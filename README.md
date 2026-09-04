# Wack The Man

Dan The Man tarzı yan kaydırmalı aksiyon: kayıp kardeşini bulmak için köyden ormana, harabelere ve kuleye ilerle.

## Kontroller

- **← → / A D** — hareket
- **Z / Space / W** — zıpla
- **X / J** — yumruk
- **C** — can iksiri
- **R** — yeniden başlat
- Mobilde ekran butonları (ok / Zıpla / Vur / İksir)

## Çalıştır

```bash
cd wack-the-man
npm install
npm run dev -- --host 127.0.0.1 --port 43210
```

Tarayıcıda: http://127.0.0.1:43210 — **OYUNA GİR** ile başla.

## Bu dilimde ne var

- Başlık ekranı → oyuna giriş
- Uzun harita: Köy · Orman · Harabeler · Kardeş Kulesi
- Envanter: jeton, anahtar, iksir, medalyon
- Düşmanlar: slime, yarasa, asker + kule gardiyanı (boss)
- Kapı (anahtarla açılır), dikenler, platformlar
- Pixel sprite’lar, HUD (can / bölge / envanter), hikâye balonları
- Kamera takibi + mobil kontroller

## GitHub Pages (Heisenberg gibi)

Yeni repo adı: `wack-the-man` (masspop hesabında).

1. Bu klasörün içeriğini o repoya yükle (veya `github-upload/wack-the-man/` paketini kullan)
2. Settings → Pages → Source: **GitHub Actions**
3. Push sonrası kalıcı link:

`https://masspop.github.io/wack-the-man/`

Heisenberg’s Lab ayrı projedir; bu klasör bağımsız oyundur.
