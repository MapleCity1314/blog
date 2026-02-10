import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "Admin",
    template: "Admin · %s",
  },
  robots: {
    index: false,
    follow: false,
  },
};


export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top,oklch(0.985_0_0),oklch(0.967_0.001_286.375)_55%,oklch(0.92_0.004_286.32)_100%)] text-foreground">
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,oklch(0.21_0.006_285.885/8%)_45%,transparent_100%)]" />
      <div className="pointer-events-none absolute -left-24 top-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,oklch(0.577_0.245_27.325/12%),transparent_70%)] blur-2xl" />
      <div className="pointer-events-none absolute -right-24 bottom-0 h-72 w-72 rounded-full bg-[radial-gradient(circle,oklch(0.488_0.243_264.376/14%),transparent_70%)] blur-2xl" />
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-6 focus:top-6 focus:z-50 focus:rounded-full focus:bg-foreground focus:px-4 focus:py-2 focus:text-[16px] focus:font-medium focus:text-background focus:shadow-lg"
      >
        Skip to content
      </a>
      {children}
    </div>
  );
}
