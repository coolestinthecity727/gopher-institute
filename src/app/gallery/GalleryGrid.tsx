"use client";

import { useMemo, useState } from "react";

type GalleryImage = { id: string; imageUrl: string; caption: string; category: string };

export default function GalleryGrid({ images }: { images: GalleryImage[] }) {
  const categories = useMemo(() => ["All", ...Array.from(new Set(images.map((i) => i.category)))], [images]);
  const [active, setActive] = useState("All");
  const [lightbox, setLightbox] = useState<GalleryImage | null>(null);

  const filtered = active === "All" ? images : images.filter((i) => i.category === active);

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`rounded-full px-4 py-1.5 text-sm font-semibold transition-colors ${
              active === c ? "bg-rust-500 text-white" : "bg-navy-50 text-navy-600 hover:bg-navy-100"
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      <div className="mt-6 columns-1 sm:columns-2 lg:columns-3 gap-4 [&>*]:mb-4">
        {filtered.map((img) => (
          <button
            key={img.id}
            onClick={() => setLightbox(img)}
            className="block w-full card-surface rounded-xl overflow-hidden text-left focus-ring break-inside-avoid"
          >
            <img src={img.imageUrl} alt={img.caption} className="w-full object-cover" />
            <div className="p-3">
              <span className="route-tag inline-block bg-navy-100 text-navy-700 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide">
                {img.category}
              </span>
              <p className="mt-2 text-sm text-navy-700">{img.caption}</p>
            </div>
          </button>
        ))}
      </div>

      {lightbox && (
        <div
          className="fixed inset-0 z-[100] bg-navy-900/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setLightbox(null)}
        >
          <div className="max-w-3xl w-full">
            <img src={lightbox.imageUrl} alt={lightbox.caption} className="w-full max-h-[75vh] object-contain rounded-lg" />
            <p className="mt-3 text-center text-white font-medium">{lightbox.caption}</p>
          </div>
        </div>
      )}
    </div>
  );
}
