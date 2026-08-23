"use client"

import { isBlackout } from "@/services/PrayerTimeService"
import { DailyPrayerTime } from "@/types/DailyPrayerTimeType"
import { useEffect, useState } from "react"

export default function Blackout({
  prayerTimeToday,
}: {
  prayerTimeToday: DailyPrayerTime
}) {
  const [blackout, setBlackout] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setBlackout(isBlackout(prayerTimeToday))
    }, 10 * 1000)

    return () => clearInterval(interval)
  }, [setBlackout, prayerTimeToday])

  return (
    blackout ? (
      <div
        data-testid="blackout-overlay"
        className="fixed inset-0 z-[10000] bg-black bg-opacity-80 transition-opacity"
      />
    ) : null
  )
}
