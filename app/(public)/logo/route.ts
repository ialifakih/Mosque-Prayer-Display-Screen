import { getMosqueData } from "@/services/MosqueDataService"
import { NextResponse } from "next/server"
import { redirect } from "next/navigation"
import { GENERIC_MOSQUE_LOGO } from "@/lib/publicMosqueMetadata"

export async function GET(request: Request) {
  const mosqueData = await getMosqueData()
  const metadata = mosqueData.metadata
  const logo = metadata.logo_url

  if (!logo?.trim()) {
    return redirect(GENERIC_MOSQUE_LOGO)
  }

  const imageRes = await fetch(logo)

  const imageBuffer = await imageRes.arrayBuffer()

  return new NextResponse(imageBuffer, {
    headers: {
      "Content-Type": imageRes.headers.get("content-type") || "image/jpeg",
      "Cache-Control": "public, max-age=3600",
    },
  })
}
