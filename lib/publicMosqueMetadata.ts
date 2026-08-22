import { MosqueMetadataType } from "@/types/MosqueDataType"

export const GENERIC_MOSQUE_LOGO =
  "/mosqueos-logo/android-chrome-256x256.png"

export function getPublicMosqueMetadata(
  metadata: MosqueMetadataType,
): MosqueMetadataType {
  return {
    ...metadata,
    name: metadata.name?.trim() || "Mosque",
    address: metadata.address?.trim() || "",
    website: metadata.website?.trim() || "",
    logo_url: metadata.logo_url?.trim() || GENERIC_MOSQUE_LOGO,
  }
}
