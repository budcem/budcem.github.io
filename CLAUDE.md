# Büdcəm

Sadə şəxsi xərc və gəlir izləmə PWA-sı. İstifadəçi Azərbaycan dilində yazır: cavablar və tətbiqin bütün mətnləri Azərbaycan dilində olmalıdır. İstifadəçi "çox qarışıq sistem istəmirəm" deyib, ona görə interfeys sadə qalmalıdır.

## Struktur
- `src/app.html` — tətbiqin bütün kodu (HTML + CSS + JS, bir fayl). Dəyişiklikləri burada edin.
- `src/build.py` — `src/app.html`-dən kökdəki `index.html`-i yaradır. Hər dəyişiklikdən sonra `python3 src/build.py` işlədin və hər iki faylı commit edin.
- `index.html`, `manifest.json`, `sw.js`, ikonlar — GitHub Pages-də yayımlanan fayllar (main budağı, kök qovluq): https://budcem.github.io/ (repo budcem/budcem.github.io; köhnə elshanmov47/budcem ünvanı 2026-11-02 köçürüldü)
- `sw.js` — oflayn işləmə üçün keş. Faylların siyahısı dəyişəndə `CACHE` versiyasını artırın.

## Məlumat
- Ayrıca saytda (GitHub Pages) hər kəs öz hesabı ilə daxil olur: Firebase layihəsi `budcem-1e99e` (Spark, pulsuz), Email/Password girişi. İstifadəçi adı `ad@budcem.app` e-poçtuna çevrilir. Məlumat Firestore-da `users/{uid}` sənədində (meta) və `users/{uid}/records` kolleksiyasındadır. Qayda: yalnız `request.auth.uid == uid`. Firebase SDK (compat 10.14.1) gstatic-dən yüklənir; sandboxda gstatic bloklanıb, test üçün `npm pack firebase@10.14.1` və Playwright route istifadə edin.
- Yeni hesaba telefondakı köhnə `localStorage` məlumatı (`budcem.v1`) bir dəfə köçürülür (`budcem.uploadedTo`), localStorage silinmir. Hesab doludursa, Xülasədə "Hesaba əlavə et" kartı çıxır. Firebase yüklənməsə (ilk açılış internetsiz), tətbiq köhnə qaydada yalnız telefonda işləyir.
- Saxlanılan sahələr: `categories`, `records`, `reminders`, `done`, `plan`, `cards`, `profile` ({name, photo} — kiçildilmiş JPEG data URI), `catsVersion`. Köhnə məlumatı pozmayın: yeni sahə əlavə edəndə boş olduqda standart dəyər verin.
- Ayarlar (yuxarıdakı profil/dişli düyməsi) pəncərəsində: ad və profil şəkli, tünd rejim, hesab (e-poçt əlavə et, şifrəni dəyiş, bərpa kodunu dəyiş, çıxış) və JSON ehtiyat nüsxə (yüklə / bərpa et).
- Şifrələmə (bulud): məlumat telefonda AES-GCM ilə şifrələnir, Firestore-da yalnız `enc: {iv, ct}` (+ meta-da açıq `catsVersion`) saxlanılır. Təsadüfi açar `users/{uid}/keys/main`-də iki dəfə bağlanıb: parolla (`pw`) və istifadəçinin özünün təyin etdiyi bərpa kodu ilə (`rc`), PBKDF2. Açar telefonda `budcem.key.<uid>`-də qalır (çıxışda silinmir), ona görə parol e-poçtla sıfırlansa, həmin telefonda yeni parolla avtomatik yenidən bağlanır (`syncPass`). Açarı olmayan cihazda sıfırlanmış parolla girəndə bərpa kodu soruşulur. Köhnə şifrəsiz yazılar girişdə şifrələnir (`encryptOld`).
- Taksit kartları: `cards` sahəsi `[{id, name, limit, opening}]` (meta sənəddə). Kartla alış adi xərcdir: `pay: "card"` və `cardId` (bir dəfə sayılır). Karta pul köçürmə `kind: "cardpay"` və `cardId`: xərc deyil, hesabatlarda sayılmır, yalnız həmin kartın borcunu azaldır. `cardId` olmayan köhnə yazılar `card1`-ə aiddir; köhnə `cardOpening` ilk kartın `opening`-inə köçürülür. Kart borcu = opening + kartla xərclər − ödənişlər; qalan borcu düzəltmək fərqi `opening`-ə yazır. Əməliyyatı olan kart silinmir.
- Hesablar (2026-11-02): `acc: "cash"` nağd hesabdır; `acc` olmayan bütün yazılar (köhnələr də) "bank" (Bank kartı) hesabındadır. Köçürmə `kind: "transfer"`, `from`/`to` (bank|cash): xərc/gəlir deyil, hesabatlarda sayılmır, ümumi Qalığı dəyişmir. Karta ödəniş də `acc` daşıya bilər. Kommunal xərcində istəyə bağlı `sub` (İşıq/Su/Qaz).
- Rəylər: Ayarlar → "Bizə müraciət edin" Firestore `feedback` kolleksiyasına {kind, text, uid, user, name, created, ua} yazır (şifrəsiz, admin konsolda oxuyur). Qayda: daxil olmuş istifadəçi öz uid-i ilə `create` və yalnız öz mesajlarını `read` edə bilər. Admin cavabı konsolda `reply` sahəsinə yazır; tətbiq "Müraciətlərim"də göstərir; oxunmamış cavab varsa ayarlar düyməsində və "Bizə müraciət edin"də qırmızı zəng görünür (`budcem.seenReplies`).
- Yenilik bildirişi: `NEWS` sabiti ({id, title, text}) Xülasədə bir dəfə göstərilir (`budcem.newsSeen`); yeni xəbər üçün id və mətni dəyişin.
- Geri al: `store.history` (son 30 əməliyyat, yalnız yazılar: əlavə, dəyişiklik, silmə; köçürmə və karta ödəniş də daxil). Ayarlarda "Silkələyəndə geri al" (`budcem.shakeUndo`, iOS-da hər açılışda bir dəfə düymə ilə icazə lazımdır). Silkələmə yalnız son əməliyyatı geri alır (`store.shakeArmed`: yeni əməliyyatda açılır, geri alınanda bağlanır). Kateqoriya, plan və xatırladıcı dəyişiklikləri geri alınmır.
- Kodda `window.claude` yoxlanışları claude.ai artifact versiyası üçündür; ayrıca saytda onlar işləmir və localStorage istifadə olunur.

## Əsas funksiyalar
Xərclər 4 başlıqdan birinə aiddir (Ehtiyac, İstək, İnvestisiya, Kredit) və redaktə olunan xərc maddəsinə. Gəlirlər. Aylıq xülasə və təqvim (gün-gün xərc), ödəniş xatırladıcıları (bir ödəniş ayda bir neçə gün xatırladıla bilər), Plan bölməsi (gəlir planı, başlıq və maddə limitləri), Excel hesabatı (SheetJS cdnjs-dən yüklənir), tünd rejim açarı.

## Yoxlama
Dəyişiklikdən sonra Playwright ilə iPhone ölçüsündə (390px) açıb əsas axınları yoxlayın: xərc əlavə etmək, xülasə, plan, təqvim. Səhifə üfüqi sürüşməməlidir.
