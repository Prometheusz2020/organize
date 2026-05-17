"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  DollarSign, 
  Search, 
  CheckCircle, 
  Clock, 
  XCircle,
  Plus,
  Trash2,
  Edit,
  Activity
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getSubscriptionPayments, updateSubscriptionPayment, deleteSubscriptionPayment } from "@/actions";
import PinGate from "../PinGate";
import { useSession } from "next-auth/react";

export default function SubscriptionsPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const isAdmin = (session?.user as any)?.role === "ADMIN";

  useEffect(() => {
    if (!isAdmin) {
      setLoading(false);
      return;
    }
    fetchPayments();
  }, [isAdmin]);

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const data = await getSubscriptionPayments();
      setPayments(data);
    } catch (error) {
      console.error("Error fetching payments:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este registro de mensalidade?")) return;

    try {
      await deleteSubscriptionPayment(id);
      setPayments(payments.filter(p => p.id !== id));
    } catch (error: any) {
      alert(error.message || "Erro ao excluir registro.");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateSubscriptionPayment(id, { status: newStatus });
      setPayments(payments.map(p => p.id === id ? { ...p, status: newStatus, paidAt: newStatus === 'Pago' ? new Date() : null } : p));
    } catch (error: any) {
      alert(error.message || "Erro ao atualizar status.");
    }
  };

  const filteredPayments = payments.filter(payment => 
    payment.user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.user.companyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    payment.referenceMonth.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Pago":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
            <CheckCircle className="mr-1 h-3 w-3" />
            Pago
          </span>
        );
      case "Atrasado":
        return (
          <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-500/20">
            <XCircle className="mr-1 h-3 w-3" />
            Atrasado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-400 ring-1 ring-inset ring-amber-500/20">
            <Clock className="mr-1 h-3 w-3" />
            Pendente
          </span>
        );
    }
  };

  return (
    <PinGate>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-50 tracking-tight">Gestão de Mensalidades</h1>
            <p className="mt-2 text-sm text-slate-400">
              Controle os pagamentos de mensalidades dos usuários (prestadores) do sistema.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/dashboard/subscriptions/new"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all"
            >
              <Plus className="-ml-1 mr-2 h-5 w-5" />
              Lançar Mensalidade
            </Link>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800">
          <div className="p-6 border-b border-slate-800">
            <div className="relative max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg bg-slate-950 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                placeholder="Buscar por nome, empresa ou mês..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            </div>
          ) : !isAdmin ? (
            <div className="p-12 text-center text-red-400">
              <XCircle className="mx-auto h-12 w-12 text-red-600 mb-3" />
              <h3 className="text-lg font-bold">Acesso Negado</h3>
              <p>Você não tem permissão para acessar as mensalidades.</p>
            </div>
          ) : filteredPayments.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Activity className="mx-auto h-12 w-12 text-slate-600 mb-3" />
              <p>Nenhum registro de mensalidade encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-950/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Usuário / Empresa</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Mês / Valor</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Vencimento</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Data Pgto</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                  </tr>
                </thead>
                <tbody className="bg-slate-900 divide-y divide-slate-800">
                  {filteredPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-slate-50">{payment.user?.name || "Usuário Removido"}</div>
                        <div className="text-xs text-indigo-400 font-medium">{payment.user?.companyName}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-slate-300">{payment.referenceMonth}</div>
                        <div className="text-xs text-emerald-400 font-bold">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(payment.amount)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {payment.dueDate}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(payment.status)}
                          <select 
                            value={payment.status}
                            onChange={(e) => handleStatusChange(payment.id, e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-xs rounded p-1 text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="Pendente">Pendente</option>
                            <option value="Pago">Pago</option>
                            <option value="Atrasado">Atrasado</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {payment.paidAt ? format(new Date(payment.paidAt), "dd/MM/yyyy", { locale: ptBR }) : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <Link
                          href={`/dashboard/subscriptions/${payment.id}/edit`}
                          className="text-indigo-400 hover:text-indigo-300 transition-colors inline-block"
                          title="Editar Registro"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                        <button 
                          onClick={() => handleDelete(payment.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Excluir Registro"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PinGate>
  );
}
