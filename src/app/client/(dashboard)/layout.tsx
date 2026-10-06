import { Sidebar } from "@/components/client/layout/Sidebar";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export default function ClientLayout({children}: ClientLayoutProps) {
  return (
    <div className="min-h-screen bg-[#f7f7f7] p-4">
      <div className="mx-auto flex min-h-[calc(100vh-32px)] max-w-[1440px] overflow-hidden rounded-[8px] border border-[#dedede] bg-white shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
        <Sidebar />

        <main className="min-w-0 flex-1">
          {children}
        </main>
      </div>
    </div>
  );
}