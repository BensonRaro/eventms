"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, Edit3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { type EventData } from "@/components/global/Event";

interface EventCardProps {
  event: EventData;
  onDelete?: () => void;
}

export function EventCard({ event, onDelete }: EventCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!confirm("Delete this event? This cannot be undone.")) {
      return;
    }

    setIsDeleting(true);
    setError(null);

    try {
      const response = await fetch(`/api/events/${event.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const body = await response.json().catch(() => null);
        throw new Error(body?.error || "Failed to delete event.");
      }

      onDelete?.();
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to delete event.");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="rounded-3xl border border-border bg-card p-6 shadow-sm">
      <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-xl font-semibold">{event.name}</h3>
          <p className="mt-2 text-sm text-muted-foreground">
            {event.description ?? "No description provided."}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link href={`/organizer/create-event/${event.id}`}>
            <Button variant="outline" size="sm">
              <Edit3 className="mr-2 h-4 w-4" />
              Edit
            </Button>
          </Link>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleDelete}
            disabled={isDeleting}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            {isDeleting ? "Deleting…" : "Delete"}
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-3xl bg-background/80 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Date
          </p>
          <p className="mt-2 text-sm font-semibold">
            {new Date(event.startDate).toLocaleDateString()} -{" "}
            {new Date(event.endDate).toLocaleDateString()}
          </p>
        </div>
        <div className="rounded-3xl bg-background/80 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Location
          </p>
          <p className="mt-2 text-sm font-semibold">
            {event.location ?? "Online/TBD"}
          </p>
        </div>
        <div className="rounded-3xl bg-background/80 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Price
          </p>
          <p className="mt-2 text-sm font-semibold">
            {event.isFree ? "Free" : `$${event.price?.toFixed(2) ?? 0}`}
          </p>
        </div>
      </div>

      {error ? <p className="mt-4 text-sm text-destructive">{error}</p> : null}
    </div>
  );
}
