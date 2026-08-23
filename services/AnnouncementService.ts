import { dtLocale, dtNowLocale } from "@/lib/datetimeUtils"
import type {
  AnnouncementData,
  AnnouncementRecord,
} from "@/types/AnnouncementType"
import type { Moment } from "moment"

const DATE_FORMAT = "YYYY-MM-DD"

function isValidDate(value: string): boolean {
  return dtLocale(value, DATE_FORMAT, true).isValid()
}

export function isAnnouncementEligible(
  announcement: AnnouncementRecord,
  now: Moment = dtNowLocale(),
): boolean {
  if (announcement.is_active !== true) {
    return false
  }

  if (
    !isValidDate(announcement.start_date) ||
    !isValidDate(announcement.end_date)
  ) {
    return false
  }

  const today = now.format(DATE_FORMAT)
  return (
    announcement.start_date <= today && announcement.end_date >= today
  )
}

export function getEligibleAnnouncements(
  announcements: AnnouncementRecord[],
  now: Moment = dtNowLocale(),
): AnnouncementRecord[] {
  return announcements
    .filter((announcement) => isAnnouncementEligible(announcement, now))
    .sort((first, second) => {
      const priorityDifference = second.priority - first.priority
      if (priorityDifference !== 0) return priorityDifference

      const startDateDifference = first.start_date.localeCompare(
        second.start_date,
      )
      if (startDateDifference !== 0) return startDateDifference

      const createdDifference = first.created_at.localeCompare(
        second.created_at,
      )
      if (createdDifference !== 0) return createdDifference

      return first.id.localeCompare(second.id)
    })
}

export function getEligibleLegacyAnnouncement(
  announcement: AnnouncementData | null | undefined,
  now: Moment = dtNowLocale(),
): AnnouncementRecord | null {
  if (
    announcement?.date == null ||
    announcement.start_time == null ||
    announcement.end_time == null
  ) {
    return null
  }

  const start = dtLocale(
    `${announcement.date} ${announcement.start_time}`,
    "YYYY-MM-DD HH:mm",
    true,
  )
  const end = dtLocale(
    `${announcement.date} ${announcement.end_time}`,
    "YYYY-MM-DD HH:mm",
    true,
  )

  if (
    !start.isValid() ||
    !end.isValid() ||
    !now.isSame(start, "day") ||
    now.isBefore(start, "minute") ||
    !now.isBefore(end, "minute")
  ) {
    return null
  }

  return {
    id: "legacy-config-announcement",
    title: "Announcement",
    message: announcement.message ?? "",
    image_url: announcement.image ?? null,
    start_date: announcement.date,
    end_date: announcement.date,
    is_active: true,
    priority: 0,
    created_at: start.toISOString(),
    updated_at: start.toISOString(),
  }
}

export function resolvePublicAnnouncements(
  announcements: AnnouncementRecord[],
  legacyAnnouncement: AnnouncementData | null | undefined,
  now: Moment = dtNowLocale(),
): AnnouncementRecord[] {
  const eligibleAnnouncements = getEligibleAnnouncements(announcements, now)

  // Once the dedicated worksheet contains data, it is authoritative. The
  // Configuration announcement is only a fallback for an empty/unavailable
  // worksheet during migration.
  if (announcements.length > 0) {
    return eligibleAnnouncements
  }

  const legacy = getEligibleLegacyAnnouncement(legacyAnnouncement, now)
  return legacy == null ? [] : [legacy]
}
