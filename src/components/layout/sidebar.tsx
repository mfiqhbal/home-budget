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
import { useSidebar } from "./sidebar-context";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  projectId?: string;
  projectName?: string;
}

const mainNav = [
  { label: "Projects", href: "/projects", icon: FolderOpen, section: "OVERVIEW" },
];

function getProjectNav(projectId: string) {
  const base = `/projects/${projectId}`;
  return [
    { label: "Dashboard", href: base, icon: LayoutDashboard, section: "OVERVIEW" },
    { label: "Budget", href: `${base}/budget`, icon: DollarSign, section: "PLANNING" },
    { label: "Comparisons", href: `${base}/comparisons`, icon: GitCompareArrows, section: "PLANNING" },
    { label: "Suppliers", href: `${base}/suppliers`, icon: Users, section: "RESOURCES" },
    { label: "Checklist", href: `${base}/checklist`, icon: CheckSquare, section: "RESOURCES" },
    { label: "Wiring", href: `${base}/wiring`, icon: Zap, section: "RESOURCES" },
    { label: "Gallery", href: `${base}/gallery`, icon: ImageIcon, section: "RESOURCES" },
  ];
}

export function Sidebar({ projectId, projectName }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const supabase = createClient();
  const { collapsed } = useSidebar();

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  const navItems = projectId ? getProjectNav(projectId) : mainNav;

  // Group items by section
  const sections: Record<string, typeof navItems> = {};
  for (const item of navItems) {
    const section = item.section;
    if (!sections[section]) sections[section] = [];
    sections[section].push(item);
  }

  return (
    <TooltipProvider delayDuration={0}>
      <aside
        className={cn(
          "h-screen sticky top-0 flex flex-col overflow-y-auto transition-all duration-300",
          collapsed ? "w-[68px]" : "w-64"
        )}
        style={{ background: "#1E1E2A", borderRight: "1px solid rgba(255,255,255,0.06)" }}
      >
        {/* Logo */}
        <div className={cn("p-6 pb-4", collapsed && "px-4 py-6 pb-4")}>
          <Link href="/projects" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: "rgba(205,140,60,0.2)" }}>
              <Home className="w-4 h-4" style={{ color: "#CD8C3C" }} />
            </div>
            {!collapsed && (
              <span className="text-lg font-heading font-semibold" style={{ color: "#FFFFFF" }}>BudgetNest</span>
            )}
          </Link>
        </div>

        {/* Back link + project name */}
        {projectId && !collapsed && (
          <div className="px-4 mb-3">
            <Link
              href="/projects"
              className="flex items-center gap-1 text-xs transition-colors px-2 py-1 hover:opacity-80"
              style={{ color: "rgba(255,255,255,0.5)" }}
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              All Projects
            </Link>
            {projectName && (
              <div className="mx-2 mt-1.5 px-3 py-1.5 rounded-lg" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.04)" }}>
                <p className="text-sm font-medium truncate" style={{ color: "rgba(255,255,255,0.9)" }}>{projectName}</p>
              </div>
            )}
          </div>
        )}

        {projectId && collapsed && (
          <div className="px-3 mb-3">
            <Tooltip>
              <TooltipTrigger asChild>
                <Link
                  href="/projects"
                  className="flex items-center justify-center w-10 h-10 mx-auto rounded-lg transition-colors"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(255,255,255,0.05)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
                >
                  <ChevronLeft className="w-4 h-4" />
                </Link>
              </TooltipTrigger>
              <TooltipContent side="right">All Projects</TooltipContent>
            </Tooltip>
          </div>
        )}

        {/* Nav sections */}
        <nav className={cn("flex-1 px-3 space-y-1", collapsed && "px-2")}>
          {Object.entries(sections).map(([section, items], sectionIdx) => (
            <div key={section}>
              {sectionIdx > 0 && (
                <div className="h-px mx-2 my-3" style={{ background: "rgba(255,255,255,0.08)" }} />
              )}
              {!collapsed && (
                <p className="text-[10px] font-semibold tracking-widest uppercase px-3 mb-1.5" style={{ color: "rgba(255,255,255,0.3)" }}>
                  {section}
                </p>
              )}
              {items.map((item) => {
                const isActive = projectId
                  ? pathname === item.href
                  : pathname.startsWith(item.href);

                const linkContent = (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-all relative",
                      collapsed && "justify-center px-0 w-10 h-10 mx-auto"
                    )}
                    style={{
                      color: isActive ? "#FFFFFF" : "rgba(255,255,255,0.55)",
                      background: isActive ? "rgba(255,255,255,0.08)" : "transparent",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = "rgba(255,255,255,0.85)";
                        e.currentTarget.style.background = "rgba(255,255,255,0.05)";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.color = "rgba(255,255,255,0.55)";
                        e.currentTarget.style.background = "transparent";
                      }
                    }}
                  >
                    {isActive && !collapsed && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-r-full" style={{ background: "#CD8C3C" }} />
                    )}
                    <item.icon className="w-4 h-4 shrink-0" style={{ color: isActive ? "#CD8C3C" : "inherit" }} />
                    {!collapsed && item.label}
                  </Link>
                );

                if (collapsed) {
                  return (
                    <Tooltip key={item.href}>
                      <TooltipTrigger asChild>{linkContent}</TooltipTrigger>
                      <TooltipContent side="right">{item.label}</TooltipContent>
                    </Tooltip>
                  );
                }

                return linkContent;
              })}
            </div>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3" style={{ borderTop: "1px solid rgba(255,255,255,0.06)" }}>
          {collapsed ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="w-10 h-10 mx-auto hover:bg-transparent"
                  style={{ color: "rgba(255,255,255,0.45)" }}
                  onClick={handleLogout}
                  onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
                >
                  <LogOut className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">Sign out</TooltipContent>
            </Tooltip>
          ) : (
            <Button
              variant="ghost"
              className="w-full justify-start hover:bg-transparent"
              style={{ color: "rgba(255,255,255,0.45)" }}
              onClick={handleLogout}
              onMouseEnter={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.75)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = "rgba(255,255,255,0.45)"; }}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
