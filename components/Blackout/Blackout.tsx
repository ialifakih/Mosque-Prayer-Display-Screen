"use client"

import {
  getActiveJamaaState,
  type JamaaState,
} from "@/services/PrayerTimeService"
import type { DailyPrayerTime } from "@/types/DailyPrayerTimeType"
import type { JummahTimes } from "@/types/JummahTimesType"
import { useEffect, useState } from "react"

function formatElapsed(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60)
  const seconds = totalSeconds % 60

  return `${minutes.toString().padStart(2, "0")}:${seconds
    .toString()
    .padStart(2, "0")}`
}

export default function Blackout({
  prayerTimeToday,
  jummahTimes,
}: {
  prayerTimeToday: DailyPrayerTime
  jummahTimes: JummahTimes
}) {
  const [jamaaState, setJamaaState] = useState<JamaaState | null>(null)

  useEffect(() => {
    const updateJamaaState = () => {
      setJamaaState(getActiveJamaaState(prayerTimeToday, jummahTimes))
    }

    updateJamaaState()
    const interval = window.setInterval(updateJamaaState, 1000)

    return () => window.clearInterval(interval)
  }, [prayerTimeToday, jummahTimes])

  if (jamaaState == null) return null

  return (
    <div
      data-testid="blackout-overlay"
      className="fixed inset-0 z-[10000] flex items-center justify-center bg-black text-white"
      role="status"
      aria-label={`${jamaaState.label} Jamaa in progress`}
    >
      <div className="mx-auto flex w-full max-w-4xl flex-col items-center px-8 text-center">
        <div className="mb-5 text-xl font-semibold uppercase tracking-[0.28em] text-white/70">
          Jamaa inaendelea
        </div>

        <div className="text-5xl font-bold leading-tight md:text-7xl">
          {jamaaState.label}
        </div>
        <div className="mt-3 text-4xl font-semibold md:text-5xl" dir="rtl">
          {jamaaState.arabic}
        </div>

        <time
          className="mt-10 font-mono text-7xl font-bold tabular-nums md:text-9xl"
          aria-label={`${Math.floor(jamaaState.elapsedSeconds / 60)} minutes since Jamaa began`}
        >
          {formatElapsed(jamaaState.elapsedSeconds)}
        </time>
        <div className="mt-3 text-lg tracking-wide text-white/70 md:text-2xl">
          Dakika tangu Jamaa / Minutes since Jamaa
        </div>

        <div className="mt-12 w-full max-w-3xl border-t border-white/25 pt-8">
          <div className="text-5xl" aria-hidden="true">
            🔕
          </div>
          <div className="mt-4 text-2xl font-semibold md:text-3xl">
            Tafadhali weka simu katika hali ya kimya
          </div>
          <div className="mt-2 text-lg text-white/65 md:text-xl">
            Please put your phone on silent
          </div>
        </div>
      </div>
    </div>
  )
}
