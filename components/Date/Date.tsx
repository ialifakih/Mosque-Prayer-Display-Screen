"use client"

import {
  dtHijriNowLocaleCustomFormat,
  dtNowLocaleCustomFormat,
} from "@/lib/datetimeUtils"

export default function Date() {
  const englishDate = dtNowLocaleCustomFormat("dddd D MMMM YYYY")
  const hijriDate = dtHijriNowLocaleCustomFormat("iD iMMMM iYYYY")

  return (
    <div className="text-center text-mosqueBrand-onPrimary md:text-left">
      <p className="text-2xl font-bold leading-tight md:text-4xl lg:text-5xl">
        {englishDate}
      </p>
      <p className="mt-2 text-xl font-medium text-mosqueBrand-highlight md:mt-3 md:text-3xl lg:text-4xl">
        {hijriDate}
      </p>
    </div>
  )
}
