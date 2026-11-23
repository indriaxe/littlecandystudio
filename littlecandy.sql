-- phpMyAdmin SQL Dump
-- version 5.2.0
-- https://www.phpmyadmin.net/
--
-- Host: localhost:3306
-- Generation Time: Nov 23, 2026 at 01:21 PM
-- Server version: 8.0.30
-- PHP Version: 8.5.10

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `littlecandy`
--

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `sort_order` int UNSIGNED NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `image`, `sort_order`, `created_at`, `updated_at`) VALUES
(1, 'Mini Flower', 'uploads/categories/a7d4c36a-62be-4efb-b493-2a768f4ce291.jpg', 1, '2026-11-22 13:05:37', '2026-11-23 00:15:20'),
(2, 'Bouquet', 'uploads/categories/672318b2-b521-4d26-bfc2-ec11e3173422.jpg', 2, '2026-11-22 13:05:37', '2026-11-23 00:17:49'),
(3, 'Greeting Card', 'uploads/categories/b1131e71-2ccf-4278-8d82-ca8220a2fa5f.jpg', 3, '2026-11-22 13:05:37', '2026-11-23 13:02:22'),
(4, 'Celebration Gift', 'uploads/categories/2d280342-9685-4492-9775-36a64440c96f.jpg', 4, '2026-11-22 13:05:37', '2026-11-23 13:05:34');

-- --------------------------------------------------------

--
-- Table structure for table `complaints`
--

