import { sheetsGetAnnouncements, isSheetsClientReady } from "@/services/GoogleSheetsService"
import { isSheetsClientEnabled } from "@/services/GoogleSheetsUtil"

export const dynamic = "force-dynamic"

async function checkFallbackApi(): Promise<boolean> {
  const endpoint = process.env.MOSQUE_API_ENDPOINT?.trim()
  if (!endpoint) return false

  try {
    const response = await fetch(endpoint, { cache: "no-store" })
    if (!response.ok) return false

    const data = await response.json()
    return Array.isArray(data?.prayer_times) && data.prayer_times.length > 0
  } catch {
    return false
  }
}

export async function GET() {
  const sheetsConfigured = isSheetsClientEnabled()
  const [sheetsOk, fallbackApiOk] = await Promise.all([
    sheetsConfigured ? isSheetsClientReady() : Promise.resolve(false),
    checkFallbackApi(),
  ])

  let announcementsOk = false
  if (sheetsOk) {
    try {
      await sheetsGetAnnouncements()
      announcementsOk = true
    } catch {
      announcementsOk = false
    }
  }

  const prayerDataOk = sheetsOk || fallbackApiOk
  const status = prayerDataOk && announcementsOk ? "ok" : prayerDataOk ? "degraded" : "down"

  return Response.json(
    {
      status,
      checks: {
        googleSheets: sheetsOk,
        fallbackApi: fallbackApiOk,
        prayerData: prayerDataOk,
        announcements: announcementsOk,
      },
      checkedAt: new Date().toISOString(),
    },
    {
      status: prayerDataOk ? 200 : 503,
      headers: { "Cache-Control": "no-store" },
    },
  )
}
