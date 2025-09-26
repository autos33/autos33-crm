import { cookies } from "next/headers"

// Simple hash function for demo purposes (not for production)
function simpleHash(password: string): string {
  let hash = 0
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i)
    hash = (hash << 5) - hash + char
    hash = hash & hash // Convert to 32bit integer
  }
  return hash.toString()
}

export async function hashPassword(password: string): Promise<string> {
  // For demo purposes, use simple hash
  return simpleHash(password)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return simpleHash(password) === hash
}

export function generateToken(payload: any): string {
  // Simple token generation for demo
  const timestamp = Date.now()
  const data = JSON.stringify({ ...payload, timestamp })
  return btoa(data) // Base64 encode
}

export function verifyToken(token: string): any {
  try {
    const data = atob(token) // Base64 decode
    const payload = JSON.parse(data)

    // Check if token is not older than 7 days
    const sevenDays = 7 * 24 * 60 * 60 * 1000
    if (Date.now() - payload.timestamp > sevenDays) {
      return null
    }

    return payload
  } catch {
    return null
  }
}

export async function getAuthToken(): Promise<string | null> {
  try {
    const cookieStore = await cookies()
    return cookieStore.get("admin-token")?.value || null
  } catch {
    return null
  }
}

export async function isAuthenticated(): Promise<boolean> {
  try {
    const token = await getAuthToken()
    if (!token) return false

    // For demo mode, accept any token
    if (token === "demo-token") return true

    const payload = verifyToken(token)
    return !!payload
  } catch {
    return false
  }
}

// Default admin credentials
export const DEFAULT_ADMIN = {
  password: "admin123",
  passwordHash: simpleHash("admin123"),
}
