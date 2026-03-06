Agar berita yang didapat benar-benar **viral** dan bukan sekadar berita umum, kita perlu mengubah sumber datanya dari *News API* biasa ke **Google Trends** atau **Social Media Scraping (X/Twitter Trends)**.

Berikut adalah PRD lengkap dan terperinci yang bisa kamu langsung masukkan ke **Antigravity**. PRD ini dirancang untuk sistem *on-demand* (tanpa database) yang berfokus pada efisiensi dan aktualitas tren.

---

# PRD: "What’s News Today?" – Viral Edition

## 1. Project Vision

Sebuah "Magic Button" website yang memberikan satu berita paling viral detik ini secara acak setiap kali diklik. Konten dikurasi dari tren mesin pencari dan media sosial, lalu diproses oleh AI agar ringkas, lucu, dan mudah dipahami.

## 2. Core Features (User Stories)

* **The Viral Trigger:** User menekan tombol utama untuk mendapatkan berita viral secara acak.
* **Real-time Trending Fetch:** Sistem mencari topik yang sedang *trending* di Google Trends atau X (Twitter) saat itu juga.
* **AI News Jester:** AI meringkas berita viral tersebut dengan gaya bahasa santai/gaul (slang) agar tidak membosankan.
* **Proof of Truth:** Menyediakan link sumber asli (Portal Berita/Social Media Thread) sebagai referensi.
* **Zero Storage:** Tidak ada data yang disimpan di database; semua diproses secara *live*.

---

## 3. Technical Workflow (Internal Logic)

Antigravity harus mengimplementasikan alur berikut dalam satu API Route:

1. **Step 1 (Scrape/Fetch Trends):** Mengambil daftar 10-20 topik terpopuler hari ini dari RSS Google Trends (`https://trends.google.com/trends/trendingsearches/daily/rss?geo=ID`).
2. **Step 2 (Randomize):** Memilih satu topik secara acak dari daftar tersebut.
3. **Step 3 (Deep Search):** Melakukan pencarian singkat via API (seperti Tavily atau Serper) untuk mendapatkan detail artikel/berita terkait topik yang terpilih.
4. **Step 4 (AI Processing):** Mengirim teks berita ke **Gemini API** untuk diubah menjadi:
* Judul yang *Catchy/Clickbait*.
* Ringkasan 2-3 kalimat bergaya "Lagi rame nih...".


5. **Step 5 (Response):** Menampilkan hasilnya ke Frontend.

---

## 4. Functional Requirements

### A. Frontend (UI/UX)

* **Framework:** Next.js + Tailwind CSS.
* **Hero Section:** Judul besar "What's News Today?".
* **The Button:** Tombol interaktif (misal: warna gradasi yang bergerak).
* **News Display:** Card minimalis yang muncul dengan animasi *fade-in*.
* **Loading State:** Teks random seperti *"Lagi ngintip Twitter..."* atau *"Nanya ke AI apa yang rame..."*.

### B. Backend (API Routes)

* **Endpoint:** `/api/get-viral-news`.
* **Logic:** Menghubungkan Google Trends RSS -> AI Rewriter -> Client.
* **Error Handling:** Jika tren gagal diambil, sediakan *fallback* berita viral umum.

---

## 5. Metadata & Design System

* **Style:** Modern, Minimalist, Bold Typography.
* **Color Palette:** Dark Mode (Background: `#0f172a`, Accent: `#38bdf8`).
* **Font:** Sans Serif (Inter atau Geist).

---

## 6. Prompt AI Strategy (The "Voice")

Gunakan instruksi ini di dalam kode backend untuk AI-nya:

> "Kamu adalah kurator berita viral untuk Gen-Z. Ubah berita berikut menjadi gaya bahasa yang seru, singkat, dan informatif. Gunakan sapaan santai. Format output harus JSON: { 'title': '...', 'summary': '...', 'source_url': '...' }."

---

## 7. Tech Stack Recommendation for Antigravity

* **Language:** TypeScript.
* **Styling:** Tailwind CSS + Framer Motion (untuk animasi).
* **AI:** Google Generative AI SDK (Gemini).
* **Deployment:** Vercel.

---

### Cara Menggunakan di Antigravity:

Salin seluruh teks di atas, lalu tambahkan instruksi ini di bagian bawah:
*"Berdasarkan PRD ini, buatkan satu halaman website utuh menggunakan Next.js. Pastikan kamu menggunakan RSS Google Trends Indonesia sebagai sumber utama trennya dan gunakan Gemini API untuk meringkas beritanya. Jangan pakai database, biarkan semua berjalan di API Route secara real-time."*

Apakah kamu ingin saya buatkan juga **struktur file `.env**` yang perlu kamu siapkan agar API-nya langsung jalan?