/* ==========================================================
   FILE : js/bantuan.js
   ISI  : HALAMAN BANTUAN & FAQ
   TIPS : Daftar pertanyaan: array FAQ. Form di sini menghasilkan keluhan berkode IS001, dst
          (tabel complaints di database; muncul di admin tab Keluhan, balasannya bisa dilacak di halaman Lacak Pesanan).
   ========================================================== */

const FAQ = [
  [
    "Berapa lama pengerjaan?",
    () => `Minimal pre-order ${S.po} hari sebelum hari-H. Pesanan custom yang rumit sebaiknya dipesan lebih awal.`,
  ],
  [
    "Bahan apa yang dipakai?",
    () =>
      "Kawat chenille (pipe cleaner) berkualitas, dirangkai tangan. Bunga tidak layu, tapi hindari air, panas, dan sinar matahari langsung.",
  ],
  [
    "Apakah bisa custom warna dan isi?",
    () => "Bisa. Isi form Custom Order dengan foto referensi, admin akan membalas dengan harga dan estimasi.",
  ],
  [
    "Bagaimana ongkir dihitung?",
    () =>
      "Berdasarkan jarak dari studio di Pakisaji. Estimasi muncul saat membuat pesanan, angka final dikonfirmasi admin.",
  ],
  [
    "Bagaimana cara membayar?",
    () =>
      "Lewat QRIS. Setelah pesanan dibuat, scan QRIS yang tampil sesuai total, lalu upload foto bukti pembayaran langsung di website (muncul setelah pesanan dibuat, atau lewat halaman Lacak Pesanan).",
  ],
  [
    "Bisa ambil sendiri?",
    () => 'Bisa, pilih "Ambil sendiri" saat membuat pesanan. Admin akan memberi tahu saat pesanan siap diambil.',
  ],
  [
    "Bagaimana jika ada masalah?",
    () =>
      "Kirim keluhan lewat form di halaman ini. Kamu akan mendapat kode IS untuk memantau balasan di Lacak Pesanan.",
  ],
];
// Menggambar daftar FAQ (jawaban bisa memakai pengaturan toko)
function faq() {
  // FAQ bawaan + pertanyaan pelanggan yang ditampilkan admin (teks dari pelanggan selalu di-escape)
  $("#faq").innerHTML =
    FAQ.map((f) => `<details><summary>${f[0]}</summary><p>${f[1]()}</p></details>`).join("") +
    (BOOT.faqs || [])
      .map((f) => `<details><summary>${e0(f.q)}</summary><p style="white-space:pre-line">${e0(f.a)}</p></details>`)
      .join("");
}
$("#is").onsubmit = (e) => {
  e.preventDefault();
  const f = e.target;
  [...f.elements].forEach((x) => x.classList.remove("err"));
  const bad = ["n", "k", "m"].filter((n) => !f[n].value.trim());
  bad.forEach((n) => f[n].classList.add("err"));
  if (bad.length) return toast("Isi nama, kontak, dan pesan ya");
  api("POST", "api/complaints", { nama: f.n.value, kontak: f.k.value, jenis: f.j.value, text: f.m.value })
    .then((c) => {
      f.reset();
      modal(
        `<div class="ft"><div style="font-size:3rem">💌</div><h2>Terkirim</h2><p style="margin:10px 0;color:var(--mut)">Kode pesanmu:</p><div style="font-family:'Bagel Fat One';font-size:2.2rem;color:var(--h)">${c.code}</div><p style="margin:10px 0 18px;color:var(--mut)">Pantau balasan admin di halaman Lacak Pesanan.</p><button class="pill" id="gt">Lacak sekarang</button></div>`,
      );
      $("#gt").onclick = () => goTrack(c.code);
    })
    .catch(() => {});
};
