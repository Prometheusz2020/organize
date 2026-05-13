"use client";

import { useEffect, useState } from "react";
import { Users, FileText, Clock, CheckCircle, DollarSign, TrendingUp, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { getDashboardStats } from "@/actions";

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalClients: 0,
    pendingQuotes: 0,
    approvedQuotes: 0,
    totalQuotes: 0,
    totalRecebido: 0,
    totalAReceber: 0,
  });
  const [loading, setLoading] = useState(true);
  const [showValues, setShowValues] = useState(false);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const statCards = [
    { name: "Total Recebido", value: formatCurrency(stats.totalRecebido || 0), icon: DollarSign, color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20", href: "/dashboard/finance" },
    { name: "A Receber", value: formatCurrency(stats.totalAReceber || 0), icon: TrendingUp, color: "text-orange-400 bg-orange-500/10 border-orange-500/20", href: "/dashboard/finance" },
    { name: "Orçamentos Aprovados", value: stats.approvedQuotes, icon: CheckCircle, color: "text-teal-400 bg-teal-500/10 border-teal-500/20", href: "/dashboard/quotes" },
    { name: "Orçamentos Pendentes", value: stats.pendingQuotes, icon: Clock, color: "text-amber-400 bg-amber-500/10 border-amber-500/20", href: "/dashboard/quotes" },
    { name: "Total de Clientes", value: stats.totalClients, icon: Users, color: "text-blue-400 bg-blue-500/10 border-blue-500/20", href: "/dashboard/clients" },
    { name: "Total de Orçamentos", value: stats.totalQuotes, icon: FileText, color: "text-indigo-400 bg-indigo-500/10 border-indigo-500/20", href: "/dashboard/quotes" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 tracking-tight">Dashboard</h1>
          <p className="mt-2 text-sm text-slate-400">
            Bem-vindo de volta! Aqui está o resumo do seu negócio.
          </p>
        </div>
        <button 
          onClick={() => setShowValues(!showValues)}
          className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-50 transition-colors"
          title={showValues ? "Ocultar valores" : "Mostrar valores"}
        >
          {showValues ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {statCards.map((item) => {
          const CardContent = (
            <div className="p-3 sm:p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`p-2 sm:p-3 rounded-lg border ${item.color}`}>
                    <item.icon className="h-4 w-4 sm:h-6 w-6" aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-3 sm:ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-[10px] sm:text-sm font-medium text-slate-400">{item.name}</dt>
                    <dd className="mt-0.5 sm:mt-1 text-sm sm:text-3xl font-semibold tracking-tight text-slate-50 truncate">
                      {showValues ? item.value : "••••••"}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          );

          if (item.href) {
            return (
              <Link key={item.name} href={item.href} className="overflow-hidden rounded-xl bg-slate-900 shadow-sm border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/50 transition-all cursor-pointer">
                {CardContent}
              </Link>
            );
          }

          return (
            <div key={item.name} className="overflow-hidden rounded-xl bg-slate-900 shadow-sm border border-slate-800 transition-colors">
              {CardContent}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-6 flex flex-col justify-center items-center text-center min-h-[200px]">
          <div className="p-4 bg-slate-800/50 rounded-full mb-4 ring-1 ring-slate-700/50">
            <Users className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-50">Gerencie seus clientes</h3>
          <p className="mt-1 text-sm text-slate-400 mb-6">Adicione e organize as informações dos seus clientes.</p>
          <Link href="/dashboard/clients" className="inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-500/10 px-6 py-2.5 text-sm font-medium text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 ring-1 ring-indigo-500/30 transition-all">
            Ver Clientes
          </Link>
        </div>

        <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-6 flex flex-col justify-center items-center text-center min-h-[200px]">
          <div className="p-4 bg-slate-800/50 rounded-full mb-4 ring-1 ring-slate-700/50">
            <FileText className="h-8 w-8 text-slate-400" />
          </div>
          <h3 className="text-lg font-medium text-slate-50">Crie novos orçamentos</h3>
          <p className="mt-1 text-sm text-slate-400 mb-6">Gere orçamentos profissionais para seus serviços.</p>
          <Link href="/dashboard/quotes" className="inline-flex items-center justify-center rounded-lg border border-transparent bg-indigo-500/10 px-6 py-2.5 text-sm font-medium text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 ring-1 ring-indigo-500/30 transition-all">
            Ver Orçamentos
          </Link>
        </div>
      </div>
    </div>
  );
}
