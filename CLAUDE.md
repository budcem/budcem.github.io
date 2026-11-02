# Büdcəm

Sadə şəxsi xərc və gəlir izləmə PWA-sı. İstifadəçi Azərbaycan dilində yazır: cavablar və tətbiqin bütün mətnləri Azərbaycan dilində olmalıdır. İstifadəçi "çox qarışıq sistem istəmirəm" deyib, ona görə interfeys sadə qalmalıdır.

## Struktur
- `src/app.html` — tətbiqin bütün kodu (HTML + CSS + JS, bir fayl). Dəyişiklikləri burada edin.
- `src/build.py` — `src/app.html`-dən kökdəki `index.html`-i yaradır. Hər dəyişiklikdən sonra `python3 src/build.py` işlədin və hər iki faylı commit edin.
- `index.html`, `manifest.json`, `sw.js`, ikonlar — GitHub Pages-də yayımlanan fayllar (main budağı, kök qovluq): https://elshanmov47.github.io/budcem/
- `sw.js` — oflayn işləmə üçün keş. Faylların siyahısı dəyişəndə `CACHE` versiyasını artırın.

## Məlumat
- Ayrıca saytda (GitHub Pages) hər kəs öz hesabı ilə daxil olur: Firebase layihəsi `budcem-1e99e` (Spark, pulsuz), Email/Password girişi. İstifadəçi adı `ad@budcem.app` e-poçtuna çevrilir. Məlumat Firestore-da `users/{uid}` sənədində (meta) və `users/{uid}/records` kolleksiyasındadır. Qayda: yalnız `request.auth.uid == uid`. Firebase SDK (compat 10.14.1) gstatic-dən yüklənir; sandboxda gstatic bloklanıb, test üçün `npm pack firebase@10.14.1` və Playwright route istifadə edin.
- Yeni hesaba telefondakı köhnə `localStorage` məlumatı (`budcem.v1`) bir dəfə köçürülür (`budcem.uploadedTo`), localStorage silinmir. Hesab doludursa, Xülasədə "Hesaba əlavə et" kartı çıxır. Firebase yüklənməsə (ilk açılış internetsiz), tətbiq köhnə qaydada yalnız telefonda işləyir.
- Saxlanılan sahələr: `categories`, `records`, `reminders`, `done`, `plan`, `cards`, `catsVersion`. Köhnə məlumatı pozmayın: yeni sahə əlavə edəndə boş olduqda standart dəyər verin.
- Kateqoriyalar bölməsində JSON ehtiyat nüsxə (yüklə / bərpa et) var.
- Taksit kartları: `cards` sahəsi `[{id, name, limit, opening}]` (meta sənəddə). Kartla alış adi xərcdir: `pay: "card"` və `cardId` (bir dəfə sayılır). Karta pul köçürmə `kind: "cardpay"` və `cardId`: xərc deyil, hesabatlarda sayılmır, yalnız həmin kartın borcunu azaldır. `cardId` olmayan köhnə yazılar `card1`-ə aiddir; köhnə `cardOpening` ilk kartın `opening`-inə köçürülür. Kart borcu = opening + kartla xərclər − ödənişlər; qalan borcu düzəltmək fərqi `opening`-ə yazır. Əməliyyatı olan kart silinmir.
- Kodda `window.claude` yoxlanışları claude.ai artifact versiyası üçündür; ayrıca saytda onlar işləmir və localStorage istifadə olunur.

## Əsas funksiyalar
Xərclər 4 başlıqdan birinə aiddir (Ehtiyac, İstək, İnvestisiya, Kredit) və redaktə olunan xərc maddəsinə. Gəlirlər. Aylıq xülasə və təqvim (gün-gün xərc), ödəniş xatırladıcıları (bir ödəniş ayda bir neçə gün xatırladıla bilər), Plan bölməsi (gəlir planı, başlıq və maddə limitləri), Excel hesabatı (SheetJS cdnjs-dən yüklənir), tünd rejim açarı.

## Yoxlama
Dəyişiklikdən sonra Playwright ilə iPhone ölçüsündə (390px) açıb əsas axınları yoxlayın: xərc əlavə etmək, xülasə, plan, təqvim. Səhifə üfüqi sürüşməməlidir.
