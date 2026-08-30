/** @jest-environment jsdom */

import "@testing-library/jest-dom"
import { act, render, screen } from "@testing-library/react"
import Announcement from "@/components/Announcement/Announcement"
import type { AnnouncementRecord } from "@/types/AnnouncementType"

function record(id: string, title: string): AnnouncementRecord {
  return {
    id,
    title,
    message: `${title} message`,
    image_url: null,
    start_date: "2026-08-23",
    end_date: "2026-08-23",
    is_active: true,
    priority: 0,
    created_at: "2026-08-01T00:00:00.000Z",
    updated_at: "2026-08-01T00:00:00.000Z",
  }
}

async function flushFetch(): Promise<void> {
  await act(async () => {
    await Promise.resolve()
    await Promise.resolve()
  })
}

describe("public announcement rotator", () => {
  beforeEach(() => {
    jest.useFakeTimers()
  })

  afterEach(() => {
    jest.useRealTimers()
    jest.restoreAllMocks()
  })

  it("keeps one eligible announcement static", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ announcements: [record("one", "First notice")] }),
    })
    global.fetch = fetchMock as typeof fetch

    render(<Announcement />)
    await flushFetch()

    expect(screen.getByText("First notice")).toBeVisible()
    act(() => jest.advanceTimersByTime(13_000))
    expect(screen.getByText("First notice")).toBeVisible()
    expect(screen.queryByLabelText(/Announcement 1 of/)).not.toBeInTheDocument()
  })

  it("shows a useful default when there are no active announcements", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ announcements: [] }),
    }) as typeof fetch

    render(<Announcement />)
    await flushFetch()

    expect(screen.getByText("Karibu Msikitini")).toBeVisible()
    expect(screen.getByText(/simu katika hali ya kimya/i)).toBeVisible()
  })

  it("rotates multiple announcements every 13 seconds and refetches at 60 seconds", async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        announcements: [
          record("one", "First notice"),
          record("two", "Second notice"),
        ],
      }),
    })
    global.fetch = fetchMock as typeof fetch

    render(<Announcement />)
    await flushFetch()
    expect(screen.getByText("First notice")).toBeVisible()

    act(() => jest.advanceTimersByTime(13_000))
    expect(screen.getByText("Second notice")).toBeVisible()

    act(() => jest.advanceTimersByTime(47_000))
    await flushFetch()
    expect(fetchMock).toHaveBeenCalledTimes(2)
  })
})
