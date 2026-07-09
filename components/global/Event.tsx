import Link from "next/link";
import { Link2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

export type EventData = {
  id: string;
  name: string;
  description?: string;
  startDate: string | Date;
  endDate: string | Date;
  location?: string;
  imageUrl?: string;
  categoryId?: string;
  price?: number;
  isFree?: boolean;
  url?: string;
};

type EventProps = {
  event: EventData;
  viewUrl?: string;
};

function formatDate(date: string | Date) {
  const parsed = typeof date === "string" ? new Date(date) : date;
  return parsed.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function Event({ event, viewUrl }: EventProps) {
  const priceLabel = event.isFree ? "Free" : `$${event.price?.toFixed(2) ?? 0}`;

  return (
    <article className="rounded-3xl border border-border bg-card shadow-sm overflow-hidden">
      {event.imageUrl ? (
        <div className="h-72 overflow-hidden bg-slate-950">
          <img
            src={event.imageUrl}
            alt={event.name}
            className="h-full w-full object-cover"
          />
        </div>
      ) : (
        <div className="h-72 bg-muted" />
      )}

      <div className="p-8 space-y-6">
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-3 text-xs uppercase tracking-[0.3em] text-primary">
            <span>{event.categoryId ?? "Event"}</span>
            <Sparkles className="h-4 w-4" />
          </div>
          <h2 className="text-3xl font-semibold">{event.name}</h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            {event.description ?? "No description provided."}
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-3xl bg-background/80 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
              Dates
            </p>
            <p className="mt-2 text-base font-semibold">
              {formatDate(event.startDate)} - {formatDate(event.endDate)}
            </p>
          </div>

          <div className="rounded-3xl bg-background/80 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
              Location
            </p>
            <p className="mt-2 text-base font-semibold">
              {event.location ?? "Online / TBD"}
            </p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-3xl bg-background/80 p-4 h-fit">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
              Price
            </p>
            <p className="mt-2 text-base font-semibold">{priceLabel}</p>
          </div>
          <div className="rounded-3xl bg-background/80 p-4 h-fit">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
              Venue
            </p>
            <p className="mt-2 text-base font-semibold">
              {event.location ?? "-"}
            </p>
          </div>
          <div className="rounded-3xl bg-background/80 p-4">
            <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-500">
              Website
            </p>
            <p className="mt-2 text-base font-semibold break-all">
              {event.url ? (
                <a
                  href={event.url}
                  target="_blank"
                  rel="noreferrer"
                  className="text-primary hover:underline"
                >
                  {event.url}
                </a>
              ) : (
                "Not available"
              )}
            </p>
          </div>
        </div>

        {viewUrl ? (
          <div className="flex flex-wrap gap-3">
            <Link href={viewUrl} className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto">View event details</Button>
            </Link>
            {event.url ? (
              <a
                href={event.url}
                target="_blank"
                rel="noreferrer"
                className="w-full sm:w-auto"
              >
                <Button variant="outline" className="w-full sm:w-auto">
                  <Link2 className="mr-2 h-4 w-4" />
                  Visit page
                </Button>
              </a>
            ) : null}
          </div>
        ) : null}
      </div>
    </article>
  );
}
