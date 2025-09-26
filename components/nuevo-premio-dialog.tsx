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

export function CreatePremio({ rifaId }: { rifaId: string }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
  })

  const [imagenPremio, setImagenPremio] = useState<File | null>(null)
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setImagenPremio(file)

      // Crear preview de la imagen
      const reader = new FileReader()
      reader.onload = (event) => {
        setImagenPreview(event.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const uploadImage = async (file: File): Promise<string | null> => {
    let safeFileName = file.name.replace(/\s/g, "-").toLowerCase();
    safeFileName = safeFileName.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    safeFileName = safeFileName.replace(/[^a-z0-9-.]/g, "");
    const filePath = `${safeFileName}-${Date.now()}`;

    const { error } = await supabase.storage
      .from("premio_img") // Se cambió el bucket a "foto-premio"
      .upload(filePath, file)

    if (error) {
      console.error("Error subiendo imagen:", error.message)
      return null
    }

    const { data } = await supabase.storage
      .from("premio_img")
      .getPublicUrl(filePath)

    return data.publicUrl
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      let imageUrl = null
      if (imagenPremio) {
        console.log(imagenPremio)
        imageUrl = await uploadImage(imagenPremio)
        if (!imageUrl) {
          toast({
            title: "Error",
            description: "No se pudo subir la imagen del premio",
            variant: "destructive",
          })
          return
        }
      }

      const { error } = await supabase
        .from("Premios")
        .insert({
          id_rifa: rifaId,
          titulo: formData.titulo,
          descripcion: formData.descripcion,
          foto_url: imageUrl,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      toast({
        title: "Premio creado",
        description: "El premio se ha creado exitosamente",
      })

      setOpen(false)
      resetForm()
      router.refresh()
    } catch (error: any) {
      console.error("Error creando premio:", error.message)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el premio",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      titulo: "",
      descripcion: "",
    })
    setImagenPremio(null)
    setImagenPreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Crear Nuevo Premio</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Crear Nuevo Premio</DialogTitle>
          <DialogDescription>Completa la información para crear un nuevo premio</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título del premio</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData((prev) => ({ ...prev, titulo: e.target.value }))}
              placeholder="Ej: Televisor 55 pulgadas"
              required
            />
          </div>

          <div>
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={formData.descripcion}
              onChange={(e) => setFormData((prev) => ({ ...prev, descripcion: e.target.value }))}
              placeholder="Describe el premio"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="foto">Imagen del premio</Label>
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

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => {
              setOpen(false)
              resetForm()
            }}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Creando..." : "Crear Premio"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}