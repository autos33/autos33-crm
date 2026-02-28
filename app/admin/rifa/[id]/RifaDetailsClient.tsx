"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useEffect, useState, useMemo } from "react"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { LiberarBoletosDialog } from "@/components/liberar-boletos-dialog";
import { RaffleStatsChart } from "@/components/raffle-stats-chart"
import { AddTicketDialog } from "@/components/add-ticket-dialog"
import { ActualizarButton } from "@/components/actualizar-button"
import { CreatePremio } from "@/components/nuevo-premio-dialog"
import { CambiarEstadoRifa } from "@/components/cambiar-estado-rifa";
import { DeletePremio } from "@/components/eliminar-premio-dialog";
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { supabase } from "@/lib/supabase-client"

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

interface Stats {
  vendidos: number
  disponibles: number
  total: number
  reservados: number
}

interface RifaDetailsClientProps {
  rifa: Rifa
  premios: Premio[]
  boletos: Boleto[]
  totalBoletos: number // NUEVO
  currentPage: number  // NUEVO
  stats: Stats
}

export function RifaDetailsClient({ rifa, premios, boletos, totalBoletos, currentPage, stats }: RifaDetailsClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Estados locales para la UI
  const [localQuery, setLocalQuery] = useState(searchParams.get("query") || "");
  const [filtroBoletos, setFiltroBoletos] = useState(searchParams.get("filter") || "nombre");

  const [porcentajeVisual, setPorcentajeVisual] = useState<number | null>(rifa.porcentaje_venta ?? null);
  const [isSavingPorcentaje, setIsSavingPorcentaje] = useState(false);

  const actualizarPorcentajeVisual = async (nuevoValor: number | null) => {
    setIsSavingPorcentaje(true);
    const { error } = await supabase
      .from('Rifas')
      .update({ porcentaje_venta: nuevoValor })
      .eq('id', rifa.id);

    if (error) {
      console.error("Error al actualizar porcentaje:", error);
      alert("Hubo un error al guardar el porcentaje.");
    } else {
      setPorcentajeVisual(nuevoValor);
      // Opcionalmente puedes forzar un router.refresh() aquí si quieres que page.tsx se recargue
      router.refresh(); 
    }
    setIsSavingPorcentaje(false);
  };

  const totalPages = Math.ceil(totalBoletos / 50);

  // Función para actualizar la URL
  const updateUrl = (newQuery: string, newFilter: string, newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    
    if (newQuery) params.set("query", newQuery);
    else params.delete("query");
    
    params.set("filter", newFilter);
    params.set("page", newPage.toString());
    
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  // Actualiza la búsqueda al presionar "Enter" o perder el foco, para no saturar el servidor por cada letra
  const handleSearch = () => {
    updateUrl(localQuery, filtroBoletos, 1); // Siempre vuelve a la página 1 al buscar
  };
  useEffect(() => {
    const temporizador = setTimeout(() => {
      const urlQueryActual = searchParams.get("query") || "";
      if (localQuery !== urlQueryActual) {
        updateUrl(localQuery, filtroBoletos, 1);
      }
    }, 1000);
    return () => clearTimeout(temporizador);
  }, [localQuery, filtroBoletos, searchParams]);

  const handleFilterChange = (filter: string) => {
    setFiltroBoletos(filter);
    updateUrl(localQuery, filter, 1);
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case "activa":
        return <Badge className="bg-green-100 text-green-800 hover:bg-green-400">Activa</Badge>
      case "finalizada":
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-400">Finalizada</Badge>
      case "pendiente":
        return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-400">Pendiente</Badge>
      default:
        return <Badge variant="secondary">{estado}</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center gap-4 mb-4">
            <Link href="/admin/dashboard" className="flex items-center gap-2 text-gray-600 hover:text-gray-900">
              <ArrowLeft className="w-4 h-4" />
              Volver al Dashboard
            </Link>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">{rifa.titulo}</h1>
              <p className="text-gray-600 mt-2">{rifa.detalles}</p>
              <div className="flex items-center gap-4 mt-4">
                {getStatusBadge(rifa.estado)}
                <span className="text-sm text-gray-500">
                  Culmina: {rifa.fecha_culminacion ? new Date(rifa.fecha_culminacion).toLocaleDateString() : "---"}
                </span>
              </div>
            </div>
            <img
              src={rifa.foto || "/placeholder.svg"}
              alt={rifa.titulo}
              className="w-40 h-40 object-contain rounded-lg"
            />
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-6 mb-8 w-full justify-between">
          <div className="w-full md:w-1/2 flex flex-col gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Boletos Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.vendidos}</div>
                <p className="text-xs text-gray-500">Bs {(stats.vendidos * rifa.precio).toFixed(2)} recaudados</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Boletos Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.disponibles}</div>
                <p className="text-xs text-gray-500">
                  {((stats.disponibles / stats.total) * 100).toFixed(1)}% restante
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Precio por Boleto</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">Bs {rifa.precio.toFixed(2)}</div>
                <p className="text-xs text-gray-500">Total: {stats.total.toString()} boletos</p>
              </CardContent>
            </Card>
          </div>

          <div className="w-full md:w-1/2 flex justify-end">
            <Card className="w-full max-w-[500px]">
              <CardHeader>
                <CardTitle className="text-lg">Distribución de Boletos</CardTitle>
              </CardHeader>
              <CardContent>
                <RaffleStatsChart stats={stats} />
              </CardContent>
            </Card>
          </div>
        </div>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Premios de la Rifa
              <CreatePremio rifaId={rifa.id.toString()} />
            </CardTitle>
            <CardDescription>Lista de premios disponibles para esta rifa</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {premios.map((premio, index) => (
                <div key={premio.id} className="border rounded-lg p-4">
                  <img
                    src={premio.foto_url || "/placeholder.svg"}
                    alt={premio.titulo}
                    className="w-full h-32 object-cover rounded mb-3"
                  />
                  <div className="flex flex-row justify-between items-end gap-3">
                    <div className="flex flex-col">
                      <h3 className="font-semibold text-lg mb-2">
                        {index + 1}° Premio: {premio.titulo}
                      </h3>
                      <p className="text-gray-600 text-sm">{premio.descripcion}</p>
                    </div>
                    <div className="flex flex-col">
                      <DeletePremio rifaId={rifa.id.toString()} premioId={premio.id.toString()} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex justify-between items-center">
              Boletos Vendidos ({stats.vendidos} boletos encontrados)
              <div className="flex flex-row justify-end gap-3">
                <LiberarBoletosDialog rifaId={rifa.id} />
                <ActualizarButton />
                <AddTicketDialog rifaId={rifa.id} />
              </div>
            </CardTitle>
            <CardDescription>Lista de todos los boletos vendidos para esta rifa</CardDescription>
            <div className="flex flex-col w-full gap-2 py-5">
              <div className="flex flex-row w-full md:w-1/2 gap-3 justify-start">
                <Button variant="outline" size="sm" className={filtroBoletos === "nombre" ? "bg-gray-200" : ""} onClick={() => handleFilterChange("nombre")}> Nombre </Button>
                <Button variant="outline" size="sm" className={filtroBoletos === "cedula" ? "bg-gray-200" : ""} onClick={() => handleFilterChange("cedula")}> Cédula </Button>
                <Button variant="outline" size="sm" className={filtroBoletos === "telefono" ? "bg-gray-200" : ""} onClick={() => handleFilterChange("telefono")}> Teléfono </Button>
                <Button variant="outline" size="sm" className={filtroBoletos === "numero" ? "bg-gray-200" : ""} onClick={() => handleFilterChange("numero")}> N° Boleto </Button>
              </div>
              <div className="flex gap-2">
                <Input 
                    placeholder={`Buscar por ${filtroBoletos}...`}
                    value={localQuery}
                    onChange={(e) => setLocalQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                    onBlur={handleSearch}
                />
                <Button onClick={handleSearch} variant="secondary">Buscar</Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número de Boleto</TableHead>
                  <TableHead>Nombre del Comprador</TableHead>
                  <TableHead>Cédula</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Correo</TableHead>
                  <TableHead>Fecha de Compra</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {boletos.map((boleto) => (
                  <TableRow key={boleto.id}>
                    <TableCell className="font-mono font-semibold">#{boleto.numero_boleto.toString()}</TableCell>
                    <TableCell className="font-medium">{boleto.nombre_comprador}</TableCell>
                    <TableCell>{boleto.cedula_comprador}</TableCell>
                    <TableCell>{boleto.telefono_comprador}</TableCell>
                    <TableCell>{boleto.correo_comprador}</TableCell>
                    <TableCell>{new Date(boleto.fecha_compra).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            
            {boletos.length === 0 && (
              <div className="text-center py-8 text-gray-500">No se encontraron boletos con el filtro actual.</div>
            )}

            {/* CONTROLES DE PAGINACIÓN */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-2 py-4">
                <p className="text-sm text-gray-500">
                  Mostrando página {currentPage} de {totalPages} ({totalBoletos} resultados)
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage <= 1}
                    onClick={() => updateUrl(localQuery, filtroBoletos, currentPage - 1)}
                  >
                    Anterior
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={currentPage >= totalPages}
                    onClick={() => updateUrl(localQuery, filtroBoletos, currentPage + 1)}
                  >
                    Siguiente
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Porcentaje de Venta Visual (Marketing)</CardTitle>
            <CardDescription>
              Ajusta el porcentaje de ventas que verán los usuarios en la página principal para generar interés. 
              Si lo limpias, el sistema mostrará el porcentaje real calculado <strong>({((stats.vendidos / stats.total) * 100).toFixed(1)}%)</strong>.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-6">
              <div className="flex items-center gap-6">
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  // Si es null, el slider se posiciona en el valor real en lugar de 0
                  value={porcentajeVisual ?? ((stats.vendidos / stats.total) * 100)} 
                  onChange={(e) => setPorcentajeVisual(Number(e.target.value))}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
                <div className="flex flex-col items-center justify-center min-w-[6rem] p-3 bg-gray-100 rounded-lg">
                  <span className="text-2xl font-bold text-gray-800">
                    {porcentajeVisual !== null ? `${porcentajeVisual}%` : 'Real'}
                  </span>
                  {/* Pequeño texto debajo para recordar el valor real en todo momento */}
                  <span className="text-xs text-gray-500 mt-1 font-medium">
                    Real: {((stats.vendidos / stats.total) * 100).toFixed(1)}%
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => actualizarPorcentajeVisual(null)}
                  disabled={isSavingPorcentaje || porcentajeVisual === null}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  Limpiar (Usar Real)
                </Button>
                <Button 
                  onClick={() => actualizarPorcentajeVisual(porcentajeVisual)}
                  disabled={isSavingPorcentaje || porcentajeVisual === rifa.porcentaje_venta}
                >
                  {isSavingPorcentaje ? "Guardando..." : "Guardar Porcentaje"}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 p-4">
            <div className="flex flex-col">
              <span className="text-2xl font-semibold">Cambiar estado de la Rifa</span>
              <span className="text-gray-600">Actualiza el estado de la rifa. Inicia, Finaliza o Habilita</span>
            </div>
            <div className={`flex flex-row border rounded-lg p-3 gap-4 items-center 
              ${rifa.estado === "activa" ? "border-2 border-green-600 bg-green-300" : 
              rifa.estado === "finalizada" ? "border-2 border-red-600 bg-red-300" : 
              "border-2 border-yellow-600 bg-yellow-300"}`}>

              <span className="text-md text-gray-600">Estado Actual:</span>
              <span className={`text-md font-bold ${rifa.estado === "activa" ? "text-green-800" : rifa.estado === "finalizada" ? "text-red-800" : "text-yellow-800"}`}>{rifa.estado === "activa" ? "Activa" : rifa.estado === "finalizada" ? "Finalizada" : "Próximamente"}</span>

            </div>
            <CambiarEstadoRifa rifaId={rifa.id.toString()} estado={rifa.estado} />
          </div>
        </Card>
      </div>
    </div>
  )
}