import Link from "next/link";
import {
  Building2,
  ShieldCheck,
  LayoutDashboard,
  FileText,
  Users,
  Settings
} from "lucide-react";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/companies", label: "Empresas", icon: Building2 },
  { href: "/certificates", label: "Certificados", icon: ShieldCheck },
  { href: "/notes", label: "Observações", icon: FileText },
  { href: "/users", label: "Usuários", icon: Users },
  { href: "/settings", label: "Configurações", icon: Settings }
];

export function Sidebar() {
  return (
    <aside className="w-64 min-h-screen border-r border-border bg-surface/80">
      <div className="p-6">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <span className="text-accent font-semibold">EI</span>
          </div>
          <div>
            <p className="text-sm text-muted">Intranet</p>
            <p className="text-lg font-semibold">Empresas</p>
          </div>
        </div>
      </div>
      <nav className="px-4 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 rounded-xl px-3 py-2 text-sm text-muted hover:text-white hover:bg-border/60"
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
