import DashboardShell from "@/components/dashboard/dashboard-shell";

const DashboardsLayout = ({ children }: { children: React.ReactNode }) => {
  return <DashboardShell>{children}</DashboardShell>;
};

export default DashboardsLayout;
