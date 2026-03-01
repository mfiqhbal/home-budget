"use client";

import Link from "next/link";
import { GlassCard } from "@/components/shared/glass-card";
import { StatusBadge } from "@/components/shared/status-badge";
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

export function ProjectCard({ project }: ProjectCardProps) {
  return (
    <Link href={`/projects/${project.id}`}>
      <GlassCard hover className="h-full">
        <div className="flex items-start justify-between mb-3">
          <h3 className="font-semibold text-lg truncate pr-2">{project.name}</h3>
          <StatusBadge status={project.status} />
        </div>
        {project.description && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {project.description}
          </p>
        )}
        {project.address && (
          <div className="flex items-center gap-1 text-sm text-muted-foreground mb-3">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{project.address}</span>
          </div>
        )}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{project.currency}</span>
          <span>{formatDate(project.created_at)}</span>
        </div>
        <div className="mt-3 flex justify-end" onClick={(e) => e.preventDefault()}>
          <DeleteProjectButton projectId={project.id} projectName={project.name} />
        </div>
      </GlassCard>
    </Link>
  );
}
