"use client"

import { dtNowLocale } from "@/lib/datetimeUtils"
import { useEffect } from "react"

export default function DailyRefresh({ loadedDate }: { loadedDate: string }) {
  useEffect(() => {
    let refreshStarted = false
    let healthCheckRunning = false

    const refreshForNewDay = async () => {
      if (refreshStarted || healthCheckRunning) return

      const currentDate = dtNowLocale().format("YYYY-MM-DD")
      const isNewDay = currentDate !== loadedDate

      if (!isNewDay || !navigator.onLine) return

      healthCheckRunning = true

      try {
        const response = await fetch(
          `/api/health?midnight_refresh=${Date.now()}`,
          { cache: "no-store" },
        )

        if (!response.ok) return

        const health = await response.json()
        if (health?.checks?.prayerData !== true) return

        refreshStarted = true
        window.location.reload()
      } catch (error) {
        console.warn(
          "Prayer data is not reachable yet; keeping the last known good display",
          error,
        )
      } finally {
        healthCheckRunning = false
      }
    }

    const triggerRefreshCheck = () => {
      void refreshForNewDay()
    }

    triggerRefreshCheck()

    const interval = window.setInterval(triggerRefreshCheck, 15_000)
    window.addEventListener("online", triggerRefreshCheck)
    document.addEventListener("visibilitychange", triggerRefreshCheck)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener("online", triggerRefreshCheck)
      document.removeEventListener("visibilitychange", triggerRefreshCheck)
    }
  }, [loadedDate])

  return null
}
