"use client"

import { ZANZIBAR_PILOT_LOGO } from "@/lib/publicMosqueMetadata"
import { useState } from "react"

export default function MosqueLogo({
  src,
  mosqueName,
}: {
  src?: string
  mosqueName: string
}) {
  const [logoSrc, setLogoSrc] = useState(src?.trim() || ZANZIBAR_PILOT_LOGO)
  const [showBadge, setShowBadge] = useState(false)

  if (showBadge) {
    return (
      <span
        className="display-mosque-logo-fallback"
        role="img"
        aria-label={`${mosqueName} logo`}
      >
        <span className="display-logo-dome" />
        <span className="display-logo-minaret" />
        <span className="display-logo-crescent">☾</span>
      </span>
    )
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className="display-mosque-logo-image"
      src={logoSrc}
      alt={`${mosqueName} logo`}
      onError={() => {
        if (logoSrc === ZANZIBAR_PILOT_LOGO) {
          setShowBadge(true)
          return
        }
        setLogoSrc(ZANZIBAR_PILOT_LOGO)
      }}
    />
  )
}
