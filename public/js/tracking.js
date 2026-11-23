/* ==========================================================
   FILE : js/tracking.js
   ISI  : HALAMAN LACAK PESANAN
   TIPS : Mencari kode LCS (pesanan), CQ (permintaan harga/custom), dan IS (keluhan/pertanyaan)
          ke server (GET api/track/KODE). Server hanya mengirim data yang boleh dilihat pelanggan.
   ========================================================== */

const rp = (r) =>
  r
    ? `<p style="margin-top:14px"><b>Balasan admin</b></p><div class="es">${e0(r)}</div>`
    : '<p style="color:var(--mut);margin-top:14px">Admin belum membalas. Mohon ditunggu ya.</p>';
// Pindah ke halaman Lacak dengan kode tertentu
function goTrack(c) {
  close();
  $("#tc").value = c;
  go("lacak");
}
let trkSeq = 0; // supaya hasil pencarian lama tidak menimpa pencarian yang lebih baru
// Mencari kode ke server lalu menampilkan hasilnya
function track() {
  const c = $("#tc").value.trim().toUpperCase(),
    b = $("#tr"),
    my = ++trkSeq;
  const msg = (h, pad) => {
    b.style.color = "var(--mut)";
    b.style.textAlign = "center";
    b.innerHTML = `<p style="padding-top:${pad}px">${h}</p>`;
  };
  if (!c) return msg("Kode belum diisi.", 90);
  msg("Mencari...", 90);
  api("GET", "api/track/" + encodeURIComponent(c), undefined, { quiet: true })
    .then((r) => {
      if (my == trkSeq) trkShow(c, r);
    })
    .catch((e) => {
      if (my != trkSeq) return;
      if (e.status == 404)
        msg(
          `Kode <b>${e0(c)}</b> tidak ditemukan.<br><span style="color:var(--mut)">Periksa penulisan kodenya, atau hubungi kami lewat WhatsApp.</span>`,
          80,
        );
      else msg("Gagal mengambil data. Coba lagi sebentar lagi.", 90);
      b.style.color = "var(--tx)";
    });
}
// ===== Pesanan: pelunasan DP & konfirmasi diterima =====
const trkBtn = (id, t, cls = "pill") => `<button class="${cls}" id="${id}">${t}</button>`;
function orderActions(o) {
  let h = "";
  if (o.source) h += `<p style="margin-top:12px;color:var(--mut);font-size:.88rem">Pesanan ini dibuat dari custom order <b>${e0(o.source)}</b>.</p>`;
  if (o.bayarTipe == "dp") {
    if (o.lunasOk)
      h += `<div class="es" style="margin-top:14px">✓ Pelunasan sudah dikonfirmasi admin. Terima kasih!</div>`;
    else if (o.buktiLunas)
      h += `<div class="es" style="margin-top:14px"><b>Bukti pelunasan terkirim (${e0(o.buktiLunasTgl)}).</b> Menunggu verifikasi admin.<img class="pv" style="height:110px;display:block;margin-top:8px" src="${e0(o.buktiLunas)}" alt="Bukti pelunasan"></div>`;
    else if (o.canSettle)
      h += `<div style="margin-top:14px"><div class="es"><b>Pesanan sudah dikemas.</b> Sisa pelunasan: <b>${fmt(o.sisa)}</b>. Lunasi sebelum pesanan diambil / dikirim.</div><div style="margin-top:10px">${trkBtn("pl", "Bayar pelunasan " + fmt(o.sisa))}</div><div id="plb" style="display:none;margin-top:12px">${qrisBox(o.sisa)}<label class="fi" style="margin-top:10px"><b>Upload bukti pelunasan</b><em style="font-style:normal">png atau jpg</em><input type="file" id="plf" accept="image/*"></label></div></div>`;
    else if (o.status < 2)
      h += `<p style="margin-top:14px;color:var(--mut);font-size:.88rem">Sisa pelunasan ${fmt(o.sisa)}. Tombol pelunasan muncul saat pesananmu sudah tahap <b>Dikemas</b>.</p>`;
  }
  // ---- Konfirmasi penerimaan: DIAMBIL = admin yang konfirmasi, DIANTAR = pelanggan yang konfirmasi ----
  const ambil = o.metode != "antar";
  if (o.status == 4) {
    h += ambil
      ? `<div class="es" style="margin-top:14px">✓ Pesanan sudah diambil dan dikonfirmasi admin${o.receivedAt ? " pada " + e0(o.receivedAt) : ""}. Terima kasih sudah memesan 🌷</div>`
      : o.receivedAt
        ? `<div class="es" style="margin-top:14px">✓ Kamu mengonfirmasi pesanan sudah diterima pada ${e0(o.receivedAt)}. Terima kasih sudah memesan 🌷</div>`
        : `<div class="es" style="margin-top:14px">✓ Pesanan sudah selesai. Terima kasih sudah memesan 🌷</div>`;
  } else if (o.status == 3 && ambil) {
    h += `<div class="es" style="margin-top:14px"><b>Pesananmu siap diambil di studio.</b> Setelah kamu ambil, admin yang akan mengonfirmasi dan menyelesaikan pesanan ini.${o.bayarTipe == "dp" && !o.lunasOk ? " Jangan lupa lunasi sisa pembayaran dulu." : ""}</div>`;
  } else if (o.canReceive) {
    h += `<div style="margin-top:16px"><div class="es">Pesananmu sudah <b>dikirim</b>. Kalau sudah sampai di tanganmu, konfirmasi di sini ya.</div><div style="margin-top:10px">${trkBtn("rc", "Pesanan sudah saya terima")}</div></div>`;
  } else if (o.status == 3 && !ambil) {
    h += `<p style="margin-top:14px;color:var(--mut);font-size:.88rem">Pesananmu sedang dalam pengiriman. Tombol konfirmasi diterima muncul setelah pembayaran ${o.bayarTipe == "dp" ? "dan pelunasan " : ""}dikonfirmasi admin.</p>`;
  }
  return h;
}
function orderBind(o) {
  const c = o.code,
    redraw = (r) => trkShow(c, { type: "order", data: r });
  if ($("#pl")) $("#pl").onclick = () => ($("#plb").style.display = "block");
  if ($("#plf"))
    $("#plf").onchange = () => {
      const fl = $("#plf").files[0];
      if (!fl) return;
      rs(fl, 900, (u) =>
        api("POST", "api/track/" + encodeURIComponent(c) + "/settle", { bukti: u })
          .then((r) => {
            toast("Bukti pelunasan terkirim");
            redraw(r);
          })
          .catch(() => {}),
      );
    };
  if ($("#rc"))
    $("#rc").onclick = () => {
      if (!confirm("Konfirmasi bahwa pesanan " + c + " sudah kamu terima?")) return;
      api("POST", "api/track/" + encodeURIComponent(c) + "/received")
        .then((r) => {
          toast("Terima kasih, pesanan selesai 🌷");
          redraw(r);
        })
        .catch(() => {});
    };
}

