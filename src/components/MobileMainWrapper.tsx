export default function MobileMainWrapper({ children }: { children: React.ReactNode }) {
  return (
    <main className="main-content">
      {children}
    </main>
  );
}
