import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const { email, phone, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "E-mail e senha são obrigatórios" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "Este e-mail já possui cadastro. Acesse o painel." }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        phone,
        password: hashedPassword,
        licenseStatus: "Pendente",
        role: "USER"
      },
    });

    // Enviar email
    try {
      if (process.env.SMTP_USER && process.env.SMTP_PASS) {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: parseInt(process.env.SMTP_PORT || "587"),
          secure: process.env.SMTP_SECURE === "true",
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        });

        await transporter.sendMail({
          from: `"Organize" <${process.env.SMTP_USER}>`,
          to: email,
          subject: "Bem-vindo ao Organize! Seu cadastro foi concluído",
          html: `
            <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; max-width: 600px; margin: 0 auto;">
              <h1 style="color: #4F46E5;">Olá!</h1>
              <p>Seu cadastro no sistema <strong>Organize</strong> foi realizado com sucesso.</p>
              <p>Para acessar o painel, clique no link abaixo e entre com seu e-mail e senha:</p>
              <br/>
              <a href="${process.env.NEXTAUTH_URL || 'https://organize.ztilabs.com.br'}/login" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: #fff; text-decoration: none; border-radius: 8px; font-weight: bold;">Acessar o Painel</a>
              <br/><br/>
              <div style="background-color: #f3f4f6; padding: 15px; border-radius: 8px; margin-top: 20px; border-left: 4px solid #4F46E5;">
                <h3 style="margin-top: 0; color: #1f2937;">📱 Dica de Acesso pelo Celular</h3>
                <p style="margin-bottom: 0; font-size: 14px; color: #4b5563; line-height: 1.5;">Para facilitar seu dia a dia, ao abrir o painel no celular, adicione o site à sua <strong>Tela Inicial</strong>. Basta clicar nas opções do seu navegador (os 3 pontinhos ou o ícone de compartilhar) e selecionar <strong>"Adicionar à Tela Inicial"</strong>. Assim, o sistema funcionará como um aplicativo!</p>
              </div>
              <p style="margin-top: 30px; font-size: 12px; color: #777;">Se você não solicitou este cadastro, desconsidere este e-mail.</p>
            </div>
          `,
        });
      } else {
        console.warn("SMTP_USER e SMTP_PASS não estão configurados. O e-mail não foi enviado.");
      }
    } catch (emailError) {
      console.error("Erro ao enviar email:", emailError);
    }

    return NextResponse.json({ message: "Usuário cadastrado com sucesso" }, { status: 201 });
  } catch (error) {
    console.error("Erro no cadastro:", error);
    return NextResponse.json({ error: "Erro interno do servidor" }, { status: 500 });
  }
}
