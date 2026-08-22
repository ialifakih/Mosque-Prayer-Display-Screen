import Blackout from "@/components/Blackout/Blackout"
import Clock from "@/components/Clock/Clock"
import Date from "@/components/Date/Date"
import MosqueMetadata from "@/components/MosqueMetadata/MosqueMetadata"
import Notice from "@/components/Notice/Notice"
import SunriseJummahTiles from "@/components/SunriseJummahTiles/SunriseJummahTiles"
import PrayerTimes from "@/components/PrayerTimes/PrayerTimes"
import ServiceWorker from "@/components/ServiceWorker/ServiceWorker"
import SlidingBanner from "@/components/SlidingBanner/SlidingBanner"
import {
  getJummahTimes,
  getMetaData,
  getPrayerTimesForUpcomingDays,
  getPrayerTimesForToday,
  getPrayerTimesForTomorrow,
  getConfiguration,
} from "@/services/MosqueDataService"
import type {
  DailyPrayerTime,
  UpcomingPrayerTimes,
} from "@/types/DailyPrayerTimeType"
import type { JummahTimes } from "@/types/JummahTimesType"
import type { MosqueMetadataType } from "@/types/MosqueDataType"
import type { Metadata } from "next"
import UpcomingPrayerDayTiles from "@/components/UpcomingPrayerDayTiles/UpcomingPrayerDayTiles"
import "./prayer-times.css"
import Announcement from "@/components/Announcement/Announcement"
import { ConfigurationJson } from "@/types/ConfigurationType"
import { ConfigurationProvider } from "@/providers/ConfigurationProvider"
import { getPublicMosqueMetadata } from "@/lib/publicMosqueMetadata"

export async function generateMetadata(): Promise<Metadata> {
  const mosqueMetadata = getPublicMosqueMetadata(await getMetaData())

  return {
    title: `${mosqueMetadata.name} Prayer Times | MosqueScreen Project by MosqueOS`,
    description: `${mosqueMetadata.address} | ${mosqueMetadata.name} | MosqueScreen Project by MosqueOS`,
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
  const upcomingPrayerDays: UpcomingPrayerTimes[] =
    await getPrayerTimesForUpcomingDays()

  let slides = [
    <SunriseJummahTiles
      sunrise={today.sunrise_start}
      jummahTimes={jummahTimes}
      key={"sunrise_jummah_times"}
    />,
  ]

  upcomingPrayerDays.forEach((times) => {
    slides.push(
      <UpcomingPrayerDayTiles times={times} key={times.display_date} />,
    )
  })

  return (
    <ConfigurationProvider config={config}>
      <div className="min-h-screen min-w-full bg-mosqueBrand">
        <main className="p-4 md:p-6 lg:p-8">
          <div className="md:grid md:grid-cols-8 md:gap-6 lg:gap-8">
            <header className="flex flex-col gap-5 md:col-span-3 md:gap-7 md:border-r md:border-mosqueBrand-highlight/40 md:pr-6 lg:pr-8">
              <Clock />
              <Date />
              <MosqueMetadata metadata={mosqueMetadata} />
              <div className="hidden md:block md:pt-1">
                <Notice />
              </div>
            </header>
            <section
              aria-label="Prayer times"
              className="pt-5 md:col-span-5 md:pt-0"
            >
              <PrayerTimes today={today} tomorrow={tomorrow} />
            </section>
          </div>
          <div className="pt-5 md:pt-7">
            <SlidingBanner slides={slides} />
          </div>
          <ServiceWorker />
        </main>
        {config.feature.announcement.enabled && <Announcement />}
        <Blackout prayerTimeToday={today} />
      </div>
    </ConfigurationProvider>
  )
}
