# ANCANG — Prototipe Dashboard Early Warning System Krisis Reputasi

Prototipe statis (`index.html`, tanpa dependensi build) untuk **Tujuan Terapan** pada
skripsi *"Efektivitas Early Warning System Berbasis AI dalam Mendeteksi Potensi Krisis
Reputasi"* (Renata Trixie Maran, Program Studi Sarjana Terapan Produksi Media, Vokasi UI).

Buka `index.html` langsung di browser — tidak perlu server atau instalasi apa pun.

## Cara pakai

1. Ketik kata kunci apa pun (merek, produk, tokoh, institusi) di kotak input pada bagian atas.
2. Pilih platform yang ingin disertakan: **X, Instagram, TikTok, Berita & Forum** — semuanya aktif secara default.
3. Klik **Mulai Pantau**. Simulasi langsung berjalan dan bergerak setiap ±3 detik (1 tick = 1 jam simulasi).
4. Menonaktifkan/mengaktifkan platform kapan pun langsung memengaruhi skor komposit dan daftar unggahan tanpa perlu memulai ulang.
5. Buka tab **Unggahan Terdeteksi** untuk melihat daftar unggahan individual — urut berdasarkan waktu terbaru atau engagement tertinggi — lengkap dengan saran AI soal unggahan mana yang kemungkinan menjadi pemicu awal eskalasi.

## Penting: ini simulasi, bukan data sungguhan

Menghubungkan langsung ke API resmi X, Instagram, dan TikTok memerlukan kredensial
developer berbayar dan proses persetujuan yang berada di luar cakupan prototipe ini.
Karena itu, dashboard membangkitkan volume, sentimen, unggahan individual, dan skor
indikator melalui **generator acak-berbobot yang berjalan sepenuhnya di browser**
(seeded berdasarkan kata kunci + waktu, sehingga setiap sesi terasa berbeda dan hidup),
bukan menarik data asli dari platform manapun. Ini ditandai secara eksplisit pada
banner di dashboard.

Setiap sesi simulasi memilih salah satu dari tiga skenario secara acak:

- **Tenang** — volume & sentimen tetap dalam rentang Normal
- **Meningkat** — eskalasi bertahap yang bisa menembus Waspada, kadang Kritis
- **Lonjakan** — periode tenang lalu ledakan mendadak (firestorm), dengan sebuah
  unggahan berkredibilitas tinggi (media/figur berpengaruh) yang muncul tepat di
  titik lonjakan — mencerminkan pola pada Bab I §1.1 di mana respons defensif/sinyal
  kredibel memperburuk eskalasi

## Apa yang disimulasikan — empat indikator komposit

Setiap jam simulasi menghasilkan 2–5 unggahan individual (platform, penulis,
kredibilitas sumber, kategori isi, dan engagement). Keempat indikator dihitung
langsung dari unggahan-unggahan tersebut, bukan dari agregat volume semata:

1. **Deviasi Volume Berbasis Kredibilitas** (bobot 30%) — deviasi volume dari
   baseline, ditimbang oleh kredibilitas/pengaruh sumber (akun biasa = bobot 1,
   akun berpengaruh = 4, media/figur publik = 9). Sejumlah kecil unggahan dari
   sumber kredibel dapat menghasilkan skor tinggi meski volume mentahnya rendah.
2. **Proporsi Sentimen Negatif** (bobot 30%) — persentase unggahan bernada negatif
   (kategori keluhan + atribusi + divergensi) dari seluruh unggahan pada jendela
   bergulir 3 jam terakhir.
3. **Atribusi Tanggung Jawab** (bobot 25%) — proporsi unggahan negatif yang secara
   spesifik menyalahkan organisasi atas kelalaian/kesengajaan, bukan sekadar mengeluh.
4. **Divergensi Narasi** (bobot 15%) — proporsi unggahan negatif yang menuduh
   organisasi tidak jujur/tidak aman/tidak kompeten, menyimpang dari narasi resmi;
   komentar kasual (harga, desain, dsb.) tidak dihitung.

Dua indikator pada versi sebelumnya (anomali kata kunci, kecepatan difusi jejaring)
disederhanakan keluar dari struktur inti ini — lihat tab **Roadmap Fitur** untuk
catatan iterasinya.

## Unggahan Terdeteksi

Setiap unggahan simulasi membawa: platform, nama/jenis akun, badge kredibilitas
(Akun biasa / Akun berpengaruh / Media &amp; figur publik), cuplikan teks, kategori
(Netral / Keluhan / Atribusi Kelalaian / Divergensi Narasi), dan angka engagement.
Tab Unggahan Terdeteksi dan kartu "Unggahan Menonjol" pada Ringkasan bisa diurutkan
berdasarkan waktu terbaru atau engagement tertinggi.

**Saran AI** menyoroti unggahan yang kemungkinan menjadi pemicu awal: unggahan
bernada negatif paling awal (secara kronologis) yang engagement-nya berada di atas
persentil-75 dari seluruh unggahan yang terkumpul sejauh ini. Ini murni heuristik
sederhana pada prototipe — bukan model AI sungguhan yang membaca konten.

## Isi dashboard

| Tab | Fungsi |
|---|---|
| Ringkasan | Skor komposit live, status eskalasi, KPI utama, sebaran volume per platform, unggahan menonjol & saran AI |
| Linimasa Eskalasi | Volume harian + skor komposit + log peristiwa yang terisi otomatis |
| Indikator Komposit | Formula, bobot, dan skor live tiap dari 4 indikator |
| Divergensi Narasi | Perbandingan narasi resmi vs. narasi publik — teks berubah mengikuti kata kunci & level eskalasi |
| Unggahan Terdeteksi | Daftar unggahan individual, dapat diurutkan, dengan saran AI pemicu awal |
| Verifikasi Analis | Antrean *human-in-the-loop* — analis mengonfirmasi atau menandai *false positive* (interaktif, terisi otomatis) |
| Playbook Respons | Tindakan yang direkomendasikan per tingkat eskalasi (Normal/Waspada/Kritis), selaras SCCT |
| Roadmap Fitur | Eksplorasi arah pengembangan lanjutan |

## Batasan prototipe

Ini adalah *prototipe visual dengan mesin simulasi*, bukan sistem yang terhubung ke
data nyata: tidak ada pipeline pengambilan data, model NLP, atau backend di baliknya.
Teks unggahan ditarik dari sekumpulan template, bukan dihasilkan LLM sungguhan.
Seluruh state (unggahan, alert, log) bersifat sisi klien dan hilang saat halaman
dimuat ulang. Tujuannya adalah memvalidasi *kelayakan operasional* tampilan dan alur
kerja human-in-the-loop kepada praktisi Public Relations (Tujuan Terapan §1.3.4),
bukan menguji akurasi model pada data sungguhan.
