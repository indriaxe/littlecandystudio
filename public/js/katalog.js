/* ==========================================================
   FILE : js/katalog.js
   ISI  : HALAMAN KATALOG
   TIPS : Filter, urutan, pencarian, pagination. Jumlah produk per halaman: PER.
   ========================================================== */

const F = { q: "", k: [], pr: "", s: "", p: 1 }, // k = daftar kategori terpilih (kosong = Semua)
  PER = 12; // kelipatan 2, 3, 4 supaya baris selalu penuh
// Membuat satu grup opsi filter
function opts(t, key, arr) {
  return (
    `<h4>${t}</h4>` +
    arr
      .map(
        (a) =>
          `<div class="op${(key == "k" ? (a[0] == "Semua" ? !F.k.length : F.k.includes(a[0])) : F[key] == a[0]) ? " on" : ""}" data-f="${key}" data-v="${a[0]}" role="button" tabindex="0"><i></i>${a[1] || a[0]}</div>`,
      )
      .join("")
  );
}
// Menggambar ulang filter + daftar produk + pagination Katalog
function kat() {
  F.k = F.k.filter((x) => K.includes(x)); // buang kategori yang sudah dihapus
  $("#flt").innerHTML =
    opts(
      'Kategori <small style="font-weight:400;color:var(--mut)">(boleh lebih dari satu)</small>',
      "k",
      ["Semua", ...K].map((x) => [x]),
    ) +
    opts("Harga", "pr", [
      [100000, "Sampai " + fmt(100000)],
      [200000, "Sampai " + fmt(200000)],
    ]) +
    opts("Urutkan", "s", [
      ["lo", "Harga terendah"],
      ["hi", "Harga tertinggi"],
      ["new", "Terbaru"],
    ]);
  $$(".op").forEach((o) => {
    const f = () => {
      const k = o.dataset.f,
        v = o.dataset.v;
      if (k == "k") F.k = v == "Semua" ? [] : F.k.includes(v) ? F.k.filter((x) => x != v) : [...F.k, v]; // kategori: boleh lebih dari satu
      else F[k] = F[k] == v ? "" : v;
      F.p = 1;
      kat();
    };
    o.onclick = f;
    o.onkeydown = (e) => {
      if (e.key == "Enter") f();
    };
  });
  $("#q").value = F.q;
  let l = P.filter(
    (p) =>
      p.on !== false &&
      (!F.k.length || F.k.includes(p.k)) &&
      p.n.toLowerCase().includes(F.q.toLowerCase()) &&
      (!F.pr || p.pr <= +F.pr),
  );
  if (F.s == "lo") l.sort((a, b) => a.pr - b.pr);
  if (F.s == "hi") l.sort((a, b) => b.pr - a.pr);
  if (F.s == "new") l.sort((a, b) => b.id - a.id);
  const pc = Math.max(1, Math.ceil(l.length / PER));
  F.p = Math.min(F.p, pc);
  $("#kc").textContent = l.length + " produk ditemukan";
  $("#kg").innerHTML = l.length
    ? l
        .slice((F.p - 1) * PER, F.p * PER)
        .map(card)
        .join("")
    : '<p class="empty">Tidak ada produk yang cocok. Coba ubah filter, atau buat <a href="#custom">custom order</a>.</p>';
  $("#pgn").innerHTML =
    pc > 1
      ? Array.from(
          { length: pc },
          (_, i) => `<button class="${F.p == i + 1 ? "on" : ""}" data-p="${i + 1}">${i + 1}</button>`,
        ).join("")
      : "";
  $$("#pgn button").forEach(
    (b) =>
      (b.onclick = () => {
        F.p = +b.dataset.p;
        kat();
        scrollTo({ top: 0, behavior: "smooth" });
      }),
  );
  reveal();
}
$("#q").oninput = (e) => {
  F.q = e.target.value;
  F.p = 1;
  kat();
};
