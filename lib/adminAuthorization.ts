import type { Session } from "next-auth"

export type AdminSession = Session & { provider?: string }

export function parseAdminAllowedEmails(
  value: string | undefined = process.env.ADMIN_ALLOWED_EMAILS,
): string[] {
  return (value ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
}

export function isAllowedAdminEmail(
  email: string | null | undefined,
  value: string | undefined = process.env.ADMIN_ALLOWED_EMAILS,
): boolean {
  if (email == null) return false
  return parseAdminAllowedEmails(value).includes(email.trim().toLowerCase())
}

export function isAdminSessionAuthorized(
  session: AdminSession | null,
  value: string | undefined = process.env.ADMIN_ALLOWED_EMAILS,
): session is AdminSession {
  if (session == null) return false

  if (session.provider === "google") {
    return isAllowedAdminEmail(session.user?.email, value)
  }

  return session.provider === "credentials"
}
