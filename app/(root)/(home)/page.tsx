import Header from "@/components/home/Header";
import HeroSection from "@/components/home/HeroSection";
import { prisma } from "@/lib/prisma";
import { Event } from "@/components/global/Event";
import { type EventData } from "@/components/global/Event";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{
    query?: string;
    categoryId?: string;
    page?: string;
  }>;
}) {
  const { query, categoryId, page } = await searchParams;

  const events = await prisma.event.findMany({
    where: { banned: false },
    orderBy: { startDate: "asc" },
    take: 3,
  });

  const featuredEvents: EventData[] = events.map((event) => ({
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
    <main className="relative min-h-screen bg-[#07080a] text-white flex flex-col selection:bg-white selection:text-black font-sans">
      <Header />
      <HeroSection />
      <section className="px-10 py-12">
        <div className="mb-8 space-y-3">
          <p className="text-sm uppercase tracking-[0.3em] text-primary">
            Featured Events
          </p>
          <h2 className="text-3xl font-semibold">Upcoming experiences</h2>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {featuredEvents.length > 0 ? (
            featuredEvents.map((event) => (
              <Event
                key={event.id}
                event={event}
                viewUrl={`/event/${event.id}`}
              />
            ))
          ) : (
            <div className="rounded-3xl border border-dashed border-border bg-card p-8 text-center text-sm text-muted-foreground">
              No events are available yet.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
