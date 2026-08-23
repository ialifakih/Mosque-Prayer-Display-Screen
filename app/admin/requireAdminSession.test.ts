import type { AdminSession } from "@/lib/adminAuthorization"
import {
  AdminAuthorizationError,
  requireAdminSession,
} from "@/app/admin/requireAdminSession"

describe("requireAdminSession", () => {
  const originalAllowedEmails = process.env.ADMIN_ALLOWED_EMAILS

  afterEach(() => {
    if (originalAllowedEmails == null) {
      delete process.env.ADMIN_ALLOWED_EMAILS
    } else {
      process.env.ADMIN_ALLOWED_EMAILS = originalAllowedEmails
    }
  })

  it("rejects an unauthenticated write", async () => {
    await expect(requireAdminSession(async () => null)).rejects.toBeInstanceOf(
      AdminAuthorizationError,
    )
  })

  it("rejects a Google account outside the allow-list", async () => {
    process.env.ADMIN_ALLOWED_EMAILS = "admin@example.com"
    const session = {
      provider: "google",
      user: { email: "someone-else@example.com" },
      expires: "2099-01-01T00:00:00.000Z",
    } as AdminSession

    await expect(
      requireAdminSession(async () => session),
    ).rejects.toBeInstanceOf(AdminAuthorizationError)
  })

  it("allows a case-insensitive allow-listed Google admin", async () => {
    process.env.ADMIN_ALLOWED_EMAILS =
      " caretaker@example.com, ADMIN@EXAMPLE.COM "
    const session = {
      provider: "google",
      user: { email: "admin@example.com" },
      expires: "2099-01-01T00:00:00.000Z",
    } as AdminSession

    await expect(requireAdminSession(async () => session)).resolves.toBe(
      session,
    )
  })

  it("allows a successfully authenticated credentials admin", async () => {
    const session = {
      provider: "credentials",
      user: { name: "mosque-admin" },
      expires: "2099-01-01T00:00:00.000Z",
    } as AdminSession

    await expect(requireAdminSession(async () => session)).resolves.toBe(
      session,
    )
  })
})
