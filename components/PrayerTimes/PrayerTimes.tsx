import { dtFormatTimeTo12h } from "@/lib/datetimeUtils"
import type { PrayerTime } from "@/types/DailyPrayerTimeType"

export type PrayerDisplayRow = {
  label: string
  arabic?: string
  icon?: string
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
          <th>Sala / Prayer</th>
          <th>Mwanzo / Adhan</th>
          <th>Jamaa / Iqamah</th>
        </tr>
      </thead>
      <tbody>
        {prayers.map((prayer, index) => {
          const isNextPrayer = nextPrayerTime.prayerIndex === index
          const displayPrayer =
            isNextPrayer && !nextPrayerTime.today ? prayer.tomorrow : prayer.data

          return (
            <tr
              key={prayer.label}
              className={isNextPrayer ? "is-next-prayer" : undefined}
            >
              <th scope="row">
                <span className="prayer-name-layout">
                  <span className="prayer-row-icon" aria-hidden="true">
                    {prayer.icon}
                  </span>
                  <span className="prayer-name-copy">
                    <span className="prayer-row-main">{prayer.label}</span>
                    {prayer.arabic && (
                      <span className="prayer-row-arabic" dir="rtl">
                        {prayer.arabic}
                      </span>
                    )}
                    {isNextPrayer && !nextPrayerTime.today && (
                      <span className="prayer-row-tomorrow">Kesho</span>
                    )}
                  </span>
                </span>
              </th>
              <td className="tabular-nums">
                {dtFormatTimeTo12h(displayPrayer.start)}
                {displayPrayer.start_secondary &&
                displayPrayer.start !== displayPrayer.start_secondary ? (
                  <span className="secondary-start-time">
                    Hanafi {dtFormatTimeTo12h(displayPrayer.start_secondary)}
                  </span>
                ) : null}
              </td>
              <td className="tabular-nums font-bold">
                {dtFormatTimeTo12h(displayPrayer.congregation_start)}
              </td>
            </tr>
          )
        })}
      </tbody>
    </table>
  )
}
