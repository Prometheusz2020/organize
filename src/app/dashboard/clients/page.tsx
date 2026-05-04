"use client";

import { useEffect, useState } from "react";
import { Plus, Search, MapPin, Phone, Mail, Users } from "lucide-react";
import Link from "next/link";
import { getClients } from "@/actions";

export default function ClientsList() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchClients = async () => {
      try {
        const data = await getClients();
        setClients(data);
      } catch (error) {
        console.error("Error fetching clients:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchClients();
  }, []);

  const filteredClients = clients.filter(client => 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
    client.phone.includes(searchTerm)
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-50 tracking-tight">Clientes</h1>
          <p className="mt-2 text-sm text-slate-400">
            Gerencie sua lista de clientes e contatos.
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Link
            href="/dashboard/clients/new"
            className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-slate-950 transition-all"
          >
            <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
            Novo Cliente
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
              placeholder="Buscar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
            <p className="mt-2 text-sm text-slate-400">Carregando clientes...</p>
          </div>
        ) : filteredClients.length === 0 ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-16 w-16 bg-slate-800/50 rounded-full flex items-center justify-center ring-1 ring-slate-700/50 mb-4">
              <Users className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="mt-2 text-sm font-semibold text-slate-50">Nenhum cliente encontrado</h3>
            <p className="mt-1 text-sm text-slate-400">
              {searchTerm ? "Tente buscar com outros termos." : "Comece adicionando seu primeiro cliente."}
            </p>
            {!searchTerm && (
              <div className="mt-6">
                <Link
                  href="/dashboard/clients/new"
                  className="inline-flex items-center rounded-lg border border-transparent bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/20 hover:text-indigo-300 ring-1 ring-indigo-500/30 transition-all"
                >
                  <Plus className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Novo Cliente
                </Link>
              </div>
            )}
          </div>
        ) : (
          <ul role="list" className="divide-y divide-slate-800">
            {filteredClients.map((client) => (
              <li key={client.id} className="p-4 sm:px-6 hover:bg-slate-800/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-semibold text-slate-50">{client.name}</p>
                    <div className="mt-1 flex flex-col sm:flex-row sm:flex-wrap sm:space-x-4">
                      {client.email && (
                        <div className="mt-2 flex items-center text-sm text-slate-400 sm:mt-0">
                          <Mail className="mr-1.5 h-4 w-4 flex-shrink-0 text-slate-500" aria-hidden="true" />
                          {client.email}
                        </div>
                      )}
                      <div className="mt-2 flex items-center text-sm text-slate-400 sm:mt-0">
                        <Phone className="mr-1.5 h-4 w-4 flex-shrink-0 text-slate-500" aria-hidden="true" />
                        {client.phone}
                      </div>
                      {client.address && (
                        <div className="mt-2 flex items-center text-sm text-slate-400 sm:mt-0">
                          <MapPin className="mr-1.5 h-4 w-4 flex-shrink-0 text-slate-500" aria-hidden="true" />
                          <span className="truncate max-w-[200px]">{client.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
