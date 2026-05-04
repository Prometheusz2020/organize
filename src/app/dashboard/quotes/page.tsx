"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, FileText, CheckCircle, Clock, XCircle, User } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getQuotes, updateQuoteStatusAction } from "@/actions";

export default function QuotesList() {
  const router = useRouter();
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchQuotes = async () => {
      try {
        const data = await getQuotes();
        setQuotes(data);
      } catch (error) {
        console.error("Error fetching quotes:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchQuotes();
  }, []);

  const handleApprove = async (id: string) => {
    try {
      await updateQuoteStatusAction(id, "Aprovado");
      setQuotes(quotes.map(q => q.id === id ? { ...q, status: "Aprovado" } : q));
    } catch (error) {
      console.error(error);
      alert("Erro ao aprovar orçamento.");
    }
  };

  const filteredQuotes = quotes.filter(quote => 
    quote.serviceType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (quote.client?.name && quote.client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    quote.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aprovado":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
            <CheckCircle className="mr-1 h-3 w-3" /> Aprovado
          </span>
        );
      case "Rejeitado":
        return (
          <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-500/20">
            <XCircle className="mr-1 h-3 w-3" /> Rejeitado
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
          <h1 className="text-3xl font-bold text-slate-50 tracking-tight">Orçamentos</h1>
          <p className="mt-2 text-sm text-slate-400">
            Crie e gerencie os orçamentos de serviços para seus clientes.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/dashboard/quotes/new"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Novo Orçamento
          </Link>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <div className="relative rounded-md max-w-md">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-slate-500" aria-hidden="true" />
            </div>
            <input
              type="text"
              className="block w-full rounded-lg border border-slate-700 bg-slate-950 pl-10 px-3 py-2 text-slate-50 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
              placeholder="Buscar por cliente, serviço ou status..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            <p className="mt-2 text-sm text-slate-400">Carregando orçamentos...</p>
          </div>
        ) : filteredQuotes.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-16 w-16 bg-slate-800/50 rounded-full flex items-center justify-center ring-1 ring-slate-700/50 mb-4">
              <FileText className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="mt-2 text-sm font-semibold text-slate-50">Nenhum orçamento encontrado</h3>
            <p className="mt-1 text-sm text-slate-400">
              {searchTerm ? "Tente buscar com outros termos." : "Crie o primeiro orçamento para um cliente."}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Link
                  href="/dashboard/quotes/new"
                  className="inline-flex items-center rounded-lg border border-transparent bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 ring-1 ring-indigo-500/30 transition-all"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Novo Orçamento
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Mobile View (Cards) */}
            <div className="block sm:hidden divide-y divide-slate-800">
          {filteredQuotes.map((quote) => (
            <div 
              key={quote.id} 
              className="p-4 hover:bg-slate-800/50 transition-colors cursor-pointer space-y-3"
              onClick={() => router.push(`/dashboard/quotes/${quote.id}`)}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1 min-w-0 pr-4">
                  <h3 className="text-sm font-bold text-slate-50 truncate">{quote.serviceType}</h3>
                  <div className="flex items-center text-xs text-slate-400 mt-1">
                    <User className="flex-shrink-0 mr-1.5 h-3 w-3 text-slate-500" />
                    <span className="truncate">{quote.client?.name || "Cliente excluído"}</span>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-bold text-indigo-400">{formatCurrency(quote.value)}</div>
                  <div className="text-[10px] text-slate-500 mt-0.5">{quote.paymentMethod || "À vista"}</div>
                </div>
              </div>
              
              <div className="flex justify-between items-center">
                <div className="text-[11px] text-slate-400">
                  {quote.date ? format(new Date(quote.date), "dd/MM/yy") : '-'}
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(quote.status)}
                  {quote.status === "Pendente" && (
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handleApprove(quote.id);
                      }}
                      className="text-[10px] font-bold text-emerald-400 border border-emerald-500/30 bg-emerald-500/5 px-2 py-0.5 rounded"
                    >
                      Aprovar
                    </button>
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
                  Cliente / Serviço
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Data de Execução
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Valor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Pagamento
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Ações</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-slate-900 divide-y divide-slate-800">
              {filteredQuotes.map((quote) => (
                <tr 
                  key={quote.id} 
                  className="hover:bg-slate-800/50 transition-colors cursor-pointer"
                  onClick={() => router.push(`/dashboard/quotes/${quote.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div>
                        <div className="text-sm font-medium text-slate-50">{quote.serviceType}</div>
                        <div className="flex items-center text-sm text-slate-400 mt-1">
                          <User className="flex-shrink-0 mr-1.5 h-3.5 w-3.5 text-slate-500" />
                          {quote.client?.name || "Cliente excluído"}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    {quote.date ? format(new Date(quote.date), "dd 'de' MMMM, yyyy", { locale: ptBR }) : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-50">
                    {formatCurrency(quote.value)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                    <div className="flex flex-col">
                      <span>{quote.paymentMethod || "À vista"}</span>
                      {quote.installments && quote.installments.length > 0 && (
                        <span className="text-xs text-indigo-400">{quote.installments.length} parcelas</span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getStatusBadge(quote.status)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    {quote.status === "Pendente" && (
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          handleApprove(quote.id);
                        }}
                        className="text-emerald-400 hover:text-emerald-300 inline-flex items-center"
                      >
                        Aprovar
                      </button>
                    )}
                    <Link href={`/dashboard/quotes/${quote.id}`} className="text-indigo-400 hover:text-indigo-300 inline-flex items-center">
                      Detalhes
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
