import { JummahTimes } from "@/types/JummahTimesType"
import { dtFormatTimeTo12h } from "@/lib/datetimeUtils"

export default function SunriseJummahTiles({
  sunrise,
  jummahTimes = [],
}: {
  sunrise: string
  jummahTimes: JummahTimes
}) {
  return (
    <dl
      className={`grid justify-items-stretch lg:grid-cols-${
        jummahTimes.length + 1
      } text-center gap-0 md:gap-3`}
    >
      <div className="border-t-2 border-mosqueBrand-highlight bg-mosqueBrand-primaryAlt p-4 text-mosqueBrand-onPrimary lg:col-auto lg:p-6">
        <dt className="text-sm lg:text-2xl font-medium">Kuchomoza Jua</dt>
        <dd className="mt-1 text-xl lg:text-5xl font-bold tracking-tight">
          {dtFormatTimeTo12h(sunrise)}
        </dd>
      </div>

      {jummahTimes.map((jummahTime, index) => (
        <div
          className="border-t-2 border-mosqueBrand-highlight bg-mosqueBrand-primaryAlt p-4 text-mosqueBrand-onPrimary lg:col-auto lg:p-6"
          key={index}
        >
          <dt className="text-sm lg:text-2xl font-medium">
            {jummahTime.label.replace(/Jummah/i, "Swala ya Ijumaa")}
          </dt>
          <dd className="mt-1 text-xl lg:text-5xl font-bold tracking-tight">
            {dtFormatTimeTo12h(jummahTime.time)}
          </dd>
        </div>
      ))}
    </dl>
  )
}
