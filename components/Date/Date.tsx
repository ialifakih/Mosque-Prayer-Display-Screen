"use client"

import { useEffect, useState } from "react"
import {
  dtHijriNowLocaleCustomFormat,
  dtNowLocaleCustomFormat,
} from "@/lib/datetimeUtils"

type DisplayDate = {
  english: string
  hijri: string
}

export default function Date() {
  const [date, setDate] = useState<DisplayDate | null>(null)

  useEffect(() => {
    const updateDate = () => {
      setDate({
        english: dtNowLocaleCustomFormat("dddd D MMMM YYYY"),
        hijri: dtHijriNowLocaleCustomFormat("iD iMMMM iYYYY"),
      })
    }

    updateDate()
    const interval = window.setInterval(updateDate, 60_000)
    return () => window.clearInterval(interval)
  }, [])

  return (
    <div className="display-date">
      <p className="display-date-gregorian">{date?.english ?? "—"}</p>
      <p className="display-date-hijri">{date?.hijri ?? "—"}</p>
    </div>
  )
}
