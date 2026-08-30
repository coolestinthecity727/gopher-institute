import Link from "next/link";
import { getSessionFromCookies } from "@/lib/auth";

const LINKS = [
  { href: "/courses", label: "Programmes" },
  { href: "/apply", label: "Apply Now" },
  { href: "/gallery", label: "Gallery" },
  { href: "/verify-certificate", label: "Verify Certificate" },
  { href: "/check-registration", label: "Check Registration" },
  { href: "/events", label: "News & Events" },
  { href: "/partners", label: "Partnerships" },
  { href: "/about", label: "About" },
];

export default function Navbar() {
  const session = getSessionFromCookies();

  return (
    <header className="sticky top-0 z-50 border-b border-navy-900/10 bg-navy-900/95 backdrop-blur text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5 font-display font-bold text-lg tracking-tight">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-rust-500 text-white font-display font-extrabold text-sm route-tag">
            GIF
          </span>
          <span className="leading-tight">
            Gopher Institute
            <span className="block text-[11px] font-body font-normal text-navy-200">Foundation</span>
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-6 text-sm font-medium text-navy-100">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="hover:text-rust-400 transition-colors focus-ring rounded">
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3">
          {session?.role === "STUDENT" && (
            <Link href="/student/dashboard" className="text-sm font-semibold text-navy-100 hover:text-rust-400">
              My Dashboard
            </Link>
          )}
          {session && session.role !== "STUDENT" && (
            <Link href="/admin" className="text-sm font-semibold text-navy-100 hover:text-rust-400">
              Admin Panel
            </Link>
          )}
          {session ? (
            <form action="/api/auth/logout" method="post">
              <button className="rounded-md bg-rust-500 px-4 py-2 text-sm font-semibold hover:bg-rust-400 transition-colors focus-ring">
                Log Out
              </button>
            </form>
          ) : (
            <Link
              href="/login"
              className="rounded-md bg-rust-500 px-4 py-2 text-sm font-semibold hover:bg-rust-400 transition-colors focus-ring"
            >
              Login
            </Link>
          )}
        </div>

        {/* Mobile menu — CSS-only checkbox toggle, no JS required */}
        <input type="checkbox" id="nav-toggle" className="peer hidden" />
        <label
          htmlFor="nav-toggle"
          className="lg:hidden cursor-pointer rounded-md p-2 hover:bg-white/10 focus-ring"
          aria-label="Toggle menu"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </label>
        <div className="peer-checked:flex hidden lg:hidden absolute left-0 right-0 top-full flex-col gap-1 bg-navy-800 px-4 py-4 border-t border-white/10">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="rounded px-2 py-2 text-navy-100 hover:bg-white/5">
              {l.label}
            </Link>
          ))}
          <div className="mt-2 flex gap-2 border-t border-white/10 pt-3">
            {session ? (
              <>
                <Link
                  href={session.role === "STUDENT" ? "/student/dashboard" : "/admin"}
                  className="flex-1 rounded-md bg-white/10 px-4 py-2 text-center text-sm font-semibold"
                >
                  Dashboard
                </Link>
                <form action="/api/auth/logout" method="post" className="flex-1">
                  <button className="w-full rounded-md bg-rust-500 px-4 py-2 text-sm font-semibold">Log Out</button>
                </form>
              </>
            ) : (
              <Link href="/login" className="flex-1 rounded-md bg-rust-500 px-4 py-2 text-center text-sm font-semibold">
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
