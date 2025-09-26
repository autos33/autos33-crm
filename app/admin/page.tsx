"use client"

import type React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase-client" // Asegúrate de que esta ruta sea correcta

export default function AdminLogin() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    // Aquí ya no necesitamos el modo demo, ya que Supabase es el servicio de autenticación
    // y debe estar configurado.
    
    try {
      if (isSignUp) {
        // Lógica de registro con Supabase
        const { error } = await supabase.auth.signUp({
          email,
          password,
        })
        
        if (error) {
          toast({
            title: "Error de registro",
            description: error.message,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Revisa tu correo",
            description: "Te hemos enviado un enlace de confirmación. Haz clic en él para iniciar sesión.",
            variant: "default",
          })
          // Opcional: Cambiar al modo de inicio de sesión después del registro exitoso
          setIsSignUp(false);
          setEmail("");
          setPassword("");
        }
      } else {
        // Lógica de inicio de sesión con Supabase
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        console.log("Resultado de login:", { data, error });

        if (error) {
          toast({
            title: "Error de acceso",
            description: error.message,
            variant: "destructive",
          })
        } else {
          toast({
            title: "Acceso concedido",
            description: "Bienvenido al panel de administración.",
          })
          document.cookie = `admin-token=${data.session.access_token}; path=/; secure`
          router.push("/admin/dashboard")
        }
      }
    } catch (error) {
      toast({
        title: "Error inesperado",
        description: "Ocurrió un problema, inténtalo de nuevo.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {isSignUp ? "✍️ Registrarse" : "🔐 Panel de Administración"}
          </CardTitle>
          <CardDescription>
            {isSignUp ? "Crea una nueva cuenta de administrador." : "Ingresa tus credenciales para acceder al CRM."}
            <div className="mt-2">
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  Autenticación con Supabase
                </Badge>
              </div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={"Ingresa tu email"}
                required
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={"Ingresa tu contraseña"}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? isSignUp
                  ? "Registrando..."
                  : "Verificando..."
                : isSignUp
                ? "Registrarse"
                : "Ingresar"}
            </Button>
          </form>
          <div className="mt-4 text-center">
            <Button
              variant="link"
              className="p-0 text-sm"
              onClick={() => setIsSignUp(!isSignUp)}
            >
              {isSignUp ? "¿Ya tienes cuenta? Inicia sesión" : "¿No tienes cuenta? Regístrate"}
            </Button>
            <div className="mt-4">
              <a href="/" className="text-sm text-blue-600 hover:underline">
                ← Volver a la página principal
              </a>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}