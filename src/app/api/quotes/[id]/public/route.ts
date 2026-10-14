import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const quote = await prisma.quote.findUnique({
      where: { id },
      include: {
        client: {
          select: {
            name: true,
            phone: true,
            email: true,
            address: true,
          },
        },
        user: {
          select: {
            companyName: true,
            name: true,
            phone: true,
            email: true,
          },
        },
        installments: {
          orderBy: { number: "asc" },
          select: {
            number: true,
            value: true,
            dueDate: true,
            status: true,
          },
        },
      },
    });

    if (!quote) {
      return NextResponse.json({ error: "Orçamento não encontrado" }, { status: 404 });
    }

    // Return only safe public fields
    const publicQuote = {
      id: quote.id,
      serviceType: quote.serviceType,
      description: quote.description,
      value: quote.value,
      date: quote.date,
      endDate: quote.endDate,
      status: quote.status,
      paymentMethod: quote.paymentMethod,
      createdAt: quote.createdAt,
      client: quote.client,
      company: quote.user,
      installments: quote.installments,
    };

    return NextResponse.json(publicQuote);
  } catch (error) {
    console.error("Error fetching public quote:", error);
    return NextResponse.json({ error: "Erro interno" }, { status: 500 });
  }
}
