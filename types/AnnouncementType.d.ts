export interface AnnouncementData {
  date: string // 2026-01-01
  start_time: string
  end_time: string
  duration_minutes?: string | null
  message?: string
  car_reg_number?: string | null
  image?: string | null
  is_visible?: boolean
}

export interface AnnouncementRecord {
  id: string
  title: string
  message: string
  image_url?: string | null
  start_date: string
  end_date: string
  is_active: boolean
  priority: number
  created_at: string
  updated_at: string
}

export type AnnouncementInput = Pick<
  AnnouncementRecord,
  | "title"
  | "message"
  | "image_url"
  | "start_date"
  | "end_date"
  | "is_active"
  | "priority"
>

export interface PublicAnnouncementsResponse {
  announcements: AnnouncementRecord[]
  announcement: (AnnouncementRecord & { is_visible: true }) | null
}
