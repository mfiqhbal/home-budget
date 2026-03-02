import { getProjects } from "./actions";
import { AppShell } from "@/components/layout/app-shell";
import { PageHeader } from "@/components/shared/page-header";
import { GlassCard } from "@/components/shared/glass-card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import Link from "next/link";
import { ProjectCard } from "./project-card";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <AppShell>
      <PageHeader title="Projects" description="Manage your renovation projects">
        <Link href="/projects/new">
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Project
          </Button>
        </Link>
      </PageHeader>

      {projects.length === 0 ? (
        <GlassCard className="text-center py-12">
          <p className="text-muted-foreground mb-4">No projects yet</p>
          <Link href="/projects/new">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Create your first project
            </Button>
          </Link>
        </GlassCard>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      )}
    </AppShell>
  );
}
