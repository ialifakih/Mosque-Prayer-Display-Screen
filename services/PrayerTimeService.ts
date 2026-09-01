import {
  DailyPrayerTime,
  PrayerTime,
} from "@/types/DailyPrayerTimeType"
import type { JummahTimes } from "@/types/JummahTimesType"
import { dtLocale, dtNowLocale } from "@/lib/datetimeUtils"
import type { Moment } from "moment"

const configuredBlackoutPeriod = Number(
  process.env.NEXT_PUBLIC_BLACKOUT_PERIOD ?? 13,
)
const blackoutPeriod =
  Number.isFinite(configuredBlackoutPeriod) && configuredBlackoutPeriod >= 0
    ? configuredBlackoutPeriod
    : 13

export type JamaaState = {
  key: "fajr" | "dhuhr" | "jummah" | "asr" | "maghrib" | "isha"
  label: string
  arabic: string
  startTime: string
  elapsedSeconds: number
  durationMinutes: number
}

type JamaaEntry = Pick<JamaaState, "key" | "label" | "arabic"> & {
  time: string
}

export function getPrayerTimeOnDay(
  time: string,
  prayerDay = dtNowLocale(),
) {
  const parsedTime = dtLocale(time, ["HH:mm"])

  return prayerDay.clone().set({
    hour: parsedTime.hour(),
    minute: parsedTime.minute(),
    second: 0,
    millisecond: 0,
  })
}

function getJamaaEntries(
  prayerTimes: DailyPrayerTime,
  jummahTimes: JummahTimes,
  currentTime: Moment,
): JamaaEntry[] {
  const isFriday = currentTime.day() === 5
  const fridayEntries: JamaaEntry[] =
    isFriday && jummahTimes.length > 0
      ? jummahTimes.map((jummah, index) => ({
          key: "jummah" as const,
          label:
            jummahTimes.length > 1
              ? jummah.label?.trim() || `Jummah ${index + 1}`
              : "Jummah / Ijumaa",
          arabic: "الجمعة",
          time: jummah.time,
        }))
      : [
          {
            key: "dhuhr" as const,
            label: "Dhuhr / Adhuhuri",
            arabic: "الظهر",
            time: prayerTimes.zuhr.congregation_start,
          },
        ]

  return [
    {
      key: "fajr",
      label: "Fajr / Alfajiri",
      arabic: "الفجر",
      time: prayerTimes.fajr.congregation_start,
    },
    ...fridayEntries,
    {
      key: "asr",
      label: "Asr / Alasiri",
      arabic: "العصر",
      time: prayerTimes.asr.congregation_start,
    },
    {
      key: "maghrib",
      label: "Maghrib / Magharibi",
      arabic: "المغرب",
      time: prayerTimes.maghrib.congregation_start,
    },
    {
      key: "isha",
      label: "Isha / Aisha",
      arabic: "العشاء",
      time: prayerTimes.isha.congregation_start,
    },
  ]
}

export function getActiveJamaaState(
  prayerTimes: DailyPrayerTime,
  jummahTimes: JummahTimes = [],
  currentTime: Moment = dtNowLocale(),
): JamaaState | null {
  const entries = getJamaaEntries(prayerTimes, jummahTimes, currentTime)

  for (const entry of entries) {
    if (!entry.time) continue

    const jamaahTime = getPrayerTimeOnDay(entry.time, currentTime)
    if (!jamaahTime.isValid()) continue

    const jamaahEnds = jamaahTime.clone().add(blackoutPeriod, "minutes")
    if (
      currentTime.isSameOrAfter(jamaahTime) &&
      currentTime.isBefore(jamaahEnds)
    ) {
      return {
        key: entry.key,
        label: entry.label,
        arabic: entry.arabic,
        startTime: entry.time,
        elapsedSeconds: Math.max(
          0,
          currentTime.diff(jamaahTime, "seconds"),
        ),
        durationMinutes: blackoutPeriod,
      }
    }
  }

  return null
}

export function isBlackout(
  prayerTimes: DailyPrayerTime,
  jummahTimes: JummahTimes = [],
) {
  return getActiveJamaaState(prayerTimes, jummahTimes) != null
}

export function getNextPrayer(today: DailyPrayerTime) {
  const currentTime = dtNowLocale()

  const todaysTimes = [
    today.fajr.congregation_start,
    today.zuhr.congregation_start,
    today.asr.congregation_start,
    today.maghrib.congregation_start,
    today.isha.congregation_start,
  ]

  let nextPrayertime = {
    today: false,
    prayerIndex: 0,
  }

  todaysTimes.forEach((time, index) => {
    const prayerTime = getPrayerTimeOnDay(time, currentTime)

    if (currentTime.isBefore(prayerTime) && !nextPrayertime.today) {
      nextPrayertime = {
        today: true,
        prayerIndex: index,
      }
    }
  })

  return nextPrayertime
}

const prayerKeys = ["fajr", "zuhr", "asr", "maghrib", "isha"] as const

export function getPrayerTimeForNextPrayer(
  today: DailyPrayerTime,
  tomorrow: DailyPrayerTime,
  nextPrayer: ReturnType<typeof getNextPrayer>,
): PrayerTime {
  const prayerDay = nextPrayer.today ? today : tomorrow

  return prayerDay[prayerKeys[nextPrayer.prayerIndex]]
}
