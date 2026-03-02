import { getProject } from "../actions";
import { AppShell } from "@/components/layout/app-shell";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  let projectName = "Project";
  try {
    const project = await getProject(projectId);
    projectName = project.name;
  } catch {
    // Project not found will be handled by child pages
  }

  return (
    <AppShell projectId={projectId} projectName={projectName}>
      {children}
    </AppShell>
  );
}
