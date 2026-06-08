<!DOCTYPE html><html lang="id"><head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>KostHub - Konfigurasi Pesanan Daily Cleaning</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "on-secondary-fixed-variant": "#444749",
                        "surface-tint": "#0053db",
                        "on-tertiary": "#ffffff",
                        "on-primary-fixed-variant": "#003ea8",
                        "inverse-primary": "#b4c5ff",
                        "on-surface": "#0b1c30",
                        "secondary-container": "#e0e3e5",
                        "on-primary": "#ffffff",
                        "tertiary-fixed": "#ffdbcd",
                        "on-secondary": "#ffffff",
                        "on-primary-fixed": "#00174b",
                        "background": "#f8f9ff",
                        "surface-container-low": "#eff4ff",
                        "on-primary-container": "#eeefff",
                        "secondary-fixed": "#e0e3e5",
                        "inverse-surface": "#213145",
                        "inverse-on-surface": "#eaf1ff",
                        "primary-fixed": "#dbe1ff",
                        "on-surface-variant": "#434655",
                        "on-tertiary-container": "#ffede6",
                        "primary-fixed-dim": "#b4c5ff",
                        "on-secondary-fixed": "#191c1e",
                        "primary-container": "#2563eb",
                        "surface-container-lowest": "#ffffff",
                        "primary": "#004ac6",
                        "outline": "#737686",
                        "secondary-fixed-dim": "#c4c7c9",
                        "tertiary": "#943700",
                        "surface-bright": "#f8f9ff",
                        "tertiary-fixed-dim": "#ffb596",
                        "surface-variant": "#d3e4fe",
                        "on-background": "#0b1c30",
                        "surface-container": "#e5eeff",
                        "on-tertiary-fixed-variant": "#7d2d00",
                        "on-error": "#ffffff",
                        "error-container": "#ffdad6",
                        "on-error-container": "#93000a",
                        "surface-dim": "#cbdbf5",
                        "surface-container-high": "#dce9ff",
                        "secondary": "#5c5f61",
                        "tertiary-container": "#bc4800",
                        "on-secondary-container": "#626567",
                        "on-tertiary-fixed": "#360f00",
                        "error": "#ba1a1a",
                        "outline-variant": "#c3c6d7",
                        "surface-container-highest": "#d3e4fe",
                        "surface": "#f8f9ff"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.125rem",
                        "lg": "0.25rem",
                        "xl": "0.5rem",
                        "full": "0.75rem"
                    },
                    "spacing": {
                        "margin-mobile": "16px",
                        "stack-md": "24px",
                        "container-max": "1280px",
                        "stack-lg": "48px",
                        "margin-desktop": "32px",
                        "gutter": "24px",
                        "base": "8px",
                        "stack-sm": "12px",
                        "stack-xs": "4px"
                    },
                    "fontFamily": {
                        "display": ["Inter"],
                        "headline-md": ["Inter"],
                        "body-md": ["Inter"],
                        "headline-lg-mobile": ["Inter"],
                        "label-sm": ["Inter"],
                        "label-md": ["Inter"],
                        "headline-sm": ["Inter"],
                        "headline-lg": ["Inter"],
                        "body-sm": ["Inter"],
                        "body-lg": ["Inter"]
                    },
                    "fontSize": {
                        "display": ["48px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                        "headline-md": ["24px", { "lineHeight": "1.3", "fontWeight": "600" }],
                        "body-md": ["16px", { "lineHeight": "1.5", "fontWeight": "400" }],
                        "headline-lg-mobile": ["24px", { "lineHeight": "1.2", "fontWeight": "600" }],
                        "label-sm": ["12px", { "lineHeight": "1", "letterSpacing": "0.02em", "fontWeight": "500" }],
                        "label-md": ["14px", { "lineHeight": "1", "letterSpacing": "0.01em", "fontWeight": "500" }],
                        "headline-sm": ["18px", { "lineHeight": "1.4", "fontWeight": "600" }],
                        "headline-lg": ["32px", { "lineHeight": "1.2", "letterSpacing": "-0.01em", "fontWeight": "600" }],
                        "body-sm": ["14px", { "lineHeight": "1.5", "fontWeight": "400" }],
                        "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }]
                    }
                }
            }
        }
    </script>
