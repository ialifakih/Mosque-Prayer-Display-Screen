import "server-only"

import type { AnnouncementRecord } from "@/types/AnnouncementType"
import { google, sheets_v4 } from "googleapis"
import {
  prayerTimeValuesToPrayerTimesJsonSchema,
  ANNOUNCEMENT_SHEET_HEADERS,
  announcementRecordToRow,
  announcementValuesToRecords,
  sheetsUtilValuesToJson,
  sheetsUtilValuesToNestedJson,
} from "@/services/GoogleSheetsUtil"
import { ConfigurationJson } from "@/types/ConfigurationType"
import deepmerge from "deepmerge"
import { configurationDefaults } from "@/config/ConfigurationDefaults"
import { MosqueData, MosqueMetadataType } from "@/types/MosqueDataType"
import { DailyPrayerTime } from "@/types/DailyPrayerTimeType"
import { JummahTimes } from "@/types/JummahTimesType"
import { unstable_cache } from "next/cache"

const SHEET_NAMES = {
  PrayerTimes: "PrayerTimes",
  JummahTimes: "JummahTimes",
  Metadata: "Metadata",
  Configuration: "Configuration",
  Announcements: "Announcements",
}

type ServiceAccountCredentials = {
  email: string
  privateKey: string
}

let sheetsClient: sheets_v4.Sheets | null = null

function getServiceAccountCredentials(): ServiceAccountCredentials {
  const serviceAccountJson = process.env.ADMIN_GOOGLE_SERVICE_ACCOUNT_JSON?.trim()

  if (serviceAccountJson) {
    try {
      const parsed = JSON.parse(serviceAccountJson) as {
        client_email?: unknown
        private_key?: unknown
      }
      const email =
        typeof parsed.client_email === "string" ? parsed.client_email.trim() : ""
      const privateKey =
        typeof parsed.private_key === "string" ? parsed.private_key : ""

      if (!email || !privateKey) {
        throw new Error("client_email or private_key is missing")
      }

      return {
        email,
        privateKey: privateKey.replace(/\\n/g, "\n"),
      }
    } catch (error: any) {
      throw new Error(
        `ADMIN_GOOGLE_SERVICE_ACCOUNT_JSON is invalid: ${error?.message ?? "unknown error"}`,
      )
    }
  }

  const email = process.env.ADMIN_GOOGLE_SA_EMAIL?.trim()
  const privateKey = process.env.ADMIN_GOOGLE_SA_PRIVATE_KEY

  if (!email || !privateKey) {
    throw new Error(
      "Google Sheets credentials have not been set. Set ADMIN_GOOGLE_SERVICE_ACCOUNT_JSON.",
    )
  }

  return {
    email,
    privateKey: privateKey.replace(/\\n/g, "\n"),
  }
}

export function logGoogleSheetsRuntimeDiagnostics(): void {
  console.info({
    hasGoogleServiceAccountJson: Boolean(
      process.env.ADMIN_GOOGLE_SERVICE_ACCOUNT_JSON,
    ),
    hasLegacyAdminGoogleSaEmail: Boolean(process.env.ADMIN_GOOGLE_SA_EMAIL),
    hasLegacyAdminGoogleSaPrivateKey: Boolean(
      process.env.ADMIN_GOOGLE_SA_PRIVATE_KEY,
    ),
    hasSpreadsheetId: Boolean(process.env.SPREADSHEET_ID),
    hasAuthSecret: Boolean(process.env.AUTH_SECRET),
    vercelCommitSha: process.env.VERCEL_GIT_COMMIT_SHA,
  })
}

export async function getUserSheetsClient() {
  logGoogleSheetsRuntimeDiagnostics()

  if (sheetsClient) return sheetsClient

  const credentials = getServiceAccountCredentials()

  try {
    const googleAuthJwt = new google.auth.JWT({
      email: credentials.email,
      key: credentials.privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"],
    })

    sheetsClient = google.sheets({
      version: "v4",
      auth: googleAuthJwt,
    })

    return sheetsClient
  } catch (err: any) {
    throw new Error(`Google Service Account error: ${err.message}`)
  }
}

function getSpreadsheetId(): string {
  const spreadsheetId = process.env.SPREADSHEET_ID?.trim()

  if (!spreadsheetId) {
    throw new Error("Spreadsheet ID has not been set")
  }

  return spreadsheetId
}

