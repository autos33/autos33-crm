"use client";

import React, { useState } from "react";
import { AdminNav } from "@/components/admin-nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { CreateRaffleDialog } from "@/components/create-raffle-dialog";
import { CreateGanadorDialog } from "@/components/create-ganador-dialog";
import { supabase } from "@/lib/supabase-client"; // Assuming this is client-safe

// You must redefine the interfaces here OR import them from a central types file
interface Rifa { 
    id: number; 
    titulo: string; 
    estado: string; 
    precio: number; 
    cantidad_boletos: 
    number; fecha_culminacion: 
    string; foto: string; 
}

interface Ganador { 
    id: number; 
    titulo: string; 
    estado: boolean; 
    foto_url: string; 
}

interface AdminDashboardClientProps {
    rifas: Rifa[];
    ganadores: Ganador[];
    boletosVendidosPorRifa: number[];
}

export function AdminDashboardClient({ rifas, ganadores, boletosVendidosPorRifa }: AdminDashboardClientProps) {
    const [imagenGanador, setImagenGanador] = useState<string>("");
    const [openVerImagen, setOpenVerImagen] = useState<boolean>(false);
    
    async function CambiarEstadoGanador(id: number, nuevoEstado: boolean) {
        const { error } = await supabase
            .from('Ganadores')
            .update({ estado: nuevoEstado })
            .eq('id', id);

        if (error) {
            console.error("Error actualizando estado del ganador:", error);
        } else {
            window.location.reload(); 
        }
    }

    const VerImagenModal = () => (
        openVerImagen ? (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                <div className="bg-white rounded-lg p-6 shadow-lg flex flex-col items-center">
                    <img
                        src={imagenGanador}
                        alt="Imagen del ganador"
                        className="max-w-xs max-h-96 mb-4 rounded"
                    />
                    <Button onClick={() => setOpenVerImagen(false)}>
                        Cerrar
                    </Button>
                </div>
            </div>
        ) : null
    );

    const getStatusBadge = (estado: string) => {
        switch (estado) {
            case "activa": return <Badge className="bg-green-100 text-green-800 hover:bg-green-400">Activa</Badge>
            case "finalizada": return <Badge className="bg-red-100 text-red-800 hover:bg-red-400">Finalizada</Badge>
            case "Proximamente": return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-400">Proximamente</Badge>
            default: return <Badge variant="secondary">{estado}</Badge>
        }
    }
    const getEstadoGanador = (estado: boolean) => {
        return estado 
            ? <Badge className="bg-green-100 text-green-800 hover:bg-green-400">Visible</Badge>
            : <Badge className="bg-red-100 text-red-800 hover:bg-red-400">Oculto</Badge>
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <AdminNav />
            <VerImagenModal /> 

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Dashboard de Rifas</h1>
                        <p className="text-gray-600">Gestiona todas las rifas del sistema</p>
                    </div>
                    <CreateRaffleDialog />
                </div>

                <Card className="mt-10">
                    <CardHeader>
                        <CardTitle>Lista de Rifas</CardTitle>
                        <CardDescription>Todas las rifas registradas en el sistema</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Imagen</TableHead>
                                    <TableHead>Título</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Precio por Boleto</TableHead>
                                    <TableHead>Total Boletos</TableHead>
                                    <TableHead>Vendidos</TableHead>
                                    <TableHead>Fecha Culminación</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {rifas?.map((rifa, index) => (
                                    <TableRow key={rifa.id}>
                                        <TableCell>
                                            <img
                                                src={rifa.foto || "/placeholder.svg"}
                                                alt={rifa.titulo}
                                                className="w-12 h-12 object-contain rounded"
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{rifa.titulo}</TableCell>
                                        <TableCell>{getStatusBadge(rifa.estado)}</TableCell>
                                        <TableCell className="font-semibold">Bs {rifa.precio.toFixed(2)}</TableCell>
                                        <TableCell>{rifa.cantidad_boletos.toString()}</TableCell>
                                        <TableCell className="text-green-600 font-semibold">{boletosVendidosPorRifa[index]}</TableCell>
                                        <TableCell>{new Date(rifa.fecha_culminacion).toLocaleDateString()}</TableCell>
                                        <TableCell>
                                            <Link href={`/admin/rifa/${rifa.id}`}>
                                                <Button variant="outline" size="sm">
                                                    Ver más
                                                </Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {rifas?.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No hay rifas registradas.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
            {/* ------------------------------------------------------------------------------ */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Gestión de Ganadores</h1>
                        <p className="text-gray-600">Añade, Edita o Elimina registros de la sección de Ganadores</p>
                    </div>
                    <CreateGanadorDialog />
                </div>

                <Card className="mt-10">
                    <CardHeader>
                        <CardTitle>Lista de Ganadores</CardTitle>
                        <CardDescription>Todas las Ganadores que se pueden ver en la página</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Imagen</TableHead>
                                    <TableHead>Título</TableHead>
                                    <TableHead>Estado</TableHead>
                                    <TableHead>Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {ganadores?.map((ganador) => (
                                    <TableRow key={ganador.id}>
                                        <TableCell>
                                            <img
                                                src={ganador.foto_url || "/placeholder.svg"}
                                                alt={ganador.titulo}
                                                className="w-12 h-12 object-contain rounded"
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{ganador.titulo}</TableCell>
                                        <TableCell>{getEstadoGanador(ganador.estado)}</TableCell>
                                        <TableCell>
                                            <div className="flex felx-col md:flex-row justify-start gap-3">
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => {CambiarEstadoGanador(ganador.id, !ganador.estado)}}
                                                >
                                                    {ganador.estado ? "Ocultar" : "Habilitar"}
                                                </Button>
                                                <Button 
                                                    variant="outline" 
                                                    size="sm" 
                                                    onClick={() => {setImagenGanador(ganador.foto_url || "/placeholder.svg"); setOpenVerImagen(true)}}
                                                >
                                                    Ver Imagen
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                        {ganadores?.length === 0 && (
                            <div className="text-center py-8 text-gray-500">
                                No hay Ganadores registrados.
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}