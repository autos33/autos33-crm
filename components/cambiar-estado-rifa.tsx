"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase-client";

export function CambiarEstadoRifa({rifaId, estado,}: {rifaId: string; estado: string;}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleCambiarEstado = async () => {
    setLoading(true);
    let newEstado = '';
    if (estado === 'activa') {
      newEstado = 'finalizada';
    } else if (estado === 'proximamente') {
      newEstado = 'activa';
    } else {
      newEstado = 'activa';
    }
    try {
      const { data: premioData, error: fetchError } = await supabase
        .from('Rifas')
        .update({ estado: newEstado })
        .eq('id', rifaId)
        .select()

      if (fetchError) {
        throw fetchError;
      }

      setOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error("Error al actualizar el estado de la Rifa:", error.message);
      toast({
        title: "Error",
        description: error.message || "No se pudo actualizar el estado de la rifa.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" variant="destructive">{estado === "activa" ? "Finalizar Rifa" : estado === "proximamente" ? "Iniciar Rifa" : "Habilitar Rifa"}</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{estado === "activa" ? "Finalizar Rifa" : estado === "proximamente" ? "Iniciar Rifa" : "Habilitar Rifa"}</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres realizar esta acción?
          </DialogDescription>
        </DialogHeader>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleCambiarEstado}
            disabled={loading}
          >
            {loading ? "Actualizando..." : "Actualizar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}