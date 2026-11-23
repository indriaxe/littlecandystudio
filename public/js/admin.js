/* ==========================================================
   FILE : js/admin.js
   ISI  : PANEL ADMIN
   TIPS : Login admin dicek server (akun dibuat oleh `php artisan migrate --seed`, lihat file .env: ADMIN_USERNAME / ADMIN_PASSWORD).
          Semua perubahan langsung disimpan ke database MySQL lewat API (js/api.js).
          Tab: Ringkasan, Pesanan, Produk, Tanya Harga & Custom, Keluhan, Pelanggan, Pengaturan.
   ========================================================== */

let adm = BOOT.isAdmin, // sudah login (sesi masih aktif)?
  admUser = "", // username admin yang sedang login
  adLoaded = false, // data admin sudah dimuat dari server?
  aV = "d",
  aQ = "",
  aS = "",
  aM = "",
  iss = [];
// Baris kartu ucapan & catatan per bunga di detail pesanan
const kartuRows = (o) =>
  kartuList(o)
    .map((k) => {
      const t = k.bunga ? `Bunga ${k.no} (${k.bunga})` : "Kartu & catatan";
      return (
        (k.dari || k.untuk || k.pes ? row(t + " · kartu ucapan", `dari ${k.dari || "-"} untuk ${k.untuk || "-"}: ${k.pes || "-"}`) : "") +
        (k.desain ? row(t + " · warna / desain kartu", k.desain) : "") +
        (k.foto ? `<div style="margin:6px 0"><small style="color:var(--mut)">${t} · contoh desain kartu</small><img src="${k.foto}" alt="Contoh desain kartu" style="display:block;max-height:160px;border-radius:12px;margin-top:4px"></div>` : "") +
        (k.cat ? row(t + " · catatan", k.cat) : "")
      );
    })
    .join("");
const CS = ["Baru", "Dibalas", "Disetujui", "Ditolak"],
  IS = ["Baru", "Diproses", "Selesai"],
  isb = 'style="margin:0;padding:4px 8px"';
const row = (a, b) =>
    `<div class="rw"><span>${a}</span><b style="text-align:right;max-width:65%">${e0(b) || "-"}</b></div>`,
  tbl = (h, r) =>
    `<div class="box" style="padding:12px;overflow-x:auto"><table class="tb"><tr>${h.map((x) => `<th>${x}</th>`).join("")}</tr>${r.join("")}</table></div>`,
  sel = (a, v, at) =>
    `<select class="in" ${at} ${isb}>${a.map((x) => `<option${x == v ? " selected" : ""}>${x}</option>`).join("")}</select>`,
  ob = (t, a) => `<button class="pill sm" style="border:1px solid var(--pr)" ${a}>${t}</button>`;
// Produk unggulan (bintang) di beranda maksimal 4
const MAXBS = 4,
  bsCount = (id) => P.filter((x) => x.bs && x.id != id).length;
