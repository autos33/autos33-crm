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

interface AddTicketDialogProps {
  rifaId: number
}

export function AddTicketDialog({ rifaId }: AddTicketDialogProps) {
  const [open, setOpen] = useState(false)
  const [feedback, setFeedback] = useState("");
  const [estadoFeedback, setEstadoFeedback] = useState<"error" | "success" | "hidden">("hidden");
  const [formData, setFormData] = useState({
    cantidad_boletos: "",
    nombre_comprador: "",
    correo_comprador: "",
    telefono_comprador: "",
    prefijo_cedula: "V-",
    cedula_comprador: "",
  })

  const [loading, setLoading] = useState(false)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    añadirBoletos()
  }

  async function añadirBoletos() {
        const { data: boletos, error: errorBoletos } = await 
        supabase.rpc("boletos_aleatorios", {limite : formData.cantidad_boletos, p_id_rifa : rifaId});

        if (errorBoletos || !boletos || boletos.length < formData.cantidad_boletos) {
            setFeedback(`No hay suficientes boletos disponibles en este momento (Boletos Restantes: ${boletos.length})`);
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
          cedula : cedulaCliente});
        if (error) {
          console.error("Hubo un error al comprar los boletos:", error);
          setFeedback("Hubo un error al agregar los boletos. Inténtalo de nuevo.");
          setEstadoFeedback("error");
          setLoading(false);
          return;
        } else {
          const numerosBoletos = data.map((boleto: { numero_boleto: string }) => boleto.numero_boleto);
          var cadenaBoletos = numerosBoletos.join(", ");
        }
        setFeedback(`Boletos agregados exitosamente (${cadenaBoletos})`);
        setEstadoFeedback("success");
        setLoading(false);
    }

  return (
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
              <select onChange={(e) => setFormData((prev) => ({ ...prev, prefijo_cedula: e.target.value }))} className="border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-black focus:border-transparent">
                <option value="V-">V</option>
                <option value="E-">E</option>
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
              maxLength={11}
              minLength={11}
              onChange={(e) => setFormData((prev) => ({ ...prev, telefono_comprador: e.target.value }))}
              placeholder="04121234567"
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

          <div className={estadoFeedback === "hidden" ? "hidden" : estadoFeedback === "error" ? "bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded relative" : "bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded relative"}>
            <p className={estadoFeedback === "hidden" ? "hidden" : estadoFeedback === "error" ? "text-sm text-orange-700" : "text-sm text-green-700"}>
              {feedback}
            </p>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => {setOpen(false);}}>
              Cerrar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Agregando..." : "Agregar Boleto"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
