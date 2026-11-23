/* ==========================================================
   FILE : js/produk.js
   ISI  : KARTU PRODUK & POPUP DETAIL PRODUK
   TIPS : Dipakai di Beranda dan Katalog.
   ========================================================== */

const card = (p, i) =>
  `<article class="card rv" style="--d:${i * 70}ms" tabindex="0" data-id="${p.id}"><div class="im">${media(p)}<span class="tag">${p.so ? "Habis" : fmt(p.pr)}</span></div><div class="cb"><small>${p.k}</small><h3>${e0(p.n)}</h3><button class="pill sm" tabindex="-1">Detail selengkapnya</button></div></article>`;
document.addEventListener("click", (e) => {
  const c = e.target.closest("[data-id]");
  if (c) detail(+c.dataset.id);
});
document.addEventListener("keydown", (e) => {
  if (e.key == "Enter" && e.target.dataset && e.target.dataset.id) detail(+e.target.dataset.id);
});
// Popup detail produk (jumlah, masukkan ke keranjang, custom versi ini)
function detail(id) {
  const p = gp(id);
  if (!p) return;
  let q = 1;
  modal(
    `<div class="pd"><div class="im">${media(p)}</div><div><small style="color:var(--mut)">${p.k}</small><h2 style="font-size:1.8rem">${e0(p.n)}</h2><div class="pc">${fmt(p.pr)}</div><p style="color:var(--mut);margin:10px 0 18px">${e0(p.d)}</p>${
      p.so
        ? '<p class="es">Stok sedang habis. Kamu tetap bisa memesan versi custom.</p>'
        : '<div class="qt"><button id="m1" aria-label="Kurangi">−</button><span id="mq2">1</span><button id="m2" aria-label="Tambah">+</button></div>'
    }<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:18px">${p.so ? "" : '<button class="pill" id="ma">Masukkan ke keranjang</button>'}<button class="pill ol" id="mc">Custom versi ini</button></div><p style="font-size:.78rem;color:var(--mut);margin-top:14px">Pre-order minimal ${S.po} hari. Foto adalah contoh hasil, detail bisa sedikit berbeda karena handmade.</p></div></div>`,
  );
  if (!p.so) {
    $("#m1").onclick = () => {
      q = Math.max(1, q - 1);
      $("#mq2").textContent = q;
    };
    $("#m2").onclick = () => {
      q++;
      $("#mq2").textContent = q;
    };
    $("#ma").onclick = () => {
      cart[id] = (cart[id] || 0) + q;
      sv("lcs2_cart", cart);
      badge(1);
      close();
      toast(p.n + " masuk keranjang");
    };
  }
  $("#mc").onclick = () => {
    close();
    Object.assign(W, W0(), {
      mode: "custom",
      kat: p.k,
      des: "Custom dari " + p.n + ": ",
      tpl: p.n,
      ref: p.img || "",
      file: p.img ? "Template: " + p.n : "",
    });
    go("custom");
  };
}
