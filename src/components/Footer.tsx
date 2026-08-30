import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-navy-900 text-navy-200 mt-16">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 grid gap-10 md:grid-cols-4">
        <div>
          <div className="flex items-center gap-2.5 font-display font-bold text-white text-lg">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-rust-500 text-white font-display font-extrabold text-sm route-tag">
              GIF
            </span>
            Gopher Institute
          </div>
          <p className="mt-3 text-sm leading-relaxed text-navy-300">
            Empowering young people with technical and practical skills, in partnership with the Ministry of
            Vocational Training and Youth Empowerment, Zimbabwe.
          </p>
        </div>

        <div>
          <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wide">Quick Links</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/courses" className="hover:text-rust-400">Programmes</Link></li>
            <li><Link href="/apply" className="hover:text-rust-400">Apply Now</Link></li>
            <li><Link href="/gallery" className="hover:text-rust-400">Gallery</Link></li>
            <li><Link href="/events" className="hover:text-rust-400">News &amp; Events</Link></li>
            <li><Link href="/partners" className="hover:text-rust-400">Partnerships</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wide">Verification</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link href="/verify-certificate" className="hover:text-rust-400">Verify a Certificate</Link></li>
            <li><Link href="/check-registration" className="hover:text-rust-400">Check Registration Status</Link></li>
            <li><Link href="/login" className="hover:text-rust-400">Student / Admin Login</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-display font-semibold text-white text-sm uppercase tracking-wide">Contact</h3>
          <ul className="mt-3 space-y-2 text-sm text-navy-300">
            <li>Stand No. 5789, Pelandaba, White City, Bulawayo, Zimbabwe</li>
            <li>Hermco Building, Office 63, 6th Avenue &amp; Main Street (opposite Unity Village), Bulawayo</li>
            <li>Landline: +263 (292) 401396</li>
            <li>WhatsApp: +263 779 678 700</li>
            <li>info@gopherinstitute.ac.zw</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-5 text-center text-xs text-navy-400">
        © {new Date().getFullYear()} Gopher Institute Foundation. Accredited in partnership with the Ministry of
        Vocational Training and Youth Empowerment, Zimbabwe.
      </div>
    </footer>
  );
}
