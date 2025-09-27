
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

async function getBoletosByRifaId(rifaId: string) {
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
  const cookieStore = cookies()
  const demoToken = cookieStore.get("admin-token")
  if (!demoToken) {
    redirect("/admin")
  }

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

  return (
    <RifaDetailsClient
      rifa={rifa}
      premios={premios}
      boletos={boletos as any[]}
      stats={stats}
    />
  )
}