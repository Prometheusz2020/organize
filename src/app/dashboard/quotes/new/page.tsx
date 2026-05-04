"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { getClients, createQuote } from "@/actions";

export default function NewQuote() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [clients, setClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(true);

  const [formData, setFormData] = useState({
    clientId: "",
    serviceType: "",
    description: "",
    value: "",
    date: new Date().toISOString().split('T')[0],
    endDate: "",
    status: "Pendente",
    paymentMethod: "À vista",
  });

  const [installments, setInstallments] = useState<any[]>([]);

  useEffect(() => {
    const fetchClientsData = async () => {
      try {
        const data = await getClients();
        setClients(data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoadingClients(false);
      }
    };

    fetchClientsData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handlePaymentMethodChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setFormData({ ...formData, paymentMethod: val });
    if (val !== "Parcelado") {
      setInstallments([]);
    } else if (installments.length === 0) {
      generateInstallments(2);
    }
  };

  const generateInstallments = (count: number) => {
    const totalValue = parseFloat(formData.value || "0");
    const baseDate = new Date(formData.date);
    const newInstallments = [];

    const installmentValue = (totalValue / count).toFixed(2);

    for (let i = 1; i <= count; i++) {
      const dueDate = new Date(baseDate);
      dueDate.setMonth(dueDate.getMonth() + i);
      
      // Handle edge cases where adding month changes the day (e.g., Jan 31 -> Feb 28/29)
      if (dueDate.getDate() !== baseDate.getDate()) {
        dueDate.setDate(0);
      }

      newInstallments.push({
        number: i,
        value: installmentValue,
        dueDate: dueDate.toISOString().split('T')[0],
        status: "Pendente"
      });
    }

    // Adjust last installment to prevent rounding errors
    if (count > 0 && totalValue > 0) {
      const sum = parseFloat(installmentValue) * (count - 1);
      newInstallments[count - 1].value = (totalValue - sum).toFixed(2);
    }

    setInstallments(newInstallments);
  };

  const updateInstallment = (index: number, field: string, value: string) => {
    const updated = [...installments];
    updated[index] = { ...updated[index], [field]: value };
    setInstallments(updated);
  };

  const addInstallment = () => {
    const i = installments.length + 1;
    const dueDate = new Date(formData.date);
    dueDate.setMonth(dueDate.getMonth() + i);

    setInstallments([...installments, {
      number: i,
      value: "0",
      dueDate: dueDate.toISOString().split('T')[0],
      status: "Pendente"
    }]);
  };

  const removeInstallment = (index: number) => {
    const updated = installments.filter((_, idx) => idx !== index).map((inst, idx) => ({
      ...inst,
      number: idx + 1
    }));
    setInstallments(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.clientId) {
      setError("Por favor, selecione um cliente.");
      return;
    }

    if (formData.paymentMethod === "Parcelado" && installments.length === 0) {
      setError("Por favor, defina as parcelas ou mude a forma de pagamento.");
      return;
    }

    // Validate if total installments match quote value (optional, but good UX)
    if (formData.paymentMethod === "Parcelado") {
      const totalInstallments = installments.reduce((acc, curr) => acc + parseFloat(curr.value || "0"), 0);
      const totalValue = parseFloat(formData.value || "0");
      if (Math.abs(totalInstallments - totalValue) > 0.1) {
        setError(`A soma das parcelas (R$ ${totalInstallments.toFixed(2)}) não bate com o valor total (R$ ${totalValue.toFixed(2)}).`);
        return;
      }
    }

    setLoading(true);
    setError("");

    try {
      await createQuote({
        ...formData,
        installmentsData: formData.paymentMethod === "Parcelado" ? installments : []
      });
      router.push("/dashboard/quotes");
    } catch (err) {
      console.error("Error adding quote:", err);
      setError("Erro ao salvar o orçamento. Tente novamente.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/quotes"
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-50 tracking-tight">Novo Orçamento</h1>
          <p className="text-sm text-slate-400">Crie um orçamento para um serviço específico.</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-6 sm:p-8">
        {error && (
          <div className="mb-6 bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
            
            <div className="sm:col-span-2">
              <label htmlFor="clientId" className="block text-sm font-medium text-slate-300 mb-1">
                Cliente *
              </label>
              {loadingClients ? (
                <div className="text-sm text-slate-500 py-2 flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-500 mr-2"></div>
                  Carregando clientes...
                </div>
              ) : clients.length === 0 ? (
                <div className="rounded-md bg-amber-900/30 p-4 border border-amber-500/30">
                  <div className="flex">
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-amber-400">Nenhum cliente cadastrado</h3>
                      <div className="mt-2 text-sm text-amber-200">
                        <p>Você precisa cadastrar um cliente antes de criar um orçamento.</p>
                      </div>
                      <div className="mt-4">
                        <Link
                          href="/dashboard/clients/new"
                          className="text-sm font-medium text-amber-400 hover:text-amber-300 underline"
                        >
                          Ir para Cadastro de Clientes
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <select
                  id="clientId"
                  name="clientId"
                  required
                  value={formData.clientId}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                >
                  <option value="" disabled className="text-slate-500">Selecione um cliente</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id} className="text-slate-50">
                      {client.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="serviceType" className="block text-sm font-medium text-slate-300 mb-1">
                Tipo de Serviço *
              </label>
              <input
                type="text"
                name="serviceType"
                id="serviceType"
                required
                value={formData.serviceType}
                onChange={handleChange}
                className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                placeholder="Ex: Instalação Elétrica, Reforma de Fachada, Consultoria"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="description" className="block text-sm font-medium text-slate-300 mb-1">
                Descrição do Serviço *
              </label>
              <textarea
                id="description"
                name="description"
                required
                rows={4}
                value={formData.description}
                onChange={handleChange}
                className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                placeholder="Detalhes do que será feito, materiais inclusos, etc."
              />
            </div>

            <div>
              <label htmlFor="value" className="block text-sm font-medium text-slate-300 mb-1">
                Valor Estimado (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                name="value"
                id="value"
                required
                value={formData.value}
                onChange={(e) => {
                  handleChange(e);
                  if (formData.paymentMethod === "Parcelado" && installments.length > 0) {
                    // Update installments if total changes
                    const totalValue = parseFloat(e.target.value || "0");
                    const count = installments.length;
                    const installmentValue = (totalValue / count).toFixed(2);
                    const newInst = [...installments];
                    for (let i = 0; i < count; i++) {
                      newInst[i].value = installmentValue;
                    }
                    if (count > 0 && totalValue > 0) {
                      const sum = parseFloat(installmentValue) * (count - 1);
                      newInst[count - 1].value = (totalValue - sum).toFixed(2);
                    }
                    setInstallments(newInst);
                  }
                }}
                className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                placeholder="0.00"
              />
            </div>

            <div className="sm:col-span-2">
              <label htmlFor="date" className="block text-sm font-medium text-slate-300 mb-1">
                Data de Execução do Serviço *
              </label>
              <input
                type="date"
                name="date"
                id="date"
                required
                value={formData.date}
                onChange={handleChange}
                className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
              />
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="status" className="block text-sm font-medium text-slate-300 mb-1">
                Status *
              </label>
              <select
                id="status"
                name="status"
                required
                value={formData.status}
                onChange={handleChange}
                className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
              >
                <option value="Pendente" className="text-slate-50">Pendente</option>
                <option value="Aprovado" className="text-slate-50">Aprovado</option>
                <option value="Rejeitado" className="text-slate-50">Rejeitado</option>
              </select>
            </div>

            <div className="sm:col-span-1">
              <label htmlFor="paymentMethod" className="block text-sm font-medium text-slate-300 mb-1">
                Forma de Pagamento *
              </label>
              <select
                id="paymentMethod"
                name="paymentMethod"
                required
                value={formData.paymentMethod}
                onChange={handlePaymentMethodChange}
                className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
              >
                <option value="À vista" className="text-slate-50">À vista</option>
                <option value="Parcelado" className="text-slate-50">Parcelado</option>
                <option value="Sinal + Restante" className="text-slate-50">Sinal + Restante</option>
              </select>
            </div>

            {formData.paymentMethod === "Parcelado" && (
              <div className="sm:col-span-2 mt-4 border-t border-slate-800 pt-6">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-medium text-slate-50">Parcelas</h3>
                  <div className="flex space-x-2 items-center">
                    <span className="text-sm text-slate-400">Dividir em:</span>
                    <select
                      className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1 text-slate-50 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                      onChange={(e) => generateInstallments(parseInt(e.target.value))}
                      value={installments.length > 0 ? installments.length : ""}
                    >
                      {[2, 3, 4, 5, 6, 10, 12].map(num => (
                        <option key={num} value={num}>{num}x</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-3">
                  {installments.map((inst, index) => (
                    <div key={index} className="flex items-center space-x-3 bg-slate-950 p-3 rounded-lg border border-slate-800">
                      <div className="text-sm font-medium text-slate-400 w-8">
                        {inst.number}ª
                      </div>
                      <div className="flex-[1.5]">
                        <label className="sr-only">Valor</label>
                        <div className="relative">
                          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                            <span className="text-slate-500 sm:text-sm">R$</span>
                          </div>
                          <input
                            type="number"
                            step="0.01"
                            value={inst.value}
                            onChange={(e) => updateInstallment(index, 'value', e.target.value)}
                            className="block w-full rounded-md border border-slate-700 bg-slate-900 pl-10 pr-3 py-1.5 text-slate-50 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                          />
                        </div>
                      </div>
                      <div className="flex-1">
                        <label className="sr-only">Data Vencimento</label>
                        <input
                          type="date"
                          value={inst.dueDate}
                          onChange={(e) => updateInstallment(index, 'dueDate', e.target.value)}
                          className="block w-full rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-slate-50 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeInstallment(index)}
                        className="text-slate-500 hover:text-red-400 p-1"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
                
                <button
                  type="button"
                  onClick={addInstallment}
                  className="mt-3 flex items-center text-sm font-medium text-indigo-400 hover:text-indigo-300"
                >
                  <Plus className="h-4 w-4 mr-1" /> Adicionar parcela manualmente
                </button>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <Link
              href="/dashboard/quotes"
              className="rounded-lg bg-slate-800 px-4 py-2 text-sm font-medium text-slate-300 shadow-sm border border-slate-700 hover:bg-slate-700 hover:text-slate-50 focus:outline-none mr-3 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={loading || clients.length === 0}
              className="inline-flex justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:bg-indigo-800 transition-colors"
            >
              {loading ? (
                "Salvando..."
              ) : (
                <>
                  <Save className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Salvar Orçamento
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
