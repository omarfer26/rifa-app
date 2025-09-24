import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const registros = await prisma.registro.findMany();
    return NextResponse.json(registros);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener registros" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { number, nombre, telefono, pago } = body;

  try {
    const newRegistro = await prisma.registro.create({
      data: { number, nombre, telefono, pago: !!pago },
    });
    return NextResponse.json(newRegistro);
  } catch (error) {
    return NextResponse.json({ error: "Número ya registrado" }, { status: 400 });
  }
}
