"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Save, Shield, Mail, Lock, User as UserIcon } from "lucide-react";
import { getUserAction, updateUserAction } from "@/actions";

export default function EditUserPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    companyName: "",
    phone: "",
    cpf: "",
    role: "USER",
    licenseStatus: "Ativo",
  });

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const user = await getUserAction(id);
        if (user) {
          setFormData({
            name: user.name || "",
            email: user.email || "",
            password: "", // Keep empty unless changing
            companyName: user.companyName || "",
            phone: user.phone || "",
            cpf: user.cpf || "",
            role: user.role || "USER",
            licenseStatus: user.licenseStatus || "Ativo",
          });
        }
      } catch (err: any) {
        setError("Erro ao carregar usuário.");
      } finally {
        setLoading(false);
      }
    };
    fetchUser();
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setSaving(true);
    setError("");

    try {
      const updateData: any = { ...formData };
      if (!updateData.password) {
        delete updateData.password; // Don't update password if empty
      }

      await updateUserAction(id, updateData);
      // Force a refresh of the users list
      router.refresh();
      // Navigate back
      router.push("/dashboard/users");
    } catch (err: any) {
      console.error("Error updating user:", err);
      setError(err.message || "Erro ao atualizar o usuário. Tente novamente.");
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
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/users"
          className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-slate-50 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-slate-50 tracking-tight">Editar Usuário</h1>
          <p className="text-sm text-slate-400">Atualize os dados e o status da licença do prestador.</p>
        </div>
      </div>

      <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-6 sm:p-8">
        {error && (
          <div className="mb-6 bg-red-900/30 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-sm text-red-400">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-1">
                  Nome do Usuário *
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-50 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                />
              </div>

              <div>
                <label htmlFor="companyName" className="block text-sm font-medium text-slate-300 mb-1">
                  Nome da Empresa *
                </label>
                <input
                  type="text"
                  name="companyName"
                  id="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-50 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-1">
                  Telefone / WhatsApp
                </label>
                <input
                  type="text"
                  name="phone"
                  id="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-50 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                />
              </div>

              <div>
                <label htmlFor="cpf" className="block text-sm font-medium text-slate-300 mb-1">
                  CPF
                </label>
                <input
                  type="text"
                  name="cpf"
                  id="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-50 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-1">
                  Email de Acesso *
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-50 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                />
              </div>

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-1">
                  Nova Senha (deixe vazio para não alterar)
                </label>
                <input
                  type="password"
                  name="password"
                  id="password"
                  minLength={6}
                  value={formData.password}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-50 placeholder-slate-600 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                  placeholder="Nova senha opcional"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="role" className="block text-sm font-medium text-slate-300 mb-1">
                  Cargo / Nível
                </label>
                <select
                  name="role"
                  id="role"
                  value={formData.role}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-50 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                >
                  <option value="USER">Usuário (Padrão)</option>
                  <option value="ADMIN">Administrador</option>
                </select>
              </div>

              <div>
                <label htmlFor="licenseStatus" className="block text-sm font-medium text-slate-300 mb-1">
                  Status da Licença
                </label>
                <select
                  name="licenseStatus"
                  id="licenseStatus"
                  value={formData.licenseStatus}
                  onChange={handleChange}
                  className="block w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-slate-50 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm transition-colors"
                >
                  <option value="Ativo">Ativo</option>
                  <option value="Pendente">Aguardando Pagamento</option>
                  <option value="Expirado">Expirado</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-6 border-t border-slate-800">
            <Link
              href="/dashboard/users"
              className="rounded-lg bg-slate-800 px-6 py-2.5 text-sm font-medium text-slate-300 shadow-sm border border-slate-700 hover:bg-slate-700 hover:text-slate-50 focus:outline-none mr-3 transition-colors"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex justify-center rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:bg-indigo-800 transition-all"
            >
              {saving ? "Salvando..." : "Atualizar Usuário"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
