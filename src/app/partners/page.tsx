import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function PartnersPage() {
  const partners = await prisma.partner.findMany({ orderBy: [{ isMinistry: "desc" }, { createdAt: "asc" }] });
  const ministry = partners.find((p) => p.isMinistry);
  const others = partners.filter((p) => !p.isMinistry);

  return (
    <div>
      <section className="bg-navy-900 text-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-wider text-rust-400">Partnership Corner</span>
          <h1 className="mt-2 font-display text-4xl font-extrabold">Our Partners</h1>
          <p className="mt-3 max-w-2xl text-navy-200">
            Gopher Institute Foundation's programmes are accredited and supported through formal partnerships
            with government and industry.
          </p>
        </div>
      </section>

      {ministry && (
        <section className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <div className="rounded-2xl border-2 border-rust-500 bg-rust-50 p-8 sm:p-10 flex flex-col lg:flex-row gap-6 items-start">
            <span className="route-tag shrink-0 bg-rust-500 text-white px-4 py-1.5 text-xs font-bold uppercase tracking-wider">
              Founding Partner
            </span>
            {ministry.logoUrl && (
              <img src={ministry.logoUrl} alt="" className="h-16 w-16 shrink-0 rounded-lg object-cover border border-navy-900/10" />
            )}
            <div>
              <h2 className="font-display text-2xl font-extrabold text-navy-900">{ministry.name}</h2>
              <p className="mt-3 text-navy-700 leading-relaxed max-w-3xl">{ministry.description}</p>
            </div>
          </div>
        </section>
      )}

      <section className="mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8">
        <h2 className="font-display text-xl font-extrabold text-navy-900 border-b border-navy-900/10 pb-3">
          Industry &amp; Community Partners
        </h2>
        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {others.map((p) => (
            <div key={p.id} className="card-surface rounded-xl p-6">
              {p.logoUrl && <img src={p.logoUrl} alt="" className="h-12 w-12 rounded-md object-cover mb-3" />}
              <h3 className="font-display font-bold text-navy-900">{p.name}</h3>
              <p className="mt-2 text-sm text-navy-600 leading-relaxed">{p.description}</p>
              {p.website && (
                <a href={p.website} target="_blank" className="mt-3 inline-block text-sm font-semibold text-rust-500 hover:text-rust-600">
                  Visit website →
                </a>
              )}
            </div>
          ))}
          {others.length === 0 && <p className="text-navy-500">More partners coming soon.</p>}
        </div>

        <div className="mt-12 rounded-2xl bg-navy-800 text-white p-8 sm:p-10">
          <h3 className="font-display text-xl font-extrabold">Interested in partnering with us?</h3>
          <p className="mt-2 text-navy-200 max-w-2xl">
            We welcome partnerships with employers, NGOs and government agencies to expand placement
            opportunities for our graduates. Reach out via our Contact page to start a conversation.
          </p>
        </div>
      </section>
    </div>
  );
}
