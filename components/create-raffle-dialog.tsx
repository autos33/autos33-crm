"use client"

import type React from "react"
import { useState, useRef } from "react"
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
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { supabase } from "@/lib/supabase-client"

export function CreateRaffleDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    titulo: "",
    detalles: "",
    fecha_culminacion: "",
    precio: 0,
    cantidad_boletos: 1000,
  })

  const [imagenRifa, setImagenRifa] = useState<File | null>(null)
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setImagenRifa(file)
      
      // Crear preview de la imagen
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagenPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    const filePath = `${file.name}-${Date.now()}`
    
    const { error } = await supabase.storage
      .from("rifa_img") // Asegúrate de que este bucket existe en Supabase Storage
      .upload(filePath, file)

    if (error) {
      console.error("Error subiendo imagen:", error.message)
      return null
    }

    const { data } = await supabase.storage
      .from("rifa_img")
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrl = null
      if (imagenRifa) {
        imageUrl = await uploadImage(imagenRifa)
        if (!imageUrl) {
          toast({
            title: "Error",
            description: "No se pudo subir la imagen",
            variant: "destructive",
          })
          return
        }
      }

      const { error } = await supabase
        .from("Rifas")
        .insert({
          titulo: formData.titulo,
          detalles: formData.detalles,
          foto: imageUrl,
          fecha_culminacion: formData.fecha_culminacion,
          precio: formData.precio,
          cantidad_boletos: formData.cantidad_boletos,
          estado: "proximamente",
          fecha_creacion: new Date().toISOString(),
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      toast({
        title: "Rifa creada",
        description: "La rifa se ha creado exitosamente",
      })

      setOpen(false)
      resetForm()
      router.refresh()
    } catch (error: any) {
      console.error("Error creando rifa:", error.message)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear la rifa",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      titulo: "",
      detalles: "",
      fecha_culminacion: "",
      precio: 0,
      cantidad_boletos: 1000,
    })
    setImagenRifa(null)
    setImagenPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Crear Nueva Rifa</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nueva Rifa</DialogTitle>
          <DialogDescription>Completa la información para crear una nueva rifa</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título de la rifa</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData((prev) => ({ ...prev, titulo: e.target.value }))}
              placeholder="Ej: Gran Rifa 2024"
              required
            />
          </div>

          <div>
            <Label htmlFor="detalles">Detalles</Label>
            <Textarea
              id="detalles"
              value={formData.detalles}
              onChange={(e) => setFormData((prev) => ({ ...prev, detalles: e.target.value }))}
              placeholder="Describe la rifa y sus premios"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="foto">Imagen de la rifa</Label>
            <Input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              id="foto"
            />
            {imagenPreview && (
              <div className="mt-2 flex justify-center">
                <div className="max-w-sm">
                  <p className="text-sm text-gray-500 mb-1">Vista previa:</p>
                  <img
                    src={imagenPreview}
                    alt="Preview"
                    className="w-full h-auto rounded-md border"
                  />
                </div>
              </div>
            )}
          </div>

          <div>
            <Label htmlFor="fecha_culminacion">Fecha de culminación</Label>
            <Input
              id="fecha_culminacion"
              type="datetime-local"
              value={formData.fecha_culminacion}
              onChange={(e) => setFormData((prev) => ({ ...prev, fecha_culminacion: e.target.value }))}
              min={new Date().toISOString().slice(0, 16)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="precio">Precio por boleto (Bs)</Label>
              <Input
                id="precio"
                type="number"
                min="1"
                step="0.01"
                value={formData.precio}
                onChange={(e) => setFormData((prev) => ({ ...prev, precio: Number.parseFloat(e.target.value) || 0 }))}
              />
            </div>

            <div>
              <Label htmlFor="cantidad_boletos">Cantidad de boletos</Label>
              <Input
                id="cantidad_boletos"
                type="number"
                min="1"
                value={formData.cantidad_boletos}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, cantidad_boletos: Number.parseInt(e.target.value) || 0 }))
                }
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => {
              setOpen(false)
              resetForm()
            }}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Rifa"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}