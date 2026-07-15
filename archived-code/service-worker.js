const CACHE_NAME = "onset-cache-v1"
const urlsToCache = [
  "./index.html",
  "./style.css",
  "./app.js",
  "./manifest.json",
  "./logo-192.png",
  "./logo-512.png",
  "./organigramme.png",
  "./intro.mp4",
]

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(urlsToCache)))
})

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keyList) =>
      Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) return caches.delete(key)
        })
      )
    )
  )
})

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => response || fetch(event.request))
  )
})
