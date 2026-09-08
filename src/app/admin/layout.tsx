import Link from "next/link";
import { getSessionFromCookies } from "@/lib/auth";

const NAV = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/applications", label: "Applications" },
  { href: "/admin/students", label: "Students" },
  { href: "/admin/courses", label: "Programmes" },
  { href: "/admin/lessons", label: "Lessons" },
  { href: "/admin/certificates", label: "Certificates" },
  { href: "/admin/gallery", label: "Photo Gallery" },
  { href: "/admin/events", label: "News & Events" },
  { href: "/admin/partners", label: "Partnerships" },
  { href: "/admin/messages", label: "Contact Messages" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = getSessionFromCookies();

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-6 flex items-center justify-between flex-wrap gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-rust-500">Administration</span>
          <h1 className="font-display text-2xl font-extrabold text-navy-900">Admin Panel</h1>
        </div>
        <p className="text-sm text-navy-500">
          Signed in as <span className="font-semibold text-navy-800">{session?.fullName}</span> ({session?.role})
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]">
        <nav className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible border-b lg:border-b-0 lg:border-r border-navy-900/10 pb-2 lg:pb-0 lg:pr-4">
          {NAV.map((n) => (
            <Link
              key={n.href}
              href={n.href}
              className="whitespace-nowrap rounded-md px-3 py-2 text-sm font-semibold text-navy-700 hover:bg-navy-50 hover:text-rust-600 transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="min-w-0">{children}</div>
      </div>
    </div>
  );
}
