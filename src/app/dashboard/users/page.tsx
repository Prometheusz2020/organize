"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { 
  UserPlus, 
  Mail, 
  Shield, 
  Activity, 
  Trash2, 
  Edit,
  Search,
  CheckCircle,
  XCircle,
  Clock
} from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { getUsers, deleteUserAction, updateUserAction } from "@/actions";
import PinGate from "../PinGate";

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const data = await getUsers();
      setUsers(data);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (!confirm("Tem certeza que deseja excluir este usuário?")) return;

    try {
      await deleteUserAction(id);
      setUsers(users.filter(u => u.id !== id));
    } catch (error: any) {
      alert(error.message || "Erro ao excluir usuário.");
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await updateUserAction(id, { licenseStatus: newStatus });
      setUsers(users.map(u => u.id === id ? { ...u, licenseStatus: newStatus } : u));
    } catch (error: any) {
      alert(error.message || "Erro ao atualizar status.");
    }
  };

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Ativo":
        return (
          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2 py-1 text-xs font-medium text-emerald-400 ring-1 ring-inset ring-emerald-500/20">
            <CheckCircle className="mr-1 h-3 w-3" />
            Ativo
          </span>
        );
      case "Expirado":
        return (
          <span className="inline-flex items-center rounded-full bg-red-500/10 px-2 py-1 text-xs font-medium text-red-400 ring-1 ring-inset ring-red-500/20">
            <XCircle className="mr-1 h-3 w-3" />
            Expirado
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center rounded-full bg-amber-500/10 px-2 py-1 text-xs font-medium text-amber-400 ring-1 ring-inset ring-amber-500/20">
            <Clock className="mr-1 h-3 w-3" />
            Pendente
          </span>
        );
    }
  };

  return (
    <PinGate>
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="sm:flex sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-50 tracking-tight">Gestão de Usuários</h1>
            <p className="mt-2 text-sm text-slate-400">
              Gerencie as contas e licenças dos usuários do sistema.
            </p>
          </div>
          <div className="mt-4 sm:mt-0">
            <Link
              href="/dashboard/users/new"
              className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all"
            >
              <UserPlus className="-ml-1 mr-2 h-5 w-5" />
              Novo Usuário
            </Link>
          </div>
        </div>

        <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800">
          <div className="p-6 border-b border-slate-800">
            <div className="relative max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-500" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-2 border border-slate-700 rounded-lg bg-slate-950 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition-colors"
                placeholder="Buscar por email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Activity className="mx-auto h-12 w-12 text-slate-600 mb-3" />
              <p>Nenhum usuário encontrado.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-800">
                <thead className="bg-slate-950/50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Usuário / Empresa</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Contato / CPF</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Cargo</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Licença</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-400 uppercase tracking-wider">Criado em</th>
                    <th scope="col" className="relative px-6 py-3"><span className="sr-only">Ações</span></th>
                  </tr>
                </thead>
                <tbody className="bg-slate-900 divide-y divide-slate-800">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-800/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0 flex items-center justify-center rounded-full bg-slate-800 text-indigo-400">
                            <Mail className="h-5 w-5" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-bold text-slate-50">{user.name || "Sem nome"}</div>
                            <div className="text-xs text-slate-400">{user.email}</div>
                            <div className="text-xs text-indigo-400 font-bold">{user.companyName || "Empresa não informada"}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-xs text-slate-300">{user.phone || "-"}</div>
                        <div className="text-[10px] text-slate-500">{user.cpf || "Sem CPF"}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          user.role === "ADMIN" 
                          ? "bg-purple-500/10 text-purple-400 ring-purple-500/20" 
                          : "bg-slate-500/10 text-slate-400 ring-slate-500/20"
                        }`}>
                          <Shield className="mr-1 h-3 w-3" />
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(user.licenseStatus)}
                          <select 
                            value={user.licenseStatus}
                            onChange={(e) => handleStatusChange(user.id, e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-xs rounded p-1 text-slate-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="Pendente">Pendente</option>
                            <option value="Ativo">Ativo</option>
                            <option value="Expirado">Expirado</option>
                          </select>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-400">
                        {format(new Date(user.createdAt), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                        <Link
                          href={`/dashboard/users/${user.id}/edit`}
                          className="text-indigo-400 hover:text-indigo-300 transition-colors inline-block"
                          title="Editar Usuário"
                        >
                          <Edit className="h-5 w-5" />
                        </Link>
                        <button 
                          onClick={() => handleDeleteUser(user.id)}
                          className="text-red-400 hover:text-red-300 transition-colors"
                          title="Excluir Usuário"
                        >
                          <Trash2 className="h-5 w-5" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </PinGate>
  );
}
