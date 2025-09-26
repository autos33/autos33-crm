// Este archivo es un Server Component por defecto.
// NO debe tener la directiva 'use client'
import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase-client"; // Asumo que este es tu cliente *Client-side*
import { RifaDetailsClient } from "./RifaDetailsClient"; // <-- Importamos el nuevo componente de cliente
import { cookies } from "next/headers"; // <-- Importación correcta de SERVER

interface PageProps {
  params: {
    id: string
  }
}

interface Rifa {
  id: number
  titulo: string
  detalles: string
  foto: string
  fecha_culminacion: string
  precio: number
  cantidad_boletos: number
  estado: string
  fecha_creacion: string
  boletos_vendidos: number
  boletos_disponibles: number
}

interface Premio {
  id: number
  id_rifa: number
  titulo: string
  descripcion: string
  foto_url: string
}

interface Boleto {
  id: number
  id_rifa: number
  numero_boleto: number
  nombre_comprador: string
  correo_comprador: string
  telefono_comprador: string
  cedula_comprador: string
  fecha_compra: string
}

async function getRifaById(id: string) {
  const { error: liberarBoletosError } = await supabase.rpc('liberar_boletos_reservados');
  if (liberarBoletosError) {
    console.error('Error al liberar boletos:', liberarBoletosError);
  } else {
    console.log('Boletos expirados liberados con éxito.');
  }

  const { data, error } = await supabase
    .from('Rifas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching rifa:", error);
    return null;
  }
  return data;
}

async function getPremiosByRifaId(rifaId: string) {
  // ... (Tu lógica de fetching se mantiene igual) ...
  const { data, error } = await supabase
    .from('Premios')
    .select('*')
    .eq('id_rifa', rifaId);

  if (error) {
    console.error("Error fetching premios:", error);
    return [];
  }
  return data;
}

// ... (Las funciones getBoletosByRifaId, getBoletosDisponiblesPorRifa, etc. se mantienen igual) ...

async function getBoletosByRifaId(rifaId: string) {
  // Always use fallback data to avoid connection issues
  // return fallbackBoletos.filter((boleto) => boleto.id_rifa.toString() === rifaId)
  const { data, error } = await supabase
    .from('Boletos')
    .select('*')
    .eq('id_rifa', rifaId)
    .eq('estado', 'ocupado');

  if (error) {
    console.error("Error fetching boletos:", error);
    return [];
  }
  return data;
}

async function getBoletosDisponiblesPorRifa(rifaId: string) {
  const { data, error } = await supabase
    .from('Boletos')
    .select('*')
    .eq('id_rifa', rifaId)
    .eq('estado', 'disponible');

  if (error) {
    console.error("Error fetching boletos disponibles:", error);
    return 0;
  }

  return data?.length || 0;
}

async function getBoletosVendidosPorRifa(rifaId: string) {
  const { data, error } = await supabase
    .from('Boletos')
    .select('*')
    .eq('id_rifa', rifaId)
    .eq('estado', 'ocupado');

  if (error) {
    console.error("Error fetching boletos disponibles:", error);
    return 0;
  }

  return data?.length || 0;
}

export default async function RifaDetailPage({ params }: PageProps) {
  // 1. Verificación de Autenticación (Ahora funciona en el servidor)
  const cookieStore = cookies()
  const demoToken = cookieStore.get("admin-token")
  if (!demoToken) {
    redirect("/admin")
  }

  // 2. Carga de datos (async/await es seguro aquí)
  const rifa = await getRifaById(params.id)
  if (!rifa) {
    redirect("/admin/dashboard")
  }

  const premios = await getPremiosByRifaId(params.id)
  const boletos = await getBoletosByRifaId(params.id)
  const cantidadBoletosDisponibles = await getBoletosDisponiblesPorRifa(params.id);
  const cantidadBoletosVendidos = await getBoletosVendidosPorRifa(params.id);

  const stats = {
    vendidos: cantidadBoletosVendidos,
    disponibles: cantidadBoletosDisponibles,
    total: rifa.cantidad_boletos,
    reservados: (rifa.cantidad_boletos - cantidadBoletosVendidos - cantidadBoletosDisponibles),
  }

  // 3. Renderizar el componente de cliente y pasar los datos como props
  return (
    <RifaDetailsClient
      rifa={rifa}
      premios={premios}
      boletos={boletos as any[]} // Ajusta el tipo si es necesario
      stats={stats}
    />
  )
}