"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";
import {
  Home,
  LayoutDashboard,
  DollarSign,
  GitCompareArrows,
  Users,
  CheckSquare,
  Zap,
  ImageIcon,
  LogOut,
  FolderOpen,
  ChevronLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  projectId?: string;
  projectName?: string;
}

const mainNav = [
  { label: "Projects", href: "/projects", icon: FolderOpen },
];

function getProjectNav(projectId: string) {
  const base = `/projects/${projectId}`;
  return [
    { label: "Dashboard", href: base, icon: LayoutDashboard },
    { label: "Budget", href: `${base}/budget`, icon: DollarSign },
    { label: "Comparisons", href: `${base}/comparisons`, icon: GitCompareArrows },
    { label: "Suppliers", href: `${base}/suppliers`, icon: Users },
    { label: "Checklist", href: `${base}/checklist`, icon: CheckSquare },
    { label: "Wiring", href: `${base}/wiring`, icon: Zap },
    { label: "Gallery", href: `${base}/gallery`, icon: ImageIcon },
  ];
}

export function Sidebar({ projectId, projectName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const navItems = projectId ? getProjectNav(projectId) : mainNav;

  return (
    <aside className="glass-sidebar w-64 h-screen sticky top-0 flex flex-col overflow-y-auto">
      <div className="p-6">
        <Link href="/projects" className="flex items-center gap-2">
          <Home className="w-6 h-6 text-primary" />
          <span className="text-lg font-bold">BudgetNest</span>
        </Link>
      </div>

      {projectId && (
        <div className="px-4 mb-2">
          <Link
            href="/projects"
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors px-2 py-1"
          >
            <ChevronLeft className="w-4 h-4" />
            All Projects
          </Link>
          {projectName && (
            <p className="text-sm font-medium px-2 mt-1 truncate">{projectName}</p>
          )}
        </div>
      )}

      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = projectId
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-white/30"
              )}
            >
              <item.icon className="w-4 h-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/20">
        <Button
          variant="ghost"
          className="w-full justify-start text-muted-foreground hover:text-foreground"
          onClick={handleLogout}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign out
        </Button>
      </div>
    </aside>
  );
}
