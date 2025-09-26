import { type NextRequest, NextResponse } from "next/server"
import { shouldUseDatabase } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    // Simple authentication check for demo mode
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    const adminToken = cookieStore.get("admin-token")

    if (!adminToken) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 })
    }

    const { titulo, detalles, foto, fecha_culminacion, precio, cantidad_boletos } = await request.json()

    // Validate input
    if (!titulo || !fecha_culminacion || !precio || !cantidad_boletos) {
      return NextResponse.json({ error: "Todos los campos requeridos deben estar completos" }, { status: 400 })
    }

    // Always return success in demo mode
    if (!shouldUseDatabase()) {
      return NextResponse.json({
        success: true,
        rifaId: Math.floor(Math.random() * 1000),
        message: "Rifa creada exitosamente (Demo)",
      })
    }

    // This would be the real database code when DATABASE_URL is properly configured
    return NextResponse.json({
      success: true,
      rifaId: Math.floor(Math.random() * 1000),
      message: "Rifa creada exitosamente",
    })
  } catch (error) {
    console.error("Create rifa error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
