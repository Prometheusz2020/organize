"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  AlertCircle,
  Building2,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
  Download,
  FileText,
  Mail,
  MapPin,
  Phone,
  XCircle,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { jsPDF } from "jspdf";
import "jspdf-autotable";

interface Quote {
  id: string;
  serviceType: string;
  description: string;
  value: number;
  date: string;
  endDate?: string;
  status: string;
  paymentMethod?: string;
  createdAt: string;
  client: {
    name: string;
    phone?: string;
    email?: string;
    address?: string;
  };
  company: {
    companyName?: string;
    name?: string;
    phone?: string;
    email?: string;
  };
  installments: {
    number: number;
    value: number;
    dueDate: string;
    status: string;
  }[];
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);

function StatusBadge({ status }: { status: string }) {
  if (status === "Aprovado" || status === "Pago") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-3 py-1 text-sm font-semibold text-emerald-400 ring-1 ring-emerald-500/25">
        <CheckCircle className="h-4 w-4" /> {status}
      </span>
    );
  }

  if (status === "Rejeitado") {
    return (
      <span className="inline-flex items-center gap-1.5 rounded-full bg-red-500/15 px-3 py-1 text-sm font-semibold text-red-400 ring-1 ring-red-500/25">
        <XCircle className="h-4 w-4" /> {status}
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/15 px-3 py-1 text-sm font-semibold text-amber-400 ring-1 ring-amber-500/25">
      <Clock className="h-4 w-4" /> Pendente
    </span>
  );
}

