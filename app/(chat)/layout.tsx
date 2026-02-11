import Header from "@/components/header";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="h-svh overflow-hidden bg-background text-foreground [--header-height:calc(4.5rem+env(safe-area-inset-top))]">
      <Header />
      <main
        id="main-content"
        className="box-border h-svh overflow-hidden pt-[var(--header-height)]"
      >
        {children}
      </main>
    </div>
  );
}
