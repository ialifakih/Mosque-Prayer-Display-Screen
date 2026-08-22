"use client"

import {
  dtHijriNowLocaleCustomFormat,
  dtNowLocaleCustomFormat,
} from "@/lib/datetimeUtils"

export default function Date() {
  const englishDate = dtNowLocaleCustomFormat("dddd D MMMM YYYY")
  const hijriDate = dtHijriNowLocaleCustomFormat("iD iMMMM iYYYY")

  return (
    <div className="display-date">
      <p className="display-date-gregorian">
        {englishDate}
      </p>
      <p className="display-date-hijri">
        {hijriDate}
      </p>
    </div>
  )
}
