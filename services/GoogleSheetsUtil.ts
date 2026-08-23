import { DailyPrayerTime } from '@/types/DailyPrayerTimeType'
import type { AnnouncementRecord } from "@/types/AnnouncementType"
import { dtMonthNumToFullMonth } from "@/lib/datetimeUtils"

export const ANNOUNCEMENT_SHEET_HEADERS = [
  "id",
  "title",
  "message",
  "image_url",
  "start_date",
  "end_date",
  "is_active",
  "priority",
  "created_at",
  "updated_at",
] as const

export function isSheetsClientEnabled(): boolean {
  return Boolean(
    process.env.ADMIN_GOOGLE_SERVICE_ACCOUNT_JSON ||
      (process.env.ADMIN_GOOGLE_SA_EMAIL &&
        process.env.ADMIN_GOOGLE_SA_PRIVATE_KEY),
  )
}

/**
 * Generic function to convert spreadsheet row/column data into a json list.
 * The object will use the column headers as json keys.
 * @param values
 */
export function sheetsUtilValuesToJson(values: any[][] = []): Record<string, any>[] {
  if (!values || values.length === 0) return []

  const headers = values[0]
  const rows = values.slice(1)

  return rows.map((row) => {
    const obj: Record<string, any> = {}

    headers.forEach((header, i) => {
      obj[header] = row[i] ?? ''
    })

    return obj
  })
}

export function sheetsUtilValuesToNestedJson(rows: any[][]): Record<string, any> {
  const result: Record<string, any> = {};

  for (const row of rows) {
    if (!row || row.length < 2) continue;

    const rawKey = row[0];
    const value = row[1];

    if (rawKey === "key") continue;

    const key = String(rawKey);
    const parts = key.split(".");
    let current: any = result;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (i === parts.length - 1) {
        current[part] = value;
      } else {
        if (current[part] == null || typeof current[part] !== "object") {
          current[part] = {};
        }
        current = current[part];
      }
    }
  }

  return result;
}

/**
 * This function is to convert JSON data into rows for the Google Sheets API.
 * The data is flattened into a list of rows, each row contains a key and a value.
 * e.g. nested JSON data:
 * {
 *   "name": "John",
 *   "age": 30,
 *   "address": {
 *     "street": "123 Main St",
 *     "city": "Anytown",
 *     "state": "CA"
 *   }
 * }
 * will be converted to:
 * [
 *   ["name", "John"],
 *   ["age", 30],
 *   ["address.street", "123 Main St"],
 *   ["address.city", "Anytown"],
 *   ["address.state", "CA"]
 * @param json
 * @returns
 */
export function sheetsUtilFlattenedJsonToRows(json: Record<string, any>): any[][] {
  const rows: any[][] = [["key", "value"]];

  function walk(obj: any, path: string[] = []) {
    if (obj === null || typeof obj !== "object") {
      rows.push([path.join("."), obj]);
      return;
    }

    for (const key of Object.keys(obj)) {
      walk(obj[key], [...path, key]);
    }
  }

  walk(json);
  return rows;
}

/**
 * Converts the PrayerTimes spreadsheet values into the DailyPrayerTime json schema
 * @param values
 */
export function prayerTimeValuesToPrayerTimesJsonSchema (values: any[][] | null = []): DailyPrayerTime[] {
  if (!values || values.length === 0) return []

  const headers = values[0]
  const rows = values.slice(1)

  return rows.map((row) => {
    //@ts-ignore
    const obj: any = { }

    headers.forEach((header, i) => {
      const value = row[i] ?? ''

      if (header === 'month' ||
        header === 'day_of_month' ||
        header === 'sunrise_start') {
        obj[header] = value
        if (header === 'month') {
          obj["month_label"] = dtMonthNumToFullMonth(value)
        }
        return
      }

      const parts = header.split('_')

      if (header.startsWith('asr_first_')) {
        obj.asr = obj.asr || {}
        obj.asr.start = value
        return
      }

      if (header.startsWith('asr_second_')) {
        obj.asr = obj.asr || {}
        obj.asr.start_secondary = value
        return
      }

      const [prayer, ...rest] = parts

      obj[prayer] = obj[prayer] || {}

      const key = rest.join('_')
      obj[prayer][key] = value
    })

    return obj as DailyPrayerTime
  })
}

export function announcementValuesToRecords(
  values: unknown[][] = [],
): AnnouncementRecord[] {
  return sheetsUtilValuesToJson(values as any[][])
    .filter((row) => String(row.id ?? "").trim().length > 0)
    .map((row) => ({
      id: String(row.id),
      title: String(row.title ?? ""),
      message: String(row.message ?? ""),
      image_url: String(row.image_url ?? "").trim() || null,
      start_date: String(row.start_date ?? ""),
      end_date: String(row.end_date ?? ""),
      is_active:
        row.is_active === true ||
        row.is_active === 1 ||
        String(row.is_active).toLowerCase() === "true" ||
        String(row.is_active) === "1",
      priority: Number.isFinite(Number(row.priority))
        ? Number(row.priority)
        : 0,
      created_at: String(row.created_at ?? ""),
      updated_at: String(row.updated_at ?? ""),
    }))
}

export function announcementRecordToRow(
  announcement: AnnouncementRecord,
): Array<string | number | boolean> {
  return ANNOUNCEMENT_SHEET_HEADERS.map((header) => {
    if (header === "image_url") return announcement.image_url ?? ""
    return announcement[header]
  })
}
