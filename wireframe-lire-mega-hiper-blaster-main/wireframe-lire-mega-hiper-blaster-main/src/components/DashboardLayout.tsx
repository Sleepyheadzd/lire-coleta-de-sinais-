import { SidebarProvider, SidebarTrigger, useSidebar } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

function DashboardContent({ children }: DashboardLayoutProps) {
  const { state, openMobile } = useSidebar();
  const isOpen = state === "expanded" || openMobile;

  return (
    <div className="min-h-screen flex w-full">
      <AppSidebar />
      <div className="flex-1 flex flex-col">
        <header className="h-14 flex items-center border-b px-4">
          <SidebarTrigger />
        </header>
        <main className={`flex-1 p-6 overflow-auto transition-all duration-200 ${isOpen ? "blur-sm pointer-events-none" : ""}`}>
          {children}
        </main>
      </div>
    </div>
  );
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <SidebarProvider defaultOpen={false}>
      <DashboardContent>{children}</DashboardContent>
    </SidebarProvider>
  );
}
