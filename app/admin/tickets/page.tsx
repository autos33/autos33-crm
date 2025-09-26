import { redirect } from "next/navigation"
import { fallbackTickets } from "@/lib/db"
import { AdminNav } from "@/components/admin-nav"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

async function getTickets() {
  // Always use fallback tickets to avoid connection issues
  return fallbackTickets
}

export default async function AdminTickets() {
  // Redirect to the new dashboard structure
  redirect("/admin/dashboard")

  // Simple cookie check for demo mode
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  const demoToken = cookieStore.get("admin-token")
  if (!demoToken) {
    redirect("/admin")
  }

  const tickets = await getTickets()

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "sold":
        return <Badge className="bg-green-100 text-green-800">Vendido</Badge>
      case "reserved":
        return <Badge className="bg-orange-100 text-orange-800">Reservado</Badge>
      default:
        return <Badge variant="secondary">Disponible</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminNav />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Tickets</h1>
            <p className="text-gray-600">Estado de todos los tickets vendidos y reservados</p>
          </div>
          <Badge variant="outline" className="text-orange-600 border-orange-600">
            Modo Demo
          </Badge>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Tickets Vendidos y Reservados</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Producto</TableHead>
                  <TableHead>Ticket #</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Comprador</TableHead>
                  <TableHead>Cédula</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell className="font-medium">{ticket.product_name}</TableCell>
                    <TableCell>#{ticket.ticket_number}</TableCell>
                    <TableCell>{getStatusBadge(ticket.status)}</TableCell>
                    <TableCell>{ticket.buyer_name || "-"}</TableCell>
                    <TableCell>{ticket.buyer_cedula || "-"}</TableCell>
                    <TableCell>{ticket.amount ? `$${Number.parseInt(ticket.amount).toLocaleString()}` : "-"}</TableCell>
                    <TableCell>
                      {ticket.purchased_at
                        ? new Date(ticket.purchased_at).toLocaleDateString()
                        : ticket.reserved_at
                          ? new Date(ticket.reserved_at).toLocaleDateString()
                          : "-"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            {tickets.length === 0 && (
              <div className="text-center py-8 text-gray-500">No hay tickets vendidos o reservados</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
