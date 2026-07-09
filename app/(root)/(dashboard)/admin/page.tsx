import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { CalendarDays, DollarSign, Ticket, Users } from "lucide-react";
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
  icon: typeof Users;
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

const AdminPage = async () => {
  const sessionHeaders = await headers();
  const session = await auth.api.getSession({ headers: sessionHeaders });

  if (!session?.user) {
    redirect("/");
  }

  if (session.user.role !== "admin") {
    redirect("/organizer");
  }

  const [
    totalUsers,
    totalEvents,
    totalPurchases,
    paidPurchases,
    paidRevenue,
    recentEvents,
    recentPurchases,
    recentUsers,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.event.count(),
    prisma.ticketPurchase.count(),
    prisma.ticketPurchase.count({ where: { status: "paid" } }),
    prisma.ticketPurchase.findMany({
      where: { status: "paid" },
      select: { amount: true },
    }),
    prisma.event.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        startDate: true,
        createdAt: true,
        organizer: { select: { name: true, email: true } },
      },
    }),
    prisma.ticketPurchase.findMany({
      take: 5,
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
    prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        createdAt: true,
        role: true,
      },
    }),
  ]);

  const revenue = paidRevenue.reduce(
    (sum, purchase) => sum + (purchase.amount ?? 0),
    0,
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Admin Overview</h1>
        <p className="text-muted-foreground">
          Monitor platform activity, revenue, and recent growth in one place.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <MetricCard
          title="Total users"
          value={totalUsers.toString()}
          description="Registered accounts across the platform"
          icon={Users}
        />
        <MetricCard
          title="Total events"
          value={totalEvents.toString()}
          description="Events created by organizers"
          icon={CalendarDays}
        />
        <MetricCard
          title="Ticket purchases"
          value={totalPurchases.toString()}
          description="All checkout attempts and purchases"
          icon={Ticket}
        />
        <MetricCard
          title="Revenue"
          value={currencyFormatter.format(revenue)}
          description={`${paidPurchases} paid purchases tracked`}
          icon={DollarSign}
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-xl border bg-card p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Recent events</h2>
              <p className="text-sm text-muted-foreground">
                Newly created events from your organizers
              </p>
            </div>
          </div>

          <div className="space-y-3">
            {recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No events have been created yet.
              </p>
            ) : (
              recentEvents.map((event) => (
                <div
                  key={event.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div>
                    <p className="font-medium">{event.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.organizer?.name ??
                        event.organizer?.email ??
                        "Unknown organizer"}{" "}
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
            <h2 className="text-lg font-semibold">Latest users</h2>
            <p className="text-sm text-muted-foreground">
              Recent signups and account activity
            </p>
          </div>

          <div className="space-y-3">
            {recentUsers.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No users have signed up yet.
              </p>
            ) : (
              recentUsers.map((user) => (
                <div key={user.id} className="rounded-lg border p-3">
                  <p className="font-medium">{user.name}</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>{user.role ?? "user"}</span>
                    <span>{dateFormatter.format(user.createdAt)}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      <div className="rounded-xl border bg-card p-5 shadow-sm">
        <div className="mb-4">
          <h2 className="text-lg font-semibold">Recent purchases</h2>
          <p className="text-sm text-muted-foreground">
            The latest ticket purchases across all events
          </p>
        </div>

        <div className="space-y-3">
          {recentPurchases.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No purchases have been made yet.
            </p>
          ) : (
            recentPurchases.map((purchase) => (
              <div
                key={purchase.id}
                className="flex flex-col gap-2 rounded-lg border p-3 md:flex-row md:items-center md:justify-between"
              >
                <div>
                  <p className="font-medium">{purchase.ticketName}</p>
                  <p className="text-sm text-muted-foreground">
                    {purchase.user?.name ??
                      purchase.user?.email ??
                      "Unknown buyer"}{" "}
                    • {purchase.event?.name ?? "Unknown event"}
                  </p>
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>
                    {purchase.quantity} ticket{purchase.quantity > 1 ? "s" : ""}
                  </p>
                  <p>
                    {currencyFormatter.format(purchase.amount)} •{" "}
                    {purchase.status}
                  </p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminPage;
