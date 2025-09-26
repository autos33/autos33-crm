import { neon } from "@neondatabase/serverless"

// Check if DATABASE_URL is available and valid
const DATABASE_URL = process.env.DATABASE_URL

// Only create sql connection if DATABASE_URL looks valid and complete
export const sql = DATABASE_URL && DATABASE_URL.includes("://") ? neon(DATABASE_URL) : null

// Fallback data for rifas
export const fallbackRifas = [
  {
    id: 1,
    titulo: "Gran Rifa 2024",
    detalles: "Rifa con increíbles premios para este año",
    foto: "/placeholder.svg?height=400&width=400&text=Gran+Rifa+2024",
    fecha_culminacion: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    precio: 180.0,
    cantidad_boletos: 1000,
    estado: "activa",
    fecha_creacion: new Date().toISOString(),
    boletos_vendidos: 423,
    boletos_disponibles: 427,
  },
]

// Fallback data for premios
export const fallbackPremios = [
  {
    id: 1,
    id_rifa: 1,
    titulo: "Moto 0km",
    descripcion: "Motocicleta completamente nueva, modelo del año",
    foto_url: "/placeholder.svg?height=300&width=300&text=Moto+0km",
  },
  {
    id: 2,
    id_rifa: 1,
    titulo: "500$ en Efectivo",
    descripcion: "Quinientos dólares americanos en efectivo",
    foto_url: "/placeholder.svg?height=300&width=300&text=500+USD",
  },
  {
    id: 3,
    id_rifa: 1,
    titulo: "30 Cenas para 2 Personas",
    descripcion: "Treinta cenas románticas para dos personas en restaurantes selectos",
    foto_url: "/placeholder.svg?height=300&width=300&text=30+Cenas",
  },
]

// Fallback data for boletos
export const fallbackBoletos = [
  {
    id: 1,
    id_rifa: 1,
    numero_boleto: 1,
    nombre_comprador: "Juan Pérez",
    correo_comprador: "juan.perez@email.com",
    telefono_comprador: "+58-412-1234567",
    cedula_comprador: "V-12345678",
    fecha_compra: new Date().toISOString(),
  },
  {
    id: 2,
    id_rifa: 1,
    numero_boleto: 15,
    nombre_comprador: "María García",
    correo_comprador: "maria.garcia@email.com",
    telefono_comprador: "+58-424-2345678",
    cedula_comprador: "V-23456789",
    fecha_compra: new Date().toISOString(),
  },
  {
    id: 3,
    id_rifa: 1,
    numero_boleto: 42,
    nombre_comprador: "Carlos López",
    correo_comprador: "carlos.lopez@email.com",
    telefono_comprador: "+58-414-3456789",
    cedula_comprador: "V-34567890",
    fecha_compra: new Date().toISOString(),
  },
  {
    id: 4,
    id_rifa: 1,
    numero_boleto: 73,
    nombre_comprador: "Ana Rodríguez",
    correo_comprador: "ana.rodriguez@email.com",
    telefono_comprador: "+58-426-4567890",
    cedula_comprador: "V-45678901",
    fecha_compra: new Date().toISOString(),
  },
  {
    id: 5,
    id_rifa: 1,
    numero_boleto: 99,
    nombre_comprador: "Luis Martínez",
    correo_comprador: "luis.martinez@email.com",
    telefono_comprador: "+58-412-5678901",
    cedula_comprador: "V-56789012",
    fecha_compra: new Date().toISOString(),
  },
]

// Simple function to check if we should use database
export function shouldUseDatabase(): boolean {
  return !!sql
}

// Safe query execution with fallback
export async function safeQuery<T>(queryFn: () => Promise<T>, fallback: T): Promise<T> {
  if (!sql) {
    console.warn("Using fallback data (no database connection)")
    return fallback
  }

  try {
    return await queryFn()
  } catch (error) {
    console.error("Database query failed, using fallback:", error)
    return fallback
  }
}
