"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  LogOut, 
  Menu, 
  X,
  Briefcase,
  Calendar,
  DollarSign
} from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading" || !session) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: "/login" });
  };

  const navigation = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Clientes", href: "/dashboard/clients", icon: Users },
    { name: "Orçamentos", href: "/dashboard/quotes", icon: FileText },
    { name: "Calendário", href: "/dashboard/calendar", icon: Calendar },
    { name: "Financeiro", href: "/dashboard/finance", icon: DollarSign },
  ];

  return (
    <div className="flex h-screen bg-slate-950 overflow-hidden">
      {/* Mobile sidebar */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm" onClick={() => setSidebarOpen(false)}></div>
          <div className="fixed inset-y-0 left-0 flex w-64 flex-col bg-slate-900 border-r border-slate-800">
            <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Briefcase className="h-6 w-6 text-indigo-400" />
                <span className="text-xl font-bold text-slate-50">Organize</span>
              </div>
              <button onClick={() => setSidebarOpen(false)}>
                <X className="h-6 w-6 text-slate-400" />
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto p-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? "bg-indigo-500/10 text-indigo-400"
                        : "text-slate-300 hover:bg-slate-800 hover:text-slate-50"
                    } group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors`}
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon
                      className={`${
                        isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                      } mr-3 h-5 w-5 flex-shrink-0 transition-colors`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-800">
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-2 py-2 text-sm font-medium text-red-400 rounded-md hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sair
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:flex-shrink-0">
        <div className="flex w-64 flex-col bg-slate-900 border-r border-slate-800">
          <div className="flex items-center h-16 px-6 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <Briefcase className="h-8 w-8 text-indigo-500" />
              <span className="text-2xl font-bold text-slate-50 tracking-tight">Organize</span>
            </div>
          </div>
          <div className="flex flex-1 flex-col overflow-y-auto">
            <nav className="flex-1 px-4 py-4 space-y-1">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (pathname !== "/dashboard" && pathname?.startsWith(item.href));
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`${
                      isActive
                        ? "bg-indigo-500/10 text-indigo-400"
                        : "text-slate-300 hover:bg-slate-800 hover:text-slate-50"
                    } group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-colors`}
                  >
                    <item.icon
                      className={`${
                        isActive ? "text-indigo-400" : "text-slate-500 group-hover:text-slate-300"
                      } mr-3 h-5 w-5 flex-shrink-0 transition-colors`}
                    />
                    {item.name}
                  </Link>
                );
              })}
            </nav>
            <div className="p-4 border-t border-slate-800">
              <div className="flex items-center px-3 py-2 mb-4">
                <div className="h-8 w-8 rounded-full bg-indigo-500/20 flex items-center justify-center text-indigo-400 font-bold border border-indigo-500/30">
                  {session.user?.email?.charAt(0).toUpperCase()}
                </div>
                <div className="ml-3 overflow-hidden text-sm font-medium text-slate-300 text-ellipsis">
                  {session.user?.email}
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="flex w-full items-center px-3 py-2 text-sm font-medium text-red-400 rounded-lg hover:bg-red-500/10 transition-colors"
              >
                <LogOut className="mr-3 h-5 w-5" />
                Sair
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="lg:hidden flex items-center justify-between h-16 px-4 bg-slate-900 border-b border-slate-800">
          <div className="flex items-center space-x-2">
            <Briefcase className="h-6 w-6 text-indigo-500" />
            <span className="text-xl font-bold text-slate-50">Organize</span>
          </div>
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-slate-400 hover:text-slate-200 focus:outline-none"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}
