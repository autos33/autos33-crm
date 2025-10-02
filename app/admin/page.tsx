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
import { supabase } from "@/lib/supabase-client"
import DotGrid from '@/components/dot-grid';
import Orb from '@/components/orbe';
import { set } from "gsap"

export default function AdminLogin() {
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { toast } = useToast()
  const [respuesta, setRespuesta] = useState("");

  const handleAuth = async (e: React.FormEvent) => {
    setRespuesta("");
    e.preventDefault()
    setLoading(true)
    
    try {
      if (isSignUp) {
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
          setIsSignUp(false);
          setEmail("");
          setPassword("");
        }
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error && error.status === 400) {
          setRespuesta("Credenciales inválidas. Por favor, verifica tu email y contraseña.");
        };

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
        <div className="relative min-h-screen w-full overflow-hidden bg-gray-50">
            <div className="absolute inset-0 z-10">
              {/* 
              <DotGrid
                dotSize={10}
                gap={20}
                baseColor="#000000"
                activeColor="#ff0000"
                proximity={120}
                shockRadius={250}
                shockStrength={5}
                resistance={750}
                returnDuration={1.5}
              />
                */}
              <Orb
                hoverIntensity={0.5}
                rotateOnHover={true}
                hue={0}
                forceHoverState={false}
              />
            </div>
            
            <div className="relative z-10 min-h-screen flex items-center justify-center">
                <Card className="w-full max-w-md bg-white/90 backdrop-blur-sm shadow-xl">
                    <CardHeader className="text-center">
                        <CardTitle className="text-2xl">
                            Panel de Administración
                        </CardTitle>
                        <CardDescription>
                            Ingresa tus credenciales para acceder al sistema.
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
                                {loading ? "Verificando..." : "Ingresar"}
                            </Button>
                            <div>
                              <p className="text-sm text-red-600">{respuesta}</p>
                            </div>
                        </form>
                        <div className="mt-4 text-center">
                            <div className="mt-4">
                                <a href="https://ganaconautos33.com" className="text-sm text-blue-600 hover:underline">
                                    ← Volver a la página principal
                                </a>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}