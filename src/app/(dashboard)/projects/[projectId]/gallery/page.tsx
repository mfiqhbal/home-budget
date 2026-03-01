import { getGalleryImages } from "./actions";
import { PageHeader } from "@/components/shared/page-header";
import { GlassCard } from "@/components/shared/glass-card";
import { GalleryGrid } from "./gallery-grid";
import { GalleryDialog } from "./gallery-dialog";
import { ImageIcon } from "lucide-react";

export default async function GalleryPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  const galleryItems = await getGalleryImages(projectId);

  const rooms = [...new Set(galleryItems.map((i) => i.room).filter(Boolean))] as string[];

  return (
    <div>
      <PageHeader title="Design Gallery" description="Interior design inspiration and renders">
        <GalleryDialog projectId={projectId} mode="create" />
      </PageHeader>

      {galleryItems.length === 0 ? (
        <GlassCard className="text-center py-16">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <ImageIcon className="w-10 h-10 text-primary" />
          </div>
          <h3 className="text-lg font-semibold mb-2">No images yet</h3>
          <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
            Add your first gallery item to start collecting interior design inspiration and renders.
          </p>
          <GalleryDialog projectId={projectId} mode="create" />
        </GlassCard>
      ) : (
        <GalleryGrid items={galleryItems} projectId={projectId} rooms={rooms} />
      )}
    </div>
  );
}
