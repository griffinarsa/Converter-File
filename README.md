# Formatku

Konverter multi-format dengan proses lokal di browser untuk format ringan serta API lokal untuk format yang membutuhkan LibreOffice, FFmpeg, Poppler, atau HEIC codec. File server disimpan di folder temp selama konversi dan dihapus setelahnya.

## Dukungan format

- **Gambar:** JPG/JPEG, PNG, WebP, GIF, BMP, TIFF, HEIC/HEIF, AVIF, SVG; output JPG, PNG, WebP, AVIF, TIFF, GIF, atau PDF. HEIC/HEIF didekode dengan converter khusus sebelum diproses.
- **Dokumen/presentasi:** DOC/DOCX, ODT, RTF, TXT, HTML, MD, PPT/PPTX, dan PDF; output utama PDF, DOCX, ODT, RTF, TXT, HTML. Dokumen dan presentasi juga dapat dirender menjadi JPG, PNG, WebP, AVIF, TIFF, atau GIF dari halaman/slide pertama. PDF multi-halaman dapat dirender ke format gambar pilihan dengan satu gambar per halaman dalam ZIP (hingga 100 halaman); PDF juga dapat dikonversi ke DOCX dengan ukuran halaman dan tampilan dipertahankan sebagai gambar, ke TXT, atau ke ZIP berisi PNG per halaman. Presentasi bisa diekspor sebagai PDF atau ZIP berisi PNG per slide; ekspor ZIP dibatasi 100 halaman/slide.
- **Spreadsheet/data:** XLS/XLSX, CSV, TSV, JSON, YAML, XML; saling konversi ke format data umum, PDF, atau gambar halaman pertama (JPG, PNG, WebP, AVIF, TIFF, GIF).
- **Audio:** MP3, WAV, AAC, OGG, FLAC, M4A; konversi antar format melalui FFmpeg.
- **Video:** MP4, WebM, MOV, AVI, MKV; output MP4, WebM, GIF, MP3, atau gambar frame pertama (JPG, PNG, WebP, AVIF, TIFF). GIF → MP4/WebM. GIF berdurasi panjang dipotong pada 30 detik.
- **PDF:** kompres file, gabungkan beberapa PDF, pecah dokumen menjadi file per halaman, dan ubah semua halaman menjadi ZIP gambar. Kompresi memakai Ghostscript bila tersedia; tanpa Ghostscript, PDF ditulis ulang dengan kompresi object stream dari pdf-lib. Hasil kompresi tidak selalu lebih kecil dan dapat menghapus elemen interaktif.
- **Arsip:** ekstrak ZIP dari browser dengan batas 200 file dan 500 MB ukuran hasil. Semua hasil batch dapat diunduh sebagai ZIP.

Konversi bergantung pada kemampuan format sumber dan target. Spreadsheet diproses dari sheet pertama; format, formula, macro, font, animasi, metadata, layout Office, serta codec dapat berubah atau hilang. Halaman PDF di DOCX dipertahankan sebagai gambar, sehingga teksnya tidak dapat diedit sebagai teks Word. Website ini mendukung format umum di atas, bukan setiap format file yang pernah dibuat.

## Menjalankan semua fitur dengan Docker

1. Pasang Docker Desktop.
2. Dari folder proyek jalankan `docker compose up --build`.
3. Buka `http://localhost:8080`.

Compose menjalankan frontend dan API dalam satu setup. API menyertakan LibreOffice, FFmpeg, Ghostscript, Poppler, Sharp, dan decoder HEIC khusus. Batas API default 50 MB/file; frontend mendukung sampai 100 MB untuk konversi browser. Rate limit API default 20 request per menit per IP.

## Menjalankan untuk pengembangan

1. Jalankan `npm install` sekali di folder proyek. Dependensi frontend dan API dipasang sebagai satu npm workspace.
2. Jalankan `npm run dev`. Perintah ini menyalakan frontend Vite dan API secara bersamaan.
3. Buka alamat Vite yang ditampilkan. Proxy `/api` menuju API di `localhost:3001`.

Untuk seluruh konversi server, API harus aktif. Office memakai LibreOffice atau Microsoft Office di Windows (Word, Excel, atau PowerPoint sesuai jenis file); ekstraksi teks PDF memakai PDF.js, sedangkan render halaman PDF memakai Poppler. Kompresi PDF memakai Ghostscript bila tersedia dan beralih ke penulisan ulang object stream dengan pdf-lib jika tidak. Audio/video memerlukan FFmpeg; HEIC/HEIF memakai decoder Node di API. Cara termudah untuk mendapatkan binary eksternal adalah Docker Compose; saat pengembangan tanpa Docker, pasang binary yang dibutuhkan dan pastikan tersedia di `PATH`.

## Batas dan konfigurasi

- Branding dan batas sisi browser: `src/config.ts`.
- Batas API: variabel `MAX_FILE_MB`; port API: `PORT`.
- Saat development, salin `.env.example` menjadi `.env`. Jika LibreOffice atau Ghostscript tidak ada di `PATH`, isi `LIBREOFFICE_BIN` atau `GHOSTSCRIPT_BIN` dengan path executable.
- Rate limit di `server/index.js`.
- API tidak menyimpan file permanen dan tidak mencatat isi file. Error dicatat sebagai pesan terbatas.
- Server menghapus folder kerja di `finally`, termasuk saat konversi gagal.
- Status dependency server dapat diperiksa di `http://localhost:3001/api/health`; halaman utama juga memberi tahu jika alat konversi server tidak tersedia.

## Menambah converter

Tambahkan format ke `targets()` pada `src/converters/index.ts` dan aturan routing di `server/index.js`. Untuk format browser, buat modul client converter; untuk format berat, gunakan binary server dengan batas waktu dan folder temp terisolasi. Tambahkan validasi magic bytes untuk format biner baru.

## Deploy

Deploy Docker Compose pada VPS/container host yang mendukung Docker dan pasang HTTPS reverse proxy di depan port 8080. Frontend statis dapat dipisahkan ke Vercel/Netlify, tetapi konversi Office/media tetap membutuhkan API server yang dapat diakses dan dikonfigurasi pada proxy.
