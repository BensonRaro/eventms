import Link from "next/link";
import { XCircle, RefreshCw, ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

const CancelPage = async () => {
  const user = await auth.api.getSession({
    headers: await headers(), // you need to pass the headers object.
  });
  return (
    <main className="flex min-h-screen items-center justify-center bg-[radial-gradient(circle_at_top,rgba(248,113,113,0.12),transparent_55%)] px-4 py-10">
      <section className="w-full max-w-2xl rounded-3xl border border-border/70 bg-background/95 p-8 shadow-[0_20px_80px_-30px_rgba(15,23,42,0.35)] backdrop-blur sm:p-10">
        <div className="flex items-center justify-center">
          <div className="rounded-full bg-rose-500/10 p-4 text-rose-600">
            <XCircle className="h-10 w-10" />
          </div>
        </div>

        <div className="mt-6 text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-rose-600">
            Checkout cancelled
          </p>
          <h1 className="mt-3 text-3xl font-semibold text-foreground sm:text-4xl">
            Your payment was not completed
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-muted-foreground">
            No charges were made. You can try again anytime and your event
            selection will remain available for a fresh booking.
          </p>
        </div>

        <div className="mt-8 rounded-2xl border border-rose-500/20 bg-rose-500/5 p-5 text-sm leading-6 text-muted-foreground">
          If the issue keeps happening, please verify your card details or try a
          different payment method.
        </div>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/"
            className="inline-flex items-center justify-center rounded-full bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground transition hover:opacity-90"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to events
          </Link>
          <Link
            href={`/profile/${user?.user.id}`}
            className="inline-flex items-center justify-center rounded-full border border-input bg-background px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-muted"
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Try again later
          </Link>
        </div>
      </section>
    </main>
  );
};

export default CancelPage;
