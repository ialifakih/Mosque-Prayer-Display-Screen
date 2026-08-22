import {
  GENERIC_MOSQUE_LOGO,
  getPublicMosqueMetadata,
} from "@/lib/publicMosqueMetadata"

describe("getPublicMosqueMetadata", () => {
  it("preserves mosque identity supplied by the configured data source", () => {
    const metadata = {
      name: "Masjid Pilot Zanzibar",
      address: "Zanzibar, Tanzania",
      website: "masjid.example",
      logo_url: "https://masjid.example/logo.png",
      short_name: "Pilot Masjid",
    }

    expect(getPublicMosqueMetadata(metadata)).toEqual(metadata)
  })

  it("uses only generic public fallbacks when identity fields are absent", () => {
    expect(getPublicMosqueMetadata({})).toEqual({
      name: "Mosque",
      address: "",
      website: "",
      logo_url: GENERIC_MOSQUE_LOGO,
    })
  })

  it("treats whitespace-only identity fields as absent", () => {
    expect(
      getPublicMosqueMetadata({
        name: "  ",
        address: " ",
        website: "\t",
        logo_url: "\n",
      }),
    ).toEqual({
      name: "Mosque",
      address: "",
      website: "",
      logo_url: GENERIC_MOSQUE_LOGO,
    })
  })
})
