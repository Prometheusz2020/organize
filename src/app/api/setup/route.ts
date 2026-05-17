import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Não autorizado" }, { status: 401 });
    }

    const { name, companyName, cpf, password } = await req.json();

    if (!name || !companyName || !password) {
      return NextResponse.json({ error: "Nome, empresa e senha são obrigatórios" }, { status: 400 });
    }

    const userId = (session.user as any).id;

    const hashedPassword = await bcrypt.hash(password, 10);

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        companyName,
        cpf: cpf || null,
        password: hashedPassword,
        licenseStatus: "Ativo", // Muda para ativo ao completar o setup
      },
    });

    return NextResponse.json({ message: "Cadastro concluído com sucesso" }, { status: 200 });
  } catch (error) {
    console.error("Erro no setup inicial:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
