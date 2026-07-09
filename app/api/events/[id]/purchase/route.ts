import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { buildTicketToken, hashTicketToken } from "@/lib/utils";
import crypto from "crypto";
import { stripeClient } from "@/lib/auth";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  try {
    const user = await auth.api.getSession({
      headers: await headers(), // you need to pass the headers object.
    });
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (!id) {
      return NextResponse.json(
        { error: "Event ID is required" },
        { status: 400 },
      );
    }

    const event = await prisma.event.findUnique({
      where: { id },
      include: {
        organizer: true,
      },
    });

    if (!event) {
      return NextResponse.json({ error: "Event not found" }, { status: 404 });
    }

    if (event.banned) {
      return NextResponse.json(
        { error: "This event is currently unavailable." },
        { status: 403 },
      );
    }

    //   free
    if (event.isFree) {
      const purchaseId = crypto.randomBytes(12).toString("hex");
      const ticketToken = buildTicketToken();
      const ticketHash = hashTicketToken(ticketToken);

      const purchase = await prisma.ticketPurchase.create({
        data: {
          id: purchaseId,
          eventId: event.id,
          userId: user.user.id,
          ticketName: event.name,
          quantity: 1,
          amount: 0,
          currency: "USD",
          status: "paid",
          ticketToken,
          ticketHash,
        },
      });

      await prisma.digitalTicket.create({
        data: {
          id: crypto.randomBytes(12).toString("hex"),
          purchaseId: purchase.id,
          eventId: event.id,
          userId: user.user.id,
          ticketCode: `${event.id.slice(0, 6).toUpperCase()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`,
          qrPayload: JSON.stringify({
            eventId: event.id,
            purchaseId: purchase.id,
            userId: user.user.id,
            ticketToken,
          }),
        },
      });

      return NextResponse.json({ purchase, ticketToken });
    }

    //   not free
    if (!event.isFree) {
      if (!stripeClient) {
        return NextResponse.json(
          { error: "Stripe client not initialized" },
          { status: 500 },
        );
      }

      const purchaseId = crypto.randomBytes(12).toString("hex");
      const ticketToken = buildTicketToken();
      const ticketHash = hashTicketToken(ticketToken);

      const purchase = await prisma.ticketPurchase.create({
        data: {
          id: purchaseId,
          eventId: event.id,
          userId: user.user.id,
          ticketName: event.name,
          quantity: 1,
          amount: Number(event.price ?? 0) * 1,
          currency: "USD",
          status: "pending",
          ticketToken,
          ticketHash,
        },
      });

      const checkoutSession = await stripeClient.checkout.sessions.create({
        mode: "payment",
        payment_method_types: ["card"],
        line_items: [
          {
            price_data: {
              currency: "usd",
              product_data: {
                name: `${event.name} ticket${1 > 1 ? "s" : ""}`,
                description: event.description ?? "Event ticket",
              },
              unit_amount: Math.round((Number(event.price ?? 0) || 0) * 100),
            },
            quantity: 1,
          },
        ],
        success_url: `${process.env.BETTER_AUTH_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.BETTER_AUTH_URL}/checkout/cancel`,
        metadata: {
          purchaseId: purchase.id,
          userId: user.user.id,
          eventId: event.id,
          ticketToken,
        },
        client_reference_id: purchase.id,
      });

      return NextResponse.json({ checkoutUrl: checkoutSession.url, purchase });
    }
  } catch (error) {
    console.error("Get event error", error);
    return NextResponse.json(
      { error: `"Unable to load event."${id}` },
      { status: 500 },
    );
  }
}
