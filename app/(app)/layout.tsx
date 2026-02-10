import Header from "@/components/header";
import Footer from "@/components/footer";
import PageTransition from "@/components/page-transition";

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <PageTransition>
      <div className="min-h-svh bg-background text-foreground [--header-height:calc(4.5rem+env(safe-area-inset-top))]">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-background focus:px-4 focus:py-2 focus:text-sm focus:shadow-lg"
        >
          Skip to content
        </a>
        <Header />
        <main
          id="main-content"
          className="mx-auto w-full max-w-7xl px-6 pb-16 pt-[calc(var(--header-height)+1.5rem)] md:px-10"
        >
          {children}
        </main>
        <Footer />
      </div>
    </PageTransition>
  );
}
