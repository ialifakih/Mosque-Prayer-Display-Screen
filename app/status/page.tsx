"use client"

import { useEffect, useMemo, useState } from "react"

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

const LAST_PRAYER_DATA_SUCCESS_KEY = "mosque:last-prayer-data-success"
const HEALTH_REFRESH_MS = 60_000

function statusLabel(value: boolean): string {
  return value ? "Working" : "Unavailable"
}

function formatZanzibarTime(value: string | null): string {
  if (!value) return "Not recorded yet"

  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return "Not recorded yet"

  return `${parsed.toLocaleString("en-GB", {
    timeZone: "Africa/Dar_es_Salaam",
  })} Zanzibar time`
}

export default function StatusPage() {
  const [health, setHealth] = useState<HealthResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastSuccessfulPrayerDataAt, setLastSuccessfulPrayerDataAt] =
    useState<string | null>(null)

  useEffect(() => {
    const stored = window.localStorage.getItem(LAST_PRAYER_DATA_SUCCESS_KEY)
    if (stored) setLastSuccessfulPrayerDataAt(stored)

    let cancelled = false

    const refreshHealth = async () => {
      try {
        const response = await fetch(`/api/health?no_cache=${Date.now()}`, {
          cache: "no-store",
        })
        const data = (await response.json()) as HealthResponse

        if (cancelled) return
        setHealth(data)

        if (data.checks.prayerData) {
          window.localStorage.setItem(
            LAST_PRAYER_DATA_SUCCESS_KEY,
            data.checkedAt,
          )
          setLastSuccessfulPrayerDataAt(data.checkedAt)
        }
      } catch {
        if (!cancelled) setHealth(null)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void refreshHealth()
    const interval = window.setInterval(refreshHealth, HEALTH_REFRESH_MS)
    window.addEventListener("online", refreshHealth)

    return () => {
      cancelled = true
      window.clearInterval(interval)
      window.removeEventListener("online", refreshHealth)
    }
  }, [])

  const staleWarning = useMemo(() => {
    if (loading) return null

    if (health?.checks.prayerData) return null

    if (lastSuccessfulPrayerDataAt) {
      return `Prayer data is stale — last successful live check: ${formatZanzibarTime(
        lastSuccessfulPrayerDataAt,
      )}`
    }

    return "Prayer data is unavailable — no successful live check has been recorded on this device yet."
  }, [health, lastSuccessfulPrayerDataAt, loading])

  return (
    <main
      style={{
        maxWidth: 760,
        margin: "48px auto",
        padding: "0 20px",
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <h1 style={{ fontSize: 32, marginBottom: 8 }}>Mosque Display Status</h1>
      <p style={{ marginTop: 0, color: "#555" }}>
        Quick health check for the Zanzibar mosque pilot.
      </p>

      {staleWarning && (
        <section
          role="alert"
          style={{
            marginTop: 28,
            padding: 20,
            border: "1px solid #b7791f",
            borderRadius: 12,
            background: "#fffaf0",
          }}
        >
          <strong>{staleWarning}</strong>
          <p style={{ marginBottom: 0, color: "#6b4f1d" }}>
            The public display can continue using its last known good cached screen
            while live data recovers.
          </p>
        </section>
      )}

      {loading ? (
        <section
          style={{
            marginTop: 28,
            padding: 20,
            border: "1px solid #ccc",
            borderRadius: 12,
          }}
        >
          <strong>Checking live services…</strong>
        </section>
      ) : !health ? (
        <section
          style={{
            marginTop: 28,
            padding: 20,
            border: "1px solid #ccc",
            borderRadius: 12,
          }}
        >
          <strong>Status check unavailable</strong>
        </section>
      ) : (
        <>
          <section
            style={{
              marginTop: staleWarning ? 16 : 28,
              padding: 20,
              border: "1px solid #ccc",
              borderRadius: 12,
            }}
          >
            <div style={{ fontSize: 14, color: "#666" }}>Overall status</div>
            <div
              style={{
                fontSize: 28,
                fontWeight: 700,
                marginTop: 4,
                textTransform: "capitalize",
              }}
            >
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
              <section
                key={String(label)}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: 16,
                  border: "1px solid #ddd",
                  borderRadius: 10,
                }}
              >
                <strong>{label}</strong>
                <span>{statusLabel(Boolean(value))}</span>
              </section>
            ))}
          </div>

          <p style={{ marginTop: 18, color: "#777", fontSize: 14 }}>
            Last checked: {formatZanzibarTime(health.checkedAt)}
          </p>
          <p style={{ marginTop: 6, color: "#777", fontSize: 14 }}>
            Last successful prayer-data check: {formatZanzibarTime(lastSuccessfulPrayerDataAt)}
          </p>
        </>
      )}
    </main>
  )
}
