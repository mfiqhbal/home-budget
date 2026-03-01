"use client";

import Link from "next/link";
import { GlassCard } from "@/components/shared/glass-card";
import { MapPin } from "lucide-react";
import { formatDate } from "@/lib/format";
import { DeleteProjectButton } from "./delete-project-button";

interface ProjectCardProps {
  project: {
    id: string;
    name: string;
    description: string | null;
    address: string | null;
    status: string;
    currency: string;
    created_at: string;
  };
}

const STATUS_COLORS: Record<string, string> = {
  active: "bg-emerald-500",
  on_hold: "bg-amber-500",
  completed: "bg-slate-400",
};

const STATUS_BORDER: Record<string, string> = {
  active: "border-l-emerald-500",
  on_hold: "border-l-amber-500",
  completed: "border-l-slate-400",
};

export function ProjectCard({ project }: ProjectCardProps) {
  const statusColor = STATUS_COLORS[project.status] || "bg-slate-400";
  const borderColor = STATUS_BORDER[project.status] || "border-l-slate-400";

  return (
    <Link href={`/projects/${project.id}`}>
      <GlassCard hover className={`h-full border-l-[3px] ${borderColor} group relative`}>
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-heading font-semibold text-lg truncate pr-2">{project.name}</h3>
          <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground shrink-0 font-body">
            <span className={`w-2 h-2 rounded-full ${statusColor}`} />
            {project.status.replace("_", " ")}
          </span>
        </div>
        {project.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2 font-body">
            {project.description}
          </p>
        )}
        {project.address && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3 font-body">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{project.address}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground font-body">
          <span className="px-2 py-0.5 rounded-md bg-copper/8 text-copper font-medium">{project.currency}</span>
          <span>{formatDate(project.created_at)}</span>
        </div>
        <div className="mt-3 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.preventDefault()}>
          <DeleteProjectButton projectId={project.id} projectName={project.name} />
        </div>
      </GlassCard>
    </Link>
  );
}
