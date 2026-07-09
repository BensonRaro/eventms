"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Users,
  Share2,
  Edit3,
  ArrowLeft,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { authClient } from "@/lib/auth-client";
import BuyTicketsButton from "@/components/global/BuyTicketsButton";

interface EventDetails {
  id: string;
  name: string;
  description: string | null;
  startDate: string;
  endDate: string;
  location: string | null;
  imageUrl: string | null;
  categoryId: string | null;
  price: number | null;
  isFree: boolean;
  url: string | null;
  organizerId: string;
  organizer: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
  tickets: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  attendees: Array<{
    id: string;
    userId: string;
    user: {
      id: string;
      name: string;
      image: string | null;
    };
  }>;
  _count: {
    attendees: number;
    ticketPurchases: number;
  };
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function formatTime(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
}

function isEventUpcoming(startDate: string) {
  return new Date(startDate) > new Date();
}

function isEventOngoing(startDate: string, endDate: string) {
  const now = new Date();
  return new Date(startDate) <= now && now <= new Date(endDate);
}

const EventPage = () => {
  const { data: session } = authClient.useSession();
  const params = useParams();
  const router = useRouter();
  const eventId = params.id as string;

  const [event, setEvent] = useState<EventDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAttending, setIsAttending] = useState(false);

  // Fetch event details
  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventId}`);
        if (!response.ok) {
          throw new Error("Failed to load event");
        }
        const data = await response.json();
        setEvent(data);
        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load event");
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    if (eventId) fetchEvent();
  }, [eventId]);

  const isOrganizer = session?.user?.id === event?.organizerId;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: event?.name,
          text: event?.description || "Check out this event!",
          url: window.location.href,
        });
      } catch (err) {
        console.log("Share cancelled");
      }
    } else {
      // Fallback: copy URL to clipboard
      navigator.clipboard.writeText(window.location.href);
      alert("Event link copied to clipboard!");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto max-w-6xl px-4 py-8">
          <Skeleton className="h-12 w-32 mb-8" />
          <Skeleton className="h-96 w-full mb-8" />
          <div className="grid gap-8 md:grid-cols-3">
            <div className="md:col-span-2 space-y-6">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-32 w-full" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Event Not Found</h2>
          <p className="text-muted-foreground mb-6">
            {error ||
              "The event you're looking for doesn't exist or has been removed."}
          </p>
          <Link href="/">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Home
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const upcoming = isEventUpcoming(event.startDate);
  const ongoing = isEventOngoing(event.startDate, event.endDate);
  const priceLabel = event.isFree ? "Free" : `$${event.price?.toFixed(2) ?? 0}`;

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <div className="sticky top-0 z-40 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto max-w-6xl px-4 py-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Button>
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto max-w-6xl px-4 py-8">
        {/* Event Header */}
        <div className="rounded-3xl overflow-hidden border border-border mb-8 bg-card">
          {/* Event Image */}
          <div className="relative h-96 w-full overflow-hidden bg-slate-950">
            {event.imageUrl ? (
              <img
                src={event.imageUrl}
                alt={event.name}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                <Calendar className="h-16 w-16 text-slate-600" />
              </div>
            )}
            {upcoming && (
              <div className="absolute top-4 right-4 bg-green-500 text-white px-4 py-2 rounded-full text-sm font-semibold">
                Upcoming
              </div>
            )}
          </div>

          {/* Event Info Section */}
          <div className="p-8 space-y-6 bg-card">
            {/* Title and Category */}
            <div className="space-y-3">
              {event.categoryId && (
                <div className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wider">
                  {event.categoryId}
                </div>
              )}
              <h1 className="text-4xl md:text-5xl font-bold">{event.name}</h1>
            </div>

            {/* Key Info Grid */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl bg-muted p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Calendar className="h-4 w-4 text-primary" />
                  <p className="text-xs font-medium uppercase text-slate-500">
                    Date
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  {formatDate(event.startDate)}
                </p>
              </div>

              <div className="rounded-2xl bg-muted p-4">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="h-4 w-4 text-primary" />
                  <p className="text-xs font-medium uppercase text-slate-500">
                    Time
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  {formatTime(event.startDate)}
                </p>
              </div>

              <div className="rounded-2xl bg-muted p-4">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <p className="text-xs font-medium uppercase text-slate-500">
                    Location
                  </p>
                </div>
                <p className="text-sm font-semibold">
                  {event.location || "Online / TBD"}
                </p>
              </div>

              <div className="rounded-2xl bg-muted p-4">
                <div className="flex items-center gap-3 mb-2">
                  <DollarSign className="h-4 w-4 text-primary" />
                  <p className="text-xs font-medium uppercase text-slate-500">
                    Price
                  </p>
                </div>
                <p className="text-sm font-semibold">{priceLabel}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Grid Layout */}
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - Event Details */}
          <div className="lg:col-span-2 space-y-8">
            {/* Description */}
            {event.description && (
              <div className="rounded-2xl border border-border bg-card p-8">
                <h2 className="text-2xl font-bold mb-4">About This Event</h2>
                <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
                  {event.description}
                </p>
              </div>
            )}

            {/* Event Details */}
            <div className="rounded-2xl border border-border bg-card p-8">
              <h2 className="text-2xl font-bold mb-6">Event Details</h2>
              <div className="space-y-4">
                <div className="flex gap-4 pb-4 border-b border-border">
                  <Calendar className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Date & Time
                    </p>
                    <p className="text-lg font-semibold mt-1">
                      {formatDate(event.startDate)} •{" "}
                      {formatTime(event.startDate)}
                      {event.endDate !== event.startDate && (
                        <>
                          {" "}
                          to {formatDate(event.endDate)} •{" "}
                          {formatTime(event.endDate)}
                        </>
                      )}
                    </p>
                  </div>
                </div>

                {event.location && (
                  <div className="flex gap-4 pb-4 border-b border-border">
                    <MapPin className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-muted-foreground">
                        Location
                      </p>
                      <p className="text-lg font-semibold mt-1">
                        {event.location}
                      </p>
                    </div>
                  </div>
                )}

                <div className="flex gap-4 pb-4 border-b border-border">
                  <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-muted-foreground">
                      Attendees
                    </p>
                    <p className="text-lg font-semibold mt-1">
                      {event._count.attendees} going
                    </p>
                  </div>
                </div>

                {event.url && (
                  <div className="flex gap-4">
                    <a
                      href={event.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex gap-4 flex-1"
                    >
                      <div className="h-5 w-5 text-primary flex-shrink-0 mt-0.5">
                        🔗
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-muted-foreground">
                          Website
                        </p>
                        <p className="text-lg font-semibold mt-1 text-primary hover:underline">
                          Visit Event Website
                        </p>
                      </div>
                    </a>
                  </div>
                )}
              </div>
            </div>

            {/* Organizer */}
            <div className="rounded-2xl border border-border bg-card p-8">
              <h2 className="text-2xl font-bold mb-6">Hosted by</h2>
              <div className="flex items-center gap-4">
                {event.organizer.image ? (
                  <img
                    src={event.organizer.image}
                    alt={event.organizer.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                    <span className="text-xl font-bold text-muted-foreground">
                      {event.organizer.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1">
                  <p className="text-lg font-semibold">
                    {event.organizer.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {event.organizer.email}
                  </p>
                </div>
              </div>
            </div>

            {/* Tickets */}
            {event.tickets && event.tickets.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-8">
                <h2 className="text-2xl font-bold mb-6">Ticket Options</h2>
                <div className="space-y-3">
                  {event.tickets.map((ticket) => (
                    <div
                      key={ticket.id}
                      className="flex items-center justify-between p-4 rounded-lg border border-border bg-muted hover:bg-muted/80 transition-colors"
                    >
                      <div>
                        <p className="font-semibold">{ticket.name}</p>
                        <p className="text-sm text-muted-foreground">
                          ${ticket.price.toFixed(2)}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">
                          {ticket.quantity} available
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Actions */}
          <div className="space-y-4 sticky top-24 h-fit">
            {/* Price Display */}
            <div className="rounded-2xl border border-border bg-card p-6 text-center">
              <p className="text-sm font-medium text-muted-foreground mb-2">
                Price
              </p>
              <p className="text-4xl font-bold">{priceLabel}</p>
            </div>

            {/* Action Buttons */}
            <div className="space-y-3">
              {isOrganizer ? (
                <>
                  <Link
                    href={`/organizer/create-event/${event.id}`}
                    className="w-full"
                  >
                    <Button className="w-full h-12 text-base">
                      <Edit3 className="mr-2 h-4 w-4" />
                      Edit Event
                    </Button>
                  </Link>
                  <p className="text-xs text-center text-muted-foreground">
                    You are the organizer of this event
                  </p>
                </>
              ) : (
                <>
                  {ongoing && (
                    <BuyTicketsButton
                      isOrganizer={isOrganizer}
                      eventId={event.id}
                      eventName={event.name}
                      isFree={event.isFree}
                      price={event.price}
                    />
                  )}
                  {!ongoing && (
                    <Button disabled className="w-full h-12 text-base">
                      Event Ended on:{" "}
                      {new Date(event.endDate).toLocaleDateString()}
                    </Button>
                  )}
                  {!session && (
                    <p className="text-xs text-center text-muted-foreground">
                      Sign in to register for this event
                    </p>
                  )}
                </>
              )}

              <Button
                variant="outline"
                onClick={handleShare}
                className="w-full h-12 text-base"
              >
                <Share2 className="mr-2 h-4 w-4" />
                Share Event
              </Button>
            </div>

            {/* Attendees Preview */}
            {event.attendees && event.attendees.length > 0 && (
              <div className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-semibold mb-3">Going</h3>
                <div className="space-y-2">
                  {event.attendees.slice(0, 5).map((attendee) => (
                    <div key={attendee.id} className="flex items-center gap-2">
                      {attendee.user.image ? (
                        <img
                          src={attendee.user.image}
                          alt={attendee.user.name}
                          className="h-8 w-8 rounded-full object-cover"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold">
                          {attendee.user.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-sm">{attendee.user.name}</span>
                    </div>
                  ))}
                  {event.attendees.length > 5 && (
                    <p className="text-xs text-muted-foreground pt-2 border-t border-border">
                      +{event.attendees.length - 5} more going
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventPage;
