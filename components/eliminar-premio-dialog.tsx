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

export function DeletePremio({
  rifaId,
  premioId,
}: {
  rifaId: string;
  premioId: string;
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleDelete = async () => {
    setLoading(true);

    try {
      // 1. Obtener los datos del premio para encontrar la URL de la imagen
      const { data: premioData, error: fetchError } = await supabase
        .from("Premios")
        .select("foto_url")
        .eq("id", premioId)
        .single();

      if (fetchError) {
        throw fetchError;
      }

      // 2. Si existe una imagen, eliminarla del almacenamiento primero
      if (premioData.foto_url) {
        const url = new URL(premioData.foto_url);
        // La ruta completa es /storage/v1/object/public/foto-premio/nombre-de-archivo.png
        // Queremos "foto-premio/nombre-de-archivo.png"
        const filePath = url.pathname.split("/public/").pop();

        if (filePath) {
          const { error: storageError } = await supabase.storage
            .from("foto-premio")
            .remove([filePath]);

          if (storageError) {
            console.error(
              "Error al eliminar la imagen del storage:",
              storageError.message
            );
            // Se puede lanzar un error o simplemente registrarlo,
            // pero es mejor continuar para eliminar el registro de la base de datos.
            // Para ser más robustos, no lanzamos un error aquí para que el premio se borre de la DB.
          }
        }
      }

      // 3. Eliminar el premio de la base de datos
      const { error: deleteError } = await supabase
        .from("Premios")
        .delete()
        .eq("id", premioId);

      if (deleteError) {
        throw deleteError;
      }

      toast({
        title: "Premio eliminado",
        description: "El premio se ha eliminado exitosamente",
      });

      setOpen(false);
      router.refresh();
    } catch (error: any) {
      console.error("Error al eliminar premio:", error.message);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el premio",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="destructive">Eliminar</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Eliminar Premio</DialogTitle>
          <DialogDescription>
            ¿Estás seguro de que quieres eliminar este premio? Esta acción no se
            puede deshacer.
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
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? "Eliminando..." : "Eliminar"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}