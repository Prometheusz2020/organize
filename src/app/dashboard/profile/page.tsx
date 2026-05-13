"use client";

import { useState } from "react";
import { Save, Lock, CheckCircle2, AlertCircle } from "lucide-react";
import { updateSelfAction } from "@/actions";

export default function ProfilePage() {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.password) {
      setError("Por favor, digite uma nova senha.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("As senhas não coincidem.");
      return;
    }

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      await updateSelfAction({ password: formData.password });
      setSuccess("Senha alterada com sucesso!");
      setFormData({ password: "", confirmPassword: "" });
    } catch (err: any) {
      setError(err.message || "Erro ao atualizar senha.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-50 tracking-tight">Segurança</h1>
        <p className="mt-2 text-sm text-slate-400">
          Altere sua senha de acesso ao sistema Organize.
        </p>
      </div>

      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-800 bg-slate-900/50">
          <h3 className="text-lg font-bold text-slate-50 flex items-center">
            <Lock className="h-5 w-5 mr-2 text-indigo-400" />
            Alterar Senha
          </h3>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
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

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Nova Senha</label>
              <input
                type="password"
                name="password"
                required
                minLength={6}
                value={formData.password}
                onChange={handleChange}
                placeholder="Digite sua nova senha"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-50 focus:border-indigo-500 focus:outline-none transition-colors placeholder-slate-600"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Confirmar Nova Senha</label>
              <input
                type="password"
                name="confirmPassword"
                required
                minLength={6}
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Repita a nova senha"
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-2.5 text-slate-50 focus:border-indigo-500 focus:outline-none transition-colors placeholder-slate-600"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-8 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-indigo-800 transition-all"
            >
              {saving ? (
                "Salvando..."
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Atualizar Senha
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-xl p-6">
        <p className="text-xs text-slate-400 leading-relaxed">
          <strong>Dica de segurança:</strong> Use uma senha única que você não utiliza em outros sites. 
          Após clicar em "Atualizar Senha", sua nova senha entrará em vigor imediatamente.
        </p>
      </div>
    </div>
  );
}
