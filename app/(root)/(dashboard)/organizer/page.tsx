import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CalendarDays, DollarSign, Ticket, TrendingUp } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

const MetricCard = ({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: typeof CalendarDays;
}) => (
  <div className="rounded-xl border bg-card p-5 shadow-sm">
    <div className="flex items-start justify-between gap-3">
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <p className="mt-2 text-2xl font-semibold">{value}</p>
      </div>
      <div className="rounded-lg bg-primary/10 p-2 text-primary">
        <Icon className="h-4 w-4" />
      </div>
    </div>
    <p className="mt-3 text-sm text-muted-foreground">{description}</p>
  </div>
);

const OrganizerPage = async () => {
  const sessionHeaders = await headers();
  const session = await auth.api.getSession({ headers: sessionHeaders });

  if (!session?.user) {
    redirect("/");
  }

  if (session.user.role === "admin") {
    redirect("/admin");
  }

  const [
    events,
    revenuePurchases,
    paidPurchases,
    upcomingEvents,
    recentPurchases,
  ] = await Promise.all([
    prisma.event.findMany({
      where: { organizerId: session.user.id },
      select: {
        id: true,
        name: true,
        startDate: true,
        price: true,
        isFree: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.ticketPurchase.findMany({
      where: { event: { organizerId: session.user.id }, status: "paid" },
      select: { amount: true },
    }),
    prisma.ticketPurchase.count({
      where: { event: { organizerId: session.user.id }, status: "paid" },
    }),
    prisma.event.count({
      where: {
        organizerId: session.user.id,
        startDate: { gte: new Date() },
      },
    }),
    prisma.ticketPurchase.findMany({
      take: 5,
      where: { event: { organizerId: session.user.id } },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        ticketName: true,
        quantity: true,
        amount: true,
        status: true,
        createdAt: true,
        event: { select: { name: true } },
        user: { select: { name: true, email: true } },
      },
    }),
  ]);

  const revenue = revenuePurchases.reduce(
    (sum, purchase) => sum + (purchase.amount ?? 0),
    0,
  );
  const totalTicketsSold = recentPurchases.reduce(
    (sum, purchase) => sum + purchase.quantity,
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Organizer Overview</h1>
        <p className="text-muted-foreground">
          Review your events, sales performance, and the most recent attendee
          activity.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Your events"
          value={events.length.toString()}
          description="Events you have created"
          icon={CalendarDays}
        />
        <MetricCard
          title="Paid purchases"
          value={paidPurchases.toString()}
          description="Confirmed ticket sales"
          icon={Ticket}
        />
        <MetricCard
          title="Revenue"
          value={currencyFormatter.format(revenue)}
          description="Income from paid ticket purchases"
          icon={DollarSign}
        />
        <MetricCard
          title="Upcoming events"
          value={upcomingEvents.toString()}
          description="Events scheduled for the future"
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Your events</h2>
            <p className="text-sm text-muted-foreground">
              A quick view of the latest events you launched
            </p>
          </div>

          <div className="space-y-3">
            {events.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                You have not created any events yet.
              </p>
            ) : (
              events.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{event.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.isFree
                        ? "Free"
                        : currencyFormatter.format(event.price ?? 0)}{" "}
                      • {dateFormatter.format(event.startDate)}
                    </p>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    {dateFormatter.format(event.createdAt)}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>

        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4">
            <h2 className="text-lg font-semibold">Recent purchases</h2>
            <p className="text-sm text-muted-foreground">
              The latest ticket activity for your events
            </p>
          </div>

          <div className="space-y-3">
            {recentPurchases.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No purchases have been made yet.
              </p>
            ) : (
              recentPurchases.map((purchase) => (
                <div key={purchase.id} className="rounded-lg border p-3">
                  <p className="font-medium">
                    {purchase.event?.name ?? "Unknown event"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {purchase.user?.name ??
                      purchase.user?.email ??
                      "Unknown buyer"}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-sm text-muted-foreground">
                    <span>
                      {purchase.quantity} ticket
                      {purchase.quantity > 1 ? "s" : ""}
                    </span>
                    <span>{purchase.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Sales snapshot</h2>
            <p className="text-sm text-muted-foreground">
              {totalTicketsSold} tickets sold across your current event
              portfolio
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizerPage;
