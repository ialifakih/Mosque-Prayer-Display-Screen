export const dynamic = "force-dynamic"

type HealthResponse = {
  status: "ok" | "degraded" | "down"
  checks: {
    googleSheets: boolean
    fallbackApi: boolean
    prayerData: boolean
    announcements: boolean
  }
  checkedAt: string
}

async function getHealth(): Promise<HealthResponse | null> {
  try {
    const baseUrl = process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000"
    const response = await fetch(`${baseUrl}/api/health`, { cache: "no-store" })
    return (await response.json()) as HealthResponse
  } catch {
    return null
  }
}

function statusLabel(value: boolean): string {
  return value ? "Working" : "Unavailable"
}

export default async function StatusPage() {
  const health = await getHealth()

  return (
    <main style={{ maxWidth: 760, margin: "48px auto", padding: "0 20px", fontFamily: "system-ui, sans-serif" }}>
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Mosque Display Status</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Quick health check for the Zanzibar mosque pilot.
      </p>

      {!health ? (
        <section style={{ marginTop: 28, padding: 20, border: "1px solid #ccc", borderRadius: 12 }}>
          <strong>Status check unavailable</strong>
        </section>
      ) : (
        <>
          <section style={{ marginTop: 28, padding: 20, border: "1px solid #ccc", borderRadius: 12 }}>
            <div style={{ fontSize: 14, color: "#666" }}>Overall status</div>
            <div style={{ fontSize: 28, fontWeight: 700, marginTop: 4, textTransform: "capitalize" }}>
              {health.status}
            </div>
          </section>

          <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
            {[
              ["Google Sheets", health.checks.googleSheets],
              ["Fallback mosque API", health.checks.fallbackApi],
              ["Prayer data", health.checks.prayerData],
              ["Announcements", health.checks.announcements],
            ].map(([label, value]) => (
              <section key={String(label)} style={{ display: "flex", justifyContent: "space-between", padding: 16, border: "1px solid #ddd", borderRadius: 10 }}>
                <strong>{label}</strong>
                <span>{statusLabel(Boolean(value))}</span>
              </section>
            ))}
          </div>

          <p style={{ marginTop: 18, color: "#777", fontSize: 14 }}>
            Last checked: {new Date(health.checkedAt).toLocaleString("en-GB", { timeZone: "Africa/Dar_es_Salaam" })} Zanzibar time
          </p>
        </>
      )}
    </main>
  )
}
