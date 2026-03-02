"use client";

import { usePathname } from "next/navigation";
import { SidebarProvider } from "./sidebar-context";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

interface AppShellProps {
  children: React.ReactNode;
  projectId?: string;
  projectName?: string;
}

export function AppShell({ children, projectId, projectName }: AppShellProps) {
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <div className="gradient-page flex min-h-screen">
        <div className="hidden md:block">
          <Sidebar projectId={projectId} projectName={projectName} />
        </div>
        <div className="flex-1 flex flex-col">
          <Topbar projectId={projectId} projectName={projectName} />
          <main key={pathname} className="flex-1 p-4 md:p-6 overflow-auto animate-page-in">
            {children}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
