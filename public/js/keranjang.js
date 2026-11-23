/* ==========================================================
   FILE : js/keranjang.js
   ISI  : KERANJANG & CHECKOUT
   TIPS : Daftar area pengiriman & jarak dari Pakisaji: config/littlecandy.php. Rumus ongkir: fee() (dihitung ulang juga di server).
   ========================================================== */

// Memperbarui angka badge di menu Keranjang
function badge(a) {
  const n = Object.values(cart).reduce((x, y) => x + y, 0),
    b = $("#bd");
  b.textContent = n;
  b.style.display = n ? "grid" : "none";
  if (a) {
    b.classList.remove("pop");
    void b.offsetWidth;
    b.classList.add("pop");
  }
}
// Daftar area pengiriman & jarak dari Pakisaji: diatur di config/littlecandy.php (dikirim server lewat BOOT)
const AREAS = BOOT.areas;
const fee = (km) => Math.max(+S.min, Math.round((+S.base + km * S.km) / 1000) * 1000),
  cids = () => Object.keys(cart).filter((id) => gp(id)),
  sub = () => cids().reduce((s, id) => s + gp(id).pr * cart[id], 0);
// Menggambar daftar item & ringkasan harga Keranjang
function renderCart() {
  const ids = cids(),
    sb = sub();
  $("#cl").innerHTML = ids.length
    ? ids
        .map((id) => {
          const p = gp(id);
          return `<div class="ci"><div class="ph">${p.img ? `<img src="${p.img}" alt="">` : sun}</div><div class="inf"><small>${p.k}</small><b>${e0(p.n)}</b><small>${fmt(p.pr)}</small><br><button class="rm" data-r="${id}">Hapus</button></div><div class="qt"><button data-m="${id}" aria-label="Kurangi">−</button><span>${cart[id]}</span><button data-a="${id}" aria-label="Tambah">+</button></div><b style="min-width:92px;text-align:right">${fmt(p.pr * cart[id])}</b></div>`;
        })
        .join("")
    : '<div class="empty" style="padding:60px 0"><div style="font-size:3rem">🧺</div><h3 style="margin:6px 0">Keranjangmu masih kosong</h3><p class="sub" style="margin:6px 0 18px">Pilih bunga dari katalog, atau buat custom order.</p><a class="pill" href="#katalog">Ke katalog</a></div>';
  $("#cs").innerHTML =
    `<h2 style="font-size:1.5rem;margin-bottom:8px">Rincian harga</h2><div class="rw"><span>Produk</span><span>${fmt(sb)}</span></div><div class="rw"><span>Ongkir</span><span style="font-size:.8rem">dihitung saat membuat pesanan</span></div><div class="rw tt"><span>Total</span><span>${fmt(sb)}</span></div><button class="pill" id="pay"${ids.length ? "" : ' disabled style="opacity:.5"'}>Buat pesanan</button><a class="pill ol" href="#katalog" style="width:100%;margin-top:8px">Tambah produk</a>`;
  $$("[data-a]").forEach(
    (b) =>
      (b.onclick = () => {
        cart[b.dataset.a]++;
        upd();
      }),
  );
  $$("[data-m]").forEach(
    (b) =>
      (b.onclick = () => {
        const i = b.dataset.m;
        cart[i] > 1 ? cart[i]-- : delete cart[i];
        upd();
      }),
  );
  $$("[data-r]").forEach(
    (b) =>
      (b.onclick = () => {
        delete cart[b.dataset.r];
        upd();
      }),
  );
  $("#pay").onclick = checkout;
}
// Simpan keranjang lalu gambar ulang
function upd() {
  sv("lcs2_cart", cart);
  badge();
  renderCart();
}
// Popup data pemesan: pilih ambil/antar + estimasi ongkir
function checkout() {
  const sb = sub(),
    ids = cids();
  if (!ids.length) return;
  // Kartu ucapan & catatan diisi PER BUNGA: 1 unit yang dibeli = 1 set isian
  const units = ids.flatMap((id) => Array.from({ length: cart[id] }, () => gp(id).n)),
    ku =
      (units.length > 1
        ? `<p class="sub full" style="margin:0">Kamu membeli ${units.length} bunga, jadi kartu ucapan dan catatan (opsional) diisi satu per bunga.</p>`
        : "") +
      units
        .map(
          (n, i) =>
            `<div class="ext show"><div class="gc">Bunga ${i + 1} · ${e0(n)}</div></div><label>Dari<input name="dari${i}" placeholder="Nama pengirim"></label><label>Untuk<input name="untuk${i}" placeholder="Nama penerima"></label><label class="full">Isi kartu ucapan (opsional)<textarea name="pes${i}" style="min-height:70px" placeholder="Selamat atas kelulusanmu ya..."></textarea></label><label class="full">Contoh desain kartu (opsional)<span class="fi"><b>Upload File</b><em id="kfn${i}" style="font-style:normal">Boleh dikosongi, desain kami yang pilihkan.</em><input type="file" id="kf${i}" accept="image/*"></span><img class="pv" id="kfp${i}" style="display:none;height:100px" alt="Contoh desain kartu"></label><label class="full">Catatan warna / desain kartu (opsional)<input name="desain${i}" placeholder="Misal: kartu warna pink pastel"></label><label class="full">Catatan untuk bunga ini (opsional)<input name="cat${i}" placeholder="Misal: warna pita pink"></label>`,
        )
        .join("");
  let mt = "ambil",
    py = "lunas";
  modal(
    `<form class="fr" id="co" style="padding:34px 28px" novalidate><h2 class="full">Data pemesan</h2><label>Nama <span>*</span><input name="n" placeholder="Nama lengkap"></label><label>Nomor WhatsApp <span>*</span><input name="w" inputmode="tel" placeholder="0812xxxxxxx"></label><label class="full">Tanggal dibutuhkan <span>*</span><span class="hint"> (minimal ${S.po} hari dari hari ini, paling cepat ${minTglTxt()})</span><input type="date" name="t" min="${minTgl()}"></label><div class="full ch"><div class="on" data-t="ambil"><b>Ambil sendiri</b><small>Studio, Pakisaji</small></div><div data-t="antar"><b>Diantar</b><small>Ongkir dari Pakisaji</small></div></div><div class="full" id="dv"><div class="fr" style="padding-top:4px"><label>Area tujuan <span>*</span><select name="a"><option value="">Pilih area</option>${AREAS.map((a, i) => `<option value="${i}">${a[0]}</option>`).join("")}<option value="x">Area lain</option></select></label><label>Alamat lengkap <span>*</span><input name="al" placeholder="Nomor rumah, RT/RW, kecamatan"></label><div class="es full" id="es"></div></div></div>${ku}${payCh("lunas")}<div class="full" id="tt"></div><div class="full"><button class="pill">Buat pesanan</button></div></form>`,
  );
  const kf = []; // foto contoh desain kartu per bunga
  units.forEach((n, i) => {
    const inp = $("#kf" + i);
    inp.onchange = () => {
      const fl = inp.files[0];
      if (!fl) return;
      rs(fl, 500, (u) => {
        kf[i] = u;
        $("#kfn" + i).textContent = fl.name;
        const pv = $("#kfp" + i);
        pv.src = u;
        pv.style.display = "block";
      });
    };
  });
  const f = $("#co"),
    calc = () => {
      let o = 0;
      if (mt == "antar") {
        const v = f.a.value;
        $("#es").innerHTML =
          v === ""
            ? "Pilih area tujuan untuk melihat estimasi ongkir."
            : v == "x"
              ? "Area di luar daftar: ongkir dikonfirmasi admin lewat WhatsApp."
              : ((o = fee(AREAS[v][1])),
                `Jarak ± ${AREAS[v][1]} km dari Pakisaji. Estimasi ongkir <b>${fmt(o)}</b>, angka final dikonfirmasi admin.`);
      }
      const d = dueAmt(sb + o, py);
      $("#tt").innerHTML =
        `<div class="rw tt"><span>Total${mt == "antar" ? " (dengan estimasi ongkir)" : ""}</span><span>${fmt(sb + o)}</span></div>` +
        (py == "dp"
          ? `<div class="rw"><span>Dibayar sekarang (DP ${S.dp}%)</span><b>${fmt(d)}</b></div><div class="rw"><span>Sisa pelunasan</span><span>${fmt(sb + o - d)}</span></div>`
          : "");
      return o;
    };
  $$("#co [data-t]").forEach(
    (d) =>
      (d.onclick = () => {
        mt = d.dataset.t;
        $$("#co [data-t]").forEach((x) => x.classList.toggle("on", x == d));
        $("#dv").classList.toggle("show", mt == "antar");
        calc();
      }),
  );
  $$("#py [data-py]").forEach(
    (d) =>
      (d.onclick = () => {
        py = d.dataset.py;
        $$("#py [data-py]").forEach((x) => x.classList.toggle("on", x == d));
        calc();
      }),
  );
  f.a.onchange = calc;
  calc();
  f.onsubmit = (e) => {
    e.preventDefault();
    [...f.elements].forEach((x) => x.classList.remove("err"));
    const bad = [];
    let msg = "Lengkapi data yang ditandai dulu ya";
    if (!f.n.value.trim()) bad.push(f.n);
    if (num(f.w.value).toString().length < 9) bad.push(f.w);
    if (!f.t.value) bad.push(f.t);
    else if (f.t.value < minTgl()) {
      bad.push(f.t);
      msg = tglMsg();
    }
    if (mt == "antar") {
      if (f.a.value === "") bad.push(f.a);
      if (!f.al.value.trim()) bad.push(f.al);
    }
    bad.forEach((x) => x.classList.add("err"));
    if (bad.length) return toast(msg);
    const btn = f.querySelector("button.pill");
    btn.disabled = true;
    // Kirim ke server: harga & ongkir dihitung ulang di sana, kode pesanan dibuat otomatis
    api("POST", "api/orders", {
      name: f.n.value.trim(),
      wa: f.w.value.trim(),
      tgl: f.t.value,
      metode: mt,
      area: mt == "antar" ? String(f.a.value) : "",
      alamat: f.al.value.trim(),
      bayarTipe: py,
      items: ids.map((i) => ({ id: +i, qty: cart[i] })),
      kartu: units
        .map((n, i) => ({
          no: i + 1,
          bunga: n,
          dari: f.elements["dari" + i].value.trim(),
          untuk: f.elements["untuk" + i].value.trim(),
          pes: f.elements["pes" + i].value.trim(),
          desain: f.elements["desain" + i].value.trim(),
          foto: kf[i] || "",
          cat: f.elements["cat" + i].value.trim(),
        }))
        .filter((k) => k.dari || k.untuk || k.pes || k.cat || k.desain || k.foto),
    })
      .then((od) => {
        cart = {};
        sv("lcs2_cart", cart);
        badge();
        renderCart();
        modal(
          `<div class="ft"><div style="font-size:3rem">🎉</div><h2>Pesanan berhasil dibuat</h2><p style="color:var(--mut);margin:8px 0">Kode pesananmu</p><div style="font-family:'Bagel Fat One';font-size:2.2rem;color:var(--h)">${od.code}</div><div class="rw tt" style="margin-top:14px"><span>${od.bayarTipe == "dp" ? "DP yang dibayar sekarang" : "Total yang dibayar"}</span><span>${fmt(od.dibayar)}</span></div>${od.bayarTipe == "dp" ? `<div class="rw"><span>Sisa pelunasan</span><span>${fmt(od.sisa)}</span></div>` : ""}<div class="es" style="margin-top:12px;text-align:left"><b>Cara pembayaran</b><br>Scan QRIS di bawah sesuai nominal, lalu upload foto bukti pembayaran di bawah ini.${od.area == "Area lain" ? " Ongkir untuk area luar daftar akan dikonfirmasi admin." : ""}</div>${od.bayarTipe == "dp" ? "<p style=\"margin-top:8px;font-size:.85rem\">Sisa pelunasan dibayar sebelum pesanan diambil atau dikirim.</p>" : ""}${qrisBox(od.dibayar)}<div style="margin-top:14px">${proofHtml(od)}</div><div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:20px"><button class="pill ol" id="gt">Lacak pesanan</button></div></div>`,
        );
        proofBind(od);
        $("#gt").onclick = () => goTrack(od.code);
      })
      .catch(() => (btn.disabled = false));
  };
}
