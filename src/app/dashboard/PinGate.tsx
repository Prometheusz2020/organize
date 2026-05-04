"use client";

import { useState, useEffect } from "react";
import { Lock, ShieldAlert, CheckCircle2 } from "lucide-react";
import { verifyPinAction } from "@/actions";

interface PinGateProps {
  children: React.ReactNode;
}

export default function PinGate({ children }: PinGateProps) {
  const [pin, setPin] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check if already verified in this session
    const verified = sessionStorage.getItem("admin_pin_verified");
    if (verified === "true") {
      setIsVerified(true);
    }
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (pin.length < 4) return;

    setLoading(true);
    setError("");

    try {
      const isValid = await verifyPinAction(pin);
      if (isValid) {
        setIsVerified(true);
        sessionStorage.setItem("admin_pin_verified", "true");
      } else {
        setError("PIN incorreto. Acesso negado.");
        setPin("");
      }
    } catch (err) {
      setError("Erro ao verificar PIN.");
    } finally {
      setLoading(false);
    }
  };

  if (isVerified) {
    return <>{children}</>;
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-8 text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-indigo-500/10 p-4 rounded-full ring-1 ring-indigo-500/30">
            <Lock className="h-10 w-10 text-indigo-400" />
          </div>
        </div>
        
        <div>
          <h2 className="text-2xl font-bold text-slate-50">Acesso Restrito</h2>
          <p className="text-sm text-slate-400 mt-2">
            Digite seu PIN de segurança para gerenciar usuários.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="flex items-center justify-center space-x-2 text-red-400 bg-red-400/10 py-2 px-3 rounded-lg text-xs font-medium border border-red-400/20">
              <ShieldAlert className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          <input
            type="password"
            maxLength={6}
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
            className="w-full text-center text-3xl tracking-[1em] py-4 bg-slate-950 border border-slate-700 rounded-xl text-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all font-mono"
            placeholder="****"
            autoFocus
          />

          <button
            type="submit"
            disabled={loading || pin.length < 4}
            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all disabled:opacity-50 disabled:bg-slate-800 shadow-lg shadow-indigo-600/20"
          >
            {loading ? "Verificando..." : "Confirmar PIN"}
          </button>
        </form>

        <p className="text-[10px] text-slate-600">
          Esta é uma camada extra de segurança para a gestão de licenças.
        </p>
      </div>
    </div>
  );
}
