"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Clock, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { ptBR } from "date-fns/locale";
import { format } from "date-fns";
import { getQuotes } from "@/actions";

export default function CalendarPage() {
  const [quotes, setQuotes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDay, setSelectedDay] = useState<number | null>(new Date().getDate());

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

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();

  const prevMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentYear, currentMonth + 1, 1));
  };

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getQuotesForDay = (day: number) => {
    const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return quotes.filter(q => q.date === dateStr);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Aprovado":
        return "bg-emerald-500/20 text-emerald-400 border-emerald-500/30";
      case "Rejeitado":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-amber-500/20 text-amber-400 border-amber-500/30";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Aprovado":
        return <CheckCircle className="h-3 w-3 mr-1" />;
      case "Rejeitado":
        return <XCircle className="h-3 w-3 mr-1" />;
      default:
        return <Clock className="h-3 w-3 mr-1" />;
    }
  };

  const monthName = format(currentDate, "MMMM 'de' yyyy", { locale: ptBR });
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const isToday = (day: number) => {
    const today = new Date();
    return day === today.getDate() && currentMonth === today.getMonth() && currentYear === today.getFullYear();
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Aprovado":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
            Aprovado
          </span>
        );
      case "Rejeitado":
        return (
          <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-bold text-red-400 ring-1 ring-inset ring-red-500/20">
            Rejeitado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold text-amber-400 ring-1 ring-inset ring-amber-500/20">
            Pendente
          </span>
        );
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 flex flex-col">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 tracking-tight">Calendário de Execuções</h1>
          <p className="mt-2 text-sm text-slate-400">
            Acompanhe os dias agendados para a execução dos seus serviços.
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center bg-slate-900 rounded-lg border border-slate-800 p-1 shadow-sm">
          <button
            onClick={prevMonth}
            className="p-2 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <span className="min-w-[150px] text-center text-sm font-medium text-slate-50 capitalize">
            {monthName}
          </span>
          <button
            onClick={nextMonth}
            className="p-2 rounded-md hover:bg-slate-800 text-slate-400 hover:text-slate-50 transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 flex flex-col">
        {loading ? (
          <div className="flex-1 flex items-center justify-center p-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <>
            {/* Desktop View (Full Grid) */}
            <div className="hidden sm:flex flex-1 flex-col min-h-[600px]">
              <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950/50">
                {weekDays.map((day, index) => (
                  <div key={index} className="py-3 text-center text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 flex-1 bg-slate-800/30 gap-[1px]">
                {days.map((day, index) => {
                  const dayQuotes = day ? getQuotesForDay(day) : [];
                  
                  return (
                    <div 
                      key={index} 
                      className={`min-h-[120px] bg-slate-900 p-2 transition-colors ${day ? 'hover:bg-slate-800/50' : ''} ${day && isToday(day) ? 'ring-1 ring-inset ring-indigo-500/50 relative' : ''}`}
                    >
                      {day && (
                        <div className="flex flex-col h-full">
                          <span className={`text-sm font-medium w-7 h-7 flex items-center justify-center rounded-full mb-2 ${isToday(day) ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-500/30' : 'text-slate-400'}`}>
                            {day}
                          </span>
                          
                          <div className="flex-1 overflow-y-auto space-y-1.5">
                            {dayQuotes.map(quote => (
                              <Link 
                                key={quote.id} 
                                href={`/dashboard/quotes/${quote.id}`}
                                className={`block p-1.5 rounded-md border text-xs truncate transition-all hover:brightness-110 ${getStatusColor(quote.status)}`}
                              >
                                <div className="flex items-center font-medium mb-0.5 truncate">
                                  {getStatusIcon(quote.status)}
                                  <span className="truncate">{quote.client?.name?.split(' ')[0]}</span>
                                </div>
                                <div className="truncate opacity-80 pl-4">{quote.serviceType}</div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Mobile View (Compact Grid + List) */}
            <div className="flex sm:hidden flex-col">
              <div className="grid grid-cols-7 border-b border-slate-800 bg-slate-950/50">
                {weekDays.map((day, index) => (
                  <div key={index} className="py-2 text-center text-[10px] font-semibold text-slate-500 uppercase">
                    {day}
                  </div>
                ))}
              </div>
              
              <div className="grid grid-cols-7 bg-slate-800/30 gap-[1px]">
                {days.map((day, index) => {
                  const dayQuotes = day ? getQuotesForDay(day) : [];
                  const isSelected = day === selectedDay;
                  
                  return (
                    <div 
                      key={index} 
                      onClick={() => day && setSelectedDay(day)}
                      className={`min-h-[50px] bg-slate-900 p-1 flex flex-col items-center justify-center relative ${isSelected ? 'bg-indigo-600/20 ring-1 ring-inset ring-indigo-500' : ''}`}
                    >
                      {day && (
                        <>
                          <span className={`text-xs font-medium ${isToday(day) ? 'text-indigo-400' : 'text-slate-400'}`}>
                            {day}
                          </span>
                          {dayQuotes.length > 0 && (
                            <div className="flex mt-1 space-x-0.5">
                              {dayQuotes.slice(0, 3).map((_, i) => (
                                <div key={i} className="w-1 h-1 rounded-full bg-indigo-500"></div>
                              ))}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Selected Day Agenda */}
              <div className="p-4 bg-slate-950/30 min-h-[200px]">
                <h3 className="text-sm font-bold text-slate-50 mb-4 flex items-center">
                  Execuções de {selectedDay ? `${selectedDay} de ${monthName}` : 'Selecione um dia'}
                </h3>
                
                {selectedDay && getQuotesForDay(selectedDay).length > 0 ? (
                  <div className="space-y-3">
                    {getQuotesForDay(selectedDay).map(quote => (
                      <Link 
                        key={quote.id} 
                        href={`/dashboard/quotes/${quote.id}`}
                        className={`block p-3 rounded-xl border ${getStatusColor(quote.status)} shadow-sm transition-transform active:scale-[0.98]`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="font-bold text-sm truncate pr-2">{quote.client?.name}</div>
                          {getStatusBadge(quote.status)}
                        </div>
                        <div className="text-xs opacity-90 font-medium">{quote.serviceType}</div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-xs text-slate-500 italic">Nenhum serviço agendado para este dia.</p>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
