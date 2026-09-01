const CACHE_NAME = "mosque-display-v2"
const LEGACY_CACHE_NAME = "v1"

async function cacheSuccessfulResponse(request, response) {
  if (!response || !response.ok) return

  const cache = await caches.open(CACHE_NAME)
  await cache.put(request, response.clone())
}

async function matchLastKnownGood(request) {
  const currentCache = await caches.open(CACHE_NAME)
  const currentMatch = await currentCache.match(request)
  if (currentMatch?.ok) return currentMatch

  if (request.mode === "navigate") {
    const currentHome = await currentCache.match("/")
    if (currentHome?.ok) return currentHome
  }

  const legacyCache = await caches.open(LEGACY_CACHE_NAME)
  const legacyMatch = await legacyCache.match(request)
  if (legacyMatch?.ok) return legacyMatch

  if (request.mode === "navigate") {
    const legacyHome = await legacyCache.match("/")
    if (legacyHome?.ok) return legacyHome
  }

  return null
}

self.addEventListener("install", (event) => {
  self.skipWaiting()

  // Seed a known-good copy of the public display as soon as the worker installs.
  // A failed seed must never block installation.
  event.waitUntil(
    (async () => {
      try {
        const response = await fetch("/", { cache: "no-store" })
        if (response.ok) {
          await cacheSuccessfulResponse("/", response)
        }
      } catch (error) {
        console.warn("Unable to seed mosque display cache", error)
      }
    })(),
  )
})

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener("fetch", (event) => {
  const request = event.request
  if (request.method !== "GET") return

  const url = new URL(request.url)
  if (url.origin !== self.location.origin) return

  // Health/data/admin/auth requests must reflect the real server state.
  // Do not let a cached API response make the display think the backend is healthy.
  if (
    url.pathname.startsWith("/api/") ||
    url.pathname.startsWith("/admin") ||
    url.pathname.startsWith("/status")
  ) {
    return
  }

  event.respondWith(
    (async () => {
      try {
        const response = await fetch(request)

        if (response.ok) {
          await cacheSuccessfulResponse(request, response)
          return response
        }

        const cached = await matchLastKnownGood(request)
        return cached ?? response
      } catch (error) {
        const cached = await matchLastKnownGood(request)
        if (cached) return cached
        throw error
      }
    })(),
  )
})
