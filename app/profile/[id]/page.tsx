import Link from "next/link";
import { redirect } from "next/navigation";
import { ShieldCheck, Ticket } from "lucide-react";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { headers } from "next/headers";
import TicketDownloadCard from "@/components/global/TicketDownloadCard";

const formatDate = (value: Date | string) =>
  new Date(value).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

const ProfilePage = async ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect("/");
  }

  if (session.user.id !== id) {
    redirect(`/profile/${session.user.id}`);
  }

  const [user, purchases] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        createdAt: true,
      },
    }),
    prisma.ticketPurchase.findMany({
      where: { userId: id },
      include: {
        event: {
          select: {
            id: true,
            name: true,
            description: true,
            startDate: true,
            endDate: true,
            location: true,
            imageUrl: true,
          },
        },
        digitalTickets: {
          select: {
            id: true,
            ticketCode: true,
            qrPayload: true,
            issuedAt: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="rounded-3xl border border-border/70 bg-card p-8 text-center shadow-sm">
          <h1 className="text-2xl font-semibold">User not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            The requested profile could not be loaded.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_55%)] px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <section className="overflow-hidden rounded-[32px] border border-border/70 bg-background/95 shadow-[0_24px_80px_-30px_rgba(15,23,42,0.45)] backdrop-blur">
          <div className="bg-linear-to-r from-primary via-sky-500 to-violet-500 px-6 py-8 text-white sm:px-8 lg:px-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-white/15 text-2xl font-semibold">
                  {user.image ? (
                    <img
                      src={user.image}
                      alt={user.name}
                      className="h-full w-full rounded-full object-cover"
                    />
                  ) : (
                    user.name.charAt(0).toUpperCase()
                  )}
                </div>

                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-white/80">
                    Profile
                  </p>
                  <h1 className="mt-2 text-3xl font-semibold">{user.name}</h1>
                  <p className="mt-1 text-sm text-white/80">{user.email}</p>
                </div>
              </div>

              <div className="rounded-2xl border border-white/20 bg-white/10 px-4 py-3 backdrop-blur">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <ShieldCheck className="h-4 w-4" />
                  Verified attendee
                </div>
                <p className="mt-1 text-sm text-white/80">
                  Member since {formatDate(user.createdAt)}
                </p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 border-t border-border/70 bg-card/60 p-6 sm:grid-cols-3 sm:p-8">
            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Tickets
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {purchases.length}
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Upcoming
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                {
                  purchases.filter(
                    (purchase) =>
                      new Date(purchase.event.startDate) > new Date(),
                  ).length
                }
              </p>
            </div>
            <div className="rounded-2xl border border-border/60 bg-background/70 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
                Status
              </p>
              <p className="mt-2 text-2xl font-semibold text-foreground">
                Active
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                My tickets
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Download your digital passes as PNG files whenever you need
                them.
              </p>
            </div>
            <Link
              href="/"
              className="inline-flex items-center rounded-full border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition hover:bg-muted"
            >
              Browse events
            </Link>
          </div>

          {purchases.length === 0 ? (
            <div className="rounded-3xl border border-dashed border-border bg-card/70 p-10 text-center shadow-sm">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Ticket className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No tickets yet</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Your booked tickets will appear here with a quick download
                option.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {purchases.map((purchase) => (
                <TicketDownloadCard
                  key={purchase.id}
                  purchase={purchase}
                  userName={user.name}
                />
              ))}
            </div>
          )}
        </section>
      </div>
    </main>
  );
};

export default ProfilePage;
