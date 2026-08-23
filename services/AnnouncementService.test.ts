import { dtLocale } from "@/lib/datetimeUtils"
import {
  getEligibleAnnouncements,
  resolvePublicAnnouncements,
} from "@/services/AnnouncementService"
import type {
  AnnouncementData,
  AnnouncementRecord,
} from "@/types/AnnouncementType"

function announcement(
  overrides: Partial<AnnouncementRecord> = {},
): AnnouncementRecord {
  return {
    id: "announcement-1",
    title: "Community notice",
    message: "Classes resume this week.",
    image_url: null,
    start_date: "2026-08-22",
    end_date: "2026-08-24",
    is_active: true,
    priority: 0,
    created_at: "2026-08-01T08:00:00.000Z",
    updated_at: "2026-08-01T08:00:00.000Z",
    ...overrides,
  }
}

describe("announcement eligibility in Africa/Dar_es_Salaam", () => {
  const midday = dtLocale("2026-08-23 12:00", "YYYY-MM-DD HH:mm", true)

  it("includes an active announcement running today", () => {
    expect(getEligibleAnnouncements([announcement()], midday)).toHaveLength(1)
  })

  it("excludes an upcoming announcement", () => {
    expect(
      getEligibleAnnouncements(
        [announcement({ start_date: "2026-08-24" })],
        midday,
      ),
    ).toEqual([])
  })

  it("excludes an expired announcement", () => {
    expect(
      getEligibleAnnouncements(
        [announcement({ end_date: "2026-08-22" })],
        midday,
      ),
    ).toEqual([])
  })

  it("excludes an inactive announcement", () => {
    expect(
      getEligibleAnnouncements(
        [announcement({ is_active: false })],
        midday,
      ),
    ).toEqual([])
  })

  it("treats the end date as inclusive", () => {
    expect(
      getEligibleAnnouncements(
        [announcement({ end_date: "2026-08-23" })],
        midday,
      ),
    ).toHaveLength(1)
  })

  it("rolls eligibility at Tanzania midnight instead of the host timezone", () => {
    const startsOnSunday = announcement({
      start_date: "2026-08-23",
      end_date: "2026-08-23",
    })

    const saturday2340 = dtLocale(
      "2026-08-22 23:40",
      "YYYY-MM-DD HH:mm",
      true,
    )
    const sunday0026 = dtLocale(
      "2026-08-23 00:26",
      "YYYY-MM-DD HH:mm",
      true,
    )

    expect(getEligibleAnnouncements([startsOnSunday], saturday2340)).toEqual(
      [],
    )
    expect(getEligibleAnnouncements([startsOnSunday], sunday0026)).toEqual([
      startsOnSunday,
    ])
  })

  it("orders by priority descending, start date, then created timestamp", () => {
    const result = getEligibleAnnouncements(
      [
        announcement({
          id: "low",
          priority: 1,
          start_date: "2026-08-20",
        }),
        announcement({
          id: "newer",
          priority: 5,
          start_date: "2026-08-21",
          created_at: "2026-08-02T08:00:00.000Z",
        }),
        announcement({
          id: "older",
          priority: 5,
          start_date: "2026-08-21",
          created_at: "2026-08-01T08:00:00.000Z",
        }),
        announcement({
          id: "earlier-start",
          priority: 5,
          start_date: "2026-08-20",
        }),
      ],
      midday,
    )

    expect(result.map(({ id }) => id)).toEqual([
      "earlier-start",
      "older",
      "newer",
      "low",
    ])
  })

  it("uses the read-only legacy configuration announcement only as a fallback", () => {
    const legacy: AnnouncementData = {
      date: "2026-08-23",
      start_time: "11:00",
      end_time: "13:00",
      message: "Legacy notice",
    }

    expect(resolvePublicAnnouncements([], legacy, midday)).toEqual([
      expect.objectContaining({
        id: "legacy-config-announcement",
        message: "Legacy notice",
      }),
    ])

    expect(
      resolvePublicAnnouncements(
        [announcement({ is_active: false })],
        legacy,
        midday,
      ),
    ).toEqual([])
  })
})
