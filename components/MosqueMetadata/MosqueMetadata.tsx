import { MosqueMetadataType } from "@/types/MosqueDataType"

export default function MosqueMetadata({
  metadata,
}: {
  metadata: MosqueMetadataType
}) {
  return (
    <div className="display-mosque-metadata">
      <div className="display-mosque-logo">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="max-h-full max-w-full object-contain"
          src={metadata.logo_url}
          alt={`${metadata.name} logo`}
        />
      </div>
      <div className="min-w-0">
        <h1 className="display-mosque-name">
          {metadata.name}
        </h1>
        {metadata.address && (
          <p className="display-mosque-location">
            {metadata.address}
          </p>
        )}
      </div>
    </div>
  )
}
