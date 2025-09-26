import { redirect } from "next/navigation"

export default async function HomePage() {
  // Redirect directly to admin login since we only use admin mode
  redirect("/admin")
}
