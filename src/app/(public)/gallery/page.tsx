import Image from "next/image";
import { getGallery } from "@/lib/data";
import { Badge } from "@/components/ui/badge";

export default function GalleryPage() {
  const images = getGallery();
  const categories = [...new Set(images.map((img) => img.category))];

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <div className="max-w-3xl">
        <h1 className="text-3xl font-semibold tracking-tight">Gallery</h1>
        <p className="mt-2 text-muted-foreground">
          Explore our community spaces, amenities, and events
        </p>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {categories.map((category) => (
          <Badge key={category} variant="secondary">
            {category}
          </Badge>
        ))}
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {images.map((image) => (
          <div
            key={image.id}
            className="group overflow-hidden rounded-xl border bg-card shadow-sm transition-shadow hover:shadow-md"
          >
            <div className="relative aspect-[4/3] overflow-hidden bg-muted">
              <Image
                src={image.imageUrl}
                alt={image.title}
                fill
                className="object-cover transition-transform duration-300 group-hover:scale-105"
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
            <div className="p-4">
              <div className="flex items-center justify-between gap-2">
                <h3 className="font-semibold">{image.title}</h3>
                <Badge variant="outline" className="shrink-0 text-xs">
                  {image.category}
                </Badge>
              </div>
              <p className="mt-1.5 text-sm text-muted-foreground">
                {image.caption}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
