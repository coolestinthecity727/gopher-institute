import { prisma } from "@/lib/prisma";
import GalleryGrid from "./GalleryGrid";

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const images = await prisma.galleryImage.findMany({ orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }] });

  return (
    <div>
      <section className="bg-navy-900 text-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-wider text-rust-400">Gallery</span>
          <h1 className="mt-2 font-display text-4xl font-extrabold">Life at Gopher Institute Foundation</h1>
          <p className="mt-3 max-w-2xl text-navy-200">
            A look at our students at work in the workshops and clinics, campus life, and graduation day.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        {images.length === 0 ? (
          <p className="text-navy-500">Photos coming soon — check back shortly.</p>
        ) : (
          <GalleryGrid images={images} />
        )}
      </section>
    </div>
  );
}