// ===== Custom order: setuju / tidak setuju =====
function custActions(q) {
  if (q.orderCode)
    return `<div class="es" style="margin-top:14px">✓ Kamu sudah menyetujui penawaran. Pesananmu dibuat dengan kode <b>${e0(q.orderCode)}</b>.<div style="margin-top:10px">${trkBtn("go", "Lacak pesanan " + e0(q.orderCode), "pill ol")}</div></div>`;
  if (q.status == "Dibalas" && q.quote > 0)
    return `<div style="margin-top:16px"><div class="es">Admin menawarkan harga <b>${fmt(q.quote)}</b>. Setuju dengan penawaran ini?</div><div style="display:flex;gap:8px;flex-wrap:wrap;margin-top:10px">${trkBtn("ya", "Setuju, buat pesanan")}${trkBtn("no", "Tidak setuju", "pill ol")}</div><div id="rf" style="display:none"></div></div>`;
  if (q.status == "Ditolak") {
    if (!q.hasPaid) return `<p style="margin-top:14px;color:var(--mut)">Permintaan ini ditutup.</p>`;
    if (q.refundDone) return `<div class="es" style="margin-top:14px">✓ Dana sudah dikembalikan ke rekeningmu.</div>`;
    if (q.refundSent) return `<div class="es" style="margin-top:14px">Data rekening sudah diterima. Admin akan memproses pengembalian dana kamu.</div>`;
    return `<div style="margin-top:14px">${refundForm()}</div>`;
  }
  return "";
}
const refundForm = () =>
  `<div class="es"><b>Pengembalian dana</b><br>Kamu sudah membayar, jadi kirim data rekening / e-wallet untuk pengembalian dana.</div><div class="fr" style="margin-top:10px;grid-template-columns:1fr"><label>Bank / e-wallet <span>*</span><input id="rb" placeholder="Contoh: BCA / DANA"></label><label>Nomor rekening <span>*</span><input id="rn" inputmode="numeric" placeholder="1234567890"></label><label>Atas nama <span>*</span><input id="ra" placeholder="Nama pemilik rekening"></label><div>${trkBtn("rs2", "Kirim data rekening")}</div></div>`;
