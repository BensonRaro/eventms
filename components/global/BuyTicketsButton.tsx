import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const BuyTicketsButton = ({
  isOrganizer,
  eventId,
  eventName,
  isFree,
  price,
}: {
  isOrganizer: boolean;
  eventId: string;
  eventName: string;
  isFree: boolean;
  price?: number | null;
}) => {
  const [isBuying, setIsBuying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handlePurchase = async () => {
    try {
      const response = await fetch(`/api/events/${eventId}/purchase`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: 1 }),
      });
      const data = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(data?.error || "Unable to start checkout right now.");
      }
      if (data?.checkoutUrl) {
        window.location.assign(data.checkoutUrl);
        return;
      }

      router.push(`/event/${eventId}?purchase=success`);
      router.refresh();
    } catch (error) {
      toast.error(
        "An error occurred while processing your purchase. Please try again.",
      );
    } finally {
      setIsBuying(false);
    }
  };
  return (
    <div className="space-y-2">
      {isOrganizer ? (
        <p className="text-sm text-muted-foreground">
          You are the organizer of this event. You cannot purchase tickets for
          your own event.
        </p>
      ) : (
        <button
          onClick={handlePurchase}
          disabled={isBuying}
          className="items-center w-full justify-center rounded-2xl border border-input bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isBuying ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              Processing...
            </span>
          ) : isFree ? (
            `Get free ticket for ${eventName}`
          ) : (
            `Buy ticket${price ? ` · $${Number(price).toFixed(2)}` : ""}`
          )}
        </button>
      )}
      {error ? <p className="text-sm text-red-500">{error}</p> : null}
    </div>
  );
};

export default BuyTicketsButton;