// Memuat semua data admin dari server: pesanan, custom order, keluhan, SEMUA produk, kategori, pengaturan
function loadAdmin() {
  return api("GET", "api/admin/data").then((d) => {
    orders = d.orders;
    cq = d.cq;
    iss = d.iss;
    P = d.products;
    applyCats(d.categories);
    S = d.settings;
    admUser = d.admin.username;
    adLoaded = true;
  });
}
// Hasil dari server setelah kategori berubah: daftar kategori + semua produk
const catRes = (r) => {
  applyCats(r.categories);
  P = r.products;
};
// Halaman admin: form login atau dashboard
function admin() {
  const a = $("#ad");
  if (!adm) {
    a.innerHTML = `<div style="display:grid;grid-template-columns:1fr 1fr;gap:30px;align-items:center" class="ag"><div style="max-width:420px"><h2 class="t">Masuk admin</h2><p class="sub">Berikut adalah halaman khusus pengelola toko ya. Untuk customer bisa langsung klik pesanan kamu tanpa login loh. Selamat berbelanja!</p><form id="lf" class="fr" style="grid-template-columns:1fr"><input name="u" placeholder="Username admin" aria-label="Username" style="border-radius:99px"><input name="p" type="password" placeholder="Password" aria-label="Password" style="border-radius:99px"><label style="display:flex;align-items:center;gap:8px;font-size:.9rem;cursor:pointer"><input type="checkbox" id="sp" style="width:auto;margin:0"> Tampilkan password</label><div><button class="pill">Masuk</button></div></form></div><div class="im" style="border-radius:28px;aspect-ratio:4/4.4;box-shadow:var(--sh)"><img src="${I[1]}" alt=""></div></div><style>@media(max-width:700px){.ag{grid-template-columns:1fr!important}}</style>`;
    // Centang "Tampilkan password" untuk melihat isi password (cek typo)
    $("#sp").onchange = (e) => ($('#lf [name="p"]').type = e.target.checked ? "text" : "password");
    $("#lf").onsubmit = (e) => {
      e.preventDefault();
      const f = e.target;
      api("POST", "api/admin/login", { username: f.u.value, password: f.p.value })
        .then((r) => {
          CSRF = r.csrf; // token keamanan baru setelah login
          adm = true;
          adLoaded = false;
          admin();
          toast("Selamat datang, admin");
        })
        .catch(() => {
          [f.u, f.p].forEach((x) => {
            x.classList.remove("err");
            void x.offsetWidth;
            x.classList.add("err");
          });
        });
    };
    return;
  }
  if (!adLoaded) {
    a.innerHTML = '<p class="sub" style="padding:60px 0;text-align:center">Memuat data admin...</p>';
    loadAdmin()
      .then(admin)
      .catch(() => {
        if (adm) a.innerHTML = '<p class="sub" style="padding:60px 0;text-align:center">Gagal memuat data. Muat ulang halaman.</p>';
      });
    return;
  }
  a.innerHTML = '<div class="ad"><div class="sb" id="sb"></div><div id="av"></div></div>';
  adV();
}
// Menu sidebar admin & memilih tampilan
function adV() {
  const n = [
      orders.filter((o) => !o.paid && o.status < 4).length,
      cq.filter((c) => c.status == "Baru").length,
      iss.filter((x) => x.status == "Baru").length,
    ],
    M = [
      ["d", "📊 Ringkasan"],
      ["o", "🧾 Pesanan", n[0]],
      ["p", "🌷 Produk"],
      ["c", "💬 Tanya Harga & Custom", n[1]],
      ["i", "📣 Keluhan", n[2]],
      ["u", "👥 Pelanggan"],
      ["s", "⚙️ Pengaturan"],
    ];
  $("#sb").innerHTML =
    M.map(
      (m) =>
        `<button data-v="${m[0]}" class="${aV == m[0] ? "on" : ""}">${m[1]}${m[2] ? `<i>${m[2]}</i>` : ""}</button>`,
    ).join("") + '<button id="rl">🔄 Muat ulang data</button><button id="lo">↩ Keluar</button>';
  $$("#sb [data-v]").forEach(
    (x) =>
      (x.onclick = () => {
        aV = x.dataset.v;
        aQ = aS = aM = "";
        adV();
      }),
  );
  // Ambil data terbaru (mis. pesanan baru dari persetujuan pelanggan)
  $("#rl").onclick = () =>
    loadAdmin()
      .then(() => {
        adV();
        toast("Data diperbarui");
      })
      .catch(() => {});
  $("#lo").onclick = () => {
    api("POST", "api/admin/logout")
      .then((r) => {
        CSRF = r.csrf;
        adm = false;
        adLoaded = false;
        orders = [];
        cq = [];
        iss = [];
        P = P.filter((p) => p.on !== false); // produk tersembunyi tidak ikut tampil di sisi pengunjung
        admin();
      })
      .catch(() => {});
  };
  ({ d: vD, o: vO, p: vP, c: vC, i: vI, u: vU, s: vS })[aV]();
}
// Tab Dashboard
function vD() {
  const rev = orders.filter((o) => o.paid).reduce((s, o) => s + o.total, 0),
    sc = ST.map((s, j) => orders.filter((o) => o.status == j).length),
    mx = Math.max(1, ...sc),
    al = [
      [orders.filter((o) => !o.paid && o.status < 4).length, "pesanan menunggu pembayaran", "o"],
      [cq.filter((c) => c.status == "Baru").length, "permintaan harga belum dibalas", "c"],
      [iss.filter((x) => x.status == "Baru").length, "keluhan baru", "i"],
      [P.filter((p) => p.so).length, "produk stok habis", "p"],
    ].filter((a) => a[0]);
  $("#av").innerHTML = `<h2 class="t">Dashboard admin</h2><div class="stats" style="margin:18px 0">${[
    [orders.length, "total pesanan"],
    [orders.filter((o) => o.status < 4).length, "sedang diproses"],
    [P.length, "produk di katalog"],
    [fmt(rev), "pemasukan (sudah dibayar)"],
  ]
    .map(
      (x) =>
        `<div><b style="font-size:${String(x[0]).length > 6 ? "1.7rem" : "2.4rem"}">${x[0]}</b><span>${x[1]}</span></div>`,
    )
    .join(
      "",
    )}</div><div class="bx2"><div class="box"><h3 style="margin-bottom:12px">Pesanan per status</h3>${ST.map((s, j) => `<div style="margin-bottom:10px;font-size:.85rem">${s[0]} ${s[1]} · <b>${sc[j]}</b><div class="bar" data-w="${(sc[j] / mx) * 100}"></div></div>`).join("")}</div><div class="box"><h3 style="margin-bottom:12px">Perlu tindakan</h3>${al.length ? al.map((a) => `<div class="al" data-g="${a[2]}"><span><b>${a[0]}</b> ${a[1]}</span><span>Buka ›</span></div>`).join("") : '<p style="color:var(--mut)">Semua beres. Tidak ada yang menunggu 🎉</p>'}<h3 style="margin:18px 0 8px">Pesanan terbaru</h3>${orders
    .slice(-4)
    .reverse()
    .map((o) => row(o.code + " · " + o.name, fmt(o.total)))
    .join("")}</div></div>`;
  $$("[data-g]").forEach(
    (x) =>
      (x.onclick = () => {
        aV = x.dataset.g;
        adV();
      }),
  );
  setTimeout(() => $$(".bar").forEach((b) => (b.style.width = b.dataset.w + "%")), 60);
}
// Tab Pesanan
function vO() {
  $("#av").innerHTML =
    `<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px"><h2 class="t">Pesanan</h2><button class="pill ol" id="ex">Ekspor Excel</button></div><div style="display:flex;gap:10px;margin:14px 0;flex-wrap:wrap"><input class="in" id="aq" value="${e0(aQ)}" placeholder="Cari kode atau nama" style="max-width:240px;margin:0"><select class="in" id="as" style="max-width:190px;margin:0"><option value="">Semua status</option>${ST.map((s, j) => `<option value="${j}"${aS === String(j) ? " selected" : ""}>${s[1]}</option>`).join("")}</select></div><div id="atb"></div>`;
  $("#aq").oninput = (e) => {
    aQ = e.target.value;
    oR();
  };
  $("#as").onchange = (e) => {
    aS = e.target.value;
    oR();
  };
  // Ekspor Excel (.xlsx) berbentuk tabel rapi: header berwarna, border, lebar kolom, filter, baris TOTAL
  $("#ex").onclick = () => {
    const tg = (t) => (t ? new Date(t + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : ""),
      kt = (o) =>
        kartuList(o)
          .map((k) => {
            const p = [];
            if (k.dari || k.untuk || k.pes) p.push(`kartu dari ${k.dari || "-"} untuk ${k.untuk || "-"}: ${k.pes || "-"}`);
            if (k.desain) p.push("desain: " + k.desain);
            if (k.foto) p.push("ada foto contoh kartu");
            if (k.cat) p.push("catatan: " + k.cat);
            return (k.bunga ? `Bunga ${k.no} (${k.bunga})` : "Kartu") + " - " + p.join("; ");
          })
          .join("\n");
    downloadXlsx(`pesanan-little-candy-${new Date().toISOString().slice(0, 10)}.xlsx`, {
      sheet: "Pesanan",
      headers: ["Kode", "Tanggal pesan", "Nama", "WhatsApp", "Pesanan", "Metode", "Area", "Alamat", "Tanggal dibutuhkan", "Produk", "Ongkir", "Total", "Skema bayar", "Pembayaran", "Status pesanan", "Kartu ucapan & catatan"],
      widths: [10, 15, 20, 16, 38, 15, 24, 30, 17, 14, 13, 15, 24, 14, 22, 52],
      types: ["m", "m", "t", "m", "t", "m", "t", "t", "m", "c", "c", "c", "t", "m", "m", "t"],
      totals: [9, 10, 11],
      rows: orders.map((o) => [
        o.code,
        o.date || "",
        o.name,
        o.wa || "",
        o.items,
        o.metode == "antar" ? "Diantar" : "Ambil sendiri",
        o.area || "",
        o.alamat || "",
        tg(o.tgl),
        o.sub ?? o.total,
        o.ongkir || 0,
        o.total,
        o.bayarTipe == "dp" ? `DP ${fmt(o.dibayar)} (sisa ${fmt(o.sisa)})` : o.bayarTipe ? "Lunas" : "-",
        o.paid ? "Sudah dibayar" : "Belum dibayar",
        ST[o.status][1],
        kt(o),
      ]),
    });
  };
  oR();
}
// Tabel pesanan (dengan filter)
function oR() {
  const l = orders
    .map((o, i) => [o, i])
    .filter(
      ([o]) => (o.code + o.name).toLowerCase().includes(aQ.toLowerCase()) && (aS === "" || o.status == aS),
    );
  $("#atb").innerHTML = l.length
    ? tbl(
        ["Kode", "Pelanggan", "Pesanan", "Metode", "Total", "Bayar", "Status", ""],
        l.map(
          ([o, i]) =>
            `<tr><td><b>${o.code}</b><br><small>${o.date}</small></td><td>${e0(o.name)}</td><td>${e0(o.items)}</td><td>${o.metode == "antar" ? "Diantar" : "Ambil"}</td><td>${fmt(o.total)}</td><td><button class="pill sm" data-pd="${i}" style="${o.paid ? "background:var(--pr);color:#fff" : "border:1px solid var(--pr)"}">${o.bayarTipe == "dp" ? (o.paid ? "DP ✓" : "DP belum") : o.paid ? "Lunas" : "Belum"}</button>${o.bayarTipe == "dp" ? `<br><button class="pill sm" data-pl="${i}" style="margin-top:4px;${o.lunasOk ? "background:var(--pr);color:#fff" : "border:1px solid var(--pr)"}">${o.lunasOk ? "Pelunasan ✓" : "Pelunasan belum"}</button>${o.buktiLunas && !o.lunasOk ? '<br><small style="color:#a23336">Bukti pelunasan masuk</small>' : ""}` : ""}${o.receivedAt ? '<br><small style="color:#2f6b3a">✓ ' + (o.metode == "antar" ? "Diterima pelanggan" : "Sudah diambil") + "</small>" : ""}</td><td><select class="in" data-o="${i}" ${isb}>${ST.map((s, j) => `<option value="${j}"${j == o.status ? " selected" : ""}>${s[1]}</option>`).join("")}</select></td><td>${ob("Detail", 'data-ov="' + i + '"')} <button class="rm" data-x="${i}">Hapus</button></td></tr>`,
        ),
      )
    : '<p class="empty">Tidak ada pesanan yang cocok.</p>';
  $$("[data-o]").forEach(
    (s) =>
      (s.onchange = () => {
        const o = orders[s.dataset.o];
        api("PATCH", "api/admin/orders/" + o.code, { status: +s.value })
          .then((r) => {
            Object.assign(o, r);
            toast("Status diperbarui");
          })
          .catch(() => oR());
      }),
  );
  $$("[data-pd]").forEach(
    (x) =>
      (x.onclick = () => {
        const o = orders[x.dataset.pd];
        api("PATCH", "api/admin/orders/" + o.code, { paid: !o.paid })
          .then((r) => {
            Object.assign(o, r);
            oR();
          })
          .catch(() => {});
      }),
  );
  // Tombol "Pelunasan" (khusus pesanan DP): verifikasi / batalkan verifikasi pelunasan
  $$("[data-pl]").forEach(
    (x) =>
      (x.onclick = () => {
        const o = orders[x.dataset.pl];
        api("PATCH", "api/admin/orders/" + o.code, { lunas_ok: !o.lunasOk })
          .then((r) => {
            Object.assign(o, r);
            oR();
          })
          .catch(() => {});
      }),
  );
  $$("[data-x]").forEach(
    (x) =>
      (x.onclick = () => {
        const o = orders[x.dataset.x];
        if (confirm("Hapus pesanan " + o.code + "?"))
          api("DELETE", "api/admin/orders/" + o.code)
            .then(() => {
              orders.splice(orders.indexOf(o), 1);
              oR();
            })
            .catch(() => {});
      }),
  );
  $$("[data-ov]").forEach((x) => (x.onclick = () => odet(+x.dataset.ov)));
}
// Kotak pelunasan DP di detail pesanan (bukti dikirim pelanggan setelah pesanan tahap Dikemas)
const lunasBox = (o) =>
  o.bayarTipe != "dp"
    ? ""
    : `<div style="margin:10px 0;padding:12px;border:1px dashed var(--pr);border-radius:14px"><b>Pelunasan DP</b> · sisa ${fmt(o.sisa)}<br>${
        o.lunasOk
          ? '<span style="color:#2f6b3a">✓ Pelunasan sudah diverifikasi</span>'
          : o.buktiLunas
            ? "Bukti pelunasan masuk (" + e0(o.buktiLunasTgl) + ")"
            : '<span style="color:var(--mut)">Belum ada bukti pelunasan' + (o.status < 2 ? " (tombol muncul bagi pelanggan saat status Dikemas)" : "") + "</span>"
      }${o.buktiLunas ? `<img src="${e0(o.buktiLunas)}" alt="Bukti pelunasan" style="display:block;max-height:220px;border-radius:12px;margin:8px 0">` : ""}<div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:8px">${
        o.buktiLunas && !o.lunasOk ? '<button class="pill sm" id="lok">Pelunasan diterima</button>' : ""
      }${o.buktiLunas ? '<button class="pill sm ol" id="lno">Tolak bukti (minta upload ulang)</button>' : ""}${
        !o.buktiLunas && !o.lunasOk ? '<button class="pill sm ol" id="lmn">Tandai lunas manual</button>' : ""
      }</div></div>`;
// Popup detail pesanan
function odet(i) {
  const o = orders[i];
  modal(
    `<div style="padding:34px 30px"><h2>${o.code}</h2><p style="color:var(--mut);margin-bottom:10px">${o.date}</p>${row("Pelanggan", o.name)}${row("WhatsApp", o.wa)}${row("Pesanan", o.items)}${row("Dibutuhkan", o.tgl)}${row("Metode", o.metode == "antar" ? "Diantar ke " + o.area : "Ambil di studio")}${row("Alamat", o.alamat)}${kartuRows(o)}${row("Pembayaran", o.bayarTipe == "dp" ? `QRIS · DP ${fmt(o.dibayar)}, sisa ${fmt(o.sisa)}` : o.bayarTipe ? "QRIS · Lunas" : "QRIS")}${o.bukti ? `<div style="margin:8px 0"><small style="color:var(--mut)">Bukti pembayaran (${o.buktiTgl || ""})</small><img src="${o.bukti}" alt="Bukti pembayaran" style="display:block;max-height:240px;border-radius:14px;margin-top:4px"></div>` : row("Bukti pembayaran", "Belum dikirim")}${row("Produk", fmt(o.sub ?? o.total))}${o.source ? row("Asal custom order", o.source) : ""}${lunasBox(o)}${row(o.metode == "antar" ? "Konfirmasi diterima (oleh pelanggan)" : "Konfirmasi diambil (oleh admin: ubah status ke Selesai)", o.receivedAt ? "✓ " + o.receivedAt : "Belum")}<div class="fr" style="margin-top:12px"><label>Ongkir final (Rp)<input class="in" id="og" inputmode="numeric" value="${o.ongkir || 0}"></label><label>Catatan internal<input class="in" id="cn" value="${e0(o.int)}"></label></div><div class="rw tt"><span>Total</span><span id="tg">${fmt(o.total)}</span></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="pill" id="os">Simpan</button><a class="pill ol" href="${WA(o.wa, "Halo " + o.name + ", pesanan " + o.code + " di Little Candy Studio: total " + fmt(o.total) + ". Pembayaran via QRIS, mohon kirim bukti bayarnya ya.")}" target="_blank" rel="noopener">WhatsApp pelanggan</a></div></div>`,
  );
  // Verifikasi pelunasan DP
  const lp = (body, msg) =>
    api("PATCH", "api/admin/orders/" + o.code, body)
      .then((r) => {
        Object.assign(o, r);
        oR();
        odet(i);
        toast(msg);
      })
      .catch(() => {});
  if ($("#lok")) $("#lok").onclick = () => lp({ lunas_ok: true }, "Pelunasan diterima");
  if ($("#lmn")) $("#lmn").onclick = () => lp({ lunas_ok: true }, "Ditandai lunas");
  if ($("#lno")) $("#lno").onclick = () => confirm("Tolak bukti pelunasan ini?") && lp({ clear_lunas: true }, "Bukti ditolak, pelanggan bisa upload ulang");
  $("#os").onclick = () => {
    api("PATCH", "api/admin/orders/" + o.code, {
      ongkir: +$("#og").value.replace(/\D/g, "") || 0,
      int: $("#cn").value,
    })
      .then((r) => {
        Object.assign(o, r);
        close();
        oR();
        toast("Pesanan disimpan");
      })
      .catch(() => {});
  };
}
// Tab Produk
function vP() {
  const l = P.filter((p) => (p.n + p.k).toLowerCase().includes(aQ.toLowerCase()));
  $("#av").innerHTML =
    `<div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px"><h2 class="t">Produk</h2><button class="pill" id="np">+ Tambah produk</button></div><input class="in" id="aq" value="${e0(aQ)}" placeholder="Cari produk" style="max-width:260px;margin:14px 0"><div id="atb"></div>`;
  $("#np").onclick = () => pform();
  $("#aq").oninput = (e) => {
    aQ = e.target.value;
    vP();
    $("#aq").focus();
    $("#aq").setSelectionRange(99, 99);
  };
  $("#atb").innerHTML = l.length
    ? tbl(
        ["", "Produk", "Kategori", "Harga", "Status", ""],
        l.map(
          (p) =>
            `<tr><td>${p.img ? `<img class="thm" src="${p.img}" alt="">` : '<div class="thm"></div>'}</td><td><b>${e0(p.n)}</b>${p.bs ? " ⭐" : ""}</td><td>${p.k}</td><td>${fmt(p.pr)}</td><td>${p.on === false ? "Disembunyikan" : p.so ? "Stok habis" : "Tersedia"}</td><td>${ob("Edit", 'data-e="' + p.id + '"')} <button class="rm" data-dp="${p.id}">Hapus</button></td></tr>`,
        ),
      )
    : '<p class="empty">Produk tidak ditemukan.</p>';
  $$("[data-e]").forEach((x) => (x.onclick = () => pform(+x.dataset.e)));
  $$("[data-dp]").forEach(
    (x) =>
      (x.onclick = () => {
        if (confirm("Hapus produk ini dari katalog?"))
          api("DELETE", "api/admin/products/" + x.dataset.dp)
            .then(() => {
              P = P.filter((p) => p.id != x.dataset.dp);
              delete cart[x.dataset.dp];
              sv("lcs2_cart", cart);
              badge();
              vP();
              toast("Produk dihapus");
            })
            .catch(() => {});
      }),
  );
}
// Form tambah/edit produk
function pform(id) {
  const p = id ? gp(id) : { n: "", k: K.includes("Bouquet") ? "Bouquet" : K[0], pr: "", d: "", img: null, on: true, so: false, bs: false };
  let im = p.img;
  const bsFull = !p.bs && bsCount(id) >= MAXBS; // slot bintang penuh
  modal(
    `<form class="fr" id="pf" style="padding:34px 28px" novalidate><h2 class="full">${id ? "Edit" : "Tambah"} produk</h2><label>Nama produk<input name="n" value="${e0(p.n)}"></label><label>Kategori<select name="k">${K.map((k) => `<option${k == p.k ? " selected" : ""}>${k}</option>`).join("")}</select></label><label>Harga (Rp)<input name="h" inputmode="numeric" value="${p.pr}"></label><label>Foto produk<span class="fi"><b>Pilih foto</b><em id="pn" style="font-style:normal">${im ? "Foto terpasang" : "png atau jpg"}</em><input type="file" id="pi" accept="image/*"></span></label><label class="full">Deskripsi<textarea name="d" style="min-height:90px">${e0(p.d)}</textarea></label><div class="full" style="display:flex;gap:18px;flex-wrap:wrap">${[
      ["on", "Tampil di katalog"],
      ["so", "Stok habis"],
      ["bs", "Unggulan di beranda"],
    ]
      .map(
        (x) =>
          `<label style="display:flex;gap:6px;align-items:center"><input type="checkbox" name="${x[0]}" style="width:auto;margin:0"${(x[0] == "on" ? p.on !== false : p[x[0]]) ? " checked" : ""}${x[0] == "bs" && bsFull ? " disabled" : ""}>${x[1]}${x[0] == "bs" && bsFull ? `<small style="color:var(--mut)">(penuh ${MAXBS}/${MAXBS})</small>` : ""}</label>`,
      )
      .join("")}${bsFull ? `<p class="es" style="flex-basis:100%;margin:4px 0 0;text-align:left">Tidak bisa menambah bintang karena produk unggulan di beranda sudah ${MAXBS}. Hapus bintang (atau hapus produk) salah satu produk unggulan dulu, baru bisa menambah yang baru.</p>` : ""}</div><div class="full"><button class="pill">Simpan produk</button></div></form>`,
  );
  $("#pi").onchange = (e) => {
    const fl = e.target.files[0];
    if (!fl) return;
    const r = new FileReader();
    r.onload = () => {
      const g = new Image();
      g.onload = () => {
        const k = Math.min(1, 600 / g.width),
          c = document.createElement("canvas");
        c.width = g.width * k;
        c.height = g.height * k;
        c.getContext("2d").drawImage(g, 0, 0, c.width, c.height);
        im = c.toDataURL("image/jpeg", 0.75);
        $("#pn").textContent = fl.name;
      };
      g.src = r.result;
    };
    r.readAsDataURL(fl);
  };
  $("#pf").onsubmit = (e) => {
    e.preventDefault();
    const f = e.target,
      h = +f.h.value.replace(/\D/g, "");
    [f.n, f.h].forEach((x) => x.classList.remove("err"));
    if (!f.n.value.trim()) return f.n.classList.add("err");
    if (!h) return f.h.classList.add("err");
    if (f.bs.checked && !(id && p.bs) && bsCount(id) >= MAXBS)
      return toast(`Tidak bisa menambah bintang: produk unggulan sudah ${MAXBS}. Hapus bintang salah satu produk unggulan dulu.`);
    const d = {
      n: f.n.value.trim(),
      k: f.k.value,
      pr: h,
      d: f.d.value,
      img: im,
      on: f.on.checked,
      so: f.so.checked,
      bs: f.bs.checked,
    };
    api(id ? "PUT" : "POST", "api/admin/products" + (id ? "/" + id : ""), d)
      .then((r) => {
        if (id) Object.assign(p, r);
        else P.push(r);
        close();
        vP();
        toast("Produk disimpan");
      })
      .catch(() => {});
  };
}
// Tab Tanya Harga & Custom Order
function vC() {
  const l = cq.map((c, i) => [c, i]).filter(([c]) => (!aM || c.mode == aM) && (!aS || c.status == aS));
  $("#av").innerHTML =
    `<h2 class="t">Tanya Harga & Custom Order</h2><div style="display:flex;gap:10px;margin:14px 0;flex-wrap:wrap"><select class="in" id="am" style="max-width:190px;margin:0"><option value="">Semua jenis</option><option${aM == "Tanya Harga" ? " selected" : ""}>Tanya Harga</option><option${aM == "Custom Order" ? " selected" : ""}>Custom Order</option></select><select class="in" id="as" style="max-width:190px;margin:0"><option value="">Semua status</option>${CS.map((s) => `<option${aS == s ? " selected" : ""}>${s}</option>`).join("")}</select></div>` +
    (l.length
      ? tbl(
          ["Kode", "Pelanggan", "Jenis", "Kategori", "Budget", "Status", ""],
          l.map(
            ([c, i]) =>
              `<tr><td><b>${c.code}</b><br><small>${c.date}</small></td><td>${e0(c.nama)}</td><td>${c.mode}</td><td>${c.kat}</td><td>${c.bud ? fmt(c.bud) : "-"}</td><td>${sel(CS, c.status, 'data-q="' + i + '"')}${c.orderCode ? "<br><small>→ " + c.orderCode + "</small>" : ""}${c.refundSent && !c.refundDone ? '<br><small style="color:#a23336">Refund: rekening masuk</small>' : ""}${c.refundDone ? '<br><small style="color:#2f6b3a">✓ Dana dikembalikan</small>' : ""}</td><td>${ob("Balas", 'data-c="' + i + '"')} <button class="rm" data-y="${i}">Hapus</button></td></tr>`,
          ),
        )
      : '<p class="empty">Belum ada permintaan harga atau custom order.</p>');
  $("#am").onchange = (e) => {
    aM = e.target.value;
    vC();
  };
  $("#as").onchange = (e) => {
    aS = e.target.value;
    vC();
  };
  $$("[data-q]").forEach(
    (s) =>
      (s.onchange = () => {
        const c = cq[s.dataset.q];
        api("PATCH", "api/admin/custom-requests/" + c.code, { status: s.value })
          .then((r) => {
            Object.assign(c, r);
            toast("Status diperbarui");
          })
          .catch(() => vC());
      }),
  );
  $$("[data-y]").forEach(
    (x) =>
      (x.onclick = () => {
        const c = cq[x.dataset.y];
        if (confirm("Hapus permintaan ini?"))
          api("DELETE", "api/admin/custom-requests/" + c.code)
            .then(() => {
              cq.splice(cq.indexOf(c), 1);
              vC();
            })
            .catch(() => {});
      }),
  );
  $$("[data-c]").forEach((x) => (x.onclick = () => cdet(+x.dataset.c)));
}
// Info tambahan di popup custom order: pesanan hasil persetujuan + data refund
const cqExtra = (c) =>
  (c.orderCode ? row("Pesanan dibuat", c.orderCode + " (lihat di tab Pesanan)") : "") +
  (c.refundSent
    ? `<div style="margin:10px 0;padding:12px;border:1px dashed var(--pr);border-radius:14px"><b>Pengembalian dana</b>${row("Bank / e-wallet", c.refundBank)}${row("No. rekening", c.refundNo)}${row("Atas nama", c.refundName)}${row("Status", c.refundDone ? "✓ Sudah dikembalikan" : "Belum dikembalikan")}${c.refundDone ? "" : '<button class="pill sm" id="cqrf" style="margin-top:8px">Dana sudah dikembalikan</button>'}</div>`
    : c.status == "Ditolak" && c.bukti
      ? row("Pengembalian dana", "Menunggu pelanggan mengirim nomor rekening")
      : "");
// Popup balas permintaan harga
function cdet(i) {
  const c = cq[i];
  modal(
    `<div style="padding:34px 30px"><h2>${c.code}</h2><p style="color:var(--mut);margin-bottom:10px">${c.mode} · ${c.date}</p>${row("Nama", c.nama)}${row("WhatsApp", c.wa)}${row("Kategori", c.kat)}${c.ref ? `<img src="${c.ref}" alt="Foto referensi" style="height:140px;border-radius:14px;margin-bottom:8px">` : ""}${row("Deskripsi", c.des)}${row("Tanggal", c.tgl)}${row("Template produk", c.tpl || "")}${row("Budget", c.bud ? fmt(c.bud) : "")}${row("Pembayaran", c.bayar || "")}${cqExtra(c)}${c.bukti ? `<div style="margin:8px 0"><small style="color:var(--mut)">Bukti pembayaran (${c.buktiTgl || ""})</small><img src="${c.bukti}" alt="Bukti pembayaran" style="display:block;max-height:240px;border-radius:14px;margin-top:4px"></div>` : c.bayar ? row("Bukti pembayaran", "Belum dikirim") : ""}${row("Ambil/antar", c.ant)}${row("Area tujuan", c.area || "")}${row("Estimasi ongkir", c.ongkir ? fmt(c.ongkir) : "")}${row("Alamat", c.alm)}${c.kartuFoto ? `<div style="margin:6px 0"><small style="color:var(--mut)">Contoh desain kartu</small><img src="${c.kartuFoto}" alt="Contoh desain kartu" style="display:block;max-height:160px;border-radius:12px;margin-top:4px"></div>` : ""}${row("Warna / desain kartu", c.kartuCat || "")}${row("Kartu ucapan", c.dari || c.untuk || c.pes ? `dari ${c.dari || "-"} untuk ${c.untuk || "-"}: ${c.pes || "-"}` : "")}<div class="fr" style="margin-top:12px"><label>Harga penawaran (Rp)<input class="in" id="cqp" inputmode="numeric" value="${c.quote || ""}"></label><label>Status${sel(CS, c.status, 'id="cqt"')}</label><label class="full">Balasan (tampil di Lacak Pesanan)<textarea class="in" id="cqr" style="min-height:80px">${e0(c.reply)}</textarea></label></div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:12px"><button class="pill" id="cqs">Simpan balasan</button><button class="pill ol" id="cqm">Isi template</button>${c.orderCode ? "" : '<button class="pill ol" id="cqo">Jadikan pesanan</button>'}<a class="pill ol" id="cqw" href="#" target="_blank" rel="noopener">Kirim via WhatsApp</a></div></div>`,
  );
  const g = () => +$("#cqp").value.replace(/\D/g, "") || 0,
    // Simpan harga penawaran, balasan, dan status ke server (mengembalikan Promise)
    sa = (st) =>
      api("PATCH", "api/admin/custom-requests/" + c.code, {
        quote: g(),
        reply: $("#cqr").value,
        status: st || $("#cqt").value,
      }).then((r) => Object.assign(c, r));
  $("#cqm").onclick = () => {
    $("#cqr").value =
      `Halo ${c.nama}, terima kasih sudah menghubungi Little Candy Studio. Untuk ${c.kat} sesuai referensimu, estimasi harganya ${g() ? fmt(g()) : "[isi harga]"}. Pengerjaan sekitar ${S.po} hari. Kalau cocok, kami lanjutkan ya.`;
  };
  $("#cqs").onclick = () => {
    const st = $("#cqt").value;
    sa(st == "Baru" ? "Dibalas" : st)
      .then(() => {
        close();
        vC();
        toast("Balasan disimpan");
      })
      .catch(() => {});
  };
  $("#cqw").onclick = () => {
    sa().catch(() => {});
    $("#cqw").href = WA(c.wa, $("#cqr").value || "Halo " + c.nama);
  };
  if ($("#cqrf"))
    $("#cqrf").onclick = () =>
      api("PATCH", "api/admin/custom-requests/" + c.code, { refund_done: true })
        .then((r) => {
          Object.assign(c, r);
          close();
          vC();
          toast("Ditandai: dana sudah dikembalikan");
        })
        .catch(() => {});
  if ($("#cqo"))
    $("#cqo").onclick = () => {
    if (!g()) return $("#cqp").classList.add("err");
    sa()
      .then(() => api("POST", "api/admin/custom-requests/" + c.code + "/convert"))
      .then((r) => {
        Object.assign(c, r.request);
        if (!orders.some((x) => x.code == r.order.code)) orders.push(r.order);
        close();
        aV = "o";
        adV();
        toast("Masuk ke daftar pesanan");
      })
      .catch(() => {});
  };
}
// Tab Keluhan
function vI() {
  $("#av").innerHTML =
    '<h2 class="t">Keluhan & Pertanyaan</h2><p class="sub">Masuk dari form di halaman Bantuan & FAQ.</p>' +
    (iss.length
      ? tbl(
          ["Kode", "Pengirim", "Jenis", "Pesan", "Status", "Di FAQ", ""],
          iss.map(
            (x, i) =>
              `<tr><td><b>${x.code}</b><br><small>${x.date}</small></td><td>${e0(x.nama)}<br><small>${e0(x.kontak)}</small></td><td>${e0(x.jenis) || "-"}</td><td style="white-space:normal;min-width:220px;max-width:300px">${e0(x.text)}</td><td>${sel(IS, x.status, 'data-s="' + i + '"')}</td><td><button class="pill sm" data-f="${i}" title="Tampilkan pertanyaan & balasan ini di halaman Bantuan & FAQ" style="${x.faq ? "background:var(--pr);color:#fff" : "border:1px solid var(--pr)"}">${x.faq ? "Tampil ✓" : "Tampilkan"}</button></td><td>${ob("Balas", 'data-b="' + i + '"')} <button class="rm" data-z="${i}">Hapus</button></td></tr>`,
          ),
        )
      : '<p class="empty">Belum ada keluhan atau pertanyaan masuk.</p>');
  $$("#av [data-s]").forEach(
    (s) =>
      (s.onchange = () => {
        const x = iss[s.dataset.s];
        api("PATCH", "api/admin/complaints/" + x.code, { status: s.value })
          .then((r) => {
            Object.assign(x, r);
            toast("Status diperbarui");
          })
          .catch(() => vI());
      }),
  );
  // Tombol tampil / sembunyikan pertanyaan di Bantuan & FAQ
  $$("#av [data-f]").forEach(
    (b) =>
      (b.onclick = () => {
        const x = iss[b.dataset.f];
        if (!x.faq && !(x.reply || "").trim()) return toast("Isi balasan dulu lewat tombol Balas, baru bisa ditampilkan di FAQ");
        api("PATCH", "api/admin/complaints/" + x.code, { faq: !x.faq })
          .then((r) => {
            Object.assign(x, r);
            vI();
            toast(x.faq ? "Ditampilkan di Bantuan & FAQ" : "Disembunyikan dari FAQ");
          })
          .catch(() => {});
      }),
  );
  $$("#av [data-z]").forEach(
    (z) =>
      (z.onclick = () => {
        const x = iss[z.dataset.z];
        if (confirm("Hapus pesan ini?"))
          api("DELETE", "api/admin/complaints/" + x.code)
            .then(() => {
              iss.splice(iss.indexOf(x), 1);
              vI();
            })
            .catch(() => {});
      }),
  );
  $$("#av [data-b]").forEach(
    (x) =>
      (x.onclick = () => {
        const t = iss[x.dataset.b],
          k = t.kontak || "",
          em = k.includes("@");
        modal(
          `<div style="padding:34px 30px"><h2>${t.code}</h2><p style="color:var(--mut)">${e0(t.jenis)} · ${t.date}</p><div class="es" style="margin:12px 0">${e0(t.text)}</div>${row("Pengirim", t.nama)}${row("Kontak", k)}<label style="margin-top:10px">Balasan (tampil di Lacak Pesanan)<textarea class="in" id="ir" style="min-height:100px">${e0(t.reply)}</textarea></label><label style="display:flex;align-items:center;gap:8px;margin-top:10px;cursor:pointer;font-size:.92rem"><input type="checkbox" id="ifq" style="width:auto;margin:0" ${t.faq ? "checked" : ""}> Tampilkan pertanyaan & balasan ini di Bantuan & FAQ (nama dan kontak tidak ikut tampil)</label><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:14px"><button class="pill" id="is2">Simpan dan tandai selesai</button>${k ? `<a class="pill ol" id="iw" href="#" target="_blank" rel="noopener">Kirim via ${em ? "email" : "WhatsApp"}</a>` : ""}</div></div>`,
        );
        // Simpan balasan (dan status bila diberikan) ke server
        const sv2 = (st) =>
          api("PATCH", "api/admin/complaints/" + t.code, { reply: $("#ir").value, faq: $("#ifq").checked, ...(st ? { status: st } : {}) }).then((r) =>
            Object.assign(t, r),
          );
        $("#is2").onclick = () => {
          sv2("Selesai")
            .then(() => {
              close();
              vI();
              toast("Keluhan ditandai selesai");
            })
            .catch(() => {});
        };
        const w = $("#iw");
        if (w)
          w.onclick = () => {
            sv2().catch(() => {});
            w.href = em
              ? "mailto:" + k + "?subject=" + encodeURIComponent("Balasan " + t.code) + "&body=" + encodeURIComponent($("#ir").value)
              : WA(k, $("#ir").value);
          };
      }),
  );
}
// Tab Pelanggan
function vU() {
  const m = {};
  orders.forEach((o) => {
    const k = (o.wa || o.name).trim();
    (m[k] = m[k] || { n: o.name, w: o.wa || "-", c: 0, t: 0 }).c++;
    m[k].t += o.total;
  });
  const l = Object.values(m).sort((a, b) => b.t - a.t);
  $("#av").innerHTML =
    '<h2 class="t">Pelanggan</h2><p class="sub">Dirangkum otomatis dari riwayat pesanan.</p>' +
    (l.length
      ? tbl(
          ["Nama", "WhatsApp", "Jumlah pesanan", "Total belanja", ""],
          l.map(
            (u) =>
              `<tr><td><b>${e0(u.n)}</b></td><td>${e0(u.w)}</td><td>${u.c}</td><td>${fmt(u.t)}</td><td>${u.w != "-" ? `<a class="pill sm" style="border:1px solid var(--pr)" href="${WA(u.w)}" target="_blank" rel="noopener">WhatsApp</a>` : ""}</td></tr>`,
          ),
        )
      : '<p class="empty">Belum ada pelanggan.</p>');
}
// Tab Pengaturan
// Pengaturan kategori produk: tambah, ubah nama, hapus (hanya jika belum dipakai produk)
function katBox() {
  const n = (k) => P.filter((p) => p.k == k).length,
    nm = (v) => String(v || "").trim().replace(/\s+/g, " ").slice(0, 30),
    dup = (v, skip) => K.some((x, i) => i != skip && x.toLowerCase() == v.toLowerCase());
  $("#kb").innerHTML = `<h3>Kategori produk</h3><p class="sub" style="margin:4px 0 10px;font-size:.9rem">Dipakai di katalog, filter, beranda, form produk, dan custom order.</p>${K.map(
    (k, i) =>
      `<div class="rw" style="align-items:center;gap:10px;border-bottom:1px solid var(--line);padding:8px 0"><span style="display:flex;align-items:center;gap:12px">${KF[k] ? `<img class="thm" style="width:48px;height:48px" src="${KF[k]}" alt="">` : '<div class="thm" style="width:48px;height:48px"></div>'}<span><b>${e0(k)}</b> <small style="color:var(--mut)">${n(k)} produk</small></span></span><span style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;justify-content:flex-end">${KF[k] ? `<button class="rm" data-kx="${i}">Hapus foto</button>` : ""}<label class="pill sm" style="border:1px solid var(--pr);cursor:pointer">${KF[k] ? "Ganti foto" : "Tambah foto"}<input type="file" accept="image/*" data-kf="${i}" hidden></label>${ob("Ubah nama", 'data-kr="' + i + '"')}<button class="rm" data-kd="${i}">Hapus</button></span></div>`,
  ).join("")}<div style="display:flex;gap:10px;margin-top:16px;flex-wrap:wrap"><input class="in" id="kn" placeholder="Nama kategori baru, misal: Hampers" maxlength="30" style="flex:1;min-width:200px;margin:0"><button class="pill" id="ka">Tambah kategori</button></div>`;
  const done = (r, m) => {
    catRes(r);
    katBox();
    toast(m);
  };
  const add = () => {
    const v = nm($("#kn").value);
    if (!v) return toast("Isi nama kategori dulu ya");
    if (dup(v, -1)) return toast("Kategori itu sudah ada");
    api("POST", "api/admin/categories", { name: v })
      .then((r) => done(r, `Kategori "${v}" ditambahkan`))
      .catch(() => {});
  };
  $("#ka").onclick = add;
  $("#kn").onkeydown = (e) => {
    if (e.key == "Enter") {
      e.preventDefault();
      add();
    }
  };
  $$("#kb [data-kr]").forEach(
    (b) =>
      (b.onclick = () => {
        const i = +b.dataset.kr,
          old = K[i],
          v = nm(prompt("Nama baru untuk kategori " + old, old));
        if (!v || v == old) return;
        if (dup(v, i)) return toast("Kategori itu sudah ada");
        api("PATCH", "api/admin/categories/" + KID[old], { name: v })
          .then((r) => {
            F.k = F.k.map((x) => (x == old ? v : x));
            done(r, "Nama kategori diperbarui");
          })
          .catch(() => {});
      }),
  );
  $$("#kb [data-kd]").forEach(
    (b) =>
      (b.onclick = () => {
        const i = +b.dataset.kd,
          k = K[i],
          c = n(k);
        if (c) return toast(`Kategori "${k}" masih dipakai ${c} produk. Pindahkan atau hapus produknya dulu.`);
        if (K.length <= 1) return toast("Minimal harus ada 1 kategori");
        if (!confirm(`Hapus kategori "${k}"?`)) return;
        api("DELETE", "api/admin/categories/" + KID[k])
          .then((r) => done(r, "Kategori dihapus"))
          .catch(() => {});
      }),
  );
  // Foto kategori (tampil di beranda, bagian "Belanja per kategori")
  $$("#kb [data-kf]").forEach(
    (inp) =>
      (inp.onchange = () => {
        const fl = inp.files[0],
          k = K[+inp.dataset.kf];
        if (!fl) return;
        rs(fl, 500, (u) =>
          api("PATCH", "api/admin/categories/" + KID[k], { image: u })
            .then((r) => done(r, `Foto kategori "${k}" disimpan`))
            .catch(() => {}),
        );
      }),
  );
  $$("#kb [data-kx]").forEach(
    (b) =>
      (b.onclick = () => {
        const k = K[+b.dataset.kx];
        api("PATCH", "api/admin/categories/" + KID[k], { remove_image: true })
          .then((r) => done(r, "Foto kategori dihapus"))
          .catch(() => {});
      }),
  );
}
function vS() {
  let qNew = ""; // gambar QRIS baru (belum disimpan)
  const L = [
    ["wa", "Nomor WhatsApp studio (format 62...)"],
    ["qrisNama", "Nama merchant QRIS"],
    ["jam", "Jam operasional"],
    ["po", "Minimal hari pre-order"],
    ["dp", "Persentase DP (%)"],
    ["base", "Ongkir: biaya dasar (Rp)"],
    ["km", "Ongkir: tarif per km (Rp)"],
    ["min", "Ongkir minimum (Rp)"],
  ];
  $("#av").innerHTML =
    `<h2 class="t">Pengaturan</h2><div class="box" id="kb" style="margin-top:14px"></div><form class="box fr" id="sf" style="margin-top:20px">${L.map((x) => `<label${x[0] == "qrisNama" ? ' class="full"' : ""}>${x[1]}<input name="${x[0]}" value="${e0(S[x[0]])}"></label>`).join("")}<div class="full"><b style="font-size:.92rem;font-weight:500">Gambar QRIS pembayaran</b><div class="qr" style="margin:8px 0 0;max-width:230px"><img id="qpv" src="${e0(S.qris)}" alt="QRIS"></div><span class="fi" style="margin-top:8px"><b>Upload QRIS</b><em id="qn" style="font-style:normal">png atau jpg, foto QRIS dari bank / e-wallet</em><input type="file" id="qf" accept="image/*"></span></div><div class="es full" id="sp"></div><div class="full" style="display:flex;gap:10px;flex-wrap:wrap"><button class="pill">Simpan pengaturan</button></div></form><form class="box fr" id="af" style="margin-top:20px" novalidate><h3 class="full">Akun admin</h3><p class="sub full" style="margin:0;font-size:.9rem">Ganti username dan/atau password login admin. Kosongkan password baru bila hanya ingin ganti username.</p><label class="full">Username<input name="au" value="${e0(admUser)}" autocomplete="username"></label><label class="full">Password saat ini <span>*</span><input name="ac" type="password" autocomplete="current-password"></label><label>Password baru<input name="an" type="password" placeholder="minimal 8 karakter" autocomplete="new-password"></label><label>Ulangi password baru<input name="ar" type="password" autocomplete="new-password"></label><label class="full" style="display:flex;align-items:center;gap:8px;cursor:pointer"><input type="checkbox" id="asp" style="width:auto;margin:0"> Tampilkan password</label><div class="full"><button class="pill">Simpan akun admin</button></div></form>`;
  katBox();
  // Form akun admin
  const af = $("#af");
  $("#asp").onchange = (e) =>
    af.querySelectorAll('[name="ac"],[name="an"],[name="ar"]').forEach((x) => (x.type = e.target.checked ? "text" : "password"));
  af.onsubmit = (e) => {
    e.preventDefault();
    const g = (n) => af.querySelector(`[name="${n}"]`),
      u = g("au").value.trim(),
      cur = g("ac").value,
      nw = g("an").value,
      rp2 = g("ar").value;
    [...af.elements].forEach((x) => x.classList.remove("err"));
    if (u.length < 3) return g("au").classList.add("err"), toast("Username minimal 3 karakter");
    if (!cur) return g("ac").classList.add("err"), toast("Isi password saat ini untuk menyimpan perubahan");
    if (nw && nw.length < 8) return g("an").classList.add("err"), toast("Password baru minimal 8 karakter");
    if (nw != rp2) return g("ar").classList.add("err"), toast("Ulangi password baru dengan benar");
    api("PUT", "api/admin/account", { username: u, current_password: cur, password: nw, password_confirmation: rp2 })
      .then((r) => {
        admUser = r.username;
        g("ac").value = g("an").value = g("ar").value = "";
        toast(nw ? "Username & password admin diperbarui" : "Username admin diperbarui");
      })
      .catch(() => {});
  };
  const f = $("#sf"),
    pv = () => {
      const km = 12,
        o = Math.max(+f.min.value, Math.round((+f.base.value + km * f.km.value) / 1000) * 1000);
      $("#sp").innerHTML = `Contoh estimasi ongkir ke Kepanjen (± 12 km): <b>${fmt(o)}</b>`;
    };
  $("#qf").onchange = (e) => {
    const fl = e.target.files[0];
    if (!fl) return;
    rs(fl, 700, (u) => {
      qNew = u;
      $("#qpv").src = u;
      $("#qn").textContent = fl.name + " (klik Simpan pengaturan)";
    });
  };
  f.oninput = pv;
  pv();
  f.onsubmit = (e) => {
    e.preventDefault();
    const d = {};
    L.forEach((x) => (d[x[0]] = ["wa", "qrisNama", "jam"].includes(x[0]) ? f[x[0]].value : +f[x[0]].value || 0));
    if (qNew) d.qris = qNew;
    api("PUT", "api/admin/settings", d)
      .then((r) => {
        S = r;
        renderFooter();
        vS();
        toast("Pengaturan disimpan");
      })
      .catch(() => {});
  };
}
