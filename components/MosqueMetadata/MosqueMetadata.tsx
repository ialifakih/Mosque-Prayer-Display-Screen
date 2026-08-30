import { MosqueMetadataType } from "@/types/MosqueDataType"

export default function MosqueMetadata({
  metadata,
}: {
  metadata: MosqueMetadataType
}) {
  const hasLogo = Boolean(metadata.logo_url?.trim())

  return (
    <div className="display-mosque-metadata">
      <div className="display-mosque-logo" aria-label={`${metadata.name} logo`}>
        {hasLogo ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            className="max-h-full max-w-full object-contain"
            src={metadata.logo_url}
            alt={`${metadata.name} logo`}
          />
        ) : (
          <span className="display-mosque-logo-fallback" aria-hidden="true">
            <span className="display-logo-dome" />
            <span className="display-logo-minaret" />
            <span className="display-logo-crescent">☾</span>
          </span>
        )}
      </div>
      <div className="min-w-0">
        <h1 className="display-mosque-name">{metadata.name}</h1>
        {metadata.address && (
          <p className="display-mosque-location">{metadata.address}</p>
        )}
      </div>
    </div>
  )
}
