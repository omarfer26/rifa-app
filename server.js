require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();
const app = express();

app.use(cors());
app.use(express.json());

// Obtener todos los registros
app.get("/registro", async (req, res) => {
    const registros = await prisma.registro.findMany();
    res.json(registros);
});

// Registrar un número
app.post("/registro", async (req, res) => {
    const { number, nombre, telefono, pago } = req.body;
    try {
        const newRegistro = await prisma.registro.create({
            data: { number, nombre, telefono, pago },
        });
        res.json(newRegistro);
    } catch (error) {
        res.status(400).json({ error: "Número ya registrado" });
    }
});

// Actualizar pago de un registro
app.put("/registro/:number", async (req, res) => {
    const { number } = req.params;
    const { pago } = req.body;
    try {
        const updatedRegistro = await prisma.registro.update({
            where: { number },
            data: { pago },
        });
        res.json(updatedRegistro);
    } catch (error) {
        res.status(400).json({ error: "Error al actualizar el pago" });
    }
});

// Eliminar un registro
app.delete("/registro/:number", async (req, res) => {
    const { number } = req.params;
    await prisma.registro.delete({ where: { number } });
    res.json({ message: "Registro eliminado" });
});

// Iniciar servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Servidor en http://localhost:${PORT}`));
