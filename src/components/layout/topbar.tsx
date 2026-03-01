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
    <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b border-white/20 sticky top-0 z-40 bg-white/80 backdrop-blur-xl">
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
        <span className="text-sm text-muted-foreground hidden sm:block">
          {user?.email}
        </span>
        <Avatar className="w-8 h-8">
          <AvatarFallback className="bg-primary/10 text-primary text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
