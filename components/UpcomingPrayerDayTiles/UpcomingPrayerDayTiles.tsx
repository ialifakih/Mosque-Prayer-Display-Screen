import { UpcomingPrayerTimes } from "@/types/DailyPrayerTimeType"
import { dtFormatTimeTo12h } from "@/lib/datetimeUtils"

export default function UpcomingPrayerDayTiles({
  times,
}: {
  times: UpcomingPrayerTimes
}) {
  return (
    <dl
      className={`grid justify-items-stretch lg:grid-cols-6 text-center gap-0 md:gap-3`}
    >
      <div className="bg-mosqueBrand-primaryAlt text-white p-4 lg:p-6 lg:col-auto">
        <dt className="text-sm lg:text-2xl font-medium">
          Jamaa times for
        </dt>
        <dd className="mt-2 text-xl lg:text-3xl font-bold tracking-tight">
          {times.display_date}
        </dd>
      </div>
      <div className="bg-mosqueBrand-primaryAlt text-white p-4 lg:p-6 lg:col-auto">
        <dt className="text-sm lg:text-2xl font-medium">
          Fajr الفجر ({times.display_day_label})
        </dt>
        <dd className="mt-2 text-xl lg:text-3xl font-bold tracking-tight">
          {dtFormatTimeTo12h(times.fajr.congregation_start)}
        </dd>
      </div>
      <div className="bg-mosqueBrand-primaryAlt text-white p-4 lg:p-6 lg:col-auto">
        <dt className="text-sm lg:text-2xl font-medium">
          Dhuhr الظهر ({times.display_day_label})
        </dt>
        <dd className="mt-2 text-xl lg:text-3xl font-bold tracking-tight">
          {dtFormatTimeTo12h(times.zuhr.congregation_start)}
        </dd>
      </div>
      <div className="bg-mosqueBrand-primaryAlt text-white p-4 lg:p-6 lg:col-auto">
        <dt className="text-sm lg:text-2xl font-medium">
          Asr العصر ({times.display_day_label})
        </dt>
        <dd className="mt-2 text-xl lg:text-3xl font-bold tracking-tight">
          {dtFormatTimeTo12h(times.asr.congregation_start)}
        </dd>
      </div>
      <div className="bg-mosqueBrand-primaryAlt text-white p-4 lg:p-6 lg:col-auto">
        <dt className="text-sm lg:text-2xl font-medium">
          Maghrib المغرب ({times.display_day_label})
        </dt>
        <dd className="mt-2 text-xl lg:text-3xl font-bold tracking-tight">
          {dtFormatTimeTo12h(times.maghrib.congregation_start)}
        </dd>
      </div>
      <div className="bg-mosqueBrand-primaryAlt text-white p-4 lg:p-6 lg:col-auto">
        <dt className="text-sm lg:text-2xl font-medium">
          Isha العشاء ({times.display_day_label})
        </dt>
        <dd className="mt-2 text-xl lg:text-3xl font-bold tracking-tight">
          {dtFormatTimeTo12h(times.isha.congregation_start)}
        </dd>
      </div>
    </dl>
  )
}
