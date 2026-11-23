/* ==========================================================
   FILE : js/custom.js
   ISI  : HALAMAN CUSTOM ORDER (4 langkah)
   TIPS : Jenis & kontak -> Detail pesanan -> Kartu ucapan -> Tinjau & kirim.
          Hasilnya dikirim ke server (tabel custom_requests, kode CQ001, dst) dan bisa dibalas dari admin.
   ========================================================== */

const WL = () => ["Jenis & kontak", "Detail pesanan", "Kartu ucapan", "Tinjau & kirim"].concat(W.mode == "custom" ? ["Pembayaran"] : []);
const W0 = () => ({
  s: 1,
  mode: "custom",
  py: "lunas",
  tpl: "",
  nama: "",
  wa: "",
  kat: "",
  des: "",
  tgl: "",
  bud: "",
  ant: "Ambil sendiri",
  area: "",
  alm: "",
  dari: "",
  untuk: "",
  pes: "",
  ref: "",
  file: "",
  bukti: "",
  buktiNama: "",
  kartuFoto: "",
  kartuNama: "",
  kartuCat: "",
});
const W = W0();
let cqBusy = false; // mencegah kirim ganda
// Ongkir custom order: area tujuan + estimasi (memakai AREAS & fee() dari js/keranjang.js)
const ongC = () => (W.ant == "Diantar" && W.area !== "" && W.area != "x" ? fee(AREAS[W.area][1]) : 0),
  areaName = () => (W.area === "" ? "" : W.area == "x" ? "Area lain" : AREAS[W.area][0]),
  payBase = () => (W.bud ? num(W.bud) + ongC() : 0),
  ongTxt = () =>
    W.area === ""
      ? "Pilih area tujuan untuk melihat estimasi ongkir."
      : W.area == "x"
        ? "Area di luar daftar: ongkir dikonfirmasi admin lewat WhatsApp."
        : `Jarak ± ${AREAS[W.area][1]} km dari Pakisaji. Estimasi ongkir <b>${fmt(ongC())}</b>, angka final dikonfirmasi admin.`;
const areaHtml = () =>
  `<label>Area tujuan <span>*</span><select name="area"><option value="">Pilih area</option>${AREAS.map((a, i) => `<option value="${i}"${String(W.area) === String(i) ? " selected" : ""}>${a[0]}</option>`).join("")}<option value="x"${W.area == "x" ? " selected" : ""}>Area lain</option></select></label>${wi("Alamat lengkap <span>*</span>", "alm", 'placeholder="Nomor rumah, RT/RW, kecamatan"')}<div class="es full">${ongTxt()}</div>`;
const wi = (l, n, ex = "", t = "text") =>
  `<label>${l}<input name="${n}" type="${t}" value="${e0(W[n])}" ${ex}></label>`;

