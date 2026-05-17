"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Users, Calendar, DollarSign, CalendarDays, Activity } from "lucide-react";
import { getSubscriptionPaymentById, updateSubscriptionPayment } from "@/actions";
import PinGate from "../../../PinGate";

export default function EditSubscriptionPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;
  
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [error, setError] = useState("");
  const [paymentUser, setPaymentUser] = useState<any>(null);

  const [formData, setFormData] = useState({
    amount: "",
    dueDate: "",
    referenceMonth: "",
    status: "Pendente",
  });

  useEffect(() => {
    if (!id) return;
    
    const loadData = async () => {
      try {
        const data = await getSubscriptionPaymentById(id);
        if (data) {
          setPaymentUser(data.user);
          setFormData({
            amount: data.amount.toString(),
            dueDate: data.dueDate,
            referenceMonth: data.referenceMonth,
            status: data.status,
          });
        } else {
          setError("Registro não encontrado.");
        }
      } catch (err: any) {
        setError("Erro ao carregar dados.");
        console.error(err);
      } finally {
        setFetching(false);
      }
    };
    
    loadData();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await updateSubscriptionPayment(id, formData);
      router.push("/dashboard/subscriptions");
    } catch (err: any) {
      console.error("Error updating subscription:", err);
      setError(err.message || "Erro ao salvar a mensalidade. Tente novamente.");
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <PinGate>
      <div className="max-w-2xl mx-auto space-y-6">
        <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/subscriptions"
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-50 tracking-tight">Editar Mensalidade</h1>
          <p className="text-sm text-slate-400">Altere os dados da cobrança ou pagamento deste prestador.</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-6 sm:p-8">
        {error && (
          <div className="mb-6 bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1 flex items-center">
                <Users className="h-4 w-4 mr-2 text-slate-500" />
                Prestador (Usuário)
              </label>
              <div className="block w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2.5 text-slate-400 sm:text-sm">
                {paymentUser?.name || paymentUser?.email} {paymentUser?.companyName ? `(${paymentUser.companyName})` : ""}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="referenceMonth" className="block text-sm font-medium text-slate-300 mb-1 flex items-center">
                  <CalendarDays className="h-4 w-4 mr-2 text-slate-500" />
                  Mês de Referência *
                </label>
                <input
                  type="text"
                  name="referenceMonth"
                  id="referenceMonth"
                  required
                  value={formData.referenceMonth}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-50 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                />
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-slate-300 mb-1 flex items-center">
                  <DollarSign className="h-4 w-4 mr-2 text-slate-500" />
                  Valor (R$) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  name="amount"
                  id="amount"
                  required
                  value={formData.amount}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-50 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="dueDate" className="block text-sm font-medium text-slate-300 mb-1 flex items-center">
                  <Calendar className="h-4 w-4 mr-2 text-slate-500" />
                  Data de Vencimento *
                </label>
                <input
                  type="date"
                  name="dueDate"
                  id="dueDate"
                  required
                  value={formData.dueDate}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-50 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                />
              </div>

              <div>
                <label htmlFor="status" className="block text-sm font-medium text-slate-300 mb-1 flex items-center">
                  <Activity className="h-4 w-4 mr-2 text-slate-500" />
                  Status
                </label>
                <select
                  name="status"
                  id="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-50 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                >
                  <option value="Pendente">Pendente</option>
                  <option value="Pago">Pago</option>
                  <option value="Atrasado">Atrasado</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-800">
            <Link
              href="/dashboard/subscriptions"
              className="rounded-lg bg-slate-800 px-6 py-2.5 text-sm font-medium text-slate-300 shadow-sm border border-slate-700 hover:bg-slate-700 hover:text-slate-50 focus:outline-none mr-3 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex justify-center rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:bg-indigo-800 transition-all"
            >
              {loading ? (
                "Salvando..."
              ) : (
                <>
                  <Save className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Salvar Alterações
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
    </PinGate>
  );
}
