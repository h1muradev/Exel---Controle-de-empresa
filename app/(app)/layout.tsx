import { Sidebar } from "../../components/sidebar";
import { Topbar } from "../../components/topbar";

export default function AppLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background text-white">
      <div className="flex">
        <Sidebar />
        <main className="flex-1">
          <Topbar />
          <div className="p-6 space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
