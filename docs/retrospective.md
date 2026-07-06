# Internal Retrospective
**Proyek:** KostHub (praktikum-rpl-A-09)
**Tanggal:** [Isi Tanggal]

---

## 🟢 What went well? (Apa yang berjalan dengan baik?)
- Identifikasi dan perbaikan *bug* autentikasi krusial (Error 401 Unauthorized) berhasil diselesaikan dengan tuntas.
- Proses perombakan UI (*refactoring*) berjalan lancar, khususnya pada sinkronisasi *state* di komponen Dashboard Mitra dan Profil.
- Pemanfaatan alat bantu AI (Claude, Gemini, Antigravity) sangat efektif dalam mengakselerasi penulisan kode *boilerplate* dan *debugging* yang kompleks.

## 🔴 What didn't go well? (Apa yang kurang berjalan dengan baik?)
- Terjadi *merge conflict* yang cukup signifikan saat mencoba melakukan *pull* dari *branch* `dev` pada file-file antarmuka (seperti `HelpSupportMitra.jsx`, `MitraDashboard.jsx`).
- Adanya ketidaksesuaian spesifikasi (*mismatch*) rute HTTP *method* (GET vs POST) antara *frontend* dan *backend* yang sempat menghambat integrasi fitur pesanan.

## 🟡 What can we improve? (Apa yang bisa kita tingkatkan?)
- **Komunikasi Tim:** Perlu meningkatkan koordinasi antar anggota (*frontend* & *backend*) setiap kali ada perubahan pada kontrak API (*endpoint* atau *method*).
- **Manajemen Git:** Setiap anggota sebaiknya lebih sering melakukan sinkronisasi (`git pull`) dari *branch* utama (`dev`) sebelum mengembangkan fitur baru untuk meminimalisir tumpukan konflik yang sulit di-*merge*.
- **Review Kode:** Mengintensifkan pengujian (termasuk cek respon API) sebelum melakukan penggabungan ke *branch* pengembangan.

## 🎉 Shout-outs (Apresiasi)
- **Tim Frontend & UI:** Kerja luar biasa dalam memastikan tampilan komponen aplikasi lebih dinamis, rapi, dan terstruktur.
- **Tim Backend:** Respon cepat dan adaptasi yang tangkas dalam menginvestigasi *bug* keamanan (*double-password hashing*).
- **Inisiatif AI:** *Shout-out* khusus untuk inisiatif pemanfaatan asisten pemrograman otonom yang terbukti mampu menjaga produktivitas tim di tengah batas waktu (*deadline*) proyek.
