"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

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
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { quotes: true }
      }
    }
  });
}

export async function createClient(data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Não autorizado");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("Usuário não encontrado");

  const result = await prisma.client.create({
    data: {
      ...data,
      userId: user.id
    }
  });

  revalidatePath("/dashboard/clients");
  return result;
}

export async function getClientById(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Não autorizado");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("Usuário não encontrado");

  return await prisma.client.findUnique({
    where: { 
      id,
      userId: user.id 
    }
  });
}

export async function updateClient(id: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Não autorizado");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("Usuário não encontrado");

  const result = await prisma.client.update({
    where: { 
      id,
      userId: user.id 
    },
    data
  });

  revalidatePath("/dashboard/clients");
  return result;
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

// User Management Actions (Admin)
export async function getUsers() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Não autorizado");

  // Check if user is admin (optional: strict check)
  const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!currentUser || currentUser.role !== "ADMIN") {
    // For now, if no admin exists, allow the first user to see this
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount > 0) throw new Error("Acesso negado");
  }

  return await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      email: true,
      name: true,
      companyName: true,
      phone: true,
      cpf: true,
      role: true,
      licenseStatus: true,
      createdAt: true
    }
  });
}

export async function getUserAction(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Não autorizado");

  const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("Acesso negado");
  }

  return await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      name: true,
      companyName: true,
      phone: true,
      cpf: true,
      role: true,
      licenseStatus: true,
      createdAt: true
    }
  });
}

export async function createUserAction(data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Não autorizado");

  const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!currentUser || currentUser.role !== "ADMIN") {
    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    if (adminCount > 0) throw new Error("Acesso negado");
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const result = await prisma.user.create({
    data: {
      email: data.email,
      password: hashedPassword,
      name: data.name,
      companyName: data.companyName,
      phone: data.phone,
      cpf: data.cpf,
      role: data.role || "USER",
      licenseStatus: data.licenseStatus || "Ativo"
    }
  });

  revalidatePath("/dashboard/users");
  revalidatePath("/dashboard/admin");
  
  return result;
}

export async function updateUserAction(id: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Não autorizado");

  const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("Acesso negado");
  }

  const updateData: any = { ...data };
  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  const result = await prisma.user.update({
    where: { id },
    data: updateData
  });

  revalidatePath("/dashboard/users");
  revalidatePath("/dashboard/admin");

  return result;
}

export async function updateSelfAction(data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Não autorizado");

  const user = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!user) throw new Error("Usuário não encontrado");

  const updateData: any = {
    name: data.name,
    companyName: data.companyName,
    phone: data.phone,
    cpf: data.cpf,
  };

  if (data.password) {
    updateData.password = await bcrypt.hash(data.password, 10);
  }

  const result = await prisma.user.update({
    where: { id: user.id },
    data: updateData
  });

  revalidatePath("/dashboard/profile");
  
  return result;
}

export async function deleteUserAction(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Não autorizado");

  const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("Acesso negado");
  }

  // Prevent self-deletion
  if (currentUser.id === id) throw new Error("Você não pode excluir seu próprio usuário");

  const result = await prisma.user.delete({
    where: { id }
  });

  revalidatePath("/dashboard/users");
  revalidatePath("/dashboard/admin");

  return result;
}

export async function getAdminStats() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Não autorizado");
  
  const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!currentUser || currentUser.role !== "ADMIN") throw new Error("Acesso negado");

  const totalUsers = await prisma.user.count({ where: { role: "USER" } });
  const activeUsers = await prisma.user.count({ where: { role: "USER", licenseStatus: "Ativo" } });
  const pendingUsers = await prisma.user.count({ where: { role: "USER", licenseStatus: "Pendente" } });
  const expiredUsers = await prisma.user.count({ where: { role: "USER", licenseStatus: "Expirado" } });

  const recentUsers = await prisma.user.findMany({
    where: { role: "USER" },
    orderBy: { createdAt: 'desc' },
    take: 5,
    select: {
      id: true,
      email: true,
      name: true,
      companyName: true,
      licenseStatus: true,
      createdAt: true
    }
  });

  return {
    totalUsers,
    activeUsers,
    pendingUsers,
    expiredUsers,
    recentUsers
  };
}

export async function verifyPinAction(pin: string) {
  return pin === process.env.ADMIN_PIN;
}

export async function getSubscriptionPayments() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Não autorizado");

  const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("Acesso negado");
  }

  return await prisma.subscriptionPayment.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          companyName: true,
          email: true
        }
      }
    }
  });
}

export async function getSubscriptionPaymentById(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Não autorizado");

  const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("Acesso negado");
  }

  return await prisma.subscriptionPayment.findUnique({
    where: { id },
    include: {
      user: {
        select: {
          name: true,
          companyName: true,
          email: true
        }
      }
    }
  });
}

export async function createSubscriptionPayment(data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Não autorizado");

  const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("Acesso negado");
  }

  const result = await prisma.subscriptionPayment.create({
    data: {
      userId: data.userId,
      amount: parseFloat(data.amount),
      dueDate: data.dueDate,
      referenceMonth: data.referenceMonth,
      status: data.status || "Pendente",
      paidAt: data.status === "Pago" ? new Date() : null
    }
  });

  revalidatePath("/dashboard/subscriptions");
  return result;
}

export async function updateSubscriptionPayment(id: string, data: any) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Não autorizado");

  const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("Acesso negado");
  }

  const updateData: any = { ...data };
  if (data.status === "Pago") {
    updateData.paidAt = new Date();
  } else if (data.status === "Pendente" || data.status === "Atrasado") {
    updateData.paidAt = null;
  }
  if (data.amount !== undefined) {
    updateData.amount = parseFloat(data.amount);
  }

  const result = await prisma.subscriptionPayment.update({
    where: { id },
    data: updateData
  });

  revalidatePath("/dashboard/subscriptions");
  return result;
}

export async function deleteSubscriptionPayment(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) throw new Error("Não autorizado");

  const currentUser = await prisma.user.findUnique({ where: { email: session.user.email } });
  if (!currentUser || currentUser.role !== "ADMIN") {
    throw new Error("Acesso negado");
  }

  const result = await prisma.subscriptionPayment.delete({
    where: { id }
  });

  revalidatePath("/dashboard/subscriptions");
  return result;
}
