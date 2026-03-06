"use client"

import type React from "react"
import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { supabase } from "@/lib/supabase-client";
import { CheckCircle2, Copy, Check } from "lucide-react" 

interface AddTicketDialogProps {
  rifaId: number
}

const initialFormData = {
  cantidad_boletos: "",
  nombre_comprador: "",
  correo_comprador: "",
  telefono_comprador: "",
  prefijo_cedula: "V-",
  cedula_comprador: "",
}

export function AddTicketDialog({ rifaId }: AddTicketDialogProps) {
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState("");
  const [estadoFeedback, setEstadoFeedback] = useState<"error" | "hidden">("hidden");
  
  const [formData, setFormData] = useState(initialFormData)
  const [loading, setLoading] = useState(false)

  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [boletosGenerados, setBoletosGenerados] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setEstadoFeedback("hidden")
    añadirBoletos()
  }

  async function añadirBoletos() {
    const { data: boletos, error: errorBoletos } = await 
    supabase.rpc("boletos_aleatorios", {limite : formData.cantidad_boletos, p_id_rifa : rifaId});

    if (errorBoletos || !boletos || boletos.length < parseInt(formData.cantidad_boletos)) {
        setFeedback(`No hay suficientes boletos disponibles en este momento (Restantes: ${boletos ? boletos.length : 0})`);
        setEstadoFeedback("error");
        setLoading(false);
        return;
    }
    
    const ids = boletos.map((b: any) => b.id);
    const cedulaCliente = `${formData.prefijo_cedula}${formData.cedula_comprador}`;
    
    const { data, error } = await 
    supabase.rpc("añadir_boletos", {
      p_ids : ids, 
      nombre : formData.nombre_comprador, 
      correo : formData.correo_comprador, 
      telefono : formData.telefono_comprador, 
      cedula : cedulaCliente
    });
    
    if (error) {
      console.error("Hubo un error al comprar los boletos:", error);
      setFeedback("Hubo un error al agregar los boletos. Inténtalo de nuevo.");
      setEstadoFeedback("error");
      setLoading(false);
      return;
    } 
    
    const numerosBoletos = data.map((boleto: { numero_boleto: string }) => boleto.numero_boleto);
    setBoletosGenerados(numerosBoletos.join(", "));
    setShowSuccessModal(true);
    setLoading(false);
  }

  const handleCloseSuccessModal = () => {
    setShowSuccessModal(false);
    setFormData(initialFormData); 
    setFeedback("");
    setEstadoFeedback("hidden");
  }

  return (
    <>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>Agregar Boleto</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Agregar Nuevo Boleto</DialogTitle>
            <DialogDescription>Registra manualmente un boleto vendido</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="numero_boleto">Cantidad de Boletos</Label>
              <Input
                id="numero_boleto"
                type="number"
                min="1"
                value={formData.cantidad_boletos}
                onChange={(e) => setFormData((prev) => ({ ...prev, cantidad_boletos: e.target.value }))}
                placeholder="Ej: 5"
                required
              />
            </div>

            <div>
              <Label htmlFor="nombre_comprador">Nombre del comprador</Label>
              <Input
                id="nombre_comprador"
                value={formData.nombre_comprador}
                onChange={(e) => setFormData((prev) => ({ ...prev, nombre_comprador: e.target.value }))}
                placeholder="Nombre completo"
                required
              />
            </div>

            <div>
              <Label htmlFor="cedula_comprador">Cédula</Label>
              <div className="flex flex-row gap-2">
                <select 
                  value={formData.prefijo_cedula}
                  onChange={(e) => setFormData((prev) => ({ ...prev, prefijo_cedula: e.target.value }))} 
                  className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent"
                >
                  <option value="V-">V</option>
                  <option value="E-">E</option>
                  <option value="J-">J</option>
                </select>
                <Input
                  id="cedula_comprador"
                  value={formData.cedula_comprador}
                  maxLength={8}
                  minLength={6}
                  onChange={(e) => setFormData((prev) => ({ ...prev, cedula_comprador: e.target.value }))}
                  placeholder="12345678"
                  required
                />
              </div>
            </div>

            <div>
              <Label htmlFor="telefono_comprador">Teléfono</Label>
              <Input
                id="telefono_comprador"
                value={formData.telefono_comprador}
                maxLength={20}
                minLength={11}
                onChange={(e) => setFormData((prev) => ({ ...prev, telefono_comprador: e.target.value }))}
                placeholder="04121234567 o +1 (555) 123-4567"
              />
            </div>

            <div>
              <Label htmlFor="correo_comprador">Correo electrónico</Label>
              <Input
                id="correo_comprador"
                type="email"
                value={formData.correo_comprador}
                onChange={(e) => setFormData((prev) => ({ ...prev, correo_comprador: e.target.value }))}
                placeholder="correo@ejemplo.com"
                required
              />
            </div>

            {estadoFeedback === "error" && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative">
                <p className="text-sm text-red-700">{feedback}</p>
              </div>
            )}

            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                Cerrar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? "Agregando..." : "Agregar Boleto"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal de Éxito Actualizado */}
      <Dialog open={showSuccessModal} onOpenChange={handleCloseSuccessModal}>
        <DialogContent className="sm:max-w-sm flex flex-col items-center text-center">
          <DialogHeader className="flex flex-col items-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mb-2" />
            <DialogTitle className="text-xl">¡Boletos Registrados!</DialogTitle>
            <DialogDescription>
              La compra se ha guardado exitosamente.
            </DialogDescription>
          </DialogHeader>
          
          {/* Contenedor con altura máxima y scroll */}
          <div className="w-full bg-muted/50 rounded-lg mt-2 mb-4 p-4 max-h-48 overflow-y-auto border border-border">
            <p className="text-sm text-muted-foreground mb-2 sticky top-0 bg-muted/50 backdrop-blur-sm pb-1">Números asignados:</p>
            <p className="text-xl font-mono font-bold text-foreground break-words text-balance">
              {boletosGenerados}
            </p>
          </div>

          {/* Botones de acción */}
          <div className="flex flex-col w-full gap-2">
            <Button onClick={handleCloseSuccessModal} className="w-full">
              Aceptar y registrar otro
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}