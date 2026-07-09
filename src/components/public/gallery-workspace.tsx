"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { cn } from "@/lib/utils";
import type { GalleryImage } from "@/types";

interface GalleryWorkspaceProps {
  images: GalleryImage[];
}

export function GalleryWorkspace({ images }: GalleryWorkspaceProps) {
  const categories = useMemo(
    () => ["All", ...new Set(images.map((img) => img.category))],
    [images]
  );
  const [activeCategory, setActiveCategory] = useState("All");

  const filtered = useMemo(() => {
    if (activeCategory === "All") return images;
    return images.filter((img) => img.category === activeCategory);
  }, [images, activeCategory]);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const active = activeCategory === category;
          return (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={cn(
                "rounded-full px-4 py-2 text-sm font-medium transition-colors duration-200",
                active
                  ? "bg-primary text-primary-foreground shadow-[0_8px_24px_rgba(37,99,235,0.22)]"
                  : "border border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              {category}
            </button>
          );
        })}
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((image, index) => (
          <article
            key={image.id}
            className="group overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-[0_12px_40px_rgba(15,23,42,0.06)] transition-[transform,box-shadow] duration-200 ease-[cubic-bezier(0.16,1,0.3,1)] hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(15,23,42,0.1)] landing-anim-rise"
            style={{ animationDelay: `${80 + index * 60}ms` }}
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
              <Image
                src={image.imageUrl}
                alt={image.title}
                fill
                className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#142038]/60 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <span className="absolute bottom-3 left-3 rounded-full bg-white/90 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-700 opacity-0 backdrop-blur transition-opacity duration-300 group-hover:opacity-100">
                {image.category}
              </span>
            </div>
            <div className="p-5">
              <h3 className="font-semibold tracking-tight text-slate-900">
                {image.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-slate-600">
                {image.caption}
              </p>
            </div>
          </article>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-12 text-center text-sm text-slate-500">
          No photos in this category yet.
        </p>
      )}
    </div>
  );
}
