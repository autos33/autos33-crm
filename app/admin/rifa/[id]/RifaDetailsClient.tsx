"use client"

import { useState, useMemo } from "react"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { RaffleStatsChart } from "@/components/raffle-stats-chart"
import { AddTicketDialog } from "@/components/add-ticket-dialog"
import { ActualizarButton } from "@/components/actualizar-button"
import { CreatePremio } from "@/components/nuevo-premio-dialog"
import { CambiarEstadoRifa } from "@/components/cambiar-estado-rifa";
import { DeletePremio } from "@/components/eliminar-premio-dialog";
import Link from "next/link"
import { ArrowLeft } from "lucide-react"

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
  stats: Stats
}

export function RifaDetailsClient({ rifa, premios, boletos, stats }: RifaDetailsClientProps) {
  const [searchFilter, setSearchFilter] = useState("");
  const [filtroBoletos, setFiltroBoletos] = useState<"nombre" | "cedula" | "telefono" | "numero">("nombre");

  const filteredBoletos = useMemo(() => {
    if (!searchFilter) {
      return boletos;
    }

    const lowerCaseSearch = searchFilter.toLowerCase();

    return boletos.filter(boleto => {
      let valueToSearch = '';

      switch (filtroBoletos) {
        case 'nombre':
          valueToSearch = boleto.nombre_comprador;
          break;
        case 'cedula':
          valueToSearch = boleto.cedula_comprador;
          break;
        case 'telefono':
          valueToSearch = boleto.telefono_comprador;
          break;
        case 'numero':
          valueToSearch = String(boleto.numero_boleto); 
          break;
        default:
          return true;
      }
      
      return valueToSearch.toLowerCase().includes(lowerCaseSearch);
    });
  }, [boletos, searchFilter, filtroBoletos]);


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
                  Culmina: {new Date(rifa.fecha_culminacion).toLocaleDateString()}
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
                <p className="text-xs text-gray-500">Total: {stats.total.toLocaleString()} boletos</p>
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
              Boletos Vendidos ({filteredBoletos.length} encontrados)
              <div className="flex flex-row justify-end gap-3">
                <ActualizarButton />
                <AddTicketDialog rifaId={rifa.id} />
              </div>
            </CardTitle>
            <CardDescription>Lista de todos los boletos vendidos para esta rifa</CardDescription>
            <div className="flex flex-col w-full gap-2 py-5">
              <div className="flex flex-row w-full md:w-1/2 gap-3 justify-start">
                <Button variant="outline" size="sm" className={filtroBoletos === "nombre" ? "bg-gray-200" : ""} onClick={() => {setFiltroBoletos("nombre")}}> Nombre </Button>
                <Button variant="outline" size="sm" className={filtroBoletos === "cedula" ? "bg-gray-200" : ""} onClick={() => {setFiltroBoletos("cedula")}}> Cédula </Button>
                <Button variant="outline" size="sm" className={filtroBoletos === "telefono" ? "bg-gray-200" : ""} onClick={() => {setFiltroBoletos("telefono")}}> Teléfono </Button>
                <Button variant="outline" size="sm" className={filtroBoletos === "numero" ? "bg-gray-200" : ""} onClick={() => {setFiltroBoletos("numero")}}> N° Boleto </Button>
              </div>
              <Input 
                  placeholder={`Buscar por ${filtroBoletos}...`}
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
              />
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
                {filteredBoletos.map((boleto) => (
                  <TableRow key={boleto.id}>
                    <TableCell className="font-mono font-semibold">#{boleto.numero_boleto}</TableCell>
                    <TableCell className="font-medium">{boleto.nombre_comprador}</TableCell>
                    <TableCell>{boleto.cedula_comprador}</TableCell>
                    <TableCell>{boleto.telefono_comprador}</TableCell>
                    <TableCell>{boleto.correo_comprador}</TableCell>
                    <TableCell>{new Date(boleto.fecha_compra).toLocaleDateString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {filteredBoletos.length === 0 && (
              <div className="text-center py-8 text-gray-500">No se encontraron boletos con el filtro actual.</div>
            )}
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