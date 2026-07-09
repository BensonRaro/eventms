import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Event } from "@/generated/prisma/client";

interface eventWithOrganizer extends Event {
  organizer: {
    id: string;
    name: string | null;
    email: string | null;
  } | null;
}

const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

const dateFormatter = new Intl.DateTimeFormat("en", {
  dateStyle: "medium",
});

async function toggleEventBan(formData: FormData) {
  "use server";

  const eventId = formData.get("eventId")?.toString();
  const banned = formData.get("banned")?.toString() === "true";
  const banReason = formData.get("banReason")?.toString().trim() || null;

  if (!eventId) {
    throw new Error("Missing event id.");
  }

  const sessionHeaders = await headers();
  const session = await auth.api.getSession({ headers: sessionHeaders });

  if (!session?.user || session.user.role !== "admin") {
    redirect("/");
  }

  await prisma.event.update({
    where: { id: eventId },
    data: {
      banned,
      banReason: banned ? banReason : null,
    },
  });

  revalidatePath("/admin/management-events");
  revalidatePath("/");
}

const ManagementEventsPage = async () => {
  const sessionHeaders = await headers();
  const session = await auth.api.getSession({ headers: sessionHeaders });

  if (!session?.user) {
    redirect("/");
  }

  if (session.user.role !== "admin") {
    redirect("/organizer");
  }

  const events = await prisma.event.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      organizer: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Management Events</h1>
        <p className="text-muted-foreground">
          Review and moderate platform events.
        </p>
      </div>

      <div className="space-y-3">
        {events.length === 0 ? (
          <div className="rounded-xl border bg-card p-5 text-sm text-muted-foreground">
            No events have been created yet.
          </div>
        ) : (
          events.map((event: eventWithOrganizer) => (
            <div
              key={event.id}
              className="rounded-xl border bg-card p-5 shadow-sm"
            >
              <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-lg font-semibold">{event.name}</h2>
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                        event.banned
                          ? "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                          : "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300"
                      }`}
                    >
                      {event.banned ? "Banned" : "Active"}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Organizer:{" "}
                    {event.organizer?.name ??
                      event.organizer?.email ??
                      "Unknown"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {dateFormatter.format(event.startDate)} •{" "}
                    {event.isFree
                      ? "Free"
                      : currencyFormatter.format(event.price ?? 0)}
                  </p>
                  {event.banReason ? (
                    <p className="text-sm text-muted-foreground">
                      Reason: {event.banReason}
                    </p>
                  ) : null}
                </div>

                <form
                  action={toggleEventBan}
                  className="flex flex-wrap items-center gap-2"
                >
                  <input type="hidden" name="eventId" value={event.id} />
                  <input
                    type="hidden"
                    name="banned"
                    value={event.banned ? "false" : "true"}
                  />
                  <input
                    type="text"
                    name="banReason"
                    defaultValue={event.banReason ?? ""}
                    placeholder="Reason (optional)"
                    className="w-48 rounded-md border border-input bg-background px-3 py-2 text-sm"
                  />
                  <button
                    type="submit"
                    className={`rounded-md px-3 py-2 text-sm font-medium ${
                      event.banned
                        ? "bg-emerald-600 text-white hover:bg-emerald-700"
                        : "bg-red-600 text-white hover:bg-red-700"
                    }`}
                  >
                    {event.banned ? "Unban event" : "Ban event"}
                  </button>
                </form>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ManagementEventsPage;
