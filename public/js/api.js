/* ==========================================================
   FILE : js/api.js
   ISI  : PENGHUBUNG KE SERVER (Laravel + MySQL)
   TIPS : api("GET" | "POST" | "PUT" | "PATCH" | "DELETE", "api/alamat", dataOpsional) -> Promise berisi JSON.
          Jika server menolak (misal data kurang lengkap), pesan error otomatis tampil sebagai toast
          dan Promise ditolak (reject). Pakai { quiet: true } untuk menyembunyikan toast.
   ========================================================== */

let CSRF = document.querySelector('meta[name="csrf-token"]').content;

async function api(method, url, body, opt = {}) {
  let res;
  try {
    res = await fetch(url, {
      method,
      credentials: "same-origin",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
        "X-CSRF-TOKEN": CSRF,
      },
      body: body === undefined ? undefined : JSON.stringify(body),
    });
  } catch (e) {
    if (!opt.quiet) toast("Tidak bisa terhubung ke server. Periksa koneksi.");
    throw e;
  }
  let data = null;
  try {
    data = await res.json();
  } catch (e) {}
  if (!res.ok) {
    let msg = (data && data.message) || "Terjadi kesalahan di server (kode " + res.status + ")";
    if (res.status == 422 && data && data.errors) msg = Object.values(data.errors)[0][0];
    if (res.status == 419) {
      msg = "Sesi habis. Halaman akan dimuat ulang.";
      setTimeout(() => location.reload(), 1500);
    }
    if (res.status == 401 && typeof adm !== "undefined" && adm) {
      msg = "Sesi admin berakhir, silakan masuk lagi.";
      adm = false;
      adLoaded = false;
      if (location.hash == "#admin") admin();
    }
    if (!opt.quiet) toast(msg);
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return data;
}
