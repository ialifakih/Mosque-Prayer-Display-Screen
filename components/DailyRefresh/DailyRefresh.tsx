"use client"

import { dtNowLocale } from "@/lib/datetimeUtils"
import { useEffect } from "react"

export default function DailyRefresh({ loadedDate }: { loadedDate: string }) {
  useEffect(() => {
    let refreshStarted = false

    const refreshForNewDay = () => {
      if (refreshStarted) return

      const currentDate = dtNowLocale().format("YYYY-MM-DD")
      const isNewDay = currentDate !== loadedDate

      if (isNewDay && navigator.onLine) {
        refreshStarted = true
        window.location.reload()
      }
    }

    refreshForNewDay()

    const interval = window.setInterval(refreshForNewDay, 15_000)
    window.addEventListener("online", refreshForNewDay)
    document.addEventListener("visibilitychange", refreshForNewDay)

    return () => {
      window.clearInterval(interval)
      window.removeEventListener("online", refreshForNewDay)
      document.removeEventListener("visibilitychange", refreshForNewDay)
    }
  }, [loadedDate])

  return null
}