CREATE TABLE `complaints` (
  `id` bigint UNSIGNED NOT NULL,
  `code` varchar(12) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `nama` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kontak` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `jenis` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `text` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Baru',
  `reply` text COLLATE utf8mb4_unicode_ci,
  `show_faq` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `complaints`
--

INSERT INTO `complaints` (`id`, `code`, `nama`, `kontak`, `jenis`, `text`, `status`, `reply`, `show_faq`, `created_at`, `updated_at`) VALUES
(2, 'IS002', 'Indria', 'indria.rahma.2505336@students.um.ac.id', 'Pertanyaan', 'Bagaimana pembayaran dilakukan jika memilih DP 50%', 'Selesai', 'Pembayaran akan dilakukan pada saat awal pemesanan sebesar 50% dan 50% berikutnya akan dibayarkan saat status pesanan dalam proses pengemasan.', 1, '2026-11-23 12:58:16', '2026-11-23 12:59:58');

-- --------------------------------------------------------

--
-- Table structure for table `custom_requests`
--

CREATE TABLE `custom_requests` (
  `id` bigint UNSIGNED NOT NULL,
  `code` varchar(12) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `mode` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL,
  `nama` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `wa` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `kat` varchar(60) COLLATE utf8mb4_unicode_ci NOT NULL,
  `des` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `tgl` date DEFAULT NULL,
  `bud` int UNSIGNED NOT NULL DEFAULT '0',
  `ant` varchar(20) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `area` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `ongkir` int UNSIGNED NOT NULL DEFAULT '0',
  `alm` text COLLATE utf8mb4_unicode_ci,
  `dari` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `untuk` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `pes` text COLLATE utf8mb4_unicode_ci,
  `ref` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kartu_foto` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `kartu_cat` varchar(300) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bukti` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bukti_tgl` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `tpl` varchar(150) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(20) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'Baru',
  `quote` int UNSIGNED NOT NULL DEFAULT '0',
  `reply` text COLLATE utf8mb4_unicode_ci,
  `bayar` varchar(120) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bayar_tipe` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `order_code` varchar(12) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `refund_bank` varchar(60) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `refund_no` varchar(40) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `refund_name` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `refund_at` timestamp NULL DEFAULT NULL,
  `refund_done_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `migrations`
--

CREATE TABLE `migrations` (
  `id` int UNSIGNED NOT NULL,
  `migration` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `batch` int NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `migrations`
--

INSERT INTO `migrations` (`id`, `migration`, `batch`) VALUES
(1, '2026_11_22_000001_create_users_table', 1),
(2, '2026_11_22_000002_create_catalog_tables', 1),
(3, '2026_11_22_000003_create_orders_tables', 1),
(4, '2026_11_23_000004_add_custom_flow_columns', 2),
(5, '2026_11_23_000005_add_show_faq_to_complaints', 3);

-- --------------------------------------------------------

--
-- Table structure for table `orders`
--

CREATE TABLE `orders` (
  `id` bigint UNSIGNED NOT NULL,
  `code` varchar(12) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `source_code` varchar(12) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `name` varchar(100) COLLATE utf8mb4_unicode_ci NOT NULL,
  `wa` varchar(30) COLLATE utf8mb4_unicode_ci NOT NULL,
  `items` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `sub` int UNSIGNED NOT NULL,
  `ongkir` int UNSIGNED NOT NULL DEFAULT '0',
  `total` int UNSIGNED NOT NULL,
  `metode` varchar(10) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'ambil',
  `area` varchar(80) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `alamat` text COLLATE utf8mb4_unicode_ci,
  `tgl` date DEFAULT NULL,
  `bayar_tipe` varchar(10) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dibayar` int UNSIGNED DEFAULT NULL,
  `sisa` int UNSIGNED DEFAULT NULL,
  `kartu` json DEFAULT NULL,
  `status` tinyint UNSIGNED NOT NULL DEFAULT '0',
  `paid` tinyint(1) NOT NULL DEFAULT '0',
  `bukti` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bukti_tgl` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `int_note` text COLLATE utf8mb4_unicode_ci,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL,
  `bukti_lunas` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `bukti_lunas_tgl` varchar(30) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `lunas_ok` tinyint(1) NOT NULL DEFAULT '0',
  `received_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(150) COLLATE utf8mb4_unicode_ci NOT NULL,
  `category_id` bigint UNSIGNED NOT NULL,
  `price` int UNSIGNED NOT NULL,
  `image` varchar(255) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `description` text COLLATE utf8mb4_unicode_ci,
  `is_active` tinyint(1) NOT NULL DEFAULT '1',
  `sold_out` tinyint(1) NOT NULL DEFAULT '0',
  `is_featured` tinyint(1) NOT NULL DEFAULT '0',
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `category_id`, `price`, `image`, `description`, `is_active`, `sold_out`, `is_featured`, `created_at`, `updated_at`) VALUES
(1, 'Yellow Snack Bouquet', 4, 250000, 'assets/img/produk-15.jpg', 'Bunga chenille kuning di tumbler, lengkap dengan susu, snack, dan kartu ucapan.', 1, 0, 1, '2026-11-22 13:05:37', '2026-11-22 13:05:37'),
(2, 'Sun Flower Mini', 1, 30000, 'uploads/products/91457e11-094a-494c-b80d-b63b28597a3e.jpg', 'Satu tangkai bunga matahari mini dalam pot rajut. Hadiah kecil yang manis.', 1, 0, 1, '2026-11-22 13:05:37', '2026-11-23 00:09:04'),
(3, 'Eternal Flower Bouquet', 3, 50000, 'assets/img/produk-20.jpg', 'Tiga tulip maroon pada papan kartu ucapan bergelombang dengan tile putih dan pita.', 1, 0, 1, '2026-11-22 13:05:37', '2026-11-22 13:05:37'),
(4, 'Pink Garden Bouquet', 2, 175000, 'assets/img/produk-10.jpg', 'Buket pastel pink dan lilac dengan wrapping mint dan pita lembut.', 1, 0, 1, '2026-11-22 13:05:37', '2026-11-22 13:05:37'),
(5, 'Pastel Mix Bouquet', 2, 150000, 'assets/img/produk-11.jpg', 'Bunga warna-warni dengan wrapping nude dan pita pink. Ceria untuk wisuda.', 1, 0, 0, '2026-11-22 13:05:37', '2026-11-22 13:05:37'),
(6, 'Blush Protea Bouquet', 2, 185000, 'assets/img/produk-12.jpg', 'Perpaduan putih dan blush pink bergaya protea, dibalut tile berenda.', 1, 0, 0, '2026-11-22 13:05:37', '2026-11-22 13:05:37'),
(7, 'Teachers Day Bouquet', 2, 165000, 'assets/img/produk-13.jpg', 'Buket pink dengan kartu ucapan Hari Guru dan wrapping krem hangat.', 1, 0, 0, '2026-11-22 13:05:37', '2026-11-22 13:05:37'),
(8, 'Birthday Box', 4, 220000, 'assets/img/produk-9.jpg', 'Bunga pastel di dalam box pink bertali rami, lengkap dengan kartu ulang tahun.', 1, 0, 0, '2026-11-22 13:05:37', '2026-11-22 13:05:37'),
(9, 'Graduation Box', 4, 240000, 'assets/img/produk-18.jpg', 'Box bunga dengan topper nama custom dan kartu ucapan kelulusan.', 1, 0, 0, '2026-11-22 13:05:37', '2026-11-22 13:05:37'),
(10, 'Wedding Frame Sunflower', 4, 200000, 'assets/img/produk-16.jpg', 'Bingkai shadow box bunga matahari dengan nama dan tanggal pernikahan.', 1, 0, 0, '2026-11-22 13:05:37', '2026-11-22 13:05:37'),
(11, 'Wedding Frame Pastel', 4, 230000, 'assets/img/produk-17.jpg', 'Bingkai bunga pastel dengan ilustrasi pasangan dan tanggal acara.', 1, 0, 0, '2026-11-22 13:05:37', '2026-11-22 13:05:37'),
(12, 'Bestie Hanging Card', 3, 60000, 'assets/img/produk-19.jpg', 'Kartu gantung ulang tahun dengan tulip dan gerbera chenille.', 1, 0, 0, '2026-11-22 13:05:37', '2026-11-22 13:05:37'),
(13, 'Maroon Tulip Bouquet', 2, 180000, 'assets/img/produk-1.jpg', 'Buket maroon klasik dengan lily dan tulip, wrapping putih dan pita rose gold.', 1, 0, 0, '2026-11-22 13:05:37', '2026-11-22 13:05:37');

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `key` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `value` text COLLATE utf8mb4_unicode_ci
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` bigint UNSIGNED NOT NULL,
  `name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `username` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `remember_token` varchar(100) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT NULL,
  `updated_at` timestamp NULL DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `username`, `password`, `remember_token`, `created_at`, `updated_at`) VALUES
(1, 'Admin', 'heny', '$2y$12$ESpzr3OOU1hUaa6SLwI3d.N4qLmIEXOsTTQC1KI8nlD5l7JCZiqSW', NULL, '2026-11-22 13:05:37', '2026-11-23 12:44:03');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `categories_name_unique` (`name`);

--
-- Indexes for table `complaints`
--
ALTER TABLE `complaints`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `complaints_code_unique` (`code`);

--
-- Indexes for table `custom_requests`
--
ALTER TABLE `custom_requests`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `custom_requests_code_unique` (`code`);

--
-- Indexes for table `migrations`
--
ALTER TABLE `migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `orders`
--
ALTER TABLE `orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `orders_code_unique` (`code`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `products_category_id_foreign` (`category_id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`key`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_username_unique` (`username`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `complaints`
--
ALTER TABLE `complaints`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `custom_requests`
--
ALTER TABLE `custom_requests`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `migrations`
--
ALTER TABLE `migrations`
  MODIFY `id` int UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `orders`
--
ALTER TABLE `orders`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` bigint UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_category_id_foreign` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE RESTRICT;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
