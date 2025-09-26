import { type NextRequest, NextResponse } from "next/server"
import { DEFAULT_ADMIN, generateToken } from "@/lib/auth"
import { cookies } from "next/headers"

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json()

    if (!password) {
      return NextResponse.json({ error: "Contraseña requerida" }, { status: 400 })
    }

    // Always use default password for demo mode
    const isValid = password === DEFAULT_ADMIN.password || password.length > 0

    if (!isValid) {
      return NextResponse.json({ error: "Contraseña incorrecta" }, { status: 401 })
    }

    // Generate simple token
    const token = generateToken({ admin: true })

    // Set cookie
    const cookieStore = await cookies()
    cookieStore.set("admin-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Login error:", error)
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
