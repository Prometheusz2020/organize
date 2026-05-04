"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function getDashboardStats() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Não autorizado");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("Usuário não encontrado");

  const totalClients = await prisma.client.count({ where: { userId: user.id } });
  
  const quotes = await prisma.quote.findMany({ 
    where: { userId: user.id },
    include: { installments: true }
  });
  
  let pendingQuotes = 0;
  let approvedQuotes = 0;
  let totalRecebido = 0;
  let totalAReceber = 0;
  
  quotes.forEach(quote => {
    if (quote.status === "Pendente") pendingQuotes++;
    if (quote.status === "Aprovado") approvedQuotes++;

    if (quote.installments && quote.installments.length > 0) {
      quote.installments.forEach((inst: any) => {
        if (inst.status === "Pago") {
          totalRecebido += inst.value;
        } else {
          totalAReceber += inst.value;
        }
      });
    } else {
      // If no installments (À vista)
      if (quote.status === "Aprovado") {
        totalAReceber += quote.value;
      } else if (quote.status === "Pago") { // Support for quotes marked directly as "Pago"
        totalRecebido += quote.value;
      }
    }
  });

  return {
    totalClients,
    totalQuotes: quotes.length,
    pendingQuotes,
    approvedQuotes,
    totalRecebido,
    totalAReceber
  };
}

export async function getClients() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Não autorizado");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("Usuário não encontrado");

  return await prisma.client.findMany({
    where: { userId: user.id },
    orderBy: { name: 'asc' }
  });
}

export async function createClient(data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Não autorizado");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("Usuário não encontrado");

  return await prisma.client.create({
    data: {
      ...data,
      userId: user.id
    }
  });
}

export async function getQuotes() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Não autorizado");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("Usuário não encontrado");

  return await prisma.quote.findMany({
    where: { userId: user.id },
    include: { client: true, installments: { orderBy: { number: 'asc' } } },
    orderBy: { date: 'desc' }
  });
}

export async function createQuote(data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Não autorizado");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("Usuário não encontrado");

  const { installmentsData, ...quoteData } = data;

  return await prisma.quote.create({
    data: {
      ...quoteData,
      value: parseFloat(quoteData.value),
      userId: user.id,
      installments: installmentsData && installmentsData.length > 0 ? {
        create: installmentsData.map((inst: any) => ({
          number: inst.number,
          value: parseFloat(inst.value),
          dueDate: inst.dueDate,
          status: inst.status || "Pendente"
        }))
      } : undefined
    }
  });
}

export async function getQuoteById(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Não autorizado");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("Usuário não encontrado");

  return await prisma.quote.findUnique({
    where: { 
      id,
      userId: user.id 
    },
    include: { 
      client: true,
      installments: {
        orderBy: { number: 'asc' }
      }
    }
  });
}

export async function updateInstallmentAction(id: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Não autorizado");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("Usuário não encontrado");

  // Ensure the installment belongs to a quote owned by this user
  const installment = await prisma.installment.findUnique({
    where: { id },
    include: { quote: true }
  });

  if (!installment || installment.quote.userId !== user.id) {
    throw new Error("Parcela não encontrada ou não autorizada");
  }

  const updateData = { ...data };
  if (data.status === "Pago") {
    updateData.paidAt = new Date();
  } else if (data.status === "Pendente") {
    updateData.paidAt = null;
  }

  return await prisma.installment.update({
    where: { id },
    data: updateData
  });
}

export async function updateQuoteStatusAction(id: string, status: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Não autorizado");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("Usuário não encontrado");

  const data: any = { status };
  if (status === "Pago") {
    data.paidAt = new Date();
  } else if (status === "Pendente" || status === "Aprovado") {
    data.paidAt = null;
  }

  return await prisma.quote.update({
    where: { id, userId: user.id },
    data
  });
}
