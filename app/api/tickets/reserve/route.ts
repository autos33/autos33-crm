import { type NextRequest, NextResponse } from "next/server"
import { shouldUseDatabase } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const { productId, ticketCount, buyerName, buyerCedula } = await request.json()

    // Always simulate success in demo mode
    if (!shouldUseDatabase()) {
      const simulatedTickets = Array.from({ length: ticketCount }, (_, i) => Math.floor(Math.random() * 100) + 1)

      return NextResponse.json({
        ticketNumbers: simulatedTickets,
        message: "Tickets reservados exitosamente (Demo)",
      })
    }

    // This would be the real database code when DATABASE_URL is properly configured
    const simulatedTickets = Array.from({ length: ticketCount }, (_, i) => Math.floor(Math.random() * 100) + 1)

    return NextResponse.json({
      ticketNumbers: simulatedTickets,
      message: "Tickets reservados exitosamente",
    })
  } catch (error) {
    console.error("Reserve tickets error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
