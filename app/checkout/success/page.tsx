import Link from "next/link";
import { CheckCircle2, ArrowRight, TicketCheck } from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const SuccessPage = async () => {
  const user = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });

  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_55%)] px-4 py-10">
      <section className="w-full max-w-2xl rounded-3xl border border-border/70 bg-background/95 p-8 shadow-[0_20px_80px_-30px_rgba(15,23,42,0.45)] backdrop-blur sm:p-10">
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-emerald-500/10 p-4 text-emerald-600">
            <CheckCircle2 className="h-10 w-10" />
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-emerald-600">
            Payment confirmed
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
            Your ticket is booked successfully
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            Your payment was successful and your ticket is now ready. You can
            view your booking details and keep your digital ticket handy for
            entry.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5">
          <div className="flex items-start gap-3">
            <TicketCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
            <div>
              <h2 className="font-semibold text-foreground">
                What happens next?
              </h2>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                Your ticket confirmation has been recorded, and you can access
                your digital pass from your profile or event details page.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            Browse more events
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
          <Link
            href={`/profile/${user?.user.id}`}
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            View my tickets
          </Link>
        </div>
      </section>
    </main>
  );
};

export default SuccessPage;
