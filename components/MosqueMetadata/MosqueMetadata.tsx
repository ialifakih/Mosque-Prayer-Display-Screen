import { MosqueMetadataType } from "@/types/MosqueDataType"

export default function MosqueMetadata({
  metadata,
}: {
  metadata: MosqueMetadataType
}) {
  return (
    <div className="flex flex-col items-center gap-3 text-center text-mosqueBrand-onPrimary md:flex-row md:items-start md:gap-4 md:text-left">
      <div className="flex h-20 w-20 flex-shrink-0 items-center justify-center border border-mosqueBrand-highlight/50 bg-mosqueBrand-primaryAlt p-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="mx-auto max-h-16 max-w-full object-contain"
          src={metadata.logo_url}
          alt={`${metadata.name} logo`}
        />
      </div>
      <div>
        <h2 className="text-2xl font-bold leading-tight md:text-3xl">
          {metadata.name}
        </h2>
        {metadata.address && (
          <p className="mx-5 mt-2 text-lg leading-snug text-mosqueBrand-onPrimary/90 md:mx-0">
            {metadata.address}
          </p>
        )}
        {metadata.website && (
          <p className="mt-1 text-lg leading-snug text-mosqueBrand-highlight">
            {metadata.website}
          </p>
        )}
      </div>
    </div>
  )
}
