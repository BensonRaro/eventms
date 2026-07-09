import { prisma } from "@/lib/prisma";
import { EventCard } from "@/components/global/EventCard";
import { type EventData } from "@/components/global/Event";

const OrganizerEventsPage = async () => {
  const events = await prisma.event.findMany({
    orderBy: { startDate: "asc" },
  });

  const formattedEvents: EventData[] = events.map((event) => ({
    id: event.id,
    name: event.name,
    description: event.description ?? "",
    startDate: event.startDate.toISOString(),
    endDate: event.endDate.toISOString(),
    location: event.location ?? "",
    imageUrl: event.imageUrl ?? "",
    categoryId: event.categoryId ?? "",
    price: event.price ?? 0,
    isFree: event.isFree,
    url: event.url ?? "",
  }));

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <h1 className="text-2xl font-semibold">Events</h1>
        <p className="text-muted-foreground">
          Manage your upcoming events here.
        </p>
      </div>

      <div className="grid gap-6">
        {formattedEvents.length > 0 ? (
          formattedEvents.map((event) => (
            <EventCard key={event.id} event={event} />
          ))
        ) : (
          <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
            No events found. Create one to get started.
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerEventsPage;
