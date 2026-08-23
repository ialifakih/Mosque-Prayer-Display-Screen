import { getSession } from "@/app/auth"
import {
  isAdminSessionAuthorized,
  type AdminSession,
} from "@/lib/adminAuthorization"

export class AdminAuthorizationError extends Error {
  constructor() {
    super("Admin authorization is required")
    this.name = "AdminAuthorizationError"
  }
}

export async function requireAdminSession(
  sessionLoader: () => Promise<AdminSession | null> = getSession,
): Promise<AdminSession> {
  const session = await sessionLoader()

  if (!isAdminSessionAuthorized(session)) {
    throw new AdminAuthorizationError()
  }

  return session
}
