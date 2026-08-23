import { describe, expect, it } from '@jest/globals';
import {
  ANNOUNCEMENT_SHEET_HEADERS,
  announcementRecordToRow,
  announcementValuesToRecords,
  sheetsUtilFlattenedJsonToRows,
  sheetsUtilValuesToJson, sheetsUtilValuesToNestedJson,
} from './GoogleSheetsUtil'

describe("GoogleSheetsUtil", () => {
  it("maps the Announcements worksheet schema to typed records", () => {
    const values = [
      [...ANNOUNCEMENT_SHEET_HEADERS],
      [
        "notice-1",
        "Community notice",
        "Classes resume this week.",
        "",
        "2026-08-22",
        "2026-08-24",
        "TRUE",
        "5",
        "2026-08-01T08:00:00.000Z",
        "2026-08-02T08:00:00.000Z",
      ],
    ]

    const [record] = announcementValuesToRecords(values)

    expect(record).toEqual({
      id: "notice-1",
      title: "Community notice",
      message: "Classes resume this week.",
      image_url: null,
      start_date: "2026-08-22",
      end_date: "2026-08-24",
      is_active: true,
      priority: 5,
      created_at: "2026-08-01T08:00:00.000Z",
      updated_at: "2026-08-02T08:00:00.000Z",
    })
    expect(announcementRecordToRow(record)).toEqual([
      ...values[1].slice(0, 6),
      true,
      5,
      ...values[1].slice(8),
    ])
  })

  it("should convert JSON data into rows for the Google Sheets API", () => {
    const json = {
      name: "John",
      age: 30,
      address: {
        street: "123 Main St",
        city: "Anytown",
        state: "CA"
      }
    }
    const rows = sheetsUtilFlattenedJsonToRows(json)
    expect(rows).toEqual([
      ["key", "value"],
      ["name", "John"],
      ["age", 30],
      ["address.street", "123 Main St"],
      ["address.city", "Anytown"],
      ["address.state", "CA"]
    ])
  })

  it("should convert flattened rows into JSON schema", () => {
    const values = [
      ["key", "value"],
      ["name", "John"],
      ["age", 30],
      ["address.street", "123 Main St"],
      ["address.city", "Anytown"],
      ["address.state", "CA"]
    ]
    const result = sheetsUtilValuesToNestedJson(values)
    expect(result).toEqual({
      name: "John",
      age: 30,
      address: {
        street: "123 Main St",
        city: "Anytown",
        state: "CA"
      }
    });
  })
})