function custBind(q) {
  const redraw = (r) => trkShow(q.code, { type: "cq", data: r });
  const url = "api/track/" + encodeURIComponent(q.code) + "/respond";
  if ($("#go")) $("#go").onclick = () => goTrack(q.orderCode);
  const sendRefund = () => {
    const b = $("#rb").value.trim(), n = $("#rn").value.trim(), a = $("#ra").value.trim();
    if (!b || !n || !a) return toast("Lengkapi bank, nomor rekening, dan atas nama");
    api("POST", url, { agree: false, bank: b, rekening: n, atas_nama: a })
      .then((r) => {
        toast("Data rekening terkirim");
        redraw(r.request);
      })
      .catch(() => {});
  };
  if ($("#rs2")) $("#rs2").onclick = sendRefund;
  if ($("#ya"))
    $("#ya").onclick = () => {
      if (!confirm("Setuju dengan harga " + fmt(q.quote) + "? Pesananmu akan langsung dibuat.")) return;
      api("POST", url, { agree: true })
        .then((r) => {
          modal(
            `<div class="ft"><div style="font-size:3rem">🎉</div><h2>Pesanan custom dibuat</h2><p style="color:var(--mut);margin:8px 0">Kode pesananmu</p><div style="font-family:'Bagel Fat One';font-size:2.2rem;color:var(--h)">${r.order.code}</div><p style="margin:10px 0 0;color:var(--mut)">${r.order.bukti ? "Bukti pembayaranmu sudah kami terima dan sedang diverifikasi admin." : "Silakan lakukan pembayaran dan upload bukti bayar di halaman Lacak."}</p><div style="margin-top:18px"><button class="pill" id="gt">Lacak pesanan</button></div></div>`,
          );
          $("#gt").onclick = () => goTrack(r.order.code);
        })
        .catch(() => {});
    };
  if ($("#no"))
    $("#no").onclick = () => {
      if (q.hasPaid) {
        const box = $("#rf");
        box.innerHTML = refundForm();
        box.style.display = "block";
        $("#ya").disabled = $("#no").disabled = true;
        $("#rs2").onclick = sendRefund;
        return;
      }
      if (!confirm("Tolak penawaran ini?")) return;
      api("POST", url, { agree: false })
        .then((r) => {
          toast("Penawaran ditolak");
          redraw(r.request);
        })
        .catch(() => {});
    };
}
// Menampilkan hasil pencarian (r.type = "order" | "cq" | "iss")
function trkShow(c, r) {
  const b = $("#tr"),
    d = r.data,
    o = r.type == "order" ? d : null,
    q = r.type == "cq" ? d : null,
    s = r.type == "iss" ? d : null;
  b.style.color = "var(--tx)";
  b.style.textAlign = "left";
  if (o) {
    b.innerHTML = `<div style="display:flex;justify-content:space-between;gap:10px"><div><h2 style="font-size:1.6rem">${o.code}</h2><p style="color:var(--mut)">${e0(o.name)} · ${o.date}</p></div><span class="bdg${o.paid ? " ok" : ""}" style="align-self:start">${o.paid ? "Sudah dibayar" : "Belum dibayar"}</span></div><p style="margin-top:12px">${e0(o.items)}<br><b>${fmt(o.total)}</b>${o.bayarTipe == "dp" ? ` (DP ${fmt(o.dibayar)}, sisa ${fmt(o.sisa)})` : ""} · ${o.metode == "antar" ? "Diantar ke " + e0(o.area) : "Ambil di studio"}</p><div class="stp"><i class="pr"></i>${ST.map((t, i) => `<div class="sp ${i <= o.status ? "dn" : ""} ${i == o.status ? "cu" : ""}"><b>${t[0]}</b>${t[1]}</div>`).join("")}</div>${orderActions(o)}`;
    requestAnimationFrame(() =>
      requestAnimationFrame(() => {
        const pr = $(".stp .pr");
        if (pr) pr.style.width = (o.status / 4) * 80 + "%";
      }),
    );
  } else if (q)
    b.innerHTML = `<h2 style="font-size:1.6rem">${q.code}</h2><p style="color:var(--mut)">${e0(q.mode)} · ${q.date}</p><p style="margin-top:12px">Status: <span class="bdg">${e0(q.status)}</span>${q.quote ? ` · Penawaran: <b>${fmt(q.quote)}</b>` : ""}</p>${rp(q.reply)}${custActions(q)}`;
  else if (s)
    b.innerHTML = `<h2 style="font-size:1.6rem">${s.code}</h2><p style="color:var(--mut)">Keluhan · ${s.date}</p><p style="margin-top:12px">Status: <span class="bdg">${e0(s.status)}</span></p>${rp(s.reply)}`;
  // Upload bukti bayar langsung dari halaman ini
  const pf = o ? (o.bukti || !o.paid ? o : null) : q && q.bayar ? q : null;
  if (pf) {
    const vf =
      o && o.bukti
        ? o.paid
          ? `<p style="color:#2f6b3a;margin:4px 0 0"><b>✓ ${o.bayarTipe == "dp" ? "Pembayaran DP" : "Pembayaran"} sudah dikonfirmasi admin</b></p>`
          : '<p style="color:var(--mut);margin:4px 0 0">Menunggu verifikasi admin.</p>'
        : "";
    b.insertAdjacentHTML("beforeend", `<div style="margin-top:16px"><b>Bukti pembayaran</b>${proofHtml(pf)}${vf}</div>`);
    proofBind(pf);
  }
  if (o) orderBind(o);
  if (q) custBind(q);
}
$("#tb").onclick = track;
// Catatan: handler on... tidak boleh mengembalikan false, karena itu membatalkan ketikan
$("#tc").onkeydown = (e) => {
  if (e.key == "Enter") track();
};
