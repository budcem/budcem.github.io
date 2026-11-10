// Büdcəm: tətbiq fayllarını keşdə saxlayır ki, internet olmadan da açılsın
const CACHE = "budcem-v39";
// Versiyalı kitabxanalar (Firebase 10.14.1, SheetJS) heç vaxt dəyişmir: ayrıca keşdə qalır, yeniləmədə silinmir
const LIB = "budcem-lib-v1";
const FILES = ["./", "./index.html", "./manifest.json", "./apple-touch-icon.png", "./icon-192.png", "./icon-512.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener("activate", e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE && k !== LIB).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener("fetch", e => {
  if (e.request.method !== "GET") return;
  const url = new URL(e.request.url);
  // Firestore/giriş sorğularına toxunulmur
  if (url.host === "www.gstatic.com" || url.host === "cdnjs.cloudflare.com") {
    // Kitabxanalar: əvvəlcə keş (dərhal), yoxdursa şəbəkədən alıb saxla
    e.respondWith(caches.open(LIB).then(c => c.match(e.request).then(hit => hit || fetch(e.request).then(r => { if (r.ok || r.type === "opaque") c.put(e.request, r.clone()); return r; }))));
    return;
  }
  if (url.host !== location.host) return;
  // Öz fayllarımız: əvvəlcə şəbəkə (yeniləmələr dərhal görünür). Şəbəkə 3 saniyədən çox ləngisə, keşdəki nüsxə açılır,
  // yeni versiya isə arxa planda keşə yazılır.
  const net = fetch(new Request(e.request.url, { cache: "no-cache" })).then(r => { if (r.ok) { const copy = r.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)); } return r; });
  const cached = () => caches.match(e.request).then(r => r || caches.match("./index.html"));
  e.respondWith(new Promise(resolve => {
    let done = false;
    const finish = r => { if (!done && r) { done = true; resolve(r); } };
    const timer = setTimeout(() => cached().then(r => r ? finish(r) : net.then(finish, () => {})), 3000);
    net.then(r => { clearTimeout(timer); finish(r); }, () => { clearTimeout(timer); cached().then(r => finish(r || Response.error())); });
  }));
});
