import { redirect } from "next/navigation"
import { supabase } from "@/lib/supabase-client"; // Keep the server-safe version if possible
import { cookies } from "next/headers" // Use server-safe cookies
import { AdminDashboardClient } from "./AdminDashboardClient"; // Import the new Client Component

// Interfaces de datos (importadas o definidas aquí)
interface Rifa { id: number; titulo: string; estado: string; precio: number; cantidad_boletos: number; fecha_culminacion: string; foto: string; }
interface Ganador { id: number; titulo: string; estado: boolean; foto_url: string; }

async function getRifas(): Promise<Rifa[] | null> {

    const { data: dataBoletos, error: errorBoletos } = await supabase.rpc('liberar_boletos_reservados');
    // se mostrará el mensje en la consola del servidor
    if (errorBoletos) {
        console.error('Error al liberar boletos:', errorBoletos);
    } else {
        console.log('Boletos expirados liberados con éxito.');
    }

    const { data, error } = await supabase
        .from('Rifas')
        .select('*');

    if (error) {
        console.error("Error fetching rifa:", error);
        return null;
    }
    return data as Rifa[];
}

async function getGanadores(): Promise<Ganador[] | null> {
    const { data, error } = await supabase
        .from('Ganadores')
        .select('*');

    if (error) {
        console.error("Error fetching ganadores:", error);
        return null;
    }
    return data as Ganador[];
}

async function getBoletosVendidosPorRifa(rifaId: number): Promise<number> {
    const { count, error } = await supabase
        .from('Boletos')
        .select('*', { count: 'exact', head: true })
        .eq('id_rifa', rifaId)
        .eq('estado', 'ocupado');

    if (error) {
        console.error("Error fetching boletos disponibles:", error);
        return 0;
    }

    return count ?? 0;
}

export default async function AdminDashboard() {
    const cookieStore = cookies()
    const demoToken = cookieStore.get("admin-token")
    if (!demoToken) {
        redirect("/admin")
    }

    const [rifas, ganadores] = await Promise.all([
        getRifas(),
        getGanadores()
    ]);

    const boletosVendidosPorRifa = await Promise.all(
        (rifas ?? []).map(rifa => getBoletosVendidosPorRifa(rifa.id))
    );

    return (
        <AdminDashboardClient 
            rifas={rifas ?? []} 
            ganadores={ganadores ?? []} 
            boletosVendidosPorRifa={boletosVendidosPorRifa}
        />
    )
}

