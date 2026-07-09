import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import crypto from "crypto";
import { admin } from "better-auth/plugins";
import { stripe } from "@better-auth/stripe";
import Stripe from "stripe";

export const stripeClient = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2026-06-24.dahlia", // Latest API version as of Stripe SDK v22.0.0
});

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "mongodb",
  }),
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  advanced: {
    database: {
      generateId: () => {
        // Creates a random 24-character hex string (Valid MongoDB ObjectId format)
        return crypto.randomBytes(12).toString("hex");
      },
    },
  },
  plugins: [
    stripe({
      stripeClient,
      stripeWebhookSecret: process.env.STRIPE_WEBHOOK_SECRET!,
      createCustomerOnSignUp: true,
      onEvent: async (event) => {
        // Handle any Stripe event
        if (event.type !== "checkout.session.completed") return;

        const session = event.data.object as any;
        const purchaseId = session?.metadata?.purchaseId;

        if (!purchaseId) return;

        const purchase = await prisma.ticketPurchase.findUnique({
          where: { id: purchaseId },
        });

        if (!purchase) return;

        await prisma.ticketPurchase.update({
          where: { id: purchaseId },
          data: {
            status: session.payment_status === "paid" ? "paid" : "pending",
            stripeCheckoutSessionId: session.id,
            stripePaymentIntentId: session.payment_intent?.toString() ?? null,
            stripeCustomerId: session.customer?.toString() ?? null,
            amount: (session.amount_total ?? 0) / 100,
            currency: session.currency?.toUpperCase() ?? "USD",
            updatedAt: new Date(),
          },
        });

        if (!purchase.ticketHash || !purchase.ticketToken) return;

        await prisma.digitalTicket.create({
          data: {
            id: crypto.randomBytes(12).toString("hex"),
            purchaseId: purchase.id,
            eventId: purchase.eventId,
            userId: purchase.userId,
            ticketCode: `${purchase.eventId.slice(0, 6).toUpperCase()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
            qrPayload: JSON.stringify({
              eventId: purchase.eventId,
              purchaseId: purchase.id,
              userId: purchase.userId,
              ticketToken: purchase.ticketToken,
            }),
          },
        });
      },
    }),
    admin({
      defaultRole: "user",
    }),
  ],
});
