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

export function CreateGanadorDialog() {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [formData, setFormData] = useState({
    titulo: "",
  })

  const [imagenRifa, setImagenRifa] = useState<File | null>(null)
  const [imagenPreview, setImagenPreview] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]
      setImagenRifa(file)
      
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
      .from("ganador_img")
      .upload(filePath, file)

    if (error) {
      console.error("Error subiendo imagen:", error.message)
      return null
    }

    const { data } = await supabase.storage
      .from("ganador_img")
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
        .from("Ganadores")
        .insert({
          titulo: formData.titulo,
          foto_url: imageUrl,
          estado: true,
        })
        .select()
        .single()

      if (error) {
        throw error
      }

      toast({
        title: "Ganador añadido",
        description: "El ganador ha sido añadido exitosamente.",
      })

      setOpen(false)
      resetForm()
      router.refresh()
    } catch (error: any) {
      console.error("Error creando el ganador:", error.message)
      toast({
        title: "Error",
        description: error.message || "No se pudo crear el registro",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      titulo: ""
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
        <Button>Añadir Ganador</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Añadir Ganador</DialogTitle>
          <DialogDescription>Completa la información para añadir una nueva ganador</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="titulo">Título</Label>
            <Input
              id="titulo"
              value={formData.titulo}
              onChange={(e) => setFormData((prev) => ({ ...prev, titulo: e.target.value }))}
              placeholder="Ganadores del sorteo octubre-25"
              required
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

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => {
              setOpen(false)
              resetForm()
            }}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Añadiendo..." : "Añadir Ganador"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}