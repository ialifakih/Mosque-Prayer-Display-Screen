"use client"

import { AnnouncementCard } from "@/components/Announcement/AnnouncementCard"
import type {
  AnnouncementRecord,
  PublicAnnouncementsResponse,
} from "@/types/AnnouncementType"
import { useEffect, useState } from "react"

const ROTATION_INTERVAL_MS = 13_000
const REFRESH_INTERVAL_MS = 60_000

export default function Announcement() {
  const [announcements, setAnnouncements] = useState<AnnouncementRecord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    let cancelled = false

    const refresh = async () => {
      try {
        const response = await fetch(
          `/api/data/announcements?no_cache=${Date.now()}`,
          { cache: "no-store" },
        )
        if (!response.ok) throw new Error(`Request failed: ${response.status}`)
        const data = (await response.json()) as PublicAnnouncementsResponse
        if (!cancelled) {
          setAnnouncements(
            Array.isArray(data.announcements) ? data.announcements : [],
          )
          setCurrentIndex(0)
        }
      } catch (error) {
        console.error(`Error fetching announcements: ${error}`)
      }
    }

    void refresh()
    const refreshInterval = window.setInterval(refresh, REFRESH_INTERVAL_MS)
    return () => {
      cancelled = true
      window.clearInterval(refreshInterval)
    }
  }, [])

  useEffect(() => {
    if (announcements.length < 2) return

    const rotationInterval = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % announcements.length)
    }, ROTATION_INTERVAL_MS)
    return () => window.clearInterval(rotationInterval)
  }, [announcements.length])

  const announcement = announcements[currentIndex]
  if (announcement == null) return null

  return (
    <div aria-live="polite" className="announcement-rotator">
      <AnnouncementCard announcement={announcement} />
      {announcements.length > 1 && (
        <p
          className="announcement-position"
          aria-label={`Announcement ${currentIndex + 1} of ${announcements.length}`}
        >
          {currentIndex + 1} / {announcements.length}
        </p>
      )}
    </div>
  )
}
