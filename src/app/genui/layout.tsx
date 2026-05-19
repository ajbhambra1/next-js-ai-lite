import { Header } from "@/components/header";

export default function GenUILayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <Header />
      <main className="bg-muted/50 flex min-h-screen flex-1 flex-col">
        {children}
      </main>
    </>
  );
}
