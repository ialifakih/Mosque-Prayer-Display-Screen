import { sheetsGetAnnouncements } from '@/services/GoogleSheetsService'
import {
  getAnnouncement,
} from '@/services/MosqueDataService'

import { isSheetsClientEnabled } from "@/services/GoogleSheetsUtil"
import { resolvePublicAnnouncements } from "@/services/AnnouncementService"

export async function GET() {
  try {
    const [legacyAnnouncement, worksheetAnnouncements] = await Promise.all([
      getAnnouncement(),
      isSheetsClientEnabled() ? sheetsGetAnnouncements() : Promise.resolve([]),
    ])
    const announcements = resolvePublicAnnouncements(
      worksheetAnnouncements,
      legacyAnnouncement,
    )
    const announcement = announcements[0]
      ? { ...announcements[0], is_visible: true as const }
      : null

    return Response.json({ announcements, announcement })
  } catch (error: any) {
    return Response.json({ error: error?.message ?? "Unknown error" }, { status: 400 });  }
}
