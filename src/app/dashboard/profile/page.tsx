"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { Save, User as UserIcon, Building, Phone, Fingerprint, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { updateSelfAction } from "@/actions";

export default function ProfilePage() {
  const { data: session, update } = useSession();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    companyName: "",
    phone: "",
    cpf: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    if (session?.user) {
      setFormData({
        name: (session.user as any).name || "",
        email: session.user.email || "",
        companyName: (session.user as any).companyName || "",
        phone: (session.user as any).phone || "",
        cpf: (session.user as any).cpf || "",
        password: "",
        confirmPassword: "",
      });
      setLoading(false);
    }
  }, [session]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      setSaving(false);
      return;
    }

    try {
      await updateSelfAction(formData);
      setSuccess("Perfil atualizado com sucesso!");
      setFormData({ ...formData, password: "", confirmPassword: "" });
      
      // Update the local session if needed
      await update();
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar perfil.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-50 tracking-tight">Meu Perfil</h1>
        <p className="mt-2 text-sm text-slate-400">
          Gerencie suas informações pessoais e altere sua senha de acesso.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-slate-900 rounded-xl border border-slate-800 p-6 flex flex-col items-center text-center">
            <div className="h-24 w-24 rounded-full bg-indigo-500/10 flex items-center justify-center text-indigo-400 text-3xl font-bold border-2 border-indigo-500/20 mb-4">
              {formData.name?.charAt(0).toUpperCase() || formData.email?.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-slate-50">{formData.name || "Usuário"}</h2>
            <p className="text-sm text-slate-500">{formData.email}</p>
            <div className="mt-4 inline-flex items-center rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-400 ring-1 ring-inset ring-indigo-500/20">
              {(session?.user as any)?.role === "ADMIN" ? "Administrador" : "Prestador"}
            </div>
          </div>

          <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-6">
            <h4 className="text-sm font-bold text-indigo-300 mb-2 flex items-center">
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Segurança
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Recomendamos o uso de uma senha forte com pelo menos 8 caracteres, misturando letras, números e símbolos.
            </p>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
            <form onSubmit={handleSubmit} className="divide-y divide-slate-800">
              <div className="p-6 space-y-6">
                {error && (
                  <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 flex items-center text-red-400 text-sm">
                    <AlertCircle className="h-5 w-5 mr-3 flex-shrink-0" />
                    {error}
                  </div>
                )}
                {success && (
                  <div className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4 flex items-center text-emerald-400 text-sm">
                    <CheckCircle2 className="h-5 w-5 mr-3 flex-shrink-0" />
                    {success}
                  </div>
                )}

                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center">
                      <UserIcon className="h-4 w-4 mr-2 text-slate-500" />
                      Nome Completo
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50 focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center">
                      <Building className="h-4 w-4 mr-2 text-slate-500" />
                      Nome da Empresa
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50 focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center">
                      <Phone className="h-4 w-4 mr-2 text-slate-500" />
                      Telefone / WhatsApp
                    </label>
                    <input
                      type="text"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50 focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300 flex items-center">
                      <Fingerprint className="h-4 w-4 mr-2 text-slate-500" />
                      CPF
                    </label>
                    <input
                      type="text"
                      name="cpf"
                      value={formData.cpf}
                      onChange={handleChange}
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50 focus:border-indigo-500 focus:outline-none transition-colors"
                    />
                  </div>
                </div>

                <div className="pt-6 border-t border-slate-800">
                  <h3 className="text-sm font-bold text-slate-50 mb-4 flex items-center">
                    <Lock className="h-4 w-4 mr-2 text-indigo-400" />
                    Alterar Senha
                  </h3>
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Nova Senha</label>
                      <input
                        type="password"
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Deixe vazio para manter"
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50 focus:border-indigo-500 focus:outline-none transition-colors placeholder-slate-600"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-slate-300">Confirmar Nova Senha</label>
                      <input
                        type="password"
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Repita a nova senha"
                        className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-slate-50 focus:border-indigo-500 focus:outline-none transition-colors placeholder-slate-600"
                      />
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-slate-900/50 flex justify-end">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-800 transition-all"
                >
                  {saving ? (
                    "Salvando..."
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Salvar Alterações
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
