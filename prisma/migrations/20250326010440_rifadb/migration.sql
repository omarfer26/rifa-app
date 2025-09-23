-- CreateTable
CREATE TABLE "Registro" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "nombre" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "pago" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Registro_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Registro_number_key" ON "Registro"("number");
