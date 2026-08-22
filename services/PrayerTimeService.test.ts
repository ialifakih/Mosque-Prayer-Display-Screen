process.env.TZ = "America/Los_Angeles"

import {
  isBlackout,
  getNextPrayer,
  getPrayerTimeForNextPrayer,
} from "./PrayerTimeService"
import { DailyPrayerTime } from "@/types/DailyPrayerTimeType"

const prayerTimes: DailyPrayerTime = {
  month: "1",
  month_label: "January",
  day_of_month: "2",
  sunrise_start: "06:15",
  fajr: { start: "05:00", congregation_start: "05:30" },
  zuhr: { start: "12:00", congregation_start: "12:30" },
  asr: { start: "15:15", congregation_start: "15:30" },
  maghrib: { start: "18:15", congregation_start: "18:20" },
  isha: { start: "19:30", congregation_start: "20:00" },
}

describe("Tanzania prayer-time decisions", () => {
  beforeAll(() => jest.useFakeTimers())
  afterAll(() => jest.useRealTimers())

  test("selects the next prayer using Dar es Salaam time", () => {
    // 09:40 in Tanzania; the process/device timezone is deliberately different.
    jest.setSystemTime(new Date("2026-01-02T06:40:00.000Z"))

    expect(getNextPrayer(prayerTimes)).toEqual({ today: true, prayerIndex: 1 })
  })

  test("enters and leaves blackout on Tanzania congregation boundaries", () => {
    jest.setSystemTime(new Date("2026-01-02T09:30:00.000Z"))
    expect(isBlackout(prayerTimes)).toBe(true)

    jest.setSystemTime(new Date("2026-01-02T09:43:00.000Z"))
    expect(isBlackout(prayerTimes)).toBe(true)

    jest.setSystemTime(new Date("2026-01-02T09:44:00.000Z"))
    expect(isBlackout(prayerTimes)).toBe(false)
  })

  test("moves to tomorrow only after the final Tanzania prayer", () => {
    jest.setSystemTime(new Date("2026-01-02T17:01:00.000Z"))

    expect(getNextPrayer(prayerTimes)).toEqual({ today: false, prayerIndex: 0 })
  })

  test("selects tomorrow Fajr before midnight and today's Fajr after midnight", () => {
    const saturday: DailyPrayerTime = {
      ...prayerTimes,
      day_of_month: "22",
      fajr: { start: "04:20", congregation_start: "04:50" },
    }
    const sunday: DailyPrayerTime = {
      ...prayerTimes,
      day_of_month: "23",
      fajr: { start: "04:22", congregation_start: "04:52" },
    }
    const monday: DailyPrayerTime = {
      ...prayerTimes,
      day_of_month: "24",
      fajr: { start: "04:24", congregation_start: "04:54" },
    }

    // Saturday 23:40 in Tanzania: the next prayer belongs to Sunday.
    jest.setSystemTime(new Date("2026-08-22T20:40:00.000Z"))
    const beforeMidnight = getNextPrayer(saturday)

    expect(beforeMidnight).toEqual({ today: false, prayerIndex: 0 })
    expect(
      getPrayerTimeForNextPrayer(saturday, sunday, beforeMidnight),
    ).toEqual({ start: "04:22", congregation_start: "04:52" })

    // Sunday 00:26 in Tanzania: the next prayer belongs to Sunday itself.
    jest.setSystemTime(new Date("2026-08-22T21:26:00.000Z"))
    const afterMidnight = getNextPrayer(sunday)

    expect(afterMidnight).toEqual({ today: true, prayerIndex: 0 })
    expect(getPrayerTimeForNextPrayer(sunday, monday, afterMidnight)).toEqual({
      start: "04:22",
      congregation_start: "04:52",
    })
  })
})
