import { requireAdminSession } from "@/app/admin/requireAdminSession"
import {
  createAnnouncementAction,
  deleteAnnouncementAction,
  setAnnouncementActiveAction,
  updateAnnouncementAction,
} from "@/app/admin/actions/announcements"
import {
  sheetsCreateAnnouncement,
  sheetsDeleteAnnouncement,
  sheetsGetAnnouncements,
  sheetsUpdateAnnouncementRecord,
} from "@/services/GoogleSheetsService"
import type { AnnouncementInput } from "@/types/AnnouncementType"

jest.mock("@/app/admin/requireAdminSession", () => ({
  requireAdminSession: jest.fn(),
}))

jest.mock("@/services/GoogleSheetsService", () => ({
  sheetsCreateAnnouncement: jest.fn(),
  sheetsDeleteAnnouncement: jest.fn(),
  sheetsGetAnnouncements: jest.fn(),
  sheetsUpdateAnnouncementRecord: jest.fn(),
}))

jest.mock("next/cache", () => ({ revalidatePath: jest.fn() }))

const input: AnnouncementInput = {
  title: "Community notice",
  message: "Classes resume this week.",
  image_url: null,
  start_date: "2026-08-22",
  end_date: "2026-08-24",
  is_active: true,
  priority: 5,
}

describe("announcement Server Actions", () => {
  beforeEach(() => {
    jest.clearAllMocks()
    ;(requireAdminSession as jest.Mock).mockRejectedValue(
      new Error("Admin authorization is required"),
    )
  })

  it.each([
    ["create", () => createAnnouncementAction(input)],
    ["edit", () => updateAnnouncementAction("notice-1", input)],
    ["activate/deactivate", () => setAnnouncementActiveAction("notice-1", false)],
    ["delete", () => deleteAnnouncementAction("notice-1")],
  ])("rejects an unauthorized %s mutation before storage", async (_name, action) => {
    await expect(action()).rejects.toThrow("Admin authorization is required")
    expect(sheetsCreateAnnouncement).not.toHaveBeenCalled()
    expect(sheetsGetAnnouncements).not.toHaveBeenCalled()
    expect(sheetsUpdateAnnouncementRecord).not.toHaveBeenCalled()
    expect(sheetsDeleteAnnouncement).not.toHaveBeenCalled()
  })
})