export async function isSheetsClientReady(): Promise<boolean> {
  try {
    const sheets = await getUserSheetsClient()
    await sheets.spreadsheets.get({
      spreadsheetId: getSpreadsheetId(),
    })
    return true
  } catch (error: any) {
    console.error(error)
    return false
  }
}

export async function sheetsGetMosqueData(): Promise<MosqueData> {
  try {
    const configurationData = await sheetsGetConfigurationData()
    const prayerTimes = await sheetsGetPrayerData()
    const jummahTimes = await sheetsGetJummahData()
    const metaData = await sheetsGetMetadata()
    return {
      metadata: metaData,
      jummah_times: jummahTimes,
      prayer_times: prayerTimes,
      config: configurationData,
    }
  } catch (error: any) {
    console.error(error)
    return {
      metadata: {},
      jummah_times: [],
      prayer_times: [],
      config: configurationDefaults,
    }
  }
}

const sheetsGetPrayerDataCached = unstable_cache(
  async () => {
    try {
      const sheets = await getUserSheetsClient()
      const prayerData = await sheets.spreadsheets.values.get({
        spreadsheetId: getSpreadsheetId(),
        range: SHEET_NAMES.PrayerTimes,
      })
      return prayerTimeValuesToPrayerTimesJsonSchema(
        prayerData?.data?.values ?? [],
      )
    } catch (error: any) {
      console.error(error)
      throw new Error(`Google Sheets API request failed: ${error?.message}`)
    }
  },
  ["sheetsGetPrayerDataCached"],
  { revalidate: 60 },
)

export async function sheetsGetPrayerData(): Promise<DailyPrayerTime[]> {
  return sheetsGetPrayerDataCached()
}

const sheetsGetJummahDataCached = unstable_cache(
  async () => {
    try {
      const sheets = await getUserSheetsClient()
      const jummahTimesData = await sheets.spreadsheets.values.get({
        spreadsheetId: getSpreadsheetId(),
        range: SHEET_NAMES.JummahTimes,
      })
      return sheetsUtilValuesToJson(
        jummahTimesData?.data?.values ?? [],
      ) as JummahTimes
    } catch (error: any) {
      console.error(error)
      throw new Error(`Google Sheets API request failed: ${error?.message}`)
    }
  },
  ["sheetsGetJummahDataCached"],
  { revalidate: 60 },
)

export async function sheetsGetJummahData(): Promise<JummahTimes> {
  return sheetsGetJummahDataCached()
}

const sheetsGetMetadataCached = unstable_cache(
  async () => {
    try {
      const sheets = await getUserSheetsClient()
      const metadata = await sheets.spreadsheets.values.get({
        spreadsheetId: getSpreadsheetId(),
        range: SHEET_NAMES.Metadata,
      })
      return sheetsUtilValuesToNestedJson(
        metadata?.data?.values ?? [],
      ) as MosqueMetadataType
    } catch (error: any) {
      console.error(error)
      throw new Error(`Google Sheets API request failed: ${error?.message}`)
    }
  },
  ["sheetsGetMetadataCached"],
  { revalidate: 60 },
)

export async function sheetsGetMetadata(): Promise<MosqueMetadataType> {
  return sheetsGetMetadataCached()
}

const sheetsGetConfigurationDataCached = unstable_cache(
  async () => {
    try {
      const sheets = await getUserSheetsClient()
      const configurationData = await sheets.spreadsheets.values.get({
        spreadsheetId: getSpreadsheetId(),
        range: SHEET_NAMES.Configuration,
      })
      return deepmerge(
        configurationDefaults,
        sheetsUtilValuesToNestedJson(configurationData?.data?.values ?? []),
      ) as ConfigurationJson
    } catch (error: any) {
      console.error(error)
      throw new Error(`Google Sheets API request failed: ${error?.message}`)
    }
  },
  ["sheetsGetConfigurationDataCached"],
  { revalidate: 60 },
)

export async function sheetsGetConfigurationData(): Promise<ConfigurationJson> {
  return sheetsGetConfigurationDataCached()
}

function isMissingAnnouncementsWorksheet(error: any): boolean {
  const message = String(error?.message ?? "").toLowerCase()
  return (
    Number(error?.code) === 400 &&
    (message.includes("unable to parse range") ||
      message.includes("requested entity was not found"))
  )
}

