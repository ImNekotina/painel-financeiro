import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Segunda camada de proteção (a primeira é o middleware): mesmo que o
  // middleware seja contornado por algum motivo, cada layout/página protegida
  // volta a verificar a sessão no servidor antes de renderizar qualquer dado.
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <div className="flex min-h-screen">
      <Sidebar userName={user.name} />
      <div className="flex min-w-0 flex-1 flex-col pb-16 lg:pb-0">
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
