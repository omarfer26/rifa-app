import { PrismaClient } from "@prisma/client";
import { NextRequest, NextResponse } from "next/server";

const prisma = new PrismaClient();

export async function GET(req: NextRequest, context: { params: { numero: string } }) {
  const numero = context.params.numero;
  try {
    const registro = await prisma.registro.findUnique({ where: { number: numero } });
    if (!registro) return NextResponse.json({ error: "Registro no encontrado" }, { status: 404 });
    return NextResponse.json(registro);
  } catch (error) {
    return NextResponse.json({ error: "Error al obtener registro" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, context: { params: { numero: string } }) {
  const numero = context.params.numero;
  const body = await req.json();
  try {
    const updated = await prisma.registro.update({
      where: { number: numero },
      data: body,
    });
    return NextResponse.json(updated);
  } catch (error) {
    return NextResponse.json({ error: "No se pudo actualizar" }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, context: { params: { numero: string } }) {
  const numero = context.params.numero;
  try {
    await prisma.registro.delete({ where: { number: numero } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "No se pudo eliminar" }, { status: 400 });
  }
}
