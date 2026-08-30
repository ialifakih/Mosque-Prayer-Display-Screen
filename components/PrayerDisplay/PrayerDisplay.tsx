"use client"

import { useEffect, useMemo, useState } from "react"
import PrayerTimes, {
  type PrayerDisplayRow,
} from "@/components/PrayerTimes/PrayerTimes"
import { dtFormatTimeTo12h, dtNowLocale } from "@/lib/datetimeUtils"
import { getHadithOfDay } from "@/lib/hadithOfDay"
import {
  getNextPrayer,
  getPrayerTimeOnDay,
  getPrayerTimeForNextPrayer,
} from "@/services/PrayerTimeService"
import type { DailyPrayerTime } from "@/types/DailyPrayerTimeType"
import type { JummahTimes } from "@/types/JummahTimesType"
import Announcement, {
  AnnouncementEmptyState,
} from "@/components/Announcement/Announcement"

const PRAYER_ROWS = [
  { label: "Fajr / Alfajiri", arabic: "الفجر", icon: "◒" },
  { label: "Dhuhr / Adhuhuri", arabic: "الظهر", icon: "☀" },
  { label: "Asr / Alasiri", arabic: "العصر", icon: "◉" },
  { label: "Maghrib / Magharibi", arabic: "المغرب", icon: "◓" },
  { label: "Isha / Aisha", arabic: "العشاء", icon: "☾" },
]

function formatCountdown(totalSeconds: number) {
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60

  return [hours, minutes, seconds]
    .map((value) => value.toString().padStart(2, "0"))
    .join(":")
}

function getNextPrayerDisplayState(
  today: DailyPrayerTime,
  tomorrow: DailyPrayerTime,
) {
  const nextPrayerTime = getNextPrayer(today)
  const prayerTime = getPrayerTimeForNextPrayer(
    today,
    tomorrow,
    nextPrayerTime,
  )
  const currentTime = dtNowLocale()
  const targetTime = getPrayerTimeOnDay(
    prayerTime.congregation_start,
    currentTime,
  )

  if (!nextPrayerTime.today) {
    targetTime.add(1, "day")
  }

  return {
    nextPrayerTime,
    prayerTime,
    countdown: formatCountdown(
      Math.max(0, targetTime.diff(currentTime, "seconds")),
    ),
  }
}

