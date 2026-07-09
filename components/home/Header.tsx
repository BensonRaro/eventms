"use client";

import { authClient } from "@/lib/auth-client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, buttonVariants } from "../ui/button";
import { toast } from "sonner";

const Header = () => {
  const { data: session, isPending, error } = authClient.useSession();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSignIn = async () => {
    setIsLoading(true);
    await authClient.signIn.social(
      {
        provider: "google",
      },
      {
        onSuccess: () => {
          toast.success("Redirecting to Google Sign-In...");
          setIsLoading(false);
          router.push("/");
        },
        onError(error) {
          toast.error("Failed to initiate Google Sign-In. Please try again.");
          setIsLoading(false);
          console.error("Google Sign-In error:", error);
        },
      },
    );
  };

  const handleSignOut = async () => {
    setIsLoading(true);
    await authClient.signOut(
      {},
      {
        onSuccess: () => {
          toast.success("Signed out successfully.");
          setIsLoading(false);
          router.push("/");
        },
        onError(error) {
          toast.error("Failed to sign out. Please try again.");
          setIsLoading(false);
          console.error("Sign out error:", error);
        },
      },
    );
  };

  return (
    <header
      className="sticky top-0 z-40 w-full max-w-7xl mx-auto py-6 flex items-center justify-between"
      id="app-header"
    >
      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 group" id="logo-link">
        <div className="text-white hover:scale-105 transition-transform duration-300">
          {/* Custom high-fidelity geometric logo */}
          <svg
            viewBox="0 0 100 100"
            className="w-9 h-9"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="50" cy="50" r="46" stroke="white" strokeWidth="8" />
            <path
              d="M30 60 C 30 45, 70 55, 70 40"
              stroke="white"
              strokeWidth="10"
              strokeLinecap="round"
            />
            <path
              d="M30 45 C 30 35, 42 30, 55 33"
              stroke="white"
              strokeWidth="8"
              strokeLinecap="round"
            />
            <path
              d="M45 67 C 58 70, 70 65, 70 55"
              stroke="white"
              strokeWidth="8"
              strokeLinecap="round"
            />
          </svg>
        </div>
        <span className="font-display font-semibold text-lg tracking-widest uppercase hidden xs:block">
          Hatch
        </span>
      </Link>

      {/* Navigation links */}
      <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
        <a
          href="#"
          className="text-white hover:text-white transition duration-200"
        >
          Home
        </a>
        <button
          className="hover:text-white transition duration-200 cursor-pointer"
          id="nav-events"
        >
          Events
        </button>
        <button
          className="hover:text-white transition duration-200 cursor-pointer"
          id="nav-agenda"
        >
          Agenda
        </button>
        <button
          className="hover:text-white transition duration-200 cursor-pointer"
          id="nav-ateliers"
        >
          Leadership Ateliers
        </button>
        <button
          className="hover:text-white transition duration-200 cursor-pointer"
          id="nav-partners"
        >
          Partners
        </button>
      </nav>
      <div className="flex gap-2 items-center">
        {isPending ? (
          <span className="text-neutral-400">Loading...</span>
        ) : (
          <div className="flex gap-2 items-center">
            {!session?.session.userId && (
              <Button onClick={handleSignIn} disabled={isLoading || isPending}>
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            )}
            {session?.session.userId && (
              <>
                <Link href={`/profile/${session?.user.id}`}>
                  <img
                    src={session.user?.image || "/favicon.ico"}
                    alt={session.user?.name || ""}
                    className="rounded-full size-8"
                  />
                </Link>

                <Link
                  href={`/organizer`}
                  className={buttonVariants({ variant: "outline" })}
                >
                  Organizer
                </Link>

                {session.user.role === "admin" && (
                  <Link
                    href={`/admin`}
                    className={buttonVariants({ variant: "outline" })}
                  >
                    Admin
                  </Link>
                )}
                <Button
                  onClick={handleSignOut}
                  disabled={isLoading || isPending}
                >
                  {isLoading ? "Signing Out..." : "Sign Out"}
                </Button>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
