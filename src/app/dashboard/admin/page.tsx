"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  ShieldCheck, 
  ShieldAlert, 
  ShieldQuestion, 
  UserPlus, 
  ArrowRight,
  TrendingUp,
  Activity,
  Clock
} from "lucide-react";
import Link from "next/link";
import { getAdminStats } from "@/actions";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import PinGate from "../PinGate";
import { useSession } from "next-auth/react";

export default function AdminDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        const data = await getAdminStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching admin stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center space-y-4">
        <ShieldAlert className="h-16 w-16 text-red-500" />
        <h1 className="text-2xl font-bold text-slate-50">Acesso Negado</h1>
        <p className="text-slate-400">Você não tem permissão para acessar esta área.</p>
      </div>
    );
  }

  const statCards = [
    {
      name: "Total de Prestadores",
      value: stats?.totalUsers || 0,
      icon: Users,
      color: "text-blue-400",
      bg: "bg-blue-500/10",
      border: "border-blue-500/20"
    },
    {
      name: "Licenças Ativas",
      value: stats?.activeUsers || 0,
      icon: ShieldCheck,
      color: "text-emerald-400",
      bg: "bg-emerald-500/10",
      border: "border-emerald-500/20"
    },
    {
      name: "Aguardando Pagamento",
      value: stats?.pendingUsers || 0,
      icon: ShieldQuestion,
      color: "text-amber-400",
      bg: "bg-amber-500/10",
      border: "border-amber-500/20"
    },
    {
      name: "Licenças Expiradas",
      value: stats?.expiredUsers || 0,
      icon: ShieldAlert,
      color: "text-red-400",
      bg: "bg-red-500/10",
      border: "border-red-500/20"
    }
  ];

  return (
    <PinGate>
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-50 tracking-tight">Painel de Controle Admin</h1>
            <p className="mt-2 text-sm text-slate-400">
              Visão geral da plataforma e controle de acesso dos prestadores.
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
            <Link
              href="/dashboard/users/new"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all"
            >
              <UserPlus className="-ml-1 mr-2 h-5 w-5" />
              Cadastrar Prestador
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((stat) => (
            <div key={stat.name} className={`overflow-hidden rounded-xl bg-slate-900 border ${stat.border} shadow-sm`}>
              <div className="p-5">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
                    <stat.icon className="h-6 w-6" />
                  </div>
                  <div className="ml-5">
                    <p className="truncate text-sm font-medium text-slate-400">{stat.name}</p>
                    <p className="mt-1 text-2xl font-bold text-slate-50">{stat.value}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-50 flex items-center">
                <Activity className="h-5 w-5 mr-2 text-indigo-400" />
                Cadastros Recentes
              </h3>
              <Link href="/dashboard/users" className="text-sm font-medium text-indigo-400 hover:text-indigo-300 flex items-center">
                Ver todos
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </div>
            <div className="divide-y divide-slate-800">
              {stats?.recentUsers.length > 0 ? (
                stats.recentUsers.map((user: any) => (
                  <div key={user.id} className="p-4 hover:bg-slate-800/50 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-indigo-400 font-bold border border-slate-700">
                          {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-slate-50">{user.name || "Sem nome"}</p>
                          <p className="text-xs text-slate-500">{user.companyName || "Empresa não informada"}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${
                          user.licenseStatus === "Ativo" 
                          ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" 
                          : user.licenseStatus === "Expirado"
                          ? "bg-red-500/10 text-red-400 ring-red-500/20"
                          : "bg-amber-500/10 text-amber-400 ring-amber-500/20"
                        }`}>
                          {user.licenseStatus}
                        </span>
                        <p className="text-[10px] text-slate-600 mt-1">
                          {format(new Date(user.createdAt), "dd MMM, yyyy", { locale: ptBR })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-8 text-center text-slate-500 text-sm">
                  Nenhum usuário cadastrado recentemente.
                </div>
              )}
            </div>
          </div>

          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm p-6 space-y-6">
            <h3 className="text-lg font-bold text-slate-50 flex items-center">
              <TrendingUp className="h-5 w-5 mr-2 text-indigo-400" />
              Status das Licenças
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Ativas</span>
                  <span className="text-emerald-400 font-bold">{Math.round((stats?.activeUsers / stats?.totalUsers) * 100) || 0}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div 
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${(stats?.activeUsers / stats?.totalUsers) * 100 || 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Pendentes</span>
                  <span className="text-amber-400 font-bold">{Math.round((stats?.pendingUsers / stats?.totalUsers) * 100) || 0}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div 
                    className="bg-amber-500 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${(stats?.pendingUsers / stats?.totalUsers) * 100 || 0}%` }}
                  ></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-slate-400">Expiradas</span>
                  <span className="text-red-400 font-bold">{Math.round((stats?.expiredUsers / stats?.totalUsers) * 100) || 0}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-2">
                  <div 
                    className="bg-red-500 h-2 rounded-full transition-all duration-1000" 
                    style={{ width: `${(stats?.expiredUsers / stats?.totalUsers) * 100 || 0}%` }}
                  ></div>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <div className="bg-indigo-500/10 border border-indigo-500/20 rounded-lg p-4">
                <div className="flex items-start">
                  <Clock className="h-5 w-5 text-indigo-400 mt-0.5 mr-3" />
                  <div>
                    <p className="text-sm font-bold text-indigo-300">Ação Rápida</p>
                    <p className="text-xs text-slate-400 mt-1">
                      Lembre-se de revisar os pagamentos pendentes para liberar o acesso aos novos prestadores.
                    </p>
                    <Link href="/dashboard/users" className="text-xs text-indigo-400 hover:underline mt-2 inline-block">
                      Ir para Gestão de Usuários
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PinGate>
  );
}
