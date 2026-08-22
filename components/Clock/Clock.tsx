"use client"

import { useEffect, useState } from "react"
import {
  dtNowLocaleFormatTime12hAmPm,
} from "@/lib/datetimeUtils"

export default function Clock({ darkMode = false }: { darkMode?: boolean }) {
  const [time, setTime] = useState(getCurrentTimeFormatted())

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(getCurrentTimeFormatted())
    }, 1000)

    return () => clearInterval(interval)
  }, [])

  function getCurrentTimeFormatted() {
    return dtNowLocaleFormatTime12hAmPm()
  }

  return (
    <div
      className={`${
        !darkMode ? "bg-mosqueBrand-onPrimary" : ""
      } border-l-4 border-mosqueBrand-highlight px-6 py-5 text-center shadow-sm md:w-fit md:px-7 md:py-6 md:text-left`}
    >
      <time
        className={`text-5xl font-bold tabular-nums tracking-tight md:text-7xl lg:text-8xl ${
          !darkMode ? "text-mosqueBrand" : "text-gray-500"
        }`}
      >
        {time}
      </time>
    </div>
  )
}