export default function PrayerDisplay({
  today,
  tomorrow,
  jummahTimes,
  announcementEnabled,
}: {
  today: DailyPrayerTime
  tomorrow: DailyPrayerTime
  jummahTimes: JummahTimes
  announcementEnabled: boolean
}) {
  const prayers = useMemo<PrayerDisplayRow[]>(
    () => [
      { ...PRAYER_ROWS[0], data: today.fajr, tomorrow: tomorrow.fajr },
      { ...PRAYER_ROWS[1], data: today.zuhr, tomorrow: tomorrow.zuhr },
      { ...PRAYER_ROWS[2], data: today.asr, tomorrow: tomorrow.asr },
      { ...PRAYER_ROWS[3], data: today.maghrib, tomorrow: tomorrow.maghrib },
      { ...PRAYER_ROWS[4], data: today.isha, tomorrow: tomorrow.isha },
    ],
    [today, tomorrow],
  )

  const [nextPrayerDisplay, setNextPrayerDisplay] = useState(() => ({
    nextPrayerTime: { today: true, prayerIndex: 0 },
    prayerTime: today.fajr,
    countdown: "00:00:00",
  }))
  const [featuredHadith, setFeaturedHadith] = useState(() => getHadithOfDay())

  useEffect(() => {
    const updateNextPrayer = () => {
      setNextPrayerDisplay(getNextPrayerDisplayState(today, tomorrow))
    }

    updateNextPrayer()
    const interval = setInterval(updateNextPrayer, 1000)

    return () => clearInterval(interval)
  }, [today, tomorrow])

  useEffect(() => {
    const updateHadith = () => {
      setFeaturedHadith(getHadithOfDay())
    }

    updateHadith()
    const interval = window.setInterval(updateHadith, 60_000)

    return () => window.clearInterval(interval)
  }, [])

  const { countdown, nextPrayerTime, prayerTime: nextPrayerData } =
    nextPrayerDisplay
  const nextPrayer = prayers[nextPrayerTime.prayerIndex]
  const jummahTime = jummahTimes[0]?.time

  return (
    <main className="prayer-display-main">
      <aside className="prayer-display-sidebar" aria-label="Sala inayofuata">
        <section className="next-prayer-card">
          <div className="next-prayer-heading">
            <strong>Sala Inayofuata</strong>
            <p>Next Prayer</p>
          </div>

          <div className="next-prayer-hero">
            <div className="next-prayer-symbol" aria-hidden="true">
              {nextPrayer.icon}
            </div>

            <div className="next-prayer-name-wrap">
              <div className="next-prayer-name">{nextPrayer.label}</div>
              {nextPrayer.arabic && (
                <div className="next-prayer-arabic" dir="rtl">
                  {nextPrayer.arabic}
                </div>
              )}
            </div>

            <div className="next-prayer-times">
              <div className="next-prayer-time">
                <span>Mwanzo</span>
                <strong className="tabular-nums">
                  {dtFormatTimeTo12h(nextPrayerData.start)}
                </strong>
              </div>
              <div className="next-prayer-time">
                <span>Jamaa</span>
                <strong className="tabular-nums">
                  {dtFormatTimeTo12h(nextPrayerData.congregation_start)}
                </strong>
              </div>
            </div>

            <div className="next-prayer-countdown-block">
              <span>Muda hadi Jamaa</span>
              <time
                className="next-prayer-countdown-value tabular-nums"
                aria-live="polite"
              >
                {countdown}
              </time>
            </div>
          </div>
        </section>

        <section className="jummah-card" aria-label="Swala ya Ijumaa">
          <div className="jummah-art" aria-hidden="true">
            <span className="jummah-dome" />
            <span className="jummah-minaret" />
          </div>
          <div className="jummah-copy">
            <div className="jummah-title">Jummah / Ijumaa</div>
            <time className="tabular-nums">
              {jummahTime ? dtFormatTimeTo12h(jummahTime) : "—"}
            </time>
            <small>Swala ya Ijumaa</small>
          </div>
        </section>
      </aside>

      <div className="prayer-display-content">
        <section className="prayer-table-panel" aria-label="Nyakati za sala">
          <div className="prayer-table-title">
            <span className="title-ornament" aria-hidden="true">✦</span>
            <span>Nyakati za Sala / Prayer Times</span>
            <span className="title-ornament" aria-hidden="true">✦</span>
          </div>
          <PrayerTimes prayers={prayers} nextPrayerTime={nextPrayerTime} />
        </section>

        <div className="display-bottom-grid">
          <section className="announcement-panel" aria-label="Matangazo">
            <div className="announcement-heading">
              <span className="announcement-icon" aria-hidden="true">◆</span>
              <h2>Tangazo</h2>
            </div>
            <div className="announcement-space">
              {announcementEnabled ? <Announcement /> : <AnnouncementEmptyState />}
            </div>
          </section>

          <section className="hadith-card" aria-label="Hadith ya siku">
            <div className="hadith-heading">
              <span className="hadith-book" aria-hidden="true">▤</span>
              <span>Hadith ya siku</span>
              <small>حديث اليوم</small>
            </div>
            <blockquote>
              <p className="hadith-arabic" dir="rtl">{featuredHadith.arabic}</p>
              <p className="hadith-swahili">“{featuredHadith.swahili}”</p>
            </blockquote>
            <cite className="hadith-source">{featuredHadith.source}</cite>
          </section>
        </div>
      </div>
    </main>
  )
}
