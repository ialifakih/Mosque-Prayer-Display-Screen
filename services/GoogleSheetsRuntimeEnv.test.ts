import { afterEach, describe, expect, it, jest } from "@jest/globals"

const ENVIRONMENT_KEYS = [
  "ADMIN_GOOGLE_SA_EMAIL",
  "ADMIN_GOOGLE_SA_PRIVATE_KEY",
  "SPREADSHEET_ID",
] as const

const originalEnvironment = Object.fromEntries(
  ENVIRONMENT_KEYS.map((key) => [key, process.env[key]]),
)

function clearSheetsEnvironment(): void {
  ENVIRONMENT_KEYS.forEach((key) => delete process.env[key])
}

afterEach(() => {
  ENVIRONMENT_KEYS.forEach((key) => {
    const originalValue = originalEnvironment[key]
    if (originalValue == null) {
      delete process.env[key]
    } else {
      process.env[key] = originalValue
    }
  })
  jest.resetModules()
  jest.restoreAllMocks()
})

describe("Google Sheets runtime environment", () => {
  it("detects credentials set after GoogleSheetsUtil is imported", async () => {
    clearSheetsEnvironment()
    jest.resetModules()

    const { isSheetsClientEnabled } = await import("./GoogleSheetsUtil")

    expect(isSheetsClientEnabled()).toBe(false)

    process.env.ADMIN_GOOGLE_SA_EMAIL = "runtime@example.test"
    process.env.ADMIN_GOOGLE_SA_PRIVATE_KEY = "runtime-private-key"

    expect(isSheetsClientEnabled()).toBe(true)
  })

  it("creates a client and reads the spreadsheet id from env after import", async () => {
    clearSheetsEnvironment()
    jest.resetModules()

    const mockSpreadsheetGet = jest.fn(async () => ({ data: {} }))
    const mockSheetsClient = {
      spreadsheets: {
        get: mockSpreadsheetGet,
      },
    }
    const mockJwt = jest.fn()
    const mockSheets = jest.fn(() => mockSheetsClient)

    jest.doMock("server-only", () => ({}), { virtual: true })
    jest.doMock("next/cache", () => ({
      unstable_cache: (callback: unknown) => callback,
    }))
    jest.doMock("googleapis", () => ({
      google: {
        auth: { JWT: mockJwt },
        sheets: mockSheets,
      },
    }))

    const sheetsService = await import("./GoogleSheetsService")

    process.env.ADMIN_GOOGLE_SA_EMAIL = "runtime@example.test"
    process.env.ADMIN_GOOGLE_SA_PRIVATE_KEY =
      "-----BEGIN PRIVATE KEY-----\\nTEST\\n-----END PRIVATE KEY-----\\n"
    process.env.SPREADSHEET_ID = "runtime-spreadsheet-id"

    await expect(sheetsService.getUserSheetsClient()).resolves.toBe(
      mockSheetsClient,
    )
    await expect(sheetsService.isSheetsClientReady()).resolves.toBe(true)

    expect(mockJwt).toHaveBeenCalledWith({
      email: "runtime@example.test",
      key: "-----BEGIN PRIVATE KEY-----\nTEST\n-----END PRIVATE KEY-----\n",
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })
    expect(mockSheets).toHaveBeenCalledWith({
      version: "v4",
      auth: expect.anything(),
    })
    expect(mockSpreadsheetGet).toHaveBeenCalledWith({
      spreadsheetId: "runtime-spreadsheet-id",
    })
  })
})
