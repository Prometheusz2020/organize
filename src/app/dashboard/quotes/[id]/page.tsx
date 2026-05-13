"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CheckCircle, Clock, XCircle, DollarSign, Calendar, Edit2, Save, MessageCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getQuoteById, updateInstallmentAction, updateQuoteStatusAction } from "@/actions";
import { useSession } from "next-auth/react";

export default function QuoteDetails() {
  const { data: session } = useSession();
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

  const handleSendWhatsApp = () => {
    if (!quote) return;

    const companyName = (session?.user as any)?.companyName || "Nossa Empresa";
    const phone = quote.client?.phone?.replace(/\D/g, "");
    
    if (!phone) {
      alert("O cliente não possui um telefone cadastrado.");
      return;
    }

    let message = `*ORÇAMENTO - ${companyName.toUpperCase()}*\n`;
    message += `--------------------------\n`;
    message += `*Cliente:* ${quote.client?.name}\n`;
    message += `*Serviço:* ${quote.serviceType}\n`;
    message += `*Data:* ${format(new Date(quote.date), "dd/MM/yyyy")}\n`;
    message += `*Valor Total:* ${formatCurrency(quote.value)}\n\n`;
    
    message += `*Descrição:*\n${quote.description}\n\n`;
    
    message += `*Forma de Pagamento:* ${quote.paymentMethod}\n`;
    
    if (quote.installments && quote.installments.length > 0) {
      message += `*Parcelamento:*\n`;
      quote.installments.forEach((inst: any) => {
        message += `- ${inst.number}ª Parcela: ${formatCurrency(inst.value)} (Vence em ${format(new Date(inst.dueDate), "dd/MM")})\n`;
      });
    }

    message += `\n--------------------------\n`;
    message += `Obrigado pela preferência! Ficamos no aguardo da sua aprovação.`;

    const encodedMessage = encodeURIComponent(message);
    window.open(`https://wa.me/55${phone}?text=${encodedMessage}`, "_blank");
  };

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
    <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
      <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div className="flex items-center space-x-3">
          <Link
            href="/dashboard/quotes"
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-50 transition-colors border border-slate-800 sm:border-transparent"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-50 tracking-tight">
              Orçamento
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 truncate max-w-[200px] sm:max-w-none">
              {quote.client?.name}
            </p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 sm:space-x-3">
          <button
            onClick={handleSendWhatsApp}
            className="flex-1 sm:flex-none inline-flex items-center justify-center rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-lg hover:bg-emerald-500 transition-all active:scale-95"
          >
            <MessageCircle className="-ml-1 mr-2 h-5 w-5" />
            WhatsApp
          </button>
          <select
            value={quote.status}
            onChange={(e) => handleUpdateStatus(e.target.value)}
            className="flex-1 sm:flex-none rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm font-medium text-slate-50 focus:border-indigo-500 focus:outline-none"
          >
            <option value="Pendente">Pendente</option>
            <option value="Aprovado">Aprovado</option>
            <option value="Rejeitado">Rejeitado</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
        <div className="lg:col-span-1 space-y-4 sm:space-y-6">
          <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-5 sm:p-6">
            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Resumo</h3>
              {getStatusBadge(quote.status)}
            </div>
            
            <dl className="grid grid-cols-2 gap-y-4 gap-x-2 sm:block sm:space-y-4 text-sm">
              <div className="col-span-2 border-b border-slate-800/50 pb-2 sm:border-0 sm:pb-0">
                <dt className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Valor Total</dt>
                <dd className="font-extrabold text-2xl text-indigo-400 mt-0.5">
                  {formatCurrency(quote.value)}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Cliente</dt>
                <dd className="font-bold text-slate-50 mt-0.5 truncate">{quote.client?.name}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Serviço</dt>
                <dd className="font-medium text-slate-50 mt-0.5">{quote.serviceType}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Execução</dt>
                <dd className="font-medium text-slate-50 mt-0.5 text-xs">
                  {format(new Date(quote.date), "dd/MM/yyyy", { locale: ptBR })}
                </dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500 uppercase font-bold tracking-tighter">Pagamento</dt>
                <dd className="font-medium text-slate-50 mt-0.5 text-xs">{quote.paymentMethod}</dd>
              </div>
            </dl>
          </div>
          
          <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-5 sm:p-6">
            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-3 border-b border-slate-800 pb-2">Descrição</h3>
            <p className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{quote.description || "Sem descrição informada."}</p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 overflow-hidden">
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-lg font-medium text-slate-50">Controle Financeiro / Parcelas</h3>
            </div>
            
            {quote.installments && quote.installments.length > 0 ? (
              <>
                {/* Mobile View (Cards) */}
                <div className="block sm:hidden divide-y divide-slate-800">
                  {quote.installments.map((inst: any) => (
                    <div key={inst.id} className="p-4 space-y-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{inst.number}ª Parcela</span>
                          <div className="text-lg font-bold text-slate-50 mt-1">{formatCurrency(inst.value)}</div>
                        </div>
                        <div className="flex-shrink-0">
                          {editingInstallment === inst.id ? (
                            <select
                              value={editData.status}
                              onChange={(e) => setEditData({ ...editData, status: e.target.value })}
                              className="block w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-slate-50 focus:border-indigo-500 focus:outline-none text-xs"
                            >
                              <option value="Pendente">Pendente</option>
                              <option value="Pago">Pago</option>
                              <option value="Atrasado">Atrasado</option>
                            </select>
                          ) : (
                            getStatusBadge(inst.status)
                          )}
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="text-sm text-slate-400">
                          {editingInstallment === inst.id ? (
                            <input
                              type="date"
                              value={editData.dueDate}
                              onChange={(e) => setEditData({ ...editData, dueDate: e.target.value })}
                              className="block w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-slate-50 focus:border-indigo-500 focus:outline-none text-xs"
                            />
                          ) : (
                            <span className="flex items-center text-xs">
                              <Calendar className="mr-1.5 h-3.5 w-3.5 text-slate-500" />
                              Vence em: {format(new Date(inst.dueDate), "dd/MM/yyyy")}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-3">
                          {editingInstallment === inst.id ? (
                            <button
                              onClick={() => saveInstallment(inst.id)}
                              className="bg-emerald-500 text-white px-3 py-1.5 rounded-lg font-bold text-xs flex items-center shadow-lg"
                            >
                              <Save className="h-3.5 w-3.5 mr-1.5" /> Salvar
                            </button>
                          ) : (
                            <div className="flex items-center space-x-2">
                              {inst.status !== "Pago" && (
                                <button
                                  onClick={() => handleReceiveInstallment(inst.id)}
                                  className="text-emerald-400 border border-emerald-500/30 bg-emerald-500/5 p-2 rounded-lg"
                                  title="Receber Parcela"
                                >
                                  <CheckCircle className="h-5 w-5" />
                                </button>
                              )}
                              <button
                                onClick={() => startEditingInstallment(inst)}
                                className="text-indigo-400 border border-indigo-500/30 bg-indigo-500/5 p-2 rounded-lg"
                                title="Editar Parcela"
                              >
                                <Edit2 className="h-5 w-5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Desktop View (Table) */}
                <div className="hidden sm:block overflow-x-auto">
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
              </>
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
