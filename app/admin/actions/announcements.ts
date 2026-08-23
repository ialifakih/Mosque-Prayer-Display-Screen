"use server"

import { requireAdminSession } from "@/app/admin/requireAdminSession"
import { dtLocale, dtNowLocale } from "@/lib/datetimeUtils"
import {
  sheetsCreateAnnouncement,
  sheetsDeleteAnnouncement,
  sheetsGetAnnouncements,
  sheetsUpdateAnnouncementRecord,
} from "@/services/GoogleSheetsService"
import type {
  AnnouncementInput,
  AnnouncementRecord,
} from "@/types/AnnouncementType"
import { revalidatePath } from "next/cache"

function validateAnnouncementInput(input: AnnouncementInput): AnnouncementInput {
  const title = input.title.trim()
  const message = input.message.trim()
  const startDate = dtLocale(input.start_date, "YYYY-MM-DD", true)
  const endDate = dtLocale(input.end_date, "YYYY-MM-DD", true)
  const priority = Number(input.priority)

  if (title.length === 0) throw new Error("Title is required")
  if (message.length === 0) throw new Error("Message is required")
  if (!startDate.isValid()) throw new Error("Start date is invalid")
  if (!endDate.isValid()) throw new Error("End date is invalid")
  if (input.start_date > input.end_date) {
    throw new Error("End date must be on or after the start date")
  }
  if (!Number.isInteger(priority) || priority < 0 || priority > 999) {
    throw new Error("Priority must be a whole number from 0 to 999")
  }

  return {
    title,
    message,
    image_url: input.image_url?.trim() || null,
    start_date: input.start_date,
    end_date: input.end_date,
    is_active: input.is_active === true,
    priority,
  }
}

function revalidateAnnouncementViews(): void {
  revalidatePath("/")
  revalidatePath("/admin")
}

export async function createAnnouncementAction(
  input: AnnouncementInput,
): Promise<AnnouncementRecord> {
  await requireAdminSession()
  const validated = validateAnnouncementInput(input)
  const timestamp = dtNowLocale().toISOString()
  const announcement: AnnouncementRecord = {
    id: crypto.randomUUID(),
    ...validated,
    created_at: timestamp,
    updated_at: timestamp,
  }

  await sheetsCreateAnnouncement(announcement)
  revalidateAnnouncementViews()
  return announcement
}

export async function updateAnnouncementAction(
  id: string,
  input: AnnouncementInput,
): Promise<AnnouncementRecord> {
  await requireAdminSession()
  const existing = (await sheetsGetAnnouncements()).find(
    (announcement) => announcement.id === id,
  )
  if (existing == null) throw new Error("Announcement was not found")

  const announcement: AnnouncementRecord = {
    ...existing,
    ...validateAnnouncementInput(input),
    updated_at: dtNowLocale().toISOString(),
  }

  await sheetsUpdateAnnouncementRecord(announcement)
  revalidateAnnouncementViews()
  return announcement
}

export async function setAnnouncementActiveAction(
  id: string,
  isActive: boolean,
): Promise<AnnouncementRecord> {
  await requireAdminSession()
  const existing = (await sheetsGetAnnouncements()).find(
    (announcement) => announcement.id === id,
  )
  if (existing == null) throw new Error("Announcement was not found")

  const announcement = {
    ...existing,
    is_active: isActive === true,
    updated_at: dtNowLocale().toISOString(),
  }
  await sheetsUpdateAnnouncementRecord(announcement)
  revalidateAnnouncementViews()
  return announcement
}

export async function deleteAnnouncementAction(id: string): Promise<void> {
  await requireAdminSession()
  await sheetsDeleteAnnouncement(id)
  revalidateAnnouncementViews()
}
