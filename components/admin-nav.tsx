"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export function AdminNav() {
  const router = useRouter()
  const { toast } = useToast()

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" })
      toast({
        title: "Sesión cerrada",
        description: "Has salido del panel de administración",
      })
      router.push("/admin")
    } catch (error) {
      // Simple logout for demo mode
      document.cookie = "admin-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT"
      toast({
        title: "Sesión cerrada",
        description: "Has salido del panel de administración",
      })
      router.push("/admin")
    }
  }

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-8">
            <Link href="/admin/dashboard" className="text-xl font-bold text-red-500">
              Gana Con Autos 33
            </Link>
            <div className="flex space-x-4">
              <Link
                href="/admin/dashboard"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button variant="outline" size="sm" onClick={handleLogout}>
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>
    </nav>
  )
}
