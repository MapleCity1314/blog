import Link from "next/link";

const navItems = [
  { href: "/admin/dashboard", label: "Dashboard" },
  { href: "/admin/posts", label: "Posts" },
  { href: "/admin/comments", label: "Comments" },
  { href: "/admin/resources", label: "Resources" },
  { href: "/admin/friends", label: "Friends" },
  { href: "/admin/ai", label: "AI" },
  { href: "/admin/settings", label: "Settings" },
];

export default function AdminShellHeader() {
  return (
    <header className="border-b border-border/80 bg-card/80 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-muted-foreground">
            Presto Admin
          </p>
          <p className="text-lg font-semibold text-foreground">Control Center</p>
        </div>
        <nav className="hidden items-center gap-4 text-sm text-muted-foreground md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full px-3 py-1.5 transition hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/"
          className="rounded-full border border-border/70 bg-background px-4 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
        >
          Back to site
        </Link>
      </div>
    </header>
  );
}

export function AdminShellMobileNav() {
  return (
    <div className="md:hidden">
      <div className="flex flex-wrap gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-full border border-border/70 bg-background px-3 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-muted-foreground transition hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-foreground/40"
          >
            {item.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
