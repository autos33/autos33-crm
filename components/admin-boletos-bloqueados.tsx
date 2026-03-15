"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase-client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Lock, Unlock, AlertCircle, CheckCircle2, Search } from "lucide-react"

interface BoletoBloqueado {
  id: number
  numero_boleto: number
  estado: string
}

export function AdminBoletosBloqueados({ rifaId }: { rifaId: number }) {
  const [boletos, setBoletos] = useState<BoletoBloqueado[]>([])
  const [loading, setLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Estado para la barra de búsqueda
  const [searchTerm, setSearchTerm] = useState("")
  
  // Estados para el formulario del modal
  const [numeroInput, setNumeroInput] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMsg, setErrorMsg] = useState("")
  const [successMsg, setSuccessMsg] = useState("")

  // Cargar boletos bloqueados al montar el componente
  useEffect(() => {
    fetchBoletosBloqueados()
  }, [rifaId])

  const fetchBoletosBloqueados = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from("Boletos")
      .select("id, numero_boleto, estado")
      .eq("id_rifa", rifaId)
      .eq("esta_bloqueado", true)
      .order("numero_boleto", { ascending: true })

    if (!error && data) {
      setBoletos(data)
    }
    setLoading(false)
  }

  // Filtrado de boletos según lo que se escriba en el buscador
  const boletosFiltrados = boletos.filter((boleto) => 
    boleto.numero_boleto.toString().includes(searchTerm)
  )

  // Función para bloquear un nuevo boleto
  const handleBloquear = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMsg("")
    setSuccessMsg("") 

    const numeroABloquear = parseInt(numeroInput)

    if (isNaN(numeroABloquear)) {
      setErrorMsg("Por favor, ingresa un número válido.")
      setIsSubmitting(false)
      return
    }

    // 1. Buscar si el boleto existe en esta rifa
    const { data: boleto, error: searchError } = await supabase
      .from("Boletos")
      .select("*")
      .eq("id_rifa", rifaId)
      .eq("numero_boleto", numeroABloquear)
      .single()

    if (searchError || !boleto) {
      setErrorMsg(`El boleto #${numeroABloquear} no existe en esta rifa.`)
      setIsSubmitting(false)
      return
    }

    // 2. Validar el estado actual del boleto
    if (boleto.esta_bloqueado) {
      setErrorMsg(`El boleto #${numeroABloquear} ya se encuentra bloqueado.`)
      setIsSubmitting(false)
      return
    }

    if (boleto.estado !== 'disponible') {
      setErrorMsg(`No puedes bloquear el boleto #${numeroABloquear} porque su estado es '${boleto.estado}'.`)
      setIsSubmitting(false)
      return
    }

    // 3. Si todo está bien, actualizar el boleto a bloqueado
    const { error: updateError } = await supabase
      .from("Boletos")
      .update({ esta_bloqueado: true })
      .eq("id", boleto.id)

    if (updateError) {
      setErrorMsg("Hubo un error de conexión al bloquear el boleto.")
    } else {
      // Éxito: recargar lista, limpiar formulario, mostrar éxito y NO cerrar el modal
      await fetchBoletosBloqueados()
      setSuccessMsg(`El boleto #${numeroABloquear} ha sido bloqueado con éxito.`)
      setNumeroInput("")
    }
    
    setIsSubmitting(false)
  }

  // Función para liberar un boleto en la tabla
  const handleLiberar = async (idBoleto: number) => {
    const { error } = await supabase
      .from("Boletos")
      .update({ esta_bloqueado: false })
      .eq("id", idBoleto)

    if (!error) {
      setBoletos((prev) => prev.filter((b) => b.id !== idBoleto))
    } else {
      alert("Hubo un error al intentar liberar el boleto.")
    }
  }

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Lock className="h-5 w-5 text-gray-500" />
            Boletos Bloqueados (Regalos/Reserva)
          </div>
          
          <Dialog open={isModalOpen} onOpenChange={(open) => {
            setIsModalOpen(open)
            if (!open) {
              setErrorMsg("")
              setSuccessMsg("")
              setNumeroInput("")
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="secondary" size="sm">
                <Lock className="w-4 h-4 mr-2" />
                Bloquear Número
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Bloquear un Boleto</DialogTitle>
                <DialogDescription>
                  Ingresa el número del boleto que deseas sacar de la venta.
                </DialogDescription>
              </DialogHeader>

              <form onSubmit={handleBloquear} className="space-y-4 pt-4">
                <div>
                  <Label htmlFor="numero_bloqueo">Número de Boleto</Label>
                  <Input
                    id="numero_bloqueo"
                    type="number"
                    min="0"
                    placeholder="Ej: 45"
                    value={numeroInput}
                    onChange={(e) => setNumeroInput(e.target.value)}
                    required
                    autoFocus 
                  />
                </div>

                {errorMsg && (
                  <div className="bg-red-50 border border-red-200 flex items-center gap-2 text-red-700 px-3 py-2 rounded-md text-sm">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <p>{errorMsg}</p>
                  </div>
                )}

                {successMsg && (
                  <div className="bg-green-50 border border-green-200 flex items-center gap-2 text-green-700 px-3 py-2 rounded-md text-sm">
                    <CheckCircle2 className="h-4 w-4 shrink-0" />
                    <p>{successMsg}</p>
                  </div>
                )}

                <div className="flex gap-2 justify-end pt-2">
                  <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                    Cerrar
                  </Button>
                  <Button type="submit" disabled={isSubmitting || !numeroInput}>
                    {isSubmitting ? "Bloqueando..." : "Bloquear"}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </CardTitle>
        <CardDescription>
          Estos números no saldrán en la generación aleatoria de boletos disponibles.
        </CardDescription>
      </CardHeader>
      
      <CardContent>
        {loading ? (
          <div className="text-center py-4 text-gray-500">Cargando boletos...</div>
        ) : boletos.length === 0 ? (
          <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
            No hay boletos bloqueados actualmente.
          </div>
        ) : (
          <div className="space-y-4">
            {/* Barra de Búsqueda */}
            <div className="flex items-center gap-2 max-w-sm">
              <Search className="w-5 h-5 text-gray-400" />
              <Input
                type="number"
                placeholder="Buscar por número..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>N° Boleto</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {boletosFiltrados.length > 0 ? (
                  boletosFiltrados.map((boleto) => (
                    <TableRow key={boleto.id}>
                      <TableCell className="font-mono font-bold text-lg">#{boleto.numero_boleto}</TableCell>
                      <TableCell className="text-right">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          className="text-green-600 hover:text-green-700 hover:bg-green-50"
                          onClick={() => handleLiberar(boleto.id)}
                        >
                          <Unlock className="w-4 h-4 mr-2" />
                          Liberar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center py-6 text-gray-500">
                      No se encontró ningún boleto bloqueado con el número "{searchTerm}".
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  )
}