"use client"

import { AnnouncementCard } from "@/components/Announcement/AnnouncementCard"
import type {
  AnnouncementInput,
  AnnouncementRecord,
  PublicAnnouncementsResponse,
} from "@/types/AnnouncementType"
import { useEffect, useState } from "react"

const ROTATION_INTERVAL_MS = 13_000
const REFRESH_INTERVAL_MS = 60_000
const DEFAULT_ANNOUNCEMENT = {
  title: "Karibu Msikitini",
  message:
    "Tafadhali weka simu katika hali ya kimya na udumishe utulivu ndani ya msikiti.",
}

type AnnouncementSlide = Pick<AnnouncementInput, "title" | "message">

export function AnnouncementEmptyState() {
  return (
    <div className="announcement-rotator announcement-empty-state">
      <AnnouncementCard announcement={DEFAULT_ANNOUNCEMENT} />
    </div>
  )
}

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

  const slides: AnnouncementSlide[] =
    announcements.length > 0
      ? [...announcements, DEFAULT_ANNOUNCEMENT]
      : [DEFAULT_ANNOUNCEMENT]

  useEffect(() => {
    if (slides.length < 2) return

    const rotationInterval = window.setInterval(() => {
      setCurrentIndex((index) => (index + 1) % slides.length)
    }, ROTATION_INTERVAL_MS)
    return () => window.clearInterval(rotationInterval)
  }, [slides.length])

  const safeIndex = currentIndex % slides.length
  const announcement = slides[safeIndex]

  return (
    <div aria-live="polite" className="announcement-rotator">
      <AnnouncementCard announcement={announcement} />
      {slides.length > 1 && (
        <p
          className="announcement-position"
          aria-label={`Announcement ${safeIndex + 1} of ${slides.length}`}
        >
          {safeIndex + 1} / {slides.length}
        </p>
      )}
    </div>
  )
}
