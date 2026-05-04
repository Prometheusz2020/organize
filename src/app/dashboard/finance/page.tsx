"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  CheckCircle, 
  Clock, 
  DollarSign, 
  TrendingUp,
  Filter
} from "lucide-react";
import Link from "next/link";
import { ptBR } from "date-fns/locale";
import { format, startOfMonth, endOfMonth, isWithinInterval, parseISO } from "date-fns";
import { getQuotes, updateInstallmentAction, updateQuoteStatusAction } from "@/actions";

export default function FinancePage() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await getQuotes();
      setQuotes(data);
    } catch (error) {
      console.error("Error fetching finance data:", error);
    } finally {
      setLoading(false);
    }
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleMarkAsPaid = async (itemId: string, type: 'installment' | 'quote') => {
    try {
      if (type === 'installment') {
        await updateInstallmentAction(itemId, { status: "Pago" });
        setQuotes(prevQuotes => 
          prevQuotes.map(quote => ({
            ...quote,
            installments: quote.installments.map((inst: any) => 
              inst.id === itemId ? { ...inst, status: "Pago", paidAt: new Date() } : inst
            )
          }))
        );
      } else {
        await updateQuoteStatusAction(itemId, "Pago");
        setQuotes(prevQuotes => 
          prevQuotes.map(quote => 
            quote.id === itemId ? { ...quote, status: "Pago", paidAt: new Date() } : quote
          )
        );
      }
    } catch (error) {
      console.error("Error updating payment:", error);
      alert("Erro ao atualizar pagamento.");
    }
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // Flatten installments and quotes (for "À vista" quotes) into a single list of receivables
  const monthlyReceivables: any[] = [];
  let monthReceived = 0;
  let monthPending = 0;

  quotes.forEach(quote => {
    if (quote.installments && quote.installments.length > 0) {
      quote.installments.forEach((inst: any) => {
        const dueDate = parseISO(inst.dueDate);
        const paidAtDate = inst.paidAt ? (typeof inst.paidAt === 'string' ? parseISO(inst.paidAt) : inst.paidAt) : null;
        
        let isInMonth = false;
        
        if (inst.status === "Pago" && paidAtDate) {
          if (isWithinInterval(paidAtDate, { start: monthStart, end: monthEnd })) {
            isInMonth = true;
          }
        } else if (inst.status !== "Pago") {
          if (isWithinInterval(dueDate, { start: monthStart, end: monthEnd })) {
            isInMonth = true;
          }
        }

        if (isInMonth) {
          monthlyReceivables.push({
            id: inst.id,
            type: 'installment',
            quoteId: quote.id,
            client: quote.client?.name,
            service: quote.serviceType,
            value: inst.value,
            date: inst.status === "Pago" && paidAtDate ? format(paidAtDate, "yyyy-MM-dd") : inst.dueDate,
            displayDate: inst.status === "Pago" && paidAtDate ? paidAtDate : dueDate,
            status: inst.status,
            number: inst.number,
            totalInstallments: quote.installments.length
          });
          
          if (inst.status === "Pago") {
            monthReceived += inst.value;
          } else {
            monthPending += inst.value;
          }
        }
      });
    } else if (quote.paymentMethod === "À vista" || !quote.installments?.length) {
      const executionDate = parseISO(quote.date);
      const paidAtDate = quote.paidAt ? (typeof quote.paidAt === 'string' ? parseISO(quote.paidAt) : quote.paidAt) : null;
      
      let isInMonth = false;
      if (quote.status === "Pago" && paidAtDate) {
        if (isWithinInterval(paidAtDate, { start: monthStart, end: monthEnd })) {
          isInMonth = true;
        }
      } else if (quote.status === "Aprovado" || quote.status === "Pendente") {
        if (isWithinInterval(executionDate, { start: monthStart, end: monthEnd })) {
          isInMonth = true;
        }
      }

      if (isInMonth) {
        monthlyReceivables.push({
          id: quote.id,
          type: 'quote',
          quoteId: quote.id,
          client: quote.client?.name,
          service: quote.serviceType,
          value: quote.value,
          date: quote.status === "Pago" && paidAtDate ? format(paidAtDate, "yyyy-MM-dd") : quote.date,
          displayDate: quote.status === "Pago" && paidAtDate ? paidAtDate : executionDate,
          status: quote.status === "Pago" ? "Pago" : "Pendente",
          number: 1,
          totalInstallments: 1
        });

        if (quote.status === "Pago") {
          monthReceived += quote.value;
        } else if (quote.status === "Aprovado" || quote.status === "Pendente") {
          monthPending += quote.value;
        }
      }
    }
  });

  // Sort by date
  monthlyReceivables.sort((a, b) => a.date.localeCompare(b.date));

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 tracking-tight">Controle Financeiro</h1>
          <p className="mt-2 text-sm text-slate-400">
            Gerencie seus recebimentos e fluxos de caixa por período.
          </p>
        </div>
        
        <div className="mt-4 sm:mt-0 flex items-center bg-slate-900 rounded-lg border border-slate-800 p-1 shadow-sm">
          <button
            onClick={prevMonth}
            className="p-2 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-50 transition-colors"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="min-w-[150px] text-center text-sm font-medium text-slate-50 capitalize">
            {format(currentDate, "MMMM 'de' yyyy", { locale: ptBR })}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-50 transition-colors"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="overflow-hidden rounded-xl bg-slate-900 shadow-sm border border-slate-800">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg border bg-emerald-500/10 border-emerald-500/20 text-emerald-400">
                  <DollarSign className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-slate-400">Recebido no Mês</dt>
                  <dd className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
                    {formatCurrency(monthReceived)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-slate-900 shadow-sm border border-slate-800">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg border bg-amber-500/10 border-amber-500/20 text-amber-400">
                  <TrendingUp className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-slate-400">Pendente no Mês</dt>
                  <dd className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
                    {formatCurrency(monthPending)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl bg-slate-900 shadow-sm border border-slate-800">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 rounded-lg border bg-indigo-500/10 border-indigo-500/20 text-indigo-400">
                  <Filter className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="truncate text-sm font-medium text-slate-400">Total Previsto</dt>
                  <dd className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
                    {formatCurrency(monthReceived + monthPending)}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800">
        <div className="p-6 border-b border-slate-800">
          <h3 className="text-lg font-medium text-slate-50">Lançamentos do Período</h3>
        </div>
        
        {loading ? (
          <div className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
          </div>
        ) : monthlyReceivables.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <CalendarIcon className="mx-auto h-12 w-12 text-slate-600 mb-3" />
            <p>Nenhum lançamento encontrado para este mês.</p>
          </div>
        ) : (
          <>
            {/* Mobile View (Cards) */}
            <div className="block sm:hidden divide-y divide-slate-800">
              {monthlyReceivables.map((item, idx) => (
                <div 
                  key={`${item.type}-${item.id}-${idx}`} 
                  className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer space-y-3"
                  onClick={() => router.push(`/dashboard/quotes/${item.quoteId}`)}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex-1 min-w-0 pr-4">
                      <div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">
                        {format(item.displayDate, "dd/MM/yyyy")}
                      </div>
                      <h3 className="text-sm font-bold text-slate-50 truncate">{item.client}</h3>
                      <p className="text-xs text-slate-400 truncate">{item.service}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <div className="text-sm font-bold text-indigo-400">{formatCurrency(item.value)}</div>
                      <div className="text-[10px] text-slate-500 mt-1">
                        {item.type === 'installment' ? `Parc. ${item.number}/${item.totalInstallments}` : 'À vista'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-bold ring-1 ring-inset ${
                      item.status === "Pago" 
                      ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" 
                      : "bg-amber-500/10 text-amber-400 ring-amber-500/20"
                    }`}>
                      {item.status === "Pago" ? <CheckCircle className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}
                      {item.status}
                    </span>
                    
                    {item.status !== "Pago" && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMarkAsPaid(item.id, item.type);
                        }}
                        className="text-[10px] font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/5 px-2 py-1 rounded"
                      >
                        Receber
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Desktop View (Table) */}
            <div className="hidden sm:block overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-950/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Data</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Cliente / Serviço</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Parcela</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Valor</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Status</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                  </tr>
                </thead>
                <tbody className="bg-slate-900 divide-y divide-slate-800">
                  {monthlyReceivables.map((item, idx) => (
                    <tr 
                      key={`${item.type}-${item.id}-${idx}`} 
                      className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/dashboard/quotes/${item.quoteId}`)}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {format(item.displayDate, "dd/MM/yyyy")}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-slate-50">{item.client}</div>
                        <div className="text-xs text-slate-500">{item.service}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {item.type === 'installment' ? `${item.number}/${item.totalInstallments}` : 'À vista'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-50">
                        {formatCurrency(item.value)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          item.status === "Pago" 
                          ? "bg-emerald-500/10 text-emerald-400 ring-emerald-500/20" 
                          : "bg-amber-500/10 text-amber-400 ring-amber-500/20"
                        }`}>
                          {item.status === "Pago" ? <CheckCircle className="mr-1 h-3 w-3" /> : <Clock className="mr-1 h-3 w-3" />}
                          {item.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        {item.status !== "Pago" && (
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleMarkAsPaid(item.id, item.type);
                            }}
                            className="text-emerald-400 hover:text-emerald-300"
                          >
                            Receber
                          </button>
                        )}
                        <Link href={`/dashboard/quotes/${item.quoteId}`} className="text-indigo-400 hover:text-indigo-300">
                          Ver Orçamento
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
