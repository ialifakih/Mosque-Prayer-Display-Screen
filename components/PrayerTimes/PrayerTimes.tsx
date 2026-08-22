import { dtFormatTimeTo12h } from "@/lib/datetimeUtils"
import type { PrayerTime } from "@/types/DailyPrayerTimeType"

export type PrayerDisplayRow = {
  label: string
  data: PrayerTime
  tomorrow: PrayerTime
}

export default function PrayerTimes({
  prayers,
  nextPrayerTime,
}: {
  prayers: PrayerDisplayRow[]
  nextPrayerTime: { today: boolean; prayerIndex: number }
}) {
  return (
    <table className="prayer-table">
      <thead>
        <tr>
          <th>Sala</th>
          <th>Mwanzo</th>
          <th>Jamaa</th>
        </tr>
      </thead>
      <tbody>
        {prayers.map((prayer, index) => {
          const isNextPrayer = nextPrayerTime.prayerIndex === index

          return (
            <tr
              key={prayer.label}
              className={isNextPrayer ? "is-next-prayer" : undefined}
            >
              <th scope="row">
                <span>{prayer.label}</span>
              </th>
              <td className="tabular-nums">
                {dtFormatTimeTo12h(prayer.data.start)}
                {prayer.data.start_secondary &&
                prayer.data.start !== prayer.data.start_secondary ? (
                  <span className="secondary-start-time">
                    {dtFormatTimeTo12h(prayer.data.start_secondary)}
                  </span>
                ) : null}
              </td>
              <td className="tabular-nums font-bold">
                {dtFormatTimeTo12h(prayer.data.congregation_start)}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
