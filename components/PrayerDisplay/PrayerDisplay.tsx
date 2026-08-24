"use client"

import { useEffect, useMemo, useState } from "react"
import PrayerTimes, {
  type PrayerDisplayRow,
} from "@/components/PrayerTimes/PrayerTimes"
import { dtFormatTimeTo12h, dtNowLocale } from "@/lib/datetimeUtils"
import {
  getNextPrayer,
  getPrayerTimeOnDay,
  getPrayerTimeForNextPrayer,
} from "@/services/PrayerTimeService"
import type { DailyPrayerTime } from "@/types/DailyPrayerTimeType"
import type { JummahTimes } from "@/types/JummahTimesType"
import Announcement from "@/components/Announcement/Announcement"

const PRAYER_ROWS = [
  { label: "Fajr / Alfajiri", arabic: "الفجر", icon: "◒" },
  { label: "Dhuhr / Adhuhuri", arabic: "الظهر", icon: "☀" },
  { label: "Asr / Alasiri", arabic: "العصر", icon: "◉" },
  { label: "Maghrib / Magharibi", arabic: "المغرب", icon: "◓" },
  { label: "Isha / Aisha", arabic: "العشاء", icon: "☾" },
]

const FEATURED_HADITH = {
  arabic: "إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ",
  swahili: "Hakika matendo yanategemea nia.",
  source: "Sahih al-Bukhari 1",
}

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

  useEffect(() => {
    const updateNextPrayer = () => {
      setNextPrayerDisplay(getNextPrayerDisplayState(today, tomorrow))
    }

    updateNextPrayer()
    const interval = setInterval(updateNextPrayer, 1000)

    return () => clearInterval(interval)
  }, [today, tomorrow])

  const { countdown, nextPrayerTime, prayerTime: nextPrayerData } =
    nextPrayerDisplay
  const nextPrayer = prayers[nextPrayerTime.prayerIndex]
  const jummahTime = jummahTimes[0]?.time

  return (
    <main className="prayer-display-main">
      <aside className="prayer-display-sidebar" aria-label="Sala inayofuata">
        <section className="next-prayer-card">
          <div className="next-prayer-heading">
            <p>Sala Inayofuata</p>
            <strong>Next Prayer</strong>
          </div>

          <div className="next-prayer-hero">
            <div className="next-prayer-symbol" aria-hidden="true">
              {nextPrayer.icon}
            </div>
            <div className="next-prayer-name">{nextPrayer.label}</div>

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
            <div className="jummah-title">Swala ya Ijumaa</div>
            <time className="tabular-nums">
              {jummahTime ? dtFormatTimeTo12h(jummahTime) : "—"}
            </time>
            <small>Jummah / Ijumaa</small>
          </div>
        </section>
      </aside>

      <div className="prayer-display-content">
        <section className="prayer-table-panel" aria-label="Nyakati za sala">
          <div className="prayer-table-title">
            <span className="title-ornament" aria-hidden="true">✦</span>
            <span>Nyakati za Sala</span>
            <span className="title-ornament" aria-hidden="true">✦</span>
          </div>
          <PrayerTimes prayers={prayers} nextPrayerTime={nextPrayerTime} />
        </section>

        <div className="display-bottom-grid">
          <section className="announcement-panel" aria-label="Matangazo">
            <div className="announcement-heading">
              <span className="announcement-icon" aria-hidden="true">●</span>
              <h2>Tangazo</h2>
            </div>
            <div className="announcement-space">
              {announcementEnabled && <Announcement />}
            </div>
          </section>

          <section className="hadith-card" aria-label="Hadith ya siku">
            <div className="hadith-heading">
              <span className="hadith-book" aria-hidden="true">▤</span>
              <span>Hadith ya siku</span>
              <small>حديث اليوم</small>
            </div>
            <blockquote>
              <p className="hadith-arabic" dir="rtl">{FEATURED_HADITH.arabic}</p>
              <p className="hadith-swahili">“{FEATURED_HADITH.swahili}”</p>
            </blockquote>
            <p className="hadith-source">{FEATURED_HADITH.source}</p>
          </section>
        </div>
      </div>
    </main>
  )
}
