/* ==========================================================
   FILE : js/beranda.js
   ISI  : HALAMAN BERANDA
   TIPS : Foto slider banner: lihat array s di fungsi hero(). Teks banner juga di hero().
          Cara pesan: index.html. Kategori: Admin > Pengaturan.
   ========================================================== */

let si = 0,
  tm;
// Membuat slider banner & mengatur pergantian slide otomatis
function hero() {
  const s = [
    [10, 13],
    [16, 1],
    [12, 9],
    [20, 15],
  ];
  $("#hero").innerHTML =
    s
      .map(
        (a, i) =>
          `<div class="sl${i ? "" : " on"}">${a.map((k) => `<img src="${I[k]}" alt="">`).join("")}<img src="${I[s[(i + 1) % 4][0]]}" alt=""></div>`,
      )
      .join("") +
    `<div class="ht"><span class="chip">Handmade di Pakisaji, Malang</span><h1>Little Candy Studio</h1><p>Buket, kartu ucapan, dan hadiah dari kawat chenille. Pilih dari katalog atau ceritakan idemu, kami wujudkan sesuai warna dan momennya.</p><a href="#katalog"><button class="pill">Lihat katalog</button></a><a href="#custom"><button class="pill ol">Buat custom order</button></a></div><div class="dots">${s.map((_, i) => `<i class="${i ? "" : "on"}" data-s="${i}"></i>`).join("")}</div>`;
  const go = (n) => {
    si = n;
    $$(".sl").forEach((e, i) => e.classList.toggle("on", i == n));
    $$(".dots i").forEach((e, i) => e.classList.toggle("on", i == n));
  };
  $$(".dots i").forEach(
    (d) =>
      (d.onclick = () => {
        go(+d.dataset.s);
        clearInterval(tm);
        tm = setInterval(() => go((si + 1) % 4), 5500);
      }),
  );
  clearInterval(tm);
  tm = setInterval(() => go((si + 1) % 4), 5500);
}
// Ikon kotak "Informasi penting"
const IC = [
  '<path d="M10 5h20l8 8v30H10z"/><path d="M30 5v8h8M16 20h14M16 26h8"/><circle cx="32" cy="34" r="7"/><path d="M32 30v4l3 2"/>',
  '<path d="M3 12h27v21H3zM30 19h8l7 8v6H30z"/><circle cx="12" cy="36" r="4"/><circle cx="37" cy="36" r="4"/>',
  '<circle cx="24" cy="24" r="5"/>' +
    [0, 72, 144, 216, 288]
      .map((a) => `<ellipse cx="24" cy="12" rx="5" ry="8" transform="rotate(${a} 24 24)"/>`)
      .join(""),
];
// Mengisi seluruh isi halaman Beranda
function home() {
  hero();
  const sep = "&nbsp;&nbsp;&nbsp;✦&nbsp;&nbsp;&nbsp;";

$("#mq").innerHTML = (
  [
    "Handmade chenille stem flowers",
    "Sweet little keepsakes",
    "Custom order",
    `Pre-order ${S.po} hari`,
    "Free greeting card",
    "Kirim area Malang"
  ].join(sep) + sep
).repeat(3);
  $("#best").innerHTML = P.filter((p) => p.bs && p.on !== false)
    .slice(0, 4)
    .map(card)
    .join("");
  $("#cats").innerHTML = K.map((k, i) => {
    const l = P.filter((x) => x.k == k && x.on !== false);
    return `<button class="cat rv" style="--d:${i * 80}ms" data-k="${k}"><div class="im">${KF[k] ? `<img src="${KF[k]}" alt="${e0(k)}">` : l[0] ? media(l[0]) : '<div class="noimg">🌸</div>'}</div><span>${k}<small>${l.length} produk</small></span></button>`;
  }).join("");
  $$(".cat").forEach(
    (b) =>
      (b.onclick = () => {
        F.k = [b.dataset.k];
        F.p = 1;
        go("katalog");
      }),
  );
  $("#gal").innerHTML = [18, 16, 9, 13, 17, 12]
    .map((k) => `<img class="rv" src="${I[k]}" alt="Contoh rangkaian bunga chenille stem" loading="lazy">`)
    .join("");
  $("#info").innerHTML = [
    [`Pre-order ${S.po} hari`, `Pesan minimal ${S.po} hari sebelum hari-H supaya pengerjaan tidak terburu-buru.`],
    ["Ambil atau diantar", "Ambil di studio Pakisaji, atau diantar ke area Malang dengan ongkir sesuai jarak."],
    ["Bahan awet", "Chenille tidak layu. Jauhkan dari air, panas, dan sinar matahari langsung."],
  ]
    .map(
      (x, i) =>
        `<div class="ab rv" style="--d:${i * 90}ms"><svg viewBox="0 0 48 48">${IC[i]}</svg><b>${x[0]}</b><p>${x[1]}</p></div>`,
    )
    .join("");
}
