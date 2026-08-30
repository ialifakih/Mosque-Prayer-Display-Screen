import { MosqueMetadataType } from "@/types/MosqueDataType"
import MosqueLogo from "@/components/MosqueMetadata/MosqueLogo"

export default function MosqueMetadata({
  metadata,
}: {
  metadata: MosqueMetadataType
}) {
  return (
    <div className="display-mosque-metadata">
      <div className="display-mosque-logo" aria-label={`${metadata.name} logo`}>
        <MosqueLogo src={metadata.logo_url} mosqueName={metadata.name} />
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
