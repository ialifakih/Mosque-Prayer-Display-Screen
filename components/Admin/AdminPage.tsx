import { MosqueMetadataType } from '@/types/MosqueDataType'
import AddAnnouncement
  from '@/components/Admin/Announcement/AddAnnouncement'
import EmbedTodayPrayerTimes
  from "@/components/Admin/Embed/EmbedTodayPrayerTimes/EmbedTodayPrayerTimes"
import type { AnnouncementRecord } from "@/types/AnnouncementType"
import Link from "next/link"

export default function AdminPage ({
  metadata,
  announcements,
  today,
}: {
  metadata: MosqueMetadataType
  announcements: AnnouncementRecord[]
  today: string
}) {

  return (

    <div className="">
      <div className="py-10 px-4 sm:px-6 lg:px-8 bg-mosqueBrand-primary">
        <div className="sm:flex sm:items-center sm:justify-between gap-4">
          <div className="sm:flex-auto">
            <h1
              className="text-2xl font-semibold leading-6 text-mosqueBrand-onPrimary">
              {metadata.name} Admin Page
            </h1>
            <p
              className="mt-2 text-sm text-mosqueBrand-onPrimary">{metadata.address}</p>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-6 sm:flex-none">
            <Link
              href="/status"
              className="inline-flex items-center rounded-md bg-white px-4 py-2 text-sm font-semibold text-mosqueBrand-primary shadow-sm hover:bg-gray-100 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
            >
              System Status
            </Link>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-6 bg-white px-4 py-10 sm:px-6 lg:px-8">
        <AddAnnouncement
          initialAnnouncements={announcements}
          today={today}
        />
        <div className="flex w-full max-w-6xl justify-center">
          <EmbedTodayPrayerTimes/>
        </div>
      </div>

    </div>
  )
}
