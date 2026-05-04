"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Clock, XCircle, DollarSign, Calendar, Edit2, Save } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getQuoteById, updateInstallmentAction, updateQuoteStatusAction } from "@/actions";

export default function QuoteDetails() {
  const router = useRouter();
  const params = useParams();
  const quoteId = params.id as string;
  
  const [quote, setQuote] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  const [editingInstallment, setEditingInstallment] = useState<string | null>(null);
  const [editData, setEditData] = useState<{ dueDate: string; status: string }>({ dueDate: "", status: "" });

  useEffect(() => {
    fetchQuote();
  }, [quoteId]);

  const fetchQuote = async () => {
    try {
      const data = await getQuoteById(quoteId);
      if (!data) {
        setError("Orçamento não encontrado");
      } else {
        setQuote(data);
      }
    } catch (err) {
      console.error(err);
      setError("Erro ao carregar os detalhes do orçamento.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (newStatus: string) => {
    try {
      await updateQuoteStatusAction(quoteId, newStatus);
      setQuote({ ...quote, status: newStatus });
    } catch (err) {
      console.error(err);
      alert("Erro ao atualizar o status do orçamento.");
    }
  };

  const startEditingInstallment = (installment: any) => {
    setEditingInstallment(installment.id);
    setEditData({
      dueDate: installment.dueDate,
      status: installment.status
    });
  };

  const handleReceiveInstallment = async (installmentId: string) => {
    try {
      await updateInstallmentAction(installmentId, { status: "Pago" });
      
      const updatedInstallments = quote.installments.map((inst: any) => 
        inst.id === installmentId ? { ...inst, status: "Pago" } : inst
      );
      
      setQuote({ ...quote, installments: updatedInstallments });
    } catch (err) {
      console.error(err);
      alert("Erro ao dar baixa na parcela.");
    }
  };

  const saveInstallment = async (installmentId: string) => {
    try {
      await updateInstallmentAction(installmentId, editData);
      
      // Update local state
      const updatedInstallments = quote.installments.map((inst: any) => 
        inst.id === installmentId ? { ...inst, ...editData } : inst
      );
      
      setQuote({ ...quote, installments: updatedInstallments });
      setEditingInstallment(null);
    } catch (err) {
      console.error(err);
      alert("Erro ao salvar a parcela.");
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aprovado":
      case "Pago":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
            <CheckCircle className="mr-1 h-3 w-3" /> {status}
          </span>
        );
      case "Rejeitado":
      case "Atrasado":
        return (
          <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-500/20">
            <XCircle className="mr-1 h-3 w-3" /> {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-400 ring-1 ring-inset ring-amber-500/20">
            <Clock className="mr-1 h-3 w-3" /> Pendente
          </span>
        );
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="max-w-7xl mx-auto p-6 text-center">
        <h2 className="text-xl text-slate-50">{error || "Não encontrado"}</h2>
        <Link href="/dashboard/quotes" className="text-indigo-400 hover:text-indigo-300 mt-4 inline-block">
          Voltar para orçamentos
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/quotes"
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-50 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-50 tracking-tight">
              Detalhes do Orçamento
            </h1>
            <p className="text-sm text-slate-400">Gerencie informações e parcelas do orçamento.</p>
          </div>
        </div>
        
        <div className="flex space-x-3">
          <select
            value={quote.status}
            onChange={(e) => handleUpdateStatus(e.target.value)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
          >
            <option value="Pendente">Pendente</option>
            <option value="Aprovado">Aprovado</option>
            <option value="Rejeitado">Rejeitado</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-6">
            <h3 className="text-lg font-medium text-slate-50 mb-4 border-b border-slate-800 pb-2">Resumo</h3>
            
            <dl className="space-y-4 text-sm">
              <div>
                <dt className="text-slate-400">Cliente</dt>
                <dd className="font-medium text-slate-50 mt-1">{quote.client?.name}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Serviço</dt>
                <dd className="font-medium text-slate-50 mt-1">{quote.serviceType}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Data de Criação</dt>
                <dd className="font-medium text-slate-50 mt-1 text-xs">
                  {quote.createdAt ? format(new Date(quote.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR }) : '-'}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Data de Execução</dt>
                <dd className="font-medium text-slate-50 mt-1">
                  {format(new Date(quote.date), "dd 'de' MMMM, yyyy", { locale: ptBR })}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Valor Total</dt>
                <dd className="font-medium text-slate-50 text-lg mt-1 text-indigo-400">
                  {formatCurrency(quote.value)}
                </dd>
              </div>
              <div>
                <dt className="text-slate-400">Pagamento</dt>
                <dd className="font-medium text-slate-50 mt-1">{quote.paymentMethod}</dd>
              </div>
              <div>
                <dt className="text-slate-400">Status Geral</dt>
                <dd className="mt-1">{getStatusBadge(quote.status)}</dd>
              </div>
            </dl>
          </div>
          
          <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-6">
            <h3 className="text-lg font-medium text-slate-50 mb-4 border-b border-slate-800 pb-2">Descrição</h3>
            <p className="text-sm text-slate-300 whitespace-pre-wrap">{quote.description}</p>
          </div>
        </div>

        <div className="md:col-span-2">
          <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-medium text-slate-50">Controle Financeiro / Parcelas</h3>
            </div>
            
            {quote.installments && quote.installments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-slate-950/50">
                    <tr>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        #
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Vencimento
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Valor
                      </th>
                      <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Status
                      </th>
                      <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-400 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-slate-900 divide-y divide-slate-800">
                    {quote.installments.map((inst: any) => (
                      <tr key={inst.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-300">
                          {inst.number}ª
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-50">
                          {editingInstallment === inst.id ? (
                            <input
                              type="date"
                              value={editData.dueDate}
                              onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                              className="block w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-slate-50 focus:border-indigo-500 focus:outline-none sm:text-sm"
                            />
                          ) : (
                            <span className="flex items-center">
                              <Calendar className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                              {format(new Date(inst.dueDate), "dd/MM/yyyy")}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-50">
                          {formatCurrency(inst.value)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {editingInstallment === inst.id ? (
                            <select
                              value={editData.status}
                              onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                              className="block w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-slate-50 focus:border-indigo-500 focus:outline-none sm:text-sm"
                            >
                              <option value="Pendente">Pendente</option>
                              <option value="Pago">Pago</option>
                              <option value="Atrasado">Atrasado</option>
                            </select>
                          ) : (
                            getStatusBadge(inst.status)
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          {editingInstallment === inst.id ? (
                            <button
                              onClick={() => saveInstallment(inst.id)}
                              className="text-emerald-400 hover:text-emerald-300 flex items-center justify-end w-full"
                            >
                              <Save className="h-4 w-4 mr-1" /> Salvar
                            </button>
                          ) : (
                            <div className="flex items-center justify-end space-x-4">
                              {inst.status !== "Pago" && (
                                <button
                                  onClick={() => handleReceiveInstallment(inst.id)}
                                  className="text-emerald-400 hover:text-emerald-300 flex items-center"
                                  title="Receber Parcela"
                                >
                                  <CheckCircle className="h-5 w-5" />
                                </button>
                              )}
                              <button
                                onClick={() => startEditingInstallment(inst)}
                                className="text-indigo-400 hover:text-indigo-300 flex items-center"
                                title="Editar Parcela"
                              >
                                <Edit2 className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400">
                <DollarSign className="mx-auto h-12 w-12 text-slate-600 mb-3" />
                <p>Este orçamento não possui parcelas geradas.</p>
                <p className="text-sm mt-1 text-slate-500">Provavelmente foi marcado como "À vista".</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
