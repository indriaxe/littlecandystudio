<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
    <meta name="csrf-token" content="{{ csrf_token() }}" />
    <!-- Semua alamat file/gambar relatif ke alamat utama website, jadi aman dari mana pun halaman dibuka -->
    <base href="{{ url('/') }}/" />
    <title>Little Candy Studio | Bunga Chenille Stem Handmade</title>
    <link
      rel="icon"
      href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌸</text></svg>"
    />
    <!-- Font Google (butuh internet) -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link
      href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@500;700&family=Bagel+Fat+One&family=Poppins:wght@400;500;600&family=Young+Serif&display=swap"
      rel="stylesheet"
    />
    <!-- CSS: urutan file penting, jangan diubah -->
    <link rel="stylesheet" href="css/01-base.css" />
    <link rel="stylesheet" href="css/02-navbar.css" />
    <link rel="stylesheet" href="css/03-kartu-produk.css" />
    <link rel="stylesheet" href="css/04-beranda.css" />
    <link rel="stylesheet" href="css/05-katalog.css" />
    <link rel="stylesheet" href="css/06-form.css" />
    <link rel="stylesheet" href="css/07-keranjang.css" />
    <link rel="stylesheet" href="css/08-tracking.css" />
    <link rel="stylesheet" href="css/09-modal-toast.css" />
    <link rel="stylesheet" href="css/10-footer.css" />
    <link rel="stylesheet" href="css/11-admin.css" />
    <link rel="stylesheet" href="css/12-bantuan.css" />
    <link rel="stylesheet" href="css/13-animasi.css" />
  </head>
  <body>
    <!-- ===== NAVBAR (menu atas + tombol tema + login admin) ===== -->
    <nav>
      <a class="logo" href="beranda">Little Candy<br />Studio</a>
      <div class="nl" id="nl">
        <a href="beranda" data-n="beranda">Beranda</a><a href="katalog" data-n="katalog">Katalog</a
        ><a href="custom" data-n="custom">Custom Order</a><a href="lacak" data-n="lacak">Lacak Pesanan</a
        ><a href="bantuan" data-n="bantuan">Bantuan &amp; FAQ</a
        ><a href="keranjang" data-n="keranjang">Keranjang<span class="bd" id="bd">0</span></a>
      </div>
      <button class="ic" id="tm" title="Ganti tema" aria-label="Ganti tema">◐</button>
      <a class="ic" href="admin" title="Login admin" aria-label="Login admin"
        ><svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="8" r="4.5" />
          <path d="M3.5 21c0-5 3.8-7 8.5-7s8.5 2 8.5 7z" /></svg
      ></a>
      <button class="ic" id="burger" aria-label="Menu">☰</button>
    </nav>
    <!-- ===== ISI HALAMAN — satu <div class="page"> per halaman, ditampilkan oleh router di js/main.js ===== -->
    <main>
      <!-- ===== HALAMAN BERANDA (isi dibuat oleh js/beranda.js) ===== -->
      <div class="page" id="pg-beranda">
        <div class="hero rv" id="hero"></div>
        <div class="mq"><div id="mq"></div></div>
        <section class="sec" style="margin-top: 40px">
          <h2 class="t rv">Cara pesan</h2>
          <p class="sub rv">Empat langkah, dan kamu bisa memantau pesanan kapan saja dengan kode pesanan.</p>
          <div class="steps">
            <div class="st rv">
              <b>Pilih atau kirim ide</b>
              <p>Ambil produk dari katalog, atau isi form custom order dengan foto referensi.</p>
            </div>
            <div class="st rv" style="--d: 90ms">
              <b>Isi data dan pengiriman</b>
              <p>Pilih ambil di studio atau diantar. Estimasi ongkir dihitung dari Pakisaji.</p>
            </div>
            <div class="st rv" style="--d: 180ms">
              <b>Bayar sesuai arahan</b>
              <p>Admin mengirim detail pembayaran lewat WhatsApp setelah pesanan masuk.</p>
            </div>
            <div class="st rv" style="--d: 270ms">
              <b>Pantau dengan kode</b>
              <p>Masukkan kode di Lacak Pesanan untuk melihat status pengerjaan.</p>
            </div>
          </div>
        </section>
        <section class="sec">
          <h2 class="t c rv">Paling banyak dipilih</h2>
          <p class="sub c rv">Produk unggulan studio kami.</p>
          <div class="grid g4" id="best"></div>
        </section>
        <section class="sec">
          <h2 class="t rv">Belanja per kategori</h2>
          <p class="sub rv">Dari hadiah mini sampai paket perayaan.</p>
          <div class="cats" id="cats"></div>
        </section>
        <section class="sec">
          <h2 class="t rv">Momen yang pernah kami rangkai</h2>
          <p class="sub rv">Wisuda, ulang tahun, hari guru, sampai pernikahan.</p>
          <div class="gal" id="gal"></div>
        </section>
        <section class="sec">
          <h2 class="t rv">Informasi penting</h2>
          <div class="abt" id="info"></div>
        </section>
      </div>

      <!-- ===== HALAMAN KATALOG (isi dibuat oleh js/katalog.js) ===== -->
      <div class="page" id="pg-katalog">
        <div class="kt">
          <aside>
            <h2 class="t">Katalog produk</h2>
            <p class="sub" style="margin-bottom: 0; font-size: 0.88rem">
              Klik produk untuk melihat detail. Butuh versi lain? Pilih "Custom versi ini" di detail produk.
            </p>
            <div class="srch">
              <input id="q" placeholder="Cari produk" aria-label="Cari produk" /><span
                style="padding: 6px 10px"
                >🔍</span
              >
            </div>
            <div class="fg" id="flt"></div>
          </aside>
          <div>
            <p class="sub" id="kc" style="margin-top: 0"></p>
            <div class="grid g4" id="kg"></div>
            <div class="pg" id="pgn"></div>
          </div>
        </div>
      </div>

      <!-- ===== HALAMAN CUSTOM ORDER (4 langkah: js/custom.js) ===== -->
      <div class="page" id="pg-custom">
        <h2 class="t">Custom order</h2>
        <p class="sub">
          Punya ide sendiri? Isi empat langkah singkat ini. Admin akan membalas dengan harga dan estimasi pengerjaan.
        </p>
        <div>
          <div class="wz" id="wz"></div>
          <div class="box" id="wb"></div>
        </div>
      </div>

      <!-- ===== HALAMAN LACAK PESANAN (js/tracking.js) ===== -->
      <div class="page" id="pg-lacak" style="max-width: 980px">
        <div class="box">
          <h2 class="t">Lacak pesanan</h2>
          <p class="sub">
            Masukkan kode pesanan/custom/keluhan kamu untuk melacak kemajuan pesananmu. Kode ini bersifat unik dan rahasia, jadi jangan dibagikan ke orang lain. Jika belum punya kode, hubungi admin lewat WhatsApp.
          </p>
          <div style="display: flex; gap: 10px">
            <input
              class="in"
              id="tc"
              placeholder="Contoh: LCS001"
              aria-label="Kode pesanan"
              style="margin: 0; border-radius: 99px"
            /><button class="pill" id="tb">Cari</button>
          </div>
        </div>
        <div
          class="box"
          id="tr"
          style="margin-top: 24px; min-height: 260px; text-align: center; color: var(--mut)"
        >
          <p style="padding-top: 90px">Kode belum diisi.</p>
        </div>
      </div>

      <!-- ===== HALAMAN KERANJANG & CHECKOUT (js/keranjang.js) ===== -->
      <div class="page" id="pg-keranjang">
        <h2 class="t">Keranjang &amp; pembayaran</h2>
        <p class="sub">Periksa pesananmu, lengkapi data, lalu buat pesanan.</p>
        <div class="cw">
          <div class="box" id="cl" style="padding-block: 10px"></div>
          <div class="box smy" id="cs"></div>
        </div>
      </div>

      <!-- ===== HALAMAN BANTUAN & FAQ (js/bantuan.js) ===== -->
      <div class="page" id="pg-bantuan">
        <h2 class="t">Bantuan &amp; FAQ</h2>
        <p class="sub">Jawaban cepat untuk pertanyaan yang sering muncul. Belum ketemu? Kirim pesan ke kami.</p>
        <div class="hp">
          <div id="faq"></div>
          <form class="box fr" id="is" novalidate style="grid-template-columns: 1fr; align-content: start">
            <h3>Kirim keluhan atau pertanyaan</h3>
            <label>Nama <span>*</span><input name="n" placeholder="Nama kamu" /></label>
            <label>Kontak (WhatsApp atau email) <span>*</span><input name="k" placeholder="0812xxxxxxx atau nama@email.com" /></label>
            <label
              >Jenis<select name="j">
                <option>Pertanyaan</option>
                <option>Keluhan pesanan</option>
                <option>Saran</option>
              </select></label
            >
            <label>Pesan <span>*</span><textarea name="m" placeholder="Tulis pertanyaan atau keluhanmu"></textarea></label>
            <div><button class="pill" type="submit">Kirim</button></div>
          </form>
        </div>
      </div>

      <!-- ===== HALAMAN ADMIN (js/admin.js) ===== -->
      <div class="page" id="pg-admin"><div id="ad"></div></div>
    </main>
    <!-- ===== FOOTER (isi dibuat oleh renderFooter() di js/main.js, sama seperti footer v2) ===== -->
    <footer id="ft"></footer>
    <!-- ===== POPUP / MODAL (isinya diisi lewat fungsi modal() di js/core.js) ===== -->
    <div class="ov" id="ov"><div class="md" id="md"></div></div>
    <!-- ===== TOAST (notifikasi kecil) ===== -->
    <div id="toast" role="status"></div>
    <!-- JS: urutan file penting (main.js harus paling akhir) -->
    <!-- Data awal dari Laravel/MySQL (produk, kategori, pengaturan, daftar area) -->
    <script>
      window.BOOT = {{ Illuminate\Support\Js::from($boot) }};
    </script>
    <script src="js/api.js"></script>
    <script src="js/data.js"></script>
    <script src="js/core.js"></script>
    <script src="js/produk.js"></script>
    <script src="js/beranda.js"></script>
    <script src="js/katalog.js"></script>
    <script src="js/custom.js"></script>
    <script src="js/keranjang.js"></script>
    <script src="js/tracking.js"></script>
    <script src="js/bantuan.js"></script>
    <script src="js/xlsx.js"></script>
    <script src="js/admin.js"></script>
    <script src="js/main.js"></script>
  </body>
</html>
