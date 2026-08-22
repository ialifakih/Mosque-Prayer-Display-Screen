import {
  ZANZIBAR_PILOT_LOGO,
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

  it("uses the Zanzibar pilot fallback when identity fields are absent", () => {
    expect(getPublicMosqueMetadata({})).toEqual({
      name: "Zanzibar Mosque Pilot",
      address: "Zanzibar, Tanzania",
      website: "",
      logo_url: ZANZIBAR_PILOT_LOGO,
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
      name: "Zanzibar Mosque Pilot",
      address: "Zanzibar, Tanzania",
      website: "",
      logo_url: ZANZIBAR_PILOT_LOGO,
    })
  })
})
