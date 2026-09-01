import Blackout from "@/components/Blackout/Blackout"
import Clock from "@/components/Clock/Clock"
import Date from "@/components/Date/Date"
import MosqueMetadata from "@/components/MosqueMetadata/MosqueMetadata"
import PrayerDisplay from "@/components/PrayerDisplay/PrayerDisplay"
import ServiceWorker from "@/components/ServiceWorker/ServiceWorker"
import {
  getJummahTimes,
  getMetaData,
  getPrayerTimesForToday,
  getPrayerTimesForTomorrow,
  getConfiguration,
} from "@/services/MosqueDataService"
import type { DailyPrayerTime } from "@/types/DailyPrayerTimeType"
import type { JummahTimes } from "@/types/JummahTimesType"
import type { MosqueMetadataType } from "@/types/MosqueDataType"
import type { Metadata } from "next"
import "./prayer-times.css"
import "./kiosk.css"
import { ConfigurationJson } from "@/types/ConfigurationType"
import { ConfigurationProvider } from "@/providers/ConfigurationProvider"
import { getPublicMosqueMetadata } from "@/lib/publicMosqueMetadata"

export async function generateMetadata(): Promise<Metadata> {
  const mosqueMetadata = getPublicMosqueMetadata(await getMetaData())

  return {
    title: `${mosqueMetadata.name} | Nyakati za Sala`,
    description: `${mosqueMetadata.name}${mosqueMetadata.address ? ` — ${mosqueMetadata.address}` : ""}. Nyakati za sala na matangazo ya msikiti.`,
  }
}

export default async function Home() {
  const today: DailyPrayerTime = await getPrayerTimesForToday()
  const tomorrow: DailyPrayerTime = await getPrayerTimesForTomorrow()
  const jummahTimes: JummahTimes = await getJummahTimes()
  const mosqueMetadata: MosqueMetadataType = getPublicMosqueMetadata(
    await getMetaData(),
  )
  const config: ConfigurationJson = await getConfiguration()

  return (
    <ConfigurationProvider config={config}>
      <div className="prayer-display-shell">
        <header className="prayer-display-header">
          <div className="prayer-display-header-date">
            <Date />
          </div>
          <div className="prayer-display-header-mosque">
            <MosqueMetadata metadata={mosqueMetadata} />
          </div>
          <div className="prayer-display-header-clock">
            <Clock />
          </div>
        </header>
        <PrayerDisplay
          today={today}
          tomorrow={tomorrow}
          jummahTimes={jummahTimes}
          announcementEnabled={config.feature.announcement.enabled}
        />
        <ServiceWorker />
        <Blackout prayerTimeToday={today} jummahTimes={jummahTimes} />
      </div>
    </ConfigurationProvider>
  )
}
