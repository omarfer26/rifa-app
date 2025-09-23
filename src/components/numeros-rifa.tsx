"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { X } from "lucide-react"
import { Check } from "lucide-react"
import * as XLSX from "xlsx"

// Define the registration type
interface Registration {
    number: string
    nombre: string
    telefono: string
    pago?: boolean
}

// Consistent localStorage key
const API_URL = "http://localhost:5000/registro"

export default function NumberTable() {
    // Generate numbers from 00 to 99
    const numbers = Array.from({ length: 100 }, (_, i) => i.toString().padStart(2, "0"))

    // State for modals and form
    const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false)
    const [isViewModalOpen, setIsViewModalOpen] = useState(false)
    const [selectedNumber, setSelectedNumber] = useState("")
    const [nombre, setNombre] = useState("")
    const [telefono, setTelefono] = useState("")
    const [pago, setPago] = useState(false)
    const [registrations, setRegistrations] = useState<Registration[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<string[]>([])
    const [hashmap, setHashmap] = useState<Map<string, string[]>>(new Map())

    // Load registrations from localStorage on component mount
    useEffect(() => {
        fetch(API_URL)
            .then(res => res.json())
            .then(data => {
                setRegistrations(data)
                setLoading(false)
            })
            .catch(error => {
                console.error("Error fetching data:", error)
                setLoading(false)
            })
    }, [])

    useEffect(() => {
        fetch(API_URL)
            .then(res => res.json())
            .then(data => {
                setRegistrations(data)
                setLoading(false)
    
                const newHashmap = new Map<string, string[]>();
                data.forEach((reg: { nombre: string; number: string }) => {
                    reg.nombre.split(" ").forEach((word: string) => {
                        const lowerWord = word.toLowerCase()
                        if (!newHashmap.has(lowerWord)) {
                            newHashmap.set(lowerWord, [])
                        }
                        newHashmap.get(lowerWord)?.push(reg.number)
                    })
                })
    
                setHashmap(newHashmap)
            })
            .catch(error => {
                console.error("Error fetching data:", error)
                setLoading(false)
            })
    }, [])

    useEffect(() => {
        if (searchQuery.trim() === "") {
            setSearchResults([])
            return
        }
        const lowerQuery = searchQuery.toLowerCase()
        const matchingNumbers = new Set<string>()
        lowerQuery.split(" ").forEach(word => {
            hashmap.get(word)?.forEach(num => matchingNumbers.add(num))
        })
        setSearchResults(Array.from(matchingNumbers))
    }, [ searchQuery,hashmap])

    const isNumberRegistered = (number: string) => {
        return registrations.some(reg => reg.number === number)
    }

    const getRegistration = (number: string) => {
        return registrations.find(reg => reg.number === number)
    }

    const handleNumberClick = (number: string) => {
        setSelectedNumber(number)
        if (isNumberRegistered(number)) {
            setIsViewModalOpen(true)
        } else {
            setIsRegisterModalOpen(true)
        }
    }

    const handleRegister = async () => {
        if (!nombre.trim() || !telefono.trim()) {
            alert("Por favor complete todos los campos")
            return
        }
    
        const newRegistration = { number: selectedNumber, nombre, telefono, pago }
    
        try {
            const response = await fetch(API_URL, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(newRegistration)
            })
            if (response.ok) {
                setRegistrations([...registrations, newRegistration])
                setIsRegisterModalOpen(false)
                setNombre("")
                setTelefono("")
                setPago(false) // Reset después de registrar
            }
        } catch (error) {
            console.error("Error saving registration:", error)
        }
    }
    
    const handleConfirmPay = async () => {
        try {
            const response = await fetch(`${API_URL}/${selectedNumber}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ pago: true })
            })
            if (response.ok) {
                setRegistrations(registrations.map(reg =>
                    reg.number === selectedNumber ? { ...reg, pago: true } : reg
                ))
                setPago(true) // Actualizar el estado
                setIsViewModalOpen(false)
            }
        } catch (error) {
            console.error("Error updating payment status:", error)
        }
    }

    const handleDelete = async () => {
        try {
            const response = await fetch(`${API_URL}/${selectedNumber}`, { method: "DELETE" })
            if (response.ok) {
                setRegistrations(registrations.filter(reg => reg.number !== selectedNumber))
                setIsViewModalOpen(false)
            }
        } catch (error) {
            console.error("Error deleting registration:", error)
        }
    }

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <p style={{ fontFamily: "'Comic Sans MS', cursive" }}>Cargando...</p>
            </div>
        )
    }

    const generateExcel = () => {
        // Definir el tipo de los registros
        type Registro = {
            ID: number;
            Número: string;
            Nombre: string;
            Teléfono: string;
            Pago: string;
        };

        const dataWithIds: Registro[] = registrations.map((reg, index) => ({
            ID: index + 1, // Asigna un ID basado en el índice
            Número: reg.number.toString(),
            Nombre: reg.nombre,
            Teléfono: reg.telefono,
            Pago: reg.pago ? "Sí" : "No"
            
        }));

        const ws = XLSX.utils.json_to_sheet(dataWithIds);

        // Ajustar automáticamente el ancho de las columnas
        const colWidths = Object.keys(dataWithIds[0]).map((key: string) => ({
            wch: Math.max(
                key.length, // Longitud del encabezado
                ...dataWithIds.map(row => row[key as keyof Registro]?.toString().length ?? 10) // Longitud máxima de los datos
            ) + 2 // Margen extra
        }));

        ws["!cols"] = colWidths;

        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Registros");
        XLSX.writeFile(wb, "rifa_registrations.xlsx");
    };
            return (
        <div className="flex flex-row justify-center items-start gap-6 p-6">
            <section className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg max-w-3xl">
            <h1
                className="text-4xl font-bold mb-6 text-center text-rose-600"
                style={{fontFamily: "'Comic Sans MS', cursive"}}
            >
                Gran rifa para recaudar fondos
            </h1>

            <div className="border-4 border-rose-500 rounded-md overflow-hidden bg-white">
                <table className="border-collapse">
                    <tbody>
                    {Array.from({length: 10}, (_, rowIndex) => (
                        <tr key={rowIndex}>
                            {Array.from({length: 10}, (_, colIndex) => {
                                const index = rowIndex * 10 + colIndex
                                const number = numbers[index]
                                const registered = isNumberRegistered(number)
                                const highlighted = searchResults.includes(number)

                                return (
                                    <td
                                        key={colIndex}
                                        className={`border border-rose-300 w-12 h-12 text-center hover:bg-rose-100 transition-colors cursor-pointer relative ${registered ? "bg-rose-50" : ""} ${highlighted ? "bg-yellow-200" : ""}`}
                                        style={{fontFamily: "'Comic Sans MS', cursive"}}
                                        onClick={() => handleNumberClick(number)}
                                    >
                                        {number}
                                        {registered && (
                                            <div className="absolute inset-0 flex items-center justify-center text-rose-600 font-bold text-3xl">
                                            {getRegistration(number)?.pago ? (
                                                <Check className="w-8 h-8 stroke-2 text-green-600" />
                                            ) : (
                                                <X className="w-8 h-8 stroke-2" />
                                            )}
                                        </div>
                                    )}
                                    </td>
                                )
                            })}
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>

            {/* Debug info - can be removed in production */}
            <div className="mt-4 text-xs text-gray-500">Registros guardados: {registrations.length}</div>
            <br></br>
            <Button onClick={generateExcel} className="mb-4 bg-green-500 hover:bg-green-600">Descargar
                Registros</Button>

            <Input
                type="text"
                placeholder="Buscar por nombre..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mb-4 w-80 p-2 border border-gray-400 rounded"
            />

            {/* Register Modal Dialog */}
            <Dialog open={isRegisterModalOpen} onOpenChange={setIsRegisterModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl" style={{fontFamily: "'Comic Sans MS', cursive"}}>
                            Número: {selectedNumber}
                        </DialogTitle>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="nombre" className="text-right"
                                   style={{fontFamily: "'Comic Sans MS', cursive"}}>
                                Nombre
                            </Label>
                            <Input
                                id="nombre"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                className="col-span-3"
                                style={{fontFamily: "'Comic Sans MS', cursive"}}
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="telefono" className="text-right"
                                   style={{fontFamily: "'Comic Sans MS', cursive"}}>
                                Teléfono
                            </Label>
                            <Input
                                id="telefono"
                                value={telefono}
                                onChange={(e) => setTelefono(e.target.value)}
                                className="col-span-3"
                                style={{fontFamily: "'Comic Sans MS', cursive"}}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleRegister}
                            className="bg-rose-500 hover:bg-rose-600"
                            style={{fontFamily: "'Comic Sans MS', cursive"}}
                        >
                            Anotar
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View/Delete Modal Dialog */}
            <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle className="text-center text-xl" style={{fontFamily: "'Comic Sans MS', cursive"}}>
                            Número: {selectedNumber}
                        </DialogTitle>
                    </DialogHeader>

                    {selectedNumber && isNumberRegistered(selectedNumber) && (
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right font-bold"
                                       style={{fontFamily: "'Comic Sans MS', cursive"}}>
                                    Nombre:
                                </Label>
                                <div className="col-span-3" style={{fontFamily: "'Comic Sans MS', cursive"}}>
                                    {getRegistration(selectedNumber)?.nombre}
                                </div>
                            </div>

                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label className="text-right font-bold"
                                       style={{fontFamily: "'Comic Sans MS', cursive"}}>
                                    Teléfono:
                                </Label>
                                <div className="col-span-3" style={{fontFamily: "'Comic Sans MS', cursive"}}>
                                    {getRegistration(selectedNumber)?.telefono}
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter>
                        <Button onClick={handleDelete} variant="destructive"
                                style={{fontFamily: "'Comic Sans MS', cursive"}}>
                            Eliminar
                        </Button>
                        <Button onClick={handleConfirmPay} className="bg-green-500 hover:bg-green-600"
                                style={{fontFamily: "'Comic Sans MS', cursive"}}>
                            Confirmar pago
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            </section>
            <section className="p-6 bg-rose-100 mt-25 rounded-lg shadow-lg max-w-xs text-center">
                <h2 className="text-2xl font-bold text-rose-600">Información de la Rifa</h2>
                <p className="mt-4 text-gray-700">Participa en esta gran rifa para recaudar fondos y ganar <strong>$500.000</strong></p>
                <p className="mt-2 text-gray-700">Cada puesto tiene un precio de $20.000.</p>
                <p className="mt-2 text-gray-700">Juega para el día <strong>12 de abril</strong> con la <strong>Lotería de Boyacá</strong>.</p>
                <p className="mt-2 text-gray-700">Para realizar tu pago puedes hacerlo mediante <strong>Transferencia</strong> al siguiente número</p>
                <p className="mt-2 text-gray-700"><strong>Nequi: 311 665 1620</strong> </p>
            </section>
            </div>
        )
}