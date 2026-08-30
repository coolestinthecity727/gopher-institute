export default function AboutPage() {
  const values = [
    { title: "Practical First", desc: "Every course pairs theory with hands-on workshop and clinical practice from week one." },
    { title: "Recognised Credentials", desc: "Qualifications developed with the Ministry of Vocational Training and Youth Empowerment." },
    { title: "Access for All", desc: "Flexible intakes and a range of trades so young people from any background can find a path." },
    { title: "Employer-Connected", desc: "Placement partnerships that turn graduation into genuine job and apprenticeship opportunities." },
  ];

  return (
    <div>
      <section className="bg-navy-900 text-white py-14">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <span className="text-xs font-bold uppercase tracking-wider text-rust-400">About Us</span>
          <h1 className="mt-2 font-display text-4xl font-extrabold">Gopher Institute Foundation</h1>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-14 sm:px-6 lg:px-8 space-y-6 text-navy-700 leading-relaxed">
        <p>
          Gopher Institute Foundation is a technical and vocational training college dedicated to equipping
          young Zimbabweans with the technical and practical skills employers and communities need. Operating
          in formal partnership with the Ministry of Vocational Training and Youth Empowerment, our
          accredited programmes span health sciences, engineering trades, technology, business, hospitality
          and the creative arts.
        </p>
        <p>
          Our objective is simple: empower young people with both technical and practical skills so they can
          build independent, dignified livelihoods — whether that means employment, self-employment, or
          continuing further study in their chosen trade.
        </p>
      </section>

      <section className="bg-white border-y border-navy-900/5">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <h2 className="font-display text-2xl font-extrabold text-navy-900">What Guides Us</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((v) => (
              <div key={v.title} className="card-surface rounded-xl p-6">
                <h3 className="font-display font-bold text-navy-900">{v.title}</h3>
                <p className="mt-2 text-sm text-navy-600 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
