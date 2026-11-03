// Büdcəm: tətbiq fayllarını keşdə saxlayır ki, internet olmadan da açılsın
const CACHE = "budcem-v34";
const FILES = ["./", "./index.html", "./manifest.json", "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  // Yalnız öz fayllarımız və kitabxanalar (Firebase, SheetJS) keşlənir; Firestore/giriş sorğularına toxunulmur
  const host = new URL(e.request.url).host;
  if (host !== location.host && host !== "www.gstatic.com" && host !== "cdnjs.cloudflare.com") return;
  // Əvvəlcə şəbəkə, alınmasa keş: yeniləmələr dərhal görünür
  e.respondWith(
    // Öz fayllarımız üçün brauzerin HTTP keşini keçir ki, yeni versiya dərhal gəlsin
    fetch(new URL(e.request.url).origin === location.origin ? new Request(e.request.url, { cache: "no-cache" }) : e.request).then(r => { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); return r; })
      .catch(() => caches.match(e.request).then(r => r || caches.match("./index.html")))
  );
});