export default function PublicQuotePage() {
  const params = useParams();
  const quoteId = params.id as string;

  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    if (!quoteId) {
      setLoading(false);
      return;
    }

    let isCancelled = false;
    const controller = new AbortController();

    const fetchQuote = async () => {
      try {
        const response = await fetch(`/api/quotes/${quoteId}/public`, {
          signal: controller.signal,
          cache: "no-store",
        });

        const data = await response.json();

        if (!response.ok || data.error) {
          throw new Error(data.error || "Erro ao carregar o orçamento");
        }

        if (!isCancelled) {
          setQuote(data as Quote);
        }
      } catch (err) {
        if (controller.signal.aborted) {
          return;
        }

        if (!isCancelled) {
          setError(err instanceof Error ? err.message : "Erro ao carregar o orçamento.");
        }
      } finally {
        if (!isCancelled) {
          setLoading(false);
        }
      }
    };

    fetchQuote();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [quoteId]);

  const buildPDF = () => {
    if (!quote) return null;

    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const companyName = quote.company?.companyName || quote.company?.name || "Nossa Empresa";
    const pageW = 210;
    const margin = 14;
    const contentW = pageW - margin * 2;

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, pageW, 15, "F");
    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8);
    doc.setFont("helvetica", "normal");
    doc.text(companyName.toUpperCase(), pageW - margin, 10, { align: "right" });

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("ORÇAMENTO", margin, 23);

    doc.setTextColor(148, 163, 184);
    doc.setFontSize(8.5);
    doc.setFont("helvetica", "normal");
    doc.text(`Emitido em ${format(new Date(quote.createdAt), "dd/MM/yyyy")}`, pageW - margin, 28, { align: "right" });

    const statusColors: Record<string, [number, number, number]> = {
      Aprovado: [16, 185, 129],
      Pendente: [245, 158, 11],
      Rejeitado: [239, 68, 68],
    };
    const statusColor = statusColors[quote.status] ?? [245, 158, 11];

    doc.setFillColor(...statusColor);
    doc.roundedRect(pageW - 48, 10, 30, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "bold");
    doc.text(quote.status.toUpperCase(), pageW - 33, 15.5, { align: "center" });

    let y = 40;
    const cards = [
      { label: "CLIENTE", value: quote.client?.name || "—" },
      { label: "TELEFONE", value: quote.client?.phone || "Não informado" },
      { label: "PAGAMENTO", value: quote.paymentMethod || "À vista" },
      { label: "VALOR TOTAL", value: formatCurrency(quote.value) },
    ];

    const cardW = (contentW - 6) / cards.length;
    cards.forEach((card, index) => {
      const x = margin + index * (cardW + 2);
      doc.setFillColor(241, 245, 249);
      doc.roundedRect(x, y, cardW, 26, 2, 2, "F");
      doc.setFillColor(99, 102, 241);
      doc.rect(x, y, 2, 26, "F");
      doc.setFontSize(7);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(100, 116, 139);
      doc.text(card.label, x + 5, y + 8);
      doc.setFontSize(card.label === "VALOR TOTAL" ? 10 : 8.5);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(
        card.label === "VALOR TOTAL" ? 79 : 15,
        card.label === "VALOR TOTAL" ? 70 : 23,
        card.label === "VALOR TOTAL" ? 229 : 42
      );
      const split = doc.splitTextToSize(card.value, cardW - 8);
      doc.text(split, x + 5, y + 15);
    });

    y += 40;

    doc.setFillColor(15, 23, 42);
    doc.roundedRect(margin, y, contentW, 8, 1, 1, "F");
    doc.setFontSize(8);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("DETALHES DO SERVIÇO", margin + 4, y + 5.5);
    y += 14;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(15, 23, 42);
    doc.text("Tipo de Serviço:", margin, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    doc.text(quote.serviceType, margin + 45, y);
    y += 8;

    doc.setFont("helvetica", "bold");
    doc.setTextColor(15, 23, 42);
    doc.text("Descrição:", margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(51, 65, 85);
    const splitDescription = doc.splitTextToSize(quote.description || "Sem descrição informada.", contentW);
    doc.text(splitDescription, margin, y);
    y += splitDescription.length * 5 + 8;

    if (quote.installments?.length) {
      doc.setFillColor(15, 23, 42);
      doc.roundedRect(margin, y, contentW, 8, 1, 1, "F");
      doc.setFontSize(8);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(255, 255, 255);
      doc.text("PARCELAMENTO", margin + 4, y + 5.5);
      y += 10;

      const tableData = quote.installments.map((inst) => [
        `${inst.number}ª`,
        format(new Date(inst.dueDate), "dd/MM/yyyy"),
        formatCurrency(inst.value),
        inst.status,
      ]);

      (doc as any).autoTable({
        startY: y,
        margin: { left: margin, right: margin },
        head: [["Parcela", "Vencimento", "Valor", "Status"]],
        body: tableData,
        theme: "grid",
        headStyles: {
          fillColor: [99, 102, 241],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 8,
          cellPadding: 4,
        },
        bodyStyles: {
          fontSize: 8,
          cellPadding: 3.5,
          textColor: [51, 65, 85],
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        columnStyles: {
          0: { halign: "center", cellWidth: 20 },
          2: { halign: "right" },
          3: { halign: "center" },
        },
      });

      y = (doc as any).lastAutoTable.finalY + 10;
    }

    doc.setFillColor(238, 242, 255);
    doc.roundedRect(margin, y, contentW, 18, 2, 2, "F");
    doc.setDrawColor(199, 210, 254);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, y, contentW, 18, 2, 2, "S");
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(99, 102, 241);
    doc.text("VALOR TOTAL DO ORÇAMENTO", margin + 5, y + 11);
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text(formatCurrency(quote.value), pageW - margin, y + 11, { align: "right" });

    if (y < 240) {
      const sigY = Math.max(y + 22, 240);
      doc.setDrawColor(203, 213, 225);
      doc.setLineWidth(0.3);
      doc.line(margin, sigY, margin + 65, sigY);
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(100, 116, 139);
      doc.text("Assinatura do Cliente", margin, sigY + 5);
      doc.text(quote.client?.name || "", margin, sigY + 10);
      doc.line(pageW - margin - 65, sigY, pageW - margin, sigY);
      doc.text("Assinatura / Responsável", pageW - margin - 65, sigY + 5);
      doc.text(companyName, pageW - margin - 65, sigY + 10);
    }

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 282, pageW, 15, "F");
    doc.setFontSize(7.5);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184);
    doc.text(`Documento gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")} · ${companyName}`, margin, 289);
    doc.text("Obrigado pela preferência!", pageW - margin, 289, { align: "right" });

    return doc;
  };

  const handleDownloadPDF = () => {
    if (!quote) return;

    try {
      setDownloading(true);
      const doc = buildPDF();
      if (!doc) return;
      doc.save(`Orcamento_${(quote.client?.name || "cliente").replace(/\s+/g, "_")}.pdf`);
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-100">
        <div className="flex items-center gap-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 shadow-lg">
          <div className="h-5 w-5 animate-spin rounded-full border-2 border-slate-400 border-t-indigo-500" />
          <span className="text-sm font-medium">Carregando orçamento...</span>
        </div>
      </div>
    );
  }

  if (error || !quote) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6 text-slate-100">
        <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 text-center shadow-xl">
          <AlertCircle className="mx-auto mb-3 h-10 w-10 text-red-400" />
          <h1 className="text-xl font-bold text-white">Orçamento indisponível</h1>
          <p className="mt-2 text-sm text-slate-300">{error || "Este orçamento não foi encontrado ou está indisponível."}</p>
          <Link
            href="/dashboard/quotes"
            className="mt-5 inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500"
          >
            Voltar aos orçamentos
          </Link>
        </div>
      </div>
    );
  }

  const companyName = quote.company?.companyName || quote.company?.name || "Nossa Empresa";

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-100">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex flex-col gap-4 rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-indigo-400">Orçamento</p>
            <h1 className="mt-2 text-2xl font-bold text-white">{companyName}</h1>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge status={quote.status} />
            <button
              type="button"
              onClick={handleDownloadPDF}
              disabled={downloading}
              className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <Download className="h-4 w-4" />
              {downloading ? "Gerando..." : "Baixar PDF"}
            </button>
          </div>
        </div>

        <section className="grid gap-6 md:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
            <div className="mb-4 flex items-center gap-2 text-indigo-300">
              <FileText className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Detalhes do orçamento</h2>
            </div>

            <div className="space-y-4 text-sm text-slate-300">
              <div className="flex items-start gap-3 rounded-xl bg-slate-950/60 p-3">
                <Building2 className="mt-0.5 h-4 w-4 text-slate-400" />
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Cliente</p>
                  <p className="mt-1 font-medium text-white">{quote.client?.name}</p>
                </div>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="flex items-start gap-3 rounded-xl bg-slate-950/60 p-3">
                  <Phone className="mt-0.5 h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Telefone</p>
                    <p className="mt-1 font-medium text-white">{quote.client?.phone || "Não informado"}</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 rounded-xl bg-slate-950/60 p-3">
                  <Mail className="mt-0.5 h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">E-mail</p>
                    <p className="mt-1 font-medium text-white">{quote.client?.email || "Não informado"}</p>
                  </div>
                </div>
              </div>

              {quote.client?.address ? (
                <div className="flex items-start gap-3 rounded-xl bg-slate-950/60 p-3">
                  <MapPin className="mt-0.5 h-4 w-4 text-slate-400" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-slate-500">Endereço</p>
                    <p className="mt-1 font-medium text-white">{quote.client.address}</p>
                  </div>
                </div>
              ) : null}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
            <div className="mb-4 flex items-center gap-2 text-indigo-300">
              <CreditCard className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Resumo</h2>
            </div>

            <dl className="space-y-4 text-sm text-slate-300">
              <div className="rounded-xl bg-slate-950/60 p-3">
                <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Valor total</dt>
                <dd className="mt-1 text-2xl font-bold text-indigo-400">{formatCurrency(quote.value)}</dd>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl bg-slate-950/60 p-3">
                  <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Serviço</dt>
                  <dd className="mt-1 font-medium text-white">{quote.serviceType}</dd>
                </div>
                <div className="rounded-xl bg-slate-950/60 p-3">
                  <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Execução</dt>
                  <dd className="mt-1 font-medium text-white">
                    {format(new Date(quote.date), "dd/MM/yyyy", { locale: ptBR })}
                  </dd>
                </div>
              </div>

              <div className="rounded-xl bg-slate-950/60 p-3">
                <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Pagamento</dt>
                <dd className="mt-1 font-medium text-white">{quote.paymentMethod || "À vista"}</dd>
              </div>

              <div className="rounded-xl bg-slate-950/60 p-3">
                <dt className="text-xs uppercase tracking-[0.18em] text-slate-500">Emissão</dt>
                <dd className="mt-1 font-medium text-white">
                  {format(new Date(quote.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                </dd>
              </div>
            </dl>
          </div>
        </section>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
          <div className="mb-4 flex items-center gap-2 text-indigo-300">
            <Calendar className="h-5 w-5" />
            <h2 className="text-lg font-semibold">Descrição do serviço</h2>
          </div>
          <p className="whitespace-pre-wrap text-sm leading-7 text-slate-300">{quote.description || "Sem descrição informada."}</p>
        </section>

        {quote.installments?.length ? (
          <section className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-lg">
            <div className="mb-4 flex items-center gap-2 text-indigo-300">
              <FileText className="h-5 w-5" />
              <h2 className="text-lg font-semibold">Parcelamento</h2>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-800">
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-sm text-slate-200">
                  <thead className="bg-slate-950/80 text-xs uppercase tracking-[0.18em] text-slate-400">
                    <tr>
                      <th className="px-4 py-3">Parcela</th>
                      <th className="px-4 py-3">Vencimento</th>
                      <th className="px-4 py-3">Valor</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {quote.installments.map((installment) => (
                      <tr key={`${quote.id}-${installment.number}`} className="border-t border-slate-800 bg-slate-900/40">
                        <td className="px-4 py-3 font-medium text-white">{installment.number}ª</td>
                        <td className="px-4 py-3">
                          {format(new Date(installment.dueDate), "dd/MM/yyyy", { locale: ptBR })}
                        </td>
                        <td className="px-4 py-3">{formatCurrency(installment.value)}</td>
                        <td className="px-4 py-3">
                          <span
                            className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                              installment.status === "Pago"
                                ? "bg-emerald-500/15 text-emerald-300"
                                : installment.status === "Atrasado"
                                  ? "bg-red-500/15 text-red-300"
                                  : "bg-amber-500/15 text-amber-300"
                            }`}
                          >
                            {installment.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
        ) : null}
      </div>
    </main>
  );
}
