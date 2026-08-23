import {
  DailyPrayerTime,
  UpcomingPrayerTimes,
} from '@/types/DailyPrayerTimeType'
import { JummahTimes } from '@/types/JummahTimesType'
import {
  MosqueData,
  MosqueMetadataType,
} from '@/types/MosqueDataType'
import { AnnouncementData } from '@/types/AnnouncementType'
import { find } from 'lodash'
import { sheetsGetMosqueData } from '@/services/GoogleSheetsService'
import { CalendarPrintMonthlyPrayerTimes } from '@/types/CalendarPrintType'
import deepmerge from 'deepmerge'
import {
  ConfigurationJson,
} from '@/types/ConfigurationType'
import { configurationDefaults } from '@/config/ConfigurationDefaults'
import { unflattenObject } from "@/lib/unflattenObject"
import { isSheetsClientEnabled } from "@/services/GoogleSheetsUtil"
import { dtLocale, dtNowLocale } from "@/lib/datetimeUtils"
import { getEligibleLegacyAnnouncement } from "@/services/AnnouncementService"


const DAY_FOR_UPCOMING = parseInt(process.env?.UPCOMING_PRAYER_DAY ?? '3')

function hasPrayerTimes(data: MosqueData): boolean {
  return Array.isArray(data.prayer_times) && data.prayer_times.length > 0
}

async function getMosqueDataFromApi(): Promise<MosqueData> {
  const endpoint = process.env.MOSQUE_API_ENDPOINT?.trim()

  if (!endpoint) {
    throw new Error("MOSQUE_API_ENDPOINT has not been set")
  }

  const response = await fetch(endpoint, {
    next: { revalidate: 30 },
  })

  if (!response.ok) {
    throw new Error(`Mosque API request failed with status ${response.status}`)
  }

  const data = await response.json()
  data.config = unflattenObject(data.config)

  if (!hasPrayerTimes(data)) {
    throw new Error("Mosque API returned no prayer times")
  }

  return data
}

export async function getMosqueData (): Promise<MosqueData> {
  if (isSheetsClientEnabled()) {
    try {
      const sheetsData = await sheetsGetMosqueData()

      if (hasPrayerTimes(sheetsData)) {
        return sheetsData
      }

      console.error(
        "Google Sheets returned no prayer times; falling back to MOSQUE_API_ENDPOINT",
      )
    } catch (error) {
      console.error(
        "Google Sheets unavailable; falling back to MOSQUE_API_ENDPOINT",
        error,
      )
    }
  }

  return getMosqueDataFromApi()
}

export async function getPrayerTimeForDayMonth (
  day_of_month: string,
  month: string,
): Promise<DailyPrayerTime> {
  const { prayer_times } = await getMosqueData()

  return (
    find(prayer_times, {
      day_of_month,
      month,
    }) ?? prayer_times[0]
  )
}

export async function getPrayerTimesForToday (): Promise<DailyPrayerTime> {
  const date = dtNowLocale()

  return getPrayerTimeForDayMonth(date.format('D'), date.format('M'))
}

export async function getPrayerTimesForTomorrow (): Promise<DailyPrayerTime> {
  const date = dtNowLocale().add(1, "day")

  return getPrayerTimeForDayMonth(date.format('D'), date.format('M'))
}

export async function getPrayerTimesForUpcomingDays (
  days: number = DAY_FOR_UPCOMING,
): Promise<UpcomingPrayerTimes[]> {
  let data = []

  for (let index = 1; index <= days; index++) {
    let times: UpcomingPrayerTimes = {
      ...(await getPrayerTimeForDayMonth(
        dtNowLocale().add(index, "day").format("D"),
        dtNowLocale().add(index, "day").format("M"),
      )),
      display_date: dtNowLocale().add(index, "day").format("ddd D MMM"),
      display_day_label: dtNowLocale().add(index, "day").format("ddd"),
    }

    data.push(times)
  }

  return data
}

export async function getCalendarPrintMonthlyPrayerTimesForYear (year: string): Promise<CalendarPrintMonthlyPrayerTimes[]> {
  const prayer_times = await getAllPrayerTimes()
  const map = new Map<string, CalendarPrintMonthlyPrayerTimes>()

  for (const prayer_time of prayer_times) {
    if (!map.has(prayer_time.month)) {
      map.set(prayer_time.month, {
        month: prayer_time.month,
        month_label: prayer_time.month_label,
        prayer_times: [],
      })
    }

    const date = dtLocale(
      `${year}-${prayer_time.month}-${prayer_time.day_of_month}`,
      "YYYY-M-D",
      true,
    )

    if (!date.isValid()) {
      continue
    }

    map.get(prayer_time.month)!.prayer_times.push({
      ...prayer_time,
      date: date.toDate(),
    })
  }

  return Array.from(map.values())
}

export async function getAllPrayerTimes (): Promise<DailyPrayerTime[]> {
  const { prayer_times } = await getMosqueData()

  return prayer_times
}

export async function getJummahTimes (): Promise<JummahTimes> {
  const { jummah_times } = await getMosqueData()

  return jummah_times
}

export async function getMetaData (): Promise<MosqueMetadataType> {
  const { metadata } = await getMosqueData()

  return metadata
}

export async function getConfiguration (): Promise<ConfigurationJson> {
  const { config } = await getMosqueData()
  const mergedConfig = deepmerge(configurationDefaults, config ?? {})
  return mergedConfig
}

export async function getAnnouncement (): Promise<AnnouncementData | null> {
  const configuration = await getConfiguration()
  const announcement = configuration?.announcement ?? null

  if (announcement?.date == null) {
    return null
  }

  announcement.is_visible =
    getEligibleLegacyAnnouncement(announcement, dtNowLocale()) != null

  return announcement
}
