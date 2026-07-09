"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import type { LucideIcon } from "lucide-react";
import {
  CalendarDays,
  LayoutDashboard,
  PlusCircle,
  Settings,
  ShieldCheck,
  Users,
  Sparkles,
  LogOut,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
};

const organizerNavItems: NavItem[] = [
  { title: "Overview", href: "/organizer", icon: LayoutDashboard },
  { title: "Events", href: "/organizer/events", icon: CalendarDays },
  {
    title: "Create Event",
    href: "/organizer/create-event/new",
    icon: PlusCircle,
  },
  { title: "Settings", href: "/organizer/settings", icon: Settings },
];

const adminNavItems: NavItem[] = [
  { title: "Admin Overview", href: "/admin", icon: ShieldCheck },
  {
    title: "Management Events",
    href: "/admin/management-events",
    icon: CalendarDays,
  },
  { title: "Manage Users", href: "/admin/manage-users", icon: Users },
  { title: "Make Group", href: "/admin/make-group", icon: Sparkles },
];

function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: sessionData, isPending } = authClient.useSession();

  useEffect(() => {
    if (!isPending && !sessionData?.user) {
      router.replace("/");
    }
  }, [isPending, router, sessionData?.user]);

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-6">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <div>
            <p className="text-sm font-medium">Loading your dashboard</p>
            <p className="text-sm text-muted-foreground">
              We are verifying your access now.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!sessionData?.user) {
    return null;
  }

  const role = sessionData.user.role ?? "user";
  const navItems = role === "admin" ? adminNavItems : organizerNavItems;

  return (
    <SidebarProvider defaultOpen>
      <Sidebar>
        <SidebarHeader className="border-b px-4 py-4">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
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
            <div>
              <p className="text-sm font-semibold">EventMS</p>
              <p className="text-xs text-muted-foreground">
                {role === "admin" ? "Admin workspace" : "Organizer workspace"}
              </p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarMenu>
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/organizer" || item.href === "/admin"
                    ? pathname === item.href
                    : pathname === item.href ||
                      pathname.startsWith(`${item.href}/`);

                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <Icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter className="border-t p-4">
          <Button
            variant="outline"
            className="w-full justify-start"
            onClick={() => authClient.signOut()}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Sign out
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="flex h-14 items-center border-b bg-background/95 px-4 backdrop-blur supports-backdrop-filter:bg-background/60">
          <SidebarTrigger />
          <div className="ml-4">
            <p className="text-sm font-semibold">Dashboard</p>
            <p className="text-xs text-muted-foreground">
              Signed in as {sessionData.user.name ?? sessionData.user.email}
            </p>
          </div>
        </header>

        <main className="flex-1 p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default DashboardShell;
