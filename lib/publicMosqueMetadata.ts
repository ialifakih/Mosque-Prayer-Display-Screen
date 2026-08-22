import { MosqueMetadataType } from "@/types/MosqueDataType"

export const ZANZIBAR_PILOT_LOGO = "/zanzibar-mosque-pilot.svg"

export function getPublicMosqueMetadata(
  metadata: MosqueMetadataType,
): MosqueMetadataType {
  return {
    ...metadata,
    name: metadata.name?.trim() || "Zanzibar Mosque Pilot",
    address: metadata.address?.trim() || "Zanzibar, Tanzania",
    website: metadata.website?.trim() || "",
    logo_url: metadata.logo_url?.trim() || ZANZIBAR_PILOT_LOGO,
  }
}
