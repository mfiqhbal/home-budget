"use client";

import { useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, ExternalLink, MapPin } from "lucide-react";
import Image from "next/image";
import type { GalleryItemWithImages } from "./actions";

interface FlatImage {
  url: string;
  fileName: string;
  galleryItem: GalleryItemWithImages;
}

interface LightboxProps {
  allImages: FlatImage[];
  currentIndex: number;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export function Lightbox({ allImages, currentIndex, onClose, onNavigate }: LightboxProps) {
  const current = allImages[currentIndex];
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex < allImages.length - 1;

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft" && hasPrev) onNavigate(currentIndex - 1);
      if (e.key === "ArrowRight" && hasNext) onNavigate(currentIndex + 1);
    },
    [onClose, onNavigate, currentIndex, hasPrev, hasNext]
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "";
    };
  }, [handleKeyDown]);

  if (!current) return null;

  const item = current.galleryItem;

  return (
    <div className="fixed inset-0 z-[100] flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-md"
        onClick={onClose}
      />

      {/* Close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Counter */}
      <div className="absolute top-5 left-1/2 -translate-x-1/2 z-10 text-white/70 text-sm font-medium">
        {currentIndex + 1} / {allImages.length}
      </div>

      {/* Navigation arrows */}
      {hasPrev && (
        <button
          onClick={() => onNavigate(currentIndex - 1)}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}
      {hasNext && (
        <button
          onClick={() => onNavigate(currentIndex + 1)}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all hover:scale-110"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}

      {/* Main image area */}
      <div className="relative flex-1 flex items-center justify-center p-16">
        <div className="relative w-full h-full max-w-5xl max-h-[80vh]">
          <Image
            src={current.url}
            alt={item.title || current.fileName}
            fill
            className="object-contain select-none"
            sizes="90vw"
            priority
          />
        </div>
      </div>

      {/* Bottom info bar */}
      <div className="absolute bottom-0 left-0 right-0 z-10 bg-gradient-to-t from-black/80 via-black/40 to-transparent pt-16 pb-6 px-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-white text-xl font-semibold mb-1">
                {item.title || "Untitled"}
              </h2>
              <div className="flex items-center gap-3">
                {item.room && (
                  <span className="inline-flex items-center gap-1 text-white/70 text-sm">
                    <MapPin className="w-3.5 h-3.5" />
                    {item.room}
                  </span>
                )}
                {item.description && (
                  <span className="text-white/50 text-sm">{item.description}</span>
                )}
              </div>
            </div>
            {item.coohom_url && (
              <a
                href={item.coohom_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm text-white/80 hover:text-white bg-white/10 hover:bg-white/20 px-3 py-1.5 rounded-full transition-colors shrink-0"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Coohom
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
