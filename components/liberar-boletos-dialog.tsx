"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase-client"

export function LiberarBoletosDialog({ rifaId }: { rifaId: number }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const router = useRouter()

  const handleLiberar = async () => {
    setLoading(true)
    try {
      const { error } = await supabase.rpc("liberar_boletos_por_rifa", {
        p_id_rifa: rifaId,
      })

      if (error) throw error

      toast({
        title: "Boletos liberados",
        description: "Se han liberado todos los boletos reservados de esta rifa.",
      })
      
      setOpen(false)
      router.refresh() // Recarga los datos en la página
    } catch (error: any) {
      console.error("Error liberando boletos:", error.message)
      toast({
        title: "Error",
        description: "No se pudieron liberar los boletos.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive" size="sm">
          Liberar Reservados
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="gap-2">
          <DialogTitle>¿Estás seguro?</DialogTitle>
          <DialogDescription>
            Esta acción liberará todos los boletos que estén en estado "reservado" para esta rifa, sin importar hace cuánto tiempo fueron reservados. Pasarán a estar disponibles nuevamente.
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => setOpen(false)} disabled={loading}>
            Cancelar
          </Button>
          <Button variant="destructive" onClick={handleLiberar} disabled={loading}>
            {loading ? "Liberando..." : "Sí, liberar boletos"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}