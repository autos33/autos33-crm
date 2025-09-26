"use client"
import type React from "react"
import { Button } from "@/components/ui/button"

export function ActualizarButton() {
  return (
    <Button type="button" variant="outline" onClick={() => {window.location.reload();}}>
      Actualizar
    </Button>
  )
}
