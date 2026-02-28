
import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase-client"; // Asumo que este es tu cliente *Client-side*
import { RifaDetailsClient } from "./RifaDetailsClient"; // <-- Importamos el nuevo componente de cliente
import { cookies } from "next/headers"; // <-- Importación correcta de SERVER

interface PageProps {
  params: { id: string }
  searchParams: {
    page?: string
    query?: string
    filter?: string
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
  porcentaje_venta: number | null
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

async function getBoletosPaginados(rifaId: string, page: number, query: string, filter: string) {
  const limit = 50; // Cantidad de boletos por página
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  // Iniciamos la consulta pidiendo también el conteo total (exact)
  let supabaseQuery = supabase
    .from('Boletos')
    .select('*', { count: 'exact' })
    .eq('id_rifa', rifaId)
    .eq('estado', 'ocupado');

  // Si hay algo escrito en el buscador, aplicamos el filtro correspondiente
  if (query) {
    if (filter === 'nombre') {
      supabaseQuery = supabaseQuery.ilike('nombre_comprador', `%${query}%`);
    } else if (filter === 'cedula') {
      supabaseQuery = supabaseQuery.ilike('cedula_comprador', `%${query}%`);
    } else if (filter === 'telefono') {
      supabaseQuery = supabaseQuery.ilike('telefono_comprador', `%${query}%`);
    } else if (filter === 'numero' && !isNaN(Number(query))) {
      supabaseQuery = supabaseQuery.eq('numero_boleto', Number(query));
    }
  }

  // Ejecutamos la consulta con el rango de paginación
  const { data, count, error } = await supabaseQuery
    .order('numero_boleto', { ascending: true })
    .range(from, to);

  if (error) {
    console.error("Error fetching paginated boletos:", error);
    return { boletos: [], totalBoletos: 0 };
  }

  return { boletos: data, totalBoletos: count || 0 };
}

async function getBoletosDisponiblesPorRifa(rifaId: string) {
  // Extraemos 'count' en lugar de 'data' y añadimos { count: 'exact', head: true }
  const { count, error } = await supabase
    .from('Boletos')
    .select('*', { count: 'exact', head: true }) 
    .eq('id_rifa', rifaId)
    .eq('estado', 'disponible');

  if (error) {
    console.error("Error fetching boletos disponibles:", error);
    return 0;
  }

  // Retornamos directamente el conteo
  return count || 0;
}

async function getBoletosVendidosPorRifa(rifaId: string) {
  const { count, error } = await supabase
    .from('Boletos')
    .select('*', { count: 'exact', head: true })
    .eq('id_rifa', rifaId)
    .eq('estado', 'ocupado');

  if (error) {
    console.error("Error fetching boletos vendidos:", error);
    return 0;
  }

  return count || 0;
}

export default async function RifaDetailPage({ params, searchParams }: PageProps) {
  const cookieStore = cookies()
  const demoToken = cookieStore.get("admin-token")
  if (!demoToken) redirect("/admin")

  const rifa = await getRifaById(params.id)
  if (!rifa) redirect("/admin/dashboard")

  // Extraemos los valores de la URL o asignamos valores por defecto
  const currentPage = Number(searchParams?.page) || 1;
  const currentQuery = searchParams?.query || "";
  const currentFilter = searchParams?.filter || "nombre";

  const premios = await getPremiosByRifaId(params.id)
  
  // Usamos la nueva función
  const { boletos, totalBoletos } = await getBoletosPaginados(params.id, currentPage, currentQuery, currentFilter);
  
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
      totalBoletos={totalBoletos} // Pasamos el total de encontrados
      currentPage={currentPage}   // Pasamos la página actual
      stats={stats}
    />
  )
}