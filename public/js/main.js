/* ==========================================================
   FILE : js/main.js
   ISI  : FOOTER, TEMA, ROUTER & INISIALISASI
   TIPS : Router berbasis path (/beranda, /katalog, ...). Daftar halaman: objek R (daftar yang sama ada di routes/web.php). Kode ini harus dimuat paling akhir.
   ========================================================== */

// Footer (nomor WA, jam buka, dan hari pre-order mengikuti Pengaturan admin)
function renderFooter() {
  $("#ft").innerHTML =
    `<div class="fg3"><div><h3>Little Candy Studio</h3><p>Bunga chenille stem handmade untuk setiap momen. Pre-order minimal ${S.po} hari sebelum hari-H.</p></div><div><h3>Hubungi kami</h3><a href="https://instagram.com/littlecandy_studio" target="_blank" rel="noopener">Instagram @littlecandy_studio</a><a href="mailto:indriarahmaaulia@gmail.com">indriarahmaaulia@gmail.com</a><a href="https://wa.me/${S.wa}" target="_blank" rel="noopener">WhatsApp ${e0(S.wa)}</a></div><div><h3>Studio</h3><p>Pakisaji, Kabupaten Malang, Jawa Timur</p><p>${e0(S.jam)}</p><a href="bantuan">Kirim keluhan atau pertanyaan</a></div><div class="sm2"><span>© 2026 Little Candy Studio</span></div></div>`;
}
$("#tm").onclick = () => {
  const d = document.documentElement,
    dk = d.dataset.theme ? d.dataset.theme == "dark" : matchMedia("(prefers-color-scheme:dark)").matches;
  d.dataset.theme = dk ? "light" : "dark";
};
$("#burger").onclick = () => $("#nl").classList.toggle("open");
// Animasi muncul saat di-scroll
function reveal() {
  const io = new IntersectionObserver(
    (es) =>
      es.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("on");
          io.unobserve(e.target);
        }
      }),
    { threshold: 0.12 },
  );
  $$(".page.act .rv").forEach((e) => io.observe(e));
}
const R = {
  beranda: home,
  katalog: kat,
  custom: wr,
  lacak: track,
  keranjang: renderCart,
  bantuan: faq,
  admin: admin,
};
// Router: tampilkan halaman sesuai alamat (path) di URL, misalnya /katalog
function route() {
  let n = pageName();
  if (!R[n]) {
    n = "beranda";
    history.replaceState(null, "", BASE + "beranda"); // "/" atau alamat tak dikenal -> /beranda
  }
  $$(".page").forEach((p) => p.classList.remove("act"));
  const pg = $("#pg-" + n);
  pg.classList.add("act");
  R[n]();
  $$(".nl a").forEach((a) => a.classList.toggle("on", a.dataset.n == n));
  $("#nl").classList.remove("open");
  scrollTo({ top: 0 });
  reveal();
}
addEventListener("popstate", route); // tombol back / forward browser
// Klik link internal (mis. /katalog): pindah halaman tanpa memuat ulang
document.addEventListener("click", (e) => {
  if (e.defaultPrevented || e.button || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  const a = e.target.closest("a[href]");
  if (!a || a.target == "_blank" || a.hasAttribute("download") || a.getAttribute("href").startsWith("#")) return;
  const u = new URL(a.href);
  if (u.origin != location.origin || !u.pathname.startsWith(BASE)) return;
  const n = u.pathname.slice(BASE.length).replace(/\/+$/, "");
  if (!R[n]) return;
  e.preventDefault();
  go(n);
});
// Link lama berbentuk /#katalog dialihkan ke /katalog
if (R[location.hash.slice(1)]) history.replaceState(null, "", BASE + location.hash.slice(1));
for (let i = 0; i < 9; i++) {
  const s = document.createElement("span");
  s.className = "pt";
  s.style.cssText = `left:${i * 11 + Math.random() * 8}%;animation-duration:${14 + Math.random() * 12}s;animation-delay:-${Math.random() * 20}s;transform:scale(${0.6 + Math.random()})`;
  document.body.appendChild(s);
}
badge();
renderFooter();
route();