async function getAnnouncementSheetValues(): Promise<unknown[][]> {
  const sheets = await getUserSheetsClient()
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: SHEET_NAMES.Announcements,
  })
  return response.data.values ?? []
}

export async function sheetsGetAnnouncements(): Promise<AnnouncementRecord[]> {
  try {
    return announcementValuesToRecords(await getAnnouncementSheetValues())
  } catch (error: any) {
    if (isMissingAnnouncementsWorksheet(error)) {
      return []
    }
    throw new Error(`Google Sheets API request failed: ${error?.message}`)
  }
}

async function ensureAnnouncementsWorksheet(): Promise<void> {
  const sheets = await getUserSheetsClient()
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: getSpreadsheetId(),
    fields: "sheets.properties",
  })
  const worksheet = spreadsheet.data.sheets?.find(
    ({ properties }) => properties?.title === SHEET_NAMES.Announcements,
  )

  if (worksheet == null) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId: getSpreadsheetId(),
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: { title: SHEET_NAMES.Announcements },
            },
          },
        ],
      },
    })
  }

  const headerResponse = await sheets.spreadsheets.values.get({
    spreadsheetId: getSpreadsheetId(),
    range: `${SHEET_NAMES.Announcements}!1:1`,
  })
  const existingHeaders = headerResponse.data.values?.[0] ?? []

  if (existingHeaders.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: getSpreadsheetId(),
      range: `${SHEET_NAMES.Announcements}!A1:J1`,
      valueInputOption: "RAW",
      requestBody: { values: [[...ANNOUNCEMENT_SHEET_HEADERS]] },
    })
    return
  }

  if (
    existingHeaders.join("|") !== ANNOUNCEMENT_SHEET_HEADERS.join("|")
  ) {
    throw new Error(
      `Announcements worksheet headers must be: ${ANNOUNCEMENT_SHEET_HEADERS.join(", ")}`,
    )
  }
}

export async function sheetsCreateAnnouncement(
  announcement: AnnouncementRecord,
): Promise<void> {
  await ensureAnnouncementsWorksheet()
  const sheets = await getUserSheetsClient()
  await sheets.spreadsheets.values.append({
    spreadsheetId: getSpreadsheetId(),
    range: `${SHEET_NAMES.Announcements}!A:J`,
    valueInputOption: "RAW",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [announcementRecordToRow(announcement)] },
  })
}

async function getAnnouncementRow(
  id: string,
): Promise<{ rowIndex: number }> {
  const values = await getAnnouncementSheetValues()
  const idColumn = values[0]?.findIndex((header) => header === "id") ?? -1
  const rowIndex = values
    .slice(1)
    .findIndex((row) => String(row[idColumn] ?? "") === id)

  if (idColumn < 0 || rowIndex < 0) {
    throw new Error(`Announcement not found: ${id}`)
  }

  return { rowIndex: rowIndex + 1 }
}

export async function sheetsUpdateAnnouncementRecord(
  announcement: AnnouncementRecord,
): Promise<void> {
  await ensureAnnouncementsWorksheet()
  const { rowIndex } = await getAnnouncementRow(announcement.id)
  const sheets = await getUserSheetsClient()
  const rowNumber = rowIndex + 1

  await sheets.spreadsheets.values.update({
    spreadsheetId: getSpreadsheetId(),
    range: `${SHEET_NAMES.Announcements}!A${rowNumber}:J${rowNumber}`,
    valueInputOption: "RAW",
    requestBody: { values: [announcementRecordToRow(announcement)] },
  })
}

export async function sheetsDeleteAnnouncement(id: string): Promise<void> {
  await ensureAnnouncementsWorksheet()
  const { rowIndex } = await getAnnouncementRow(id)
  const sheets = await getUserSheetsClient()
  const spreadsheet = await sheets.spreadsheets.get({
    spreadsheetId: getSpreadsheetId(),
    fields: "sheets.properties",
  })
  const sheetId = spreadsheet.data.sheets?.find(
    ({ properties }) => properties?.title === SHEET_NAMES.Announcements,
  )?.properties?.sheetId

  if (sheetId == null) {
    throw new Error("Announcements worksheet was not found")
  }

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: getSpreadsheetId(),
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId,
              dimension: "ROWS",
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  })
}

// Legacy Configuration announcement values are intentionally read-only.
