/* ==========================================================
   FILE : js/data.js
   ISI  : PETA GAMBAR (banner & galeri) + DATA PRODUK DARI SERVER
   TIPS : Produk dikelola lewat Admin > Produk (tersimpan di database MySQL, tabel `products`).
          Produk awal ada di database/seeders/DatabaseSeeder.php. Foto bawaan ada di public/assets/img/.
   ========================================================== */

const I = {
  1: "assets/img/produk-1.jpg",
  9: "assets/img/produk-9.jpg",
  10: "assets/img/produk-10.jpg",
  11: "assets/img/produk-11.jpg",
  12: "assets/img/produk-12.jpg",
  13: "assets/img/produk-13.jpg",
  15: "assets/img/produk-15.jpg",
  16: "assets/img/produk-16.jpg",
  17: "assets/img/produk-17.jpg",
  18: "assets/img/produk-18.jpg",
  19: "assets/img/produk-19.jpg",
  20: "assets/img/produk-20.jpg",
};
const sun =
  '<svg viewBox="0 0 100 100" style="background:#f9e3c4">' +
  [...Array(14)]
    .map(
      (_, i) =>
        `<ellipse cx="50" cy="20" rx="7" ry="15" fill="#f6b823" transform="rotate(${i * 25.7} 50 50)"/>`,
    )
    .join("") +
  '<circle cx="50" cy="50" r="16" fill="#6b3a1e"/><path d="M50 66v34" stroke="#3f7a38" stroke-width="5"/></svg>';

// Data produk, kategori, dan pengaturan sekarang datang dari server (Laravel + MySQL) lewat window.BOOT
const BOOT = window.BOOT || { products: [], categories: [], settings: {}, areas: [], isAdmin: false };
let P = BOOT.products;
