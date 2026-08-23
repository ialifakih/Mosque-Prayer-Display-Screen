import { MosqueMetadataType } from '@/types/MosqueDataType'
import AddAnnouncement
  from '@/components/Admin/Announcement/AddAnnouncement'
import EmbedTodayPrayerTimes
  from "@/components/Admin/Embed/EmbedTodayPrayerTimes/EmbedTodayPrayerTimes"
import type { AnnouncementRecord } from "@/types/AnnouncementType"

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
        <div className="sm:flex sm:items-center ">
          <div className="sm:flex-auto">
            <h1
              className="text-2xl font-semibold leading-6 text-mosqueBrand-onPrimary">
              {metadata.name} Admin Page
            </h1>
            <p
              className="mt-2 text-sm text-mosqueBrand-onPrimary">{metadata.address}</p>
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

