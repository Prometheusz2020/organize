"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Save, User, Building, Lock, CreditCard } from "lucide-react";

export default function SetupPage() {
  const { data: session, update } = useSession();
  const router = useRouter();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    companyName: "",
    cpf: "",
    password: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/setup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (res.ok) {
        // Atualiza a sessão local para refletir os novos dados (nome, empresa, etc)
        await update({
          ...session,
          user: {
            ...session?.user,
            name: formData.name,
            companyName: formData.companyName,
            licenseStatus: "Ativo"
          }
        });
        
        // Redireciona para o dashboard principal
        router.push("/dashboard");
        router.refresh();
      } else {
        setError(data.error || "Ocorreu um erro ao salvar os dados.");
      }
    } catch (err) {
      setError("Erro de conexão. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pt-8 pb-16">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-slate-50 tracking-tight mb-2">Complete seu Cadastro</h1>
        <p className="text-slate-400">
          Para começar a usar o sistema, precisamos de mais alguns dados e que você defina sua senha definitiva.
        </p>
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
              <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1 flex items-center">
                <User className="h-4 w-4 mr-2 text-slate-500" />
                Seu Nome Completo *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                value={formData.name}
                onChange={handleChange}
                className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-50 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                placeholder="Ex: João da Silva"
              />
            </div>

            <div>
              <label htmlFor="companyName" className="block text-sm font-medium text-slate-300 mb-1 flex items-center">
                <Building className="h-4 w-4 mr-2 text-slate-500" />
                Nome da Empresa ou Negócio *
              </label>
              <input
                type="text"
                name="companyName"
                id="companyName"
                required
                value={formData.companyName}
                onChange={handleChange}
                className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-50 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                placeholder="Ex: JS Pinturas"
              />
            </div>

            <div>
              <label htmlFor="cpf" className="block text-sm font-medium text-slate-300 mb-1 flex items-center">
                <CreditCard className="h-4 w-4 mr-2 text-slate-500" />
                CPF / CNPJ
              </label>
              <input
                type="text"
                name="cpf"
                id="cpf"
                value={formData.cpf}
                onChange={handleChange}
                className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-50 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                placeholder="000.000.000-00"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1 flex items-center">
                <Lock className="h-4 w-4 mr-2 text-slate-500" />
                Sua Senha Definitiva *
              </label>
              <input
                type="password"
                name="password"
                id="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-50 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                placeholder="Mínimo 6 caracteres"
              />
              <p className="mt-1 text-xs text-slate-500">
                Esta senha substituirá a senha temporária enviada para o seu e-mail.
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={loading}
              className="flex w-full justify-center rounded-lg bg-indigo-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:bg-indigo-800 transition-all"
            >
              {loading ? (
                "Salvando..."
              ) : (
                <>
                  <Save className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Concluir Cadastro e Acessar Sistema
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
