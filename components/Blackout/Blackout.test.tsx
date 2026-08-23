/** @jest-environment jsdom */

import "@testing-library/jest-dom"
import { act, render, screen } from "@testing-library/react"
import Blackout from "@/components/Blackout/Blackout"
import { isBlackout } from "@/services/PrayerTimeService"
import type { DailyPrayerTime } from "@/types/DailyPrayerTimeType"

jest.mock("@/services/PrayerTimeService", () => ({
  isBlackout: jest.fn(),
}))

const prayerTimes: DailyPrayerTime = {
  month: "8",
  month_label: "August",
  day_of_month: "23",
  sunrise_start: "06:15",
  fajr: { start: "04:22", congregation_start: "04:52" },
  zuhr: { start: "12:30", congregation_start: "13:00" },
  asr: { start: "16:10", congregation_start: "16:20" },
  maghrib: { start: "18:25", congregation_start: "18:30" },
  isha: { start: "19:45", congregation_start: "20:00" },
}

describe("Blackout", () => {
  beforeEach(() => {
    jest.useFakeTimers()
    ;(isBlackout as jest.Mock).mockReturnValue(true)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it("renders above every public display and announcement layer", () => {
    render(<Blackout prayerTimeToday={prayerTimes} />)

    act(() => {
      jest.advanceTimersByTime(10_000)
    })

    expect(screen.getByTestId("blackout-overlay")).toHaveClass("z-[10000]")
  })
})