// Menggambar langkah yang sedang aktif
function wr() {
  const m = W.mode == "custom";
  let h = "";
  if (W.s == 1)
    h = `<div class="fr"><div class="full ch"><div class="${m ? "" : "on"}" data-wm="q"><b>Tanya harga saja</b><small>Kirim ide, terima estimasi harga</small></div><div class="${m ? "on" : ""}" data-wm="custom"><b>Pesan custom</b><small>Lengkap dengan tanggal dan pengiriman</small></div></div>${wi('Nama <span>*</span>', "nama", 'placeholder="Nama lengkap"')}${wi('Nomor WhatsApp aktif <span>*</span>', "wa", 'placeholder="0812xxxxxxx" inputmode="tel"')}<label class="full">Kategori <span>*</span><select name="kat"><option value="">Pilih kategori</option>${K.map((k) => `<option${W.kat == k ? " selected" : ""}>${k}</option>`).join("")}</select></label></div>`;
  if (W.s == 2)
    h = `<div class="fr"><label class="full">Foto referensi (wajib) <span>*</span><span class="fi"><b>Upload File</b><em id="fn" style="font-style:normal">${e0(W.file) || "Upload file png, jpg."}</em><input type="file" accept="image/png,image/jpeg"></span>${W.ref ? `<img class="pv" src="${W.ref}" alt="Foto referensi">` : ""}</label><label class="full">Deskripsi pesanan <span>*</span><textarea name="des" placeholder="Contoh: warna bunga diganti pink dan putih, ditambah snack">${e0(W.des)}</textarea></label>${
      m
        ? `${wi('Tanggal dibutuhkan <span>*</span><span class="hint"> (minimal ' + S.po + " hari dari hari ini, paling cepat " + minTglTxt() + ")</span>", "tgl", `min="${minTgl()}"`, "date")}${wi("Budget (Rp)", "bud", 'placeholder="150000" inputmode="numeric"')}<label>Ambil atau antar<select name="ant">${["Ambil sendiri", "Diantar"].map((a) => `<option${W.ant == a ? " selected" : ""}>${a}</option>`).join("")}</select></label>${W.ant == "Diantar" ? areaHtml() : ""}`
        : ""
    }</div>`;
  if (W.s == 3)
    h = `<div class="fr"><div class="ext show"><div class="gc">Kartu Ucapan / Greeting Card</div></div><p class="sub full" style="margin:0">Opsional. Lewati jika tidak perlu kartu ucapan.</p>${wi("Dari", "dari", 'placeholder="Nama pengirim"')}${wi("Untuk", "untuk", 'placeholder="Nama penerima"')}<label class="full">Isi pesan<textarea name="pes" placeholder="Selamat atas kelulusanmu ya...">${e0(W.pes)}</textarea></label><label class="full">Contoh desain kartu (opsional)<span class="fi"><b>Upload File</b><em style="font-style:normal">${e0(W.kartuNama) || "Boleh dikosongi, desain kami yang pilihkan."}</em><input type="file" id="kf" accept="image/*"></span>${W.kartuFoto ? `<img class="pv" style="height:110px" src="${W.kartuFoto}" alt="Contoh desain kartu">` : ""}</label>${wi("Catatan warna / desain kartu (opsional)", "kartuCat", 'placeholder="Misal: kartu warna pink pastel, hiasan bunga kecil"')}</div>`;
  if (W.s == 4) {
    const r = (a, b) => `<div class="rw"><span>${a}</span><b style="text-align:right;max-width:65%">${e0(b) || "-"}</b></div>`;
    h = `<h3 style="margin-bottom:10px">Periksa kembali</h3>${r("Jenis", m ? "Pesan custom" : "Tanya harga")}${r("Nama", W.nama)}${r("WhatsApp", W.wa)}${r("Kategori", W.kat)}${r("Deskripsi", W.des)}${m ? r("Tanggal", W.tgl) + r("Budget", W.bud ? fmt(num(W.bud)) : "") + r("Pengiriman", W.ant + (W.ant == "Diantar" ? " · " + areaName() + (ongC() ? " · estimasi ongkir " + fmt(ongC()) : "") + (W.alm ? " · " + W.alm : "") : "")) : ""}${r("Kartu ucapan", W.dari || W.untuk || W.pes ? `dari ${W.dari || "-"} untuk ${W.untuk || "-"}: ${W.pes || "-"}` : "Tidak ada")}${r("Desain kartu", W.kartuFoto || W.kartuCat ? (W.kartuCat || "Sesuai foto contoh") + (W.kartuFoto ? " (foto contoh terlampir)" : "") : "Desain pilihan kami")}${W.ref ? `<img class="pv" src="${W.ref}" alt="Foto referensi">` : ""}${W.kartuFoto ? `<img class="pv" src="${W.kartuFoto}" alt="Contoh desain kartu">` : ""}`;
  }
  if (W.s == 5)
    h = `<h3 style="margin-bottom:6px">Pembayaran via QRIS</h3><p class="sub" style="margin:0 0 14px">Scan QRIS di bawah${W.bud ? " sesuai budget yang kamu isi" : ""}, lalu upload foto bukti pembayarannya di bawah QRIS. Harga final tetap dikonfirmasi admin.</p>${payCh(W.py)}${qrisBox(dueAmt(payBase(), W.py))}${W.py == "dp" && W.bud ? `<div class="es" style="margin-top:12px;text-align:center">Sisa pelunasan ${fmt(payBase() - dueAmt(payBase(), W.py))} dibayar sebelum pesanan diambil / dikirim.</div>` : ""}${W.bud && ongC() ? `<div class="es" style="margin-top:12px;text-align:center">Nominal = budget ${fmt(num(W.bud))} + estimasi ongkir ${fmt(ongC())}.</div>` : ""}${W.bud ? "" : '<div class="es" style="margin-top:12px;text-align:center">Budget belum diisi. Nominal mengikuti harga yang disepakati dengan admin.</div>'}<div class="fr" style="margin-top:16px"><label class="full">Bukti pembayaran <span>*</span><span class="fi"><b>Upload bukti bayar</b><em style="font-style:normal">${e0(W.buktiNama) || "Upload file png, jpg."}</em><input type="file" id="bf" accept="image/*"></span>${W.bukti ? `<img class="pv" style="height:130px" src="${W.bukti}" alt="Bukti pembayaran">` : ""}</label></div>`;
  // Banner template: muncul jika custom order dibuka dari tombol "Custom versi ini"
  const tp =
    W.tpl && W.s < 3
      ? `<div class="tpl">${W.ref ? `<img src="${W.ref}" alt="${e0(W.tpl)}">` : ""}<div><small>Template produk</small><b>${e0(W.tpl)}</b><span>${W.ref ? "Fotonya sudah dipakai sebagai referensi. " : ""}Ubah warna atau isi di langkah berikutnya.</span></div><button class="rm" data-wx="1" type="button">Hapus template</button></div>`
      : "";
  $("#wb").innerHTML =
    tp +
    h +
    `<div style="display:flex;justify-content:space-between;gap:10px;margin-top:24px">${W.s > 1 ? '<button class="pill ol" data-w="p">Kembali</button>' : "<span></span>"}<button class="pill" data-w="n">${W.s == 5 || (W.s == 4 && !m) ? "Kirim permintaan" : W.s == 4 ? "Lanjut ke pembayaran" : "Lanjut"}</button></div>`;
  $("#wz").innerHTML = WL().map((l, i) => `<div class="${W.s >= i + 1 ? "on" : ""}">${i + 1}. ${l}</div>`).join("");
}
// Simpan isian ke W setiap kali berubah
const wsave = (e) => {
  const t = e.target;
  if (t.name && t.type != "file") W[t.name] = t.value;
};
$("#wb").addEventListener("input", wsave);
$("#wb").addEventListener("change", (e) => {
  wsave(e);
  const t = e.target;
  if (t.name == "ant" || t.name == "area") return wr(); // tampilkan / perbarui area & estimasi ongkir
  if (t.id == "kf" && t.files[0])
    return rs(t.files[0], 500, (u) => {
      W.kartuFoto = u;
      W.kartuNama = t.files[0].name;
      wr();
    });
  if (t.id == "bf" && t.files[0])
    return rs(t.files[0], 900, (u) => {
      W.bukti = u;
      W.buktiNama = t.files[0].name;
      wr();
    });
  if (t.type == "file" && t.files[0])
    rs(t.files[0], 420, (u) => {
      W.ref = u;
      W.file = t.files[0].name;
      wr();
    });
});
$("#wb").addEventListener("click", (e) => {
  const m = e.target.closest("[data-wm]");
  if (m) {
    W.mode = m.dataset.wm;
    return wr();
  }
  if (e.target.closest("[data-wx]")) {
    W.tpl = "";
    W.ref = "";
    W.file = "";
    return wr();
  }
  const y = e.target.closest("[data-py]");
  if (y) {
    W.py = y.dataset.py;
    return wr();
  }
  const b = e.target.closest("[data-w]");
  if (!b) return;
  if (b.dataset.w == "p") {
    W.s--;
    wr();
  } else wn();
});
// Validasi langkah, lanjut, atau kirim di langkah terakhir
function wn() {
  $$("#wb .err").forEach((x) => x.classList.remove("err"));
  const bad = [],
    c = W.mode == "custom";
  let msg = "Lengkapi kolom yang ditandai dulu ya";
  if (W.s == 1) {
    if (!W.nama.trim()) bad.push("nama");
    if (num(W.wa).toString().length < 9) bad.push("wa");
    if (!W.kat) bad.push("kat");
  }
  if (W.s == 2) {
    if (!W.ref) bad.push("file");
    if (!W.des.trim()) bad.push("des");
    if (c && !W.tgl) bad.push("tgl");
    else if (c && W.tgl < minTgl()) {
      bad.push("tgl");
      msg = tglMsg();
    }
    if (c && W.ant == "Diantar" && W.area === "") bad.push("area");
    if (c && W.ant == "Diantar" && !W.alm.trim()) bad.push("alm");
  }
  if (W.s == 5 && !W.bukti) {
    bad.push("bukti");
    msg = "Upload bukti pembayaran dulu ya";
  }
  if (bad.length) {
    bad.forEach((n) => {
      const el = n == "file" || n == "bukti" ? $("#wb .fi") : $(`#wb [name=${n}]`);
      if (el) el.classList.add("err");
    });
    return toast(msg);
  }
  if (W.s < (c ? 5 : 4)) {
    W.s++;
    return wr();
  }
  if (c && W.tgl < minTgl()) {
    W.s = 2;
    wr();
    return toast(tglMsg());
  }
  if (cqBusy) return;
  cqBusy = true;
  // Kirim ke server: kode CQ dibuat otomatis, ongkir & keterangan pembayaran dihitung di sana
  api("POST", "api/custom-requests", {
    mode: c ? "Custom Order" : "Tanya Harga",
    nama: W.nama,
    wa: W.wa,
    kat: W.kat,
    des: W.des,
    tgl: c ? W.tgl : "",
    bud: num(W.bud),
    ant: c ? W.ant : "",
    area: c && W.ant == "Diantar" ? String(W.area) : "",
    alm: W.alm,
    dari: W.dari,
    untuk: W.untuk,
    pes: W.pes,
    ref: W.ref,
    kartuFoto: W.kartuFoto,
    kartuCat: W.kartuCat,
    bukti: c ? W.bukti : "",
    tpl: W.tpl,
    py: W.py,
  })
    .then((q) => {
      Object.assign(W, W0());
      wr();
      modal(
        `<div class="ft"><div style="font-size:3rem">🌷</div><h2>Permintaan terkirim</h2><p style="color:var(--mut);margin:10px 0">Simpan kode ini untuk melihat balasan admin di Lacak Pesanan:</p><div style="font-family:'Bagel Fat One';font-size:2.2rem;color:var(--h)">${q.code}</div>${c ? '<p style="margin-top:12px;color:#2f6b3a"><b>✓ Bukti pembayaran sudah terkirim</b></p>' : ""}<div style="display:flex;gap:10px;justify-content:center;flex-wrap:wrap;margin-top:20px"><button class="pill" id="mt">Lacak sekarang</button>${c ? "" : `<a class="pill ol" href="${WA(S.wa, "Halo Little Candy Studio, saya baru mengirim permintaan " + q.code + " lewat website.")}" target="_blank" rel="noopener">Kabari via WhatsApp</a>`}</div></div>`,
      );
      $("#mt").onclick = () => goTrack(q.code);
    })
    .catch(() => {})
    .finally(() => (cqBusy = false));
}
