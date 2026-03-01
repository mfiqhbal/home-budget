import { getProject } from "../actions";
import { Sidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";

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
    <div className="gradient-page flex min-h-screen">
      <div className="hidden md:block">
        <Sidebar projectId={projectId} projectName={projectName} />
      </div>
      <div className="flex-1 flex flex-col">
        <Topbar projectId={projectId} projectName={projectName} />
        <main className="flex-1 p-4 md:p-6 overflow-auto">{children}</main>
      </div>
    </div>
  );
}
