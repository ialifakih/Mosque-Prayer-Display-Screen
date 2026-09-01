"use client"

import { useEffect, useState } from "react"
import { dtNowLocaleFormatTime12hAmPm } from "@/lib/datetimeUtils"

export default function Clock({ darkMode = false }: { darkMode?: boolean }) {
  const [time, setTime] = useState<string | null>(null)

  useEffect(() => {
    const updateTime = () => setTime(dtNowLocaleFormatTime12hAmPm())
    updateTime()
    const interval = setInterval(updateTime, 1000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div
      className={`${!darkMode ? "text-mosqueBrand-onPrimary" : ""} display-clock`}
    >
      <span className="display-clock-label">Zanzibar time</span>
      <time
        className={`display-clock-time tabular-nums ${
          !darkMode ? "text-mosqueBrand-onPrimary" : "text-gray-500"
        }`}
      >
        {time ?? "--:-- --"}
      </time>
    </div>
  )
}
