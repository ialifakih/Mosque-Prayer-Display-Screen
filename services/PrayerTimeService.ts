import {
  DailyPrayerTime,
  PrayerTime,
} from "@/types/DailyPrayerTimeType"
import { dtLocale, dtNowLocale } from "@/lib/datetimeUtils"

const blackoutPeriod = process.env.NEXT_PUBLIC_BLACKOUT_PERIOD ?? 13 // defaults to 13 minutes

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

export function isBlackout(prayerTimes: DailyPrayerTime) {
  const currentTime = dtNowLocale()
  const congregationTimes = [
    prayerTimes.fajr.congregation_start,
    prayerTimes.zuhr.congregation_start,
    prayerTimes.asr.congregation_start,
    prayerTimes.maghrib.congregation_start,
    prayerTimes.isha.congregation_start,
  ]

  let setBlackoutMode = false

  congregationTimes.forEach((time) => {
    if (
      currentTime >= dtLocale(time, ["HH:mm"]) &&
      currentTime <= dtLocale(time, ["HH:mm"]).add(blackoutPeriod, "m")
    ) {
      setBlackoutMode = true
    }
  })

  return setBlackoutMode
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