<style>
        body { font-family: 'Inter', sans-serif; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
    </style>
</head>
<body class="bg-background text-on-background min-h-screen flex flex-col">
<!-- TopNavBar -->
<nav class="sticky top-0 z-50 bg-surface-container-lowest border-b border-outline-variant font-body-md w-full">
<div class="flex items-center h-16 w-full px-margin-mobile md:px-margin-desktop max-w-7xl mx-auto">
<!-- Brand Logo -->
<div class="flex-1 flex justify-start">
<a class="font-headline-md font-bold text-on-surface tracking-tight flex items-baseline" href="#">
                KostHub<span class="text-[#2563EB] text-3xl leading-none">.</span>
</a>
</div>
<!-- Navigation Links (Desktop) -->
<ul class="hidden md:flex justify-center items-center gap-8 h-full">
<li class="h-full flex items-center">
<a class="text-on-surface-variant hover:text-primary-container transition-colors duration-200 h-full flex items-center px-2 cursor-pointer" href="#">Home</a>
</li>
<li class="h-full flex items-center">
<a class="text-on-surface-variant hover:text-primary-container transition-colors duration-200 h-full flex items-center px-2 cursor-pointer" href="#">Gas &amp; Galon</a>
</li>
<li class="h-full flex items-center">
<a class="text-on-surface-variant hover:text-primary-container transition-colors duration-200 h-full flex items-center px-2 cursor-pointer" href="#">Laundry Express</a>
</li>
<li class="h-full flex items-center">
<a class="text-primary-container font-bold border-b-2 border-primary-container h-full flex items-center px-2 cursor-pointer" href="#">Daily Cleaning</a>
</li>
<li class="h-full flex items-center">
<a class="text-on-surface-variant hover:text-primary-container transition-colors duration-200 h-full flex items-center px-2 cursor-pointer" href="#">Tentang Kami</a>
</li>
</ul>
<!-- Trailing Action -->
<div class="flex-1 flex items-center justify-end"><div class="flex items-center gap-4">
<button class="material-symbols-outlined text-on-surface-variant hover:text-primary-container transition-colors cursor-pointer">notifications</button>
<div class="w-8 h-8 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md font-bold cursor-pointer">
                        JD
                    </div>
</div></div>
</div>
</nav>
<!-- Progress Stepper -->
<div class="bg-surface border-b border-outline-variant py-4">
<div class="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop">
<div class="flex items-center justify-center space-x-4 md:space-x-8">
<div class="flex items-center text-primary-container">
<span class="material-symbols-outlined mr-2">check_circle</span>
<span class="font-label-md font-bold">Pilih Mitra</span>
</div>
<div class="w-16 h-px bg-outline-variant"></div>
<div class="flex items-center text-on-surface">
<div class="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-sm font-bold mr-2">2</div>
<span class="font-label-md font-bold">Detail Pesanan</span>
</div>
<div class="w-16 h-px bg-outline-variant"></div>
<div class="flex items-center text-on-surface-variant">
<div class="w-6 h-6 rounded-full border-2 border-outline-variant flex items-center justify-center font-label-sm font-bold mr-2">3</div>
<span class="font-label-md font-medium">Pembayaran</span>
</div>
</div>
</div>
</div>
<!-- Main Content -->
<main class="flex-grow pt-stack-md pb-stack-lg px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full grid grid-cols-1 md:grid-cols-12 gap-gutter">
<!-- Header Title Section (Spans full width above columns) -->
<div class="md:col-span-12 mb-stack-md">
<h1 class="font-headline-lg md:font-display text-on-surface mb-stack-xs font-bold">Konfigurasi Pesanan Daily Cleaning</h1>
<p class="font-body-lg text-on-surface-variant">Mitra: <span class="font-semibold text-on-surface">KlinKlin Bandung</span></p>
</div>
<!-- Left Panel: Configuration -->
<div class="md:col-span-8 flex flex-col gap-stack-md">
<!-- Paket Durasi -->
<section class="bg-surface-container-lowest p-gutter rounded-lg border border-outline-variant">
<div class="flex items-center gap-2 mb-stack-sm border-b border-surface-container-high pb-stack-xs">
<span class="material-symbols-outlined text-primary-container" data-weight="fill" style="font-variation-settings: 'FILL' 1;">timer</span>
<h2 class="font-headline-md text-on-surface">Pilih Paket Durasi</h2>
</div>
<div class="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
<label class="cursor-pointer relative h-full">
<input class="peer sr-only" name="duration" type="radio" value="1jam">
<div class="p-4 border border-outline-variant rounded hover:border-primary-container peer-checked:bg-surface-container peer-checked:border-primary-container peer-checked:text-primary-container transition-all h-full flex flex-col justify-between">
<div class="font-body-md text-on-surface font-semibold mb-2">1 Jam (Ringan)</div>
<div class="font-body-sm text-on-surface-variant">Rp 35.000</div>
</div>
</label>
<label class="cursor-pointer relative h-full">
<input checked="" class="peer sr-only" name="duration" type="radio" value="2jam">
<div class="p-4 border border-primary-container bg-surface-container rounded transition-all h-full flex flex-col justify-between relative">
<div class="font-body-md text-primary-container font-semibold mb-2">2 Jam (Sedang)</div>
<div class="font-body-sm text-on-surface-variant">Rp 65.000</div>
<div class="absolute top-4 right-4 text-primary-container">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">check_circle</span>
</div>
</div>
</label>
<label class="cursor-pointer relative h-full">
<input class="peer sr-only" name="duration" type="radio" value="3jam">
<div class="p-4 border border-outline-variant rounded hover:border-primary-container peer-checked:bg-surface-container peer-checked:border-primary-container peer-checked:text-primary-container transition-all h-full flex flex-col justify-between">
<div class="font-body-md text-on-surface font-semibold mb-2">3 Jam (Berat)</div>
<div class="font-body-sm text-on-surface-variant">Rp 90.000</div>
</div>
</label>
</div>
</section>
<!-- Alat Pembersih -->
<section class="bg-surface-container-lowest p-gutter rounded-lg border border-outline-variant">
<div class="flex items-center gap-2 mb-stack-sm border-b border-surface-container-high pb-stack-xs">
<span class="material-symbols-outlined text-primary-container" data-weight="fill" style="font-variation-settings: 'FILL' 1;">cleaning_services</span>
<h2 class="font-headline-md text-on-surface">Alat Pembersih</h2>
</div>
<div class="mt-4">
<label class="flex items-start gap-3 p-3 border border-outline-variant rounded hover:border-primary-container cursor-pointer transition-colors group">
<input class="mt-1 h-5 w-5 text-primary-container border-outline-variant rounded focus:ring-primary-container focus:ring-opacity-50" type="checkbox">
<div class="flex flex-col">
<div class="font-body-md text-on-surface font-medium group-hover:text-primary-container">Sewa Alat Pembersih Tambahan dari Mitra</div>
<div class="font-body-sm text-primary-container mt-1">+ Rp 15.000</div>
</div>
</label>
</div>
</section>
<!-- Pilih Tanggal & Jam -->
<section class="bg-surface-container-lowest p-gutter rounded-lg border border-outline-variant mb-stack-lg">
<div class="flex items-center gap-2 mb-stack-sm border-b border-surface-container-high pb-stack-xs">
<span class="material-symbols-outlined text-primary-container" data-weight="fill" style="font-variation-settings: 'FILL' 1;">event</span>
<h2 class="font-headline-md text-on-surface">Pilih Tanggal &amp; Jam Pembersihan</h2>
</div>
<div class="grid grid-cols-1 md:grid-cols-2 gap-stack-md mt-4">
<div>
<label class="block font-label-md text-on-surface-variant font-bold mb-2">Tanggal</label>
<input class="w-full border border-outline-variant rounded py-4 px-3 text-on-surface font-body-md focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container focus:ring-opacity-20 transition-all" type="date">
</div>
<div>
<label class="block font-label-md text-on-surface-variant font-bold mb-2">Pilih Jam</label>
<div class="grid grid-cols-3 gap-3">
<button class="py-3 border border-outline-variant rounded text-on-surface font-body-md hover:bg-surface-container-low hover:border-primary-container hover:text-primary-container transition-colors">09:00</button>
<button class="py-3 border border-primary-container bg-surface-container text-primary-container rounded font-body-md transition-colors">10:00</button>
<button class="py-3 border border-outline-variant rounded text-on-surface font-body-md hover:bg-surface-container-low hover:border-primary-container hover:text-primary-container transition-colors">11:00</button>
<button class="py-3 border border-outline-variant rounded text-on-surface font-body-md hover:bg-surface-container-low hover:border-primary-container hover:text-primary-container transition-colors">13:00</button>
<button class="py-3 border border-outline-variant rounded text-on-surface font-body-md hover:bg-surface-container-low hover:border-primary-container hover:text-primary-container transition-colors">14:00</button>
<div class="relative">
<div class="w-full text-center py-3 border border-secondary-fixed bg-secondary-fixed opacity-50 rounded font-body-md text-on-surface-variant cursor-not-allowed">15:00
<span class="absolute -top-2 -right-2 bg-error text-on-error font-label-sm px-2 py-0.5 rounded-full shadow-sm">Penuh</span>
</div>
</div>
</div>
</div>
</div>
</section>
<!-- Catatan -->
<section class="bg-surface-container-lowest p-gutter rounded-lg border border-outline-variant mb-stack-lg">
<div class="flex items-center gap-2 mb-stack-sm border-b border-surface-container-high pb-stack-xs">
<span class="material-symbols-outlined text-primary-container" data-weight="fill" style="font-variation-settings: 'FILL' 1;">note_alt</span>
<h2 class="font-headline-md text-on-surface">Catatan untuk Mitra (Opsional)</h2>
</div>
<div class="mt-4">
<textarea class="w-full border border-outline-variant rounded p-3 h-32 text-on-surface font-body-md focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container focus:ring-opacity-20 transition-all resize-none placeholder:text-on-surface-variant" placeholder="Contoh: Tolong fokus bersihkan area kamar mandi dan bawa cairan pembersih kerak..."></textarea>
</div>
</section>
</div>
<!-- Right Panel: Sticky Billing Summary -->
<div class="md:col-span-4">
<div class="sticky top-24 bg-surface-container-lowest border border-outline-variant rounded-lg p-gutter shadow-[0px_20px_50px_rgba(0,0,0,0.05)]">
<div class="flex items-center gap-2 mb-stack-md border-b border-surface-container-high pb-stack-xs">
<span class="material-symbols-outlined text-primary-container" data-weight="fill" style="font-variation-settings: 'FILL' 1;">receipt_long</span>
<h2 class="font-headline-md text-on-surface font-bold">Ringkasan Pembayaran</h2>
</div>
<div class="flex flex-col gap-4 mb-stack-md">
<div class="flex justify-between items-center border-b border-surface-container-high pb-2">
<span class="font-body-md text-on-surface-variant">Harga Paket (2 Jam)</span>
<span class="font-body-md text-on-surface font-semibold">Rp 65.000</span>
</div>
<div class="flex justify-between items-center border-b border-surface-container-high pb-2">
<span class="font-body-md text-on-surface-variant">Biaya Tambahan Alat</span>
<span class="font-body-md text-on-surface font-semibold">-</span>
</div>
<div class="flex justify-between items-center border-b border-surface-container-high pb-2">
<span class="font-body-md text-on-surface-variant">Biaya Transportasi</span>
<span class="font-body-md text-on-surface font-semibold">Rp 10.000</span>
</div>
<div class="flex justify-between items-center pt-2">
<span class="font-headline-sm text-on-surface font-bold">Total Pembayaran Sementara</span>
<span class="font-headline-sm text-primary-container font-bold">Rp 75.000</span>
</div>
</div>
<div class="bg-surface-container p-4 rounded mb-stack-md flex items-start gap-3">
<span class="material-symbols-outlined text-primary-container mt-0.5">info</span>
<p class="font-body-sm text-on-surface">
                        Transaksi Anda dilindungi oleh Sistem Escrow KostHub. Dana akan diteruskan ke mitra hanya setelah layanan selesai sesuai pesanan Anda.
                    </p>
</div>
<button class="w-full bg-primary-container text-on-primary py-3 px-4 rounded font-label-md font-bold hover:brightness-90 transition-all flex justify-center items-center gap-2">
                    Lanjutkan ke Pembayaran
                    <span class="material-symbols-outlined text-sm">arrow_forward</span>
</button>
</div>
</div>
</main>
<!-- Footer -->
<footer class="bg-surface-container dark:bg-on-background w-full py-stack-lg border-t border-outline-variant dark:border-outline mt-auto">
<div class="flex flex-col md:flex-row justify-between items-center px-margin-desktop md:px-margin-desktop px-margin-mobile max-w-container-max mx-auto gap-4">
<div class="font-headline-sm font-bold text-on-surface">KostHub<span class="text-[#2563EB] text-2xl leading-none">.</span></div>
<div class="flex gap-4 font-body-sm text-on-surface-variant dark:text-surface-variant">
<a class="hover:text-primary-container dark:hover:text-primary-fixed transition-colors cursor-pointer" href="#">About Us</a>
<a class="hover:text-primary-container dark:hover:text-primary-fixed transition-colors cursor-pointer" href="#">Terms of Service</a>
<a class="hover:text-primary-container dark:hover:text-primary-fixed transition-colors cursor-pointer" href="#">Privacy Policy</a>
<a class="hover:text-primary-container dark:hover:text-primary-fixed transition-colors cursor-pointer" href="#">Contact</a>
</div>
<div class="font-body-sm text-on-surface-variant dark:text-surface-variant">
                © 2024 KostHub. Hyperlocal Marketplace.
            </div>
</div>
</footer>
</body></html>