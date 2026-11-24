/* ==========================================================
   FILE : js/core.js
   ISI  : INTI: helper, keranjang (localStorage), pengaturan toko, toast, modal
   TIPS : Nomor WhatsApp, QRIS, tarif ongkir diatur di Admin > Pengaturan (nilai awal: config/littlecandy.php).
          Daftar status pesanan ada di ST.
   ========================================================== */

const fmt = (n) => "Rp " + Number(n || 0).toLocaleString("id-ID"),
  $ = (s) => document.querySelector(s),
  $$ = (s) => [...document.querySelectorAll(s)];
// Amankan teks sebelum dimasukkan ke HTML
const e0 = (x) =>
  String(x ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const num = (x) => +String(x).replace(/\D/g, "") || 0;
const tdy = () => new Date().toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
// Kode berikutnya: nx(orders,"LCS") -> LCS003
const nx = (l, p) => p + String(Math.max(0, ...l.map((x) => +x.code.slice(p.length) || 0)) + 1).padStart(3, "0");
// Link WhatsApp (nomor boleh 08xx atau 62xx)
const WA = (n, t) =>
  "https://wa.me/" +
  String(n || "")
    .replace(/\D/g, "")
    .replace(/^0/, "62") +
  (t ? "?text=" + encodeURIComponent(t) : "");
// Tanggal minimal pesanan = hari ini + S.po hari (jam lokal perangkat, bukan UTC)
const ymd = (d) => d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0");
const minTgl = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + +S.po);
  return ymd(d);
};
const minTglTxt = () =>
  new Date(minTgl() + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
const tglMsg = () => `Pesanan minimal ${S.po} hari dari hari ini. Tanggal paling cepat: ${minTglTxt()}.`;
// Upload bukti pembayaran langsung ke web (dikirim ke server, disimpan sebagai file + path di database)
const proofHtml = (it) =>
  it.bukti
    ? `<div class="pf"><b style="color:#2f6b3a">✓ Bukti pembayaran sudah dikirim</b><img class="pv" style="height:120px" src="${e0(it.bukti)}" alt="Bukti pembayaran"></div>`
    : `<div class="pf"><label class="fi" style="margin-top:8px"><b>Upload bukti bayar</b><em style="font-style:normal">png atau jpg</em><input type="file" id="pff" accept="image/*"></label></div>`;
function proofBind(it) {
  const f = $("#pff");
  if (!f) return;
  f.onchange = () => {
    const fl = f.files[0];
    if (!fl) return;
    rs(fl, 900, (u) => {
      api("POST", "api/track/" + encodeURIComponent(it.code) + "/proof", { bukti: u })
        .then((r) => {
          it.bukti = r.bukti;
          it.buktiTgl = r.buktiTgl;
          f.closest(".pf").outerHTML = proofHtml(it);
          toast("Bukti pembayaran terkirim");
        })
        .catch(() => {});
    });
  };
}
// Daftar kartu ucapan + catatan per bunga pada satu pesanan (mendukung format lama: kartu tunggal + cat)
const kartuList = (o) =>
  Array.isArray(o.kartu) ? o.kartu : o.kartu || o.cat ? [{ no: 1, bunga: "", ...(o.kartu || {}), cat: o.cat || "" }] : [];
// Kotak pembayaran QRIS (gambar QRIS diatur di Admin > Pengaturan)
const qrisBox = (total) =>
  `<div class="qr"><img src="${e0(S.qris)}" alt="QRIS ${e0(S.qrisNama)}"><b>${e0(S.qrisNama)}</b><small>Scan dengan aplikasi bank atau e-wallet apa saja</small>${total ? `<div class="qa">${fmt(total)}</div>` : ""}</div>`;
// Opsi bayar DP / lunas. Persentase DP = S.dp (atur di Admin > Pengaturan)
const dueAmt = (total, t) => (t == "dp" ? Math.round((total * S.dp) / 100 / 1000) * 1000 : total);
const payCh = (t) =>
  `<div class="full ch" id="py"><div class="${t == "dp" ? "" : "on"}" data-py="lunas"><b>Bayar lunas</b><small>100% sekarang</small></div><div class="${t == "dp" ? "on" : ""}" data-py="dp"><b>Bayar DP ${S.dp}%</b><small>Sisanya dilunasi sebelum diambil / dikirim</small></div></div>`;
const media = (p) => (p.img ? `<img src="${p.img}" alt="${e0(p.n)}" loading="lazy">` : sun);
const gp = (id) => P.find((p) => p.id == id);
// Pindah halaman (tetap memuat ulang bila sudah di halaman yang sama)
// Alamat halaman memakai path biasa (/katalog, /custom, ...), bukan #hash.
// BASE = alamat dasar website (dari <base href> di app.blade.php), biasanya "/".
const BASE = new URL(document.baseURI).pathname.replace(/\/?$/, "/");
const pageName = () => location.pathname.slice(BASE.length).replace(/\/+$/, "").split("/")[0];
// Pindah halaman tanpa memuat ulang: go("katalog") -> /katalog
const go = (h) => {
  if (pageName() != h) history.pushState(null, "", BASE + h);
  route();
};

// Penyimpanan di browser (localStorage) sekarang hanya dipakai untuk KERANJANG tiap pengunjung
const ld = (k, d) => {
    try {
      return JSON.parse(localStorage.getItem(k)) || d;
    } catch (e) {
      return d;
    }
  },
  sv = (k, v) => {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch (e) {
      toast("Penyimpanan browser penuh");
    }
  };
// Kategori produk: daftar nama (K), foto per kategori (KF), dan id di database (KID).
// Bisa ditambah / diubah / dihapus di Admin > Pengaturan.
let K = [],
  KF = {},
  KID = {};
function applyCats(list) {
  K = list.map((c) => c.name);
  KF = {};
  KID = {};
  list.forEach((c) => {
    KID[c.name] = c.id;
    if (c.image) KF[c.name] = c.image;
  });
}
applyCats(BOOT.categories);
// Pengaturan toko (tabel `settings`; nilai awal di config/littlecandy.php)
let S = BOOT.settings;
// Pesanan & permintaan custom hanya dimuat untuk admin (lihat loadAdmin() di js/admin.js)
let cq = [],
  orders = [];
let cart = ld("lcs2_cart", {});
// Status pesanan: [ikon, label]
const ST = [
  ["💳", "Menunggu pembayaran"],
  ["🧵", "Dikerjakan"],
  ["🎀", "Dikemas"],
  ["🚚", "Siap diambil / dikirim"],
  ["✅", "Selesai"],
];
// Perkecil foto di browser sebelum dikirim ke server (hemat kuota & ruang simpan)
// png = true: simpan sebagai PNG tanpa kompresi lossy (dipakai untuk QRIS supaya tetap bisa di-scan)
function rs(f, max, cb, png) {
  const r = new FileReader();
  r.onload = () => {
    const g = new Image();
    g.onerror = () => toast("Gambar tidak bisa dibaca. Pakai file JPG atau PNG ya.");
    g.onload = () => {
      if (!g.width) return toast("Gambar tidak bisa dibaca. Pakai file JPG atau PNG ya.");
      const k = Math.min(1, max / g.width),
        c = document.createElement("canvas");
      c.width = g.width * k;
      c.height = g.height * k;
      c.getContext("2d").drawImage(g, 0, 0, c.width, c.height);
      cb(png ? c.toDataURL("image/png") : c.toDataURL("image/jpeg", 0.72));
    };
    g.src = r.result;
  };
  r.readAsDataURL(f);
}
// Notifikasi kecil di bawah layar
function toast(m) {
  const t = $("#toast");
  t.textContent = m;
  t.classList.add("show");
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 2600);
}
// Membuka popup dengan isi HTML tertentu
function modal(h) {
  $("#md").innerHTML = '<button class="x" aria-label="Tutup">✕</button>' + h;
  $("#ov").classList.add("show");
  $("#md .x").onclick = close;
}
// Menutup popup
function close() {
  $("#ov").classList.remove("show");
}
$("#ov").onclick = (e) => {
  if (e.target.id == "ov") close();
};
document.addEventListener("keydown", (e) => {
  if (e.key == "Escape") close();
});
