"use client";

import { useAuth } from "@/components/auth/auth-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import { Sidebar } from "./sidebar";

interface TopbarProps {
  projectId?: string;
  projectName?: string;
}

export function Topbar({ projectId, projectName }: TopbarProps) {
  const { user } = useAuth();
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? "BN";

  return (
    <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-border/30 sticky top-0 z-40 bg-background/80 backdrop-blur-xl">
      <div className="md:hidden">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64">
            <Sidebar projectId={projectId} projectName={projectName} />
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex-1" />

      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground hidden sm:block font-body">
          {user?.email}
        </span>
        <Avatar className="w-8 h-8 ring-2 ring-transparent hover:ring-copper/40 transition-all">
          <AvatarFallback className="bg-copper/10 text-copper text-xs font-semibold">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
