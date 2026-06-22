<!DOCTYPE html>

<html lang="id" style=""><head>
<meta charset="utf-8"/>
<meta content="width=device-width, initial-scale=1.0" name="viewport"/>
<title>KostHub• - Pembayaran</title>
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet"/>
<script id="tailwind-config">
        tailwind.config = {
            darkMode: "class",
            theme: {
                extend: {
                    "colors": {
                        "surface-container-high": "#dce9ff",
                        "primary-fixed-dim": "#b4c5ff",
                        "on-primary": "#ffffff",
                        "outline-variant": "#c3c6d7",
                        "on-surface": "#0b1c30",
                        "surface-bright": "#f8f9ff",
                        "on-error-container": "#93000a",
                        "surface-variant": "#d3e4fe",
                        "primary": "#004ac6",
                        "surface-tint": "#0053db",
                        "secondary-container": "#e0e3e5",
                        "on-secondary": "#ffffff",
                        "primary-fixed": "#dbe1ff",
                        "on-primary-fixed": "#00174b",
                        "tertiary-fixed-dim": "#ffb596",
                        "tertiary-container": "#bc4800",
                        "surface-container-highest": "#d3e4fe",
                        "surface": "#f8f9ff",
                        "on-tertiary-fixed-variant": "#7d2d00",
                        "on-tertiary-container": "#ffede6",
                        "surface-container-low": "#eff4ff",
                        "on-primary-fixed-variant": "#003ea8",
                        "inverse-on-surface": "#eaf1ff",
                        "surface-container-lowest": "#ffffff",
                        "on-tertiary-fixed": "#360f00",
                        "inverse-surface": "#213145",
                        "error-container": "#ffdad6",
                        "on-secondary-fixed": "#191c1e",
                        "surface-container": "#e5eeff",
                        "primary-container": "#2563eb",
                        "background": "#f8f9ff",
                        "on-secondary-fixed-variant": "#444749",
                        "on-tertiary": "#ffffff",
                        "secondary-fixed-dim": "#c4c7c9",
                        "on-primary-container": "#eeefff",
                        "on-error": "#ffffff",
                        "on-background": "#0b1c30",
                        "inverse-primary": "#b4c5ff",
                        "on-secondary-container": "#626567",
                        "tertiary-fixed": "#ffdbcd",
                        "secondary-fixed": "#e0e3e5",
                        "outline": "#737686",
                        "on-surface-variant": "#434655",
                        "tertiary": "#943700",
                        "surface-dim": "#cbdbf5",
                        "error": "#ba1a1a",
                        "secondary": "#5c5f61"
                    },
                    "borderRadius": {
                        "DEFAULT": "0.125rem",
                        "lg": "0.25rem",
                        "xl": "0.5rem",
                        "full": "0.75rem"
                    },
                    "spacing": {
                        "base": "8px",
                        "margin-mobile": "16px",
                        "stack-md": "24px",
                        "gutter": "24px",
                        "stack-lg": "48px",
                        "stack-sm": "12px",
                        "margin-desktop": "32px",
                        "stack-xs": "4px",
                        "container-max": "1280px"
                    },
                    "fontFamily": {
                        "headline-md": ["Inter"],
                        "display": ["Inter"],
                        "body-sm": ["Inter"],
                        "body-md": ["Inter"],
                        "label-sm": ["Inter"],
                        "label-md": ["Inter"],
                        "headline-lg-mobile": ["Inter"],
                        "body-lg": ["Inter"],
                        "headline-sm": ["Inter"],
                        "headline-lg": ["Inter"]
                    },
                    "fontSize": {
                        "headline-md": ["24px", { "lineHeight": "1.3", "fontWeight": "600" }],
                        "display": ["48px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                        "body-sm": ["14px", { "lineHeight": "1.5", "fontWeight": "400" }],
                        "body-md": ["16px", { "lineHeight": "1.5", "fontWeight": "400" }],
                        "label-sm": ["12px", { "lineHeight": "1", "letterSpacing": "0.02em", "fontWeight": "500" }],
                        "label-md": ["14px", { "lineHeight": "1", "letterSpacing": "0.01em", "fontWeight": "500" }],
                        "headline-lg-mobile": ["24px", { "lineHeight": "1.2", "fontWeight": "600" }],
                        "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }],
                        "headline-sm": ["18px", { "lineHeight": "1.4", "fontWeight": "600" }],
                        "headline-lg": ["32px", { "lineHeight": "1.2", "letterSpacing": "-0.01em", "fontWeight": "600" }]
                    }
                }
            }
        }
    </script>
<style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-surface text-on-surface antialiased min-h-screen flex flex-col">
<!-- TopAppBar -->
<header class="bg-surface-container-lowest border-b border-outline-variant w-full sticky top-0 z-50">
<div class="flex justify-between items-center w-full px-margin-mobile md:px-margin-desktop py-4 max-w-container-max mx-auto">
<div class="flex items-center gap-gutter">
<a class="font-headline-md font-bold text-on-surface tracking-tight flex items-baseline" href="#">KostHub<span class="text-[#2563EB] text-3xl leading-none">.</span></a>
</div>
<nav class="hidden md:flex items-center gap-stack-md">
<a class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors font-medium" href="#">Home</a>
<a class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors font-medium" href="#">Gas &amp; Galon</a>
<a class="font-body-md text-body-md hover:text-primary transition-colors font-medium text-primary font-bold border-b-2 border-primary" href="#">Laundry Express</a>
<a class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors font-medium" href="#">Daily Cleaning</a>
<a class="font-body-md text-body-md text-on-surface-variant hover:text-primary transition-colors font-medium" href="#">Tentang Kami</a>
</nav>
<div class="flex items-center gap-stack-sm">
<button class="text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center p-2 rounded-full hover:bg-surface-container-low">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0;">notifications</span>
</button>
<div class="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-label-md text-label-md font-bold cursor-pointer">
                    JD
                </div>
</div>
</div>
</header>
<main class="flex-grow w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-stack-lg">
<!-- Stepper -->
<div class="mb-stack-lg max-w-3xl mx-auto">
<div class="flex items-center justify-between relative">
<div class="absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 bg-secondary-container -z-10"></div>
<div class="absolute left-0 top-1/2 -translate-y-1/2 w-2/3 h-0.5 bg-primary -z-10"></div>
<div class="flex flex-col items-center gap-stack-xs bg-surface px-2">
<div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md font-bold">
<span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">check</span>
</div>
<span class="font-label-sm text-label-sm text-on-surface-variant">Pilih Mitra</span>
</div>
<div class="flex flex-col items-center gap-stack-xs bg-surface px-2">
<div class="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-label-md text-label-md font-bold">
<span class="material-symbols-outlined text-[16px]" style="font-variation-settings: 'FILL' 1;">check</span>
</div>
<span class="font-label-sm text-label-sm text-on-surface-variant">Detail Pesanan</span>
</div>
<div class="flex flex-col items-center gap-stack-xs bg-surface px-2">
<div class="w-8 h-8 rounded-full border-2 border-primary bg-surface text-primary flex items-center justify-center font-label-md text-label-md font-bold">
                        3
                    </div>
<span class="font-label-sm text-label-sm text-primary font-bold">Pembayaran</span>
</div>
</div>
</div>
<div class="grid grid-cols-1 lg:grid-cols-12 gap-gutter">
<!-- Left Column: Payment Details -->
<div class="lg:col-span-8 flex flex-col gap-stack-md">
<div>
<h1 class="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-stack-xs">Pembayaran</h1>
<p class="font-body-md text-body-md text-on-surface-variant">Selesaikan transaksi Anda dengan memilih metode pembayaran di bawah ini.</p>
</div>
<!-- Order Summary Small Card -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-stack-sm flex gap-stack-sm items-center">
<div class="w-12 h-12 bg-surface-container-low rounded-md flex items-center justify-center text-primary shrink-0">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">local_laundry_service</span>
</div>
<div class="flex flex-col justify-center">
<h3 class="font-label-md text-label-md font-bold text-on-surface mb-1">Laundry Express - Mitra: Laundry Wangi Jaya</h3>
<p class="font-body-sm text-body-sm text-on-surface-variant">Estimasi berat: 3kg • Cuci Setrika</p>
</div>
</div>
<!-- Payment Methods -->
<div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-stack-md flex flex-col gap-stack-sm mb-stack-md"><h3 class="font-headline-sm text-headline-sm text-on-surface">Data Pelanggan</h3><div class="flex flex-col gap-3"><div class="flex items-start gap-3"><span class="material-symbols-outlined text-on-surface-variant text-[20px]">person</span><div><p class="font-label-sm text-label-sm text-on-surface-variant">Nama</p><p class="font-body-md text-body-md text-on-surface font-medium">Budi Santoso</p></div></div><div class="flex items-start gap-3"><span class="material-symbols-outlined text-on-surface-variant text-[20px]">call</span><div><p class="font-label-sm text-label-sm text-on-surface-variant">Nomor WhatsApp</p><p class="font-body-md text-body-md text-on-surface font-medium">+62 812-3456-7890</p></div></div><div class="flex items-start gap-3"><span class="material-symbols-outlined text-on-surface-variant text-[20px]">location_on</span><div><p class="font-label-sm text-label-sm text-on-surface-variant">Alamat Pengiriman/Penjemputan</p><p class="font-body-md text-body-md text-on-surface font-medium">Jl. Merdeka No. 123, Jakarta Selatan (Kost A, Kamar 12)</p></div></div></div></div><div class="flex flex-col gap-stack-sm mt-stack-sm">
<h2 class="font-headline-sm text-headline-sm text-on-surface mb-stack-xs">Pilih Metode Pembayaran</h2>
<!-- QRIS Option (Active/Selected) -->
<label class="block cursor-pointer">
<div class="bg-surface-container-lowest border border-primary rounded-lg p-stack-md relative transition-colors hover:bg-surface-container-low">
<div class="absolute top-stack-md right-stack-md">
<input checked="" class="w-5 h-5 text-primary border-outline-variant focus:ring-primary focus:ring-2" name="payment_method" type="radio"/>
</div>
<div class="flex items-start gap-stack-md pr-8">
<div class="w-10 h-10 bg-primary-container rounded-md flex items-center justify-center text-on-primary shrink-0">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 1;">qr_code_scanner</span>
</div>
<div>
<h4 class="font-label-md text-label-md font-bold text-on-surface mb-stack-xs">QRIS</h4>
<p class="font-body-sm text-body-sm text-on-surface-variant">Bayar instan dengan aplikasi bank atau e-wallet (GoPay, OVO, ShopeePay).</p>
<div class="mt-stack-md flex gap-2">
<div class="w-12 h-8 bg-surface-container-high rounded border border-outline-variant flex items-center justify-center text-[10px] font-bold text-on-surface-variant">GoPay</div>
<div class="w-12 h-8 bg-surface-container-high rounded border border-outline-variant flex items-center justify-center text-[10px] font-bold text-on-surface-variant">OVO</div>
<div class="w-12 h-8 bg-surface-container-high rounded border border-outline-variant flex items-center justify-center text-[10px] font-bold text-on-surface-variant">Shopee</div>
</div>
</div>
</div>
</div>
</label>
<!-- Credit/Debit Card Option -->
<label class="block cursor-pointer">
<div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-stack-md relative transition-colors hover:border-outline">
<div class="absolute top-stack-md right-stack-md">
<input class="w-5 h-5 text-primary border-outline-variant focus:ring-primary focus:ring-2" name="payment_method" type="radio"/>
</div>
<div class="flex items-start gap-stack-md pr-8">
<div class="w-10 h-10 bg-surface-container-high rounded-md flex items-center justify-center text-on-surface-variant shrink-0">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0;">credit_card</span>
</div>
<div class="w-full">
<h4 class="font-label-md text-label-md font-bold text-on-surface mb-stack-xs">Kartu Kredit/Debit</h4>
<p class="font-body-sm text-body-sm text-on-surface-variant">Visa, Mastercard, atau GPN.</p>
<!-- Card Inputs (Hidden by default, would show when active) -->
<div class="mt-stack-md hidden flex-col gap-stack-sm w-full max-w-md">
<div>
<label class="block font-label-md text-label-md font-bold text-on-surface mb-1">Nomor Kartu</label>
<input class="w-full h-12 px-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest" placeholder="0000 0000 0000 0000" type="text"/>
</div>
<div class="flex gap-stack-sm">
<div class="flex-1">
<label class="block font-label-md text-label-md font-bold text-on-surface mb-1">Berlaku Hingga</label>
<input class="w-full h-12 px-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest" placeholder="MM/YY" type="text"/>
</div>
<div class="flex-1">
<label class="block font-label-md text-label-md font-bold text-on-surface mb-1">CVV</label>
<input class="w-full h-12 px-3 border border-outline-variant rounded-lg focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary bg-surface-container-lowest" placeholder="123" type="text"/>
</div>
</div>
</div>
</div>
</div>
</div>
</label>
<!-- Cash Option -->
<label class="block cursor-pointer">
<div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-stack-md relative transition-colors hover:border-outline">
<div class="absolute top-stack-md right-stack-md">
<input class="w-5 h-5 text-primary border-outline-variant focus:ring-primary focus:ring-2" name="payment_method" type="radio"/>
</div>
<div class="flex items-start gap-stack-md pr-8">
<div class="w-10 h-10 bg-surface-container-high rounded-md flex items-center justify-center text-on-surface-variant shrink-0">
<span class="material-symbols-outlined" style="font-variation-settings: 'FILL' 0;">payments</span>
</div>
<div>
<h4 class="font-label-md text-label-md font-bold text-on-surface mb-stack-xs">Cash (Tunai)</h4>
<p class="font-body-sm text-body-sm text-on-surface-variant">Bayar langsung ke kurir saat pesanan tiba.</p>
<div class="mt-stack-sm inline-flex items-center gap-1 bg-surface-container px-2 py-1 rounded text-on-surface-variant font-label-sm text-label-sm">
<span class="material-symbols-outlined text-[14px]">info</span>
                                        Mohon siapkan uang pas
                                    </div>
</div>
</div>
</div>
</label>
</div>
</div>
<!-- Right Column: Sidebar Summary -->
<div class="lg:col-span-4 mt-stack-md lg:mt-0">
<div class="bg-surface-container-lowest border border-outline-variant rounded-lg p-stack-md sticky top-[100px]">
<h2 class="font-headline-sm text-headline-sm font-bold text-on-surface mb-stack-md border-b border-outline-variant pb-stack-sm">Ringkasan Pembayaran</h2>
<div class="flex flex-col gap-stack-sm mb-stack-md">
<div class="flex justify-between items-center">
<span class="font-body-md text-body-md text-on-surface-variant">Subtotal (3kg)</span>
<span class="font-body-md text-body-md text-on-surface font-medium">Rp 24.000</span>
</div>
<div class="flex justify-between items-center">
<span class="font-body-md text-body-md text-on-surface-variant">Biaya Pengiriman</span>
<span class="font-body-md text-body-md text-on-surface font-medium">Rp 5.000</span>
</div>
<div class="flex justify-between items-center">
<span class="font-body-md text-body-md text-on-surface-variant">Biaya Layanan Aplikasi</span>
<span class="font-body-md text-body-md text-on-surface font-medium">Rp 2.000</span>
</div>
</div>
<!-- Promo Code Input -->
<div class="border-t border-outline-variant pt-stack-sm mb-stack-md flex justify-between items-center">
<span class="font-label-md text-label-md font-bold text-on-surface">Total Pembayaran</span>
<span class="font-headline-md text-headline-md font-bold text-primary">Rp 31.000</span>
</div>
<!-- Escrow Note -->
<div class="bg-surface-container-low border border-primary-fixed-dim rounded-lg p-stack-sm flex items-start gap-stack-xs mb-stack-md">
<span class="material-symbols-outlined text-primary text-[20px] shrink-0">shield_lock</span>
<p class="font-body-sm text-body-sm text-on-surface-variant leading-tight">Transaksi Anda dilindungi oleh Sistem Escrow KostHub. Dana akan diteruskan ke mitra hanya setelah layanan selesai sesuai pesanan Anda.</p>
</div>
<button class="w-full h-12 bg-primary text-on-primary font-label-md text-label-md font-bold rounded-lg hover:bg-primary-container transition-colors flex items-center justify-center gap-2">
                        Bayar Sekarang
                        <span class="material-symbols-outlined text-[18px]">arrow_forward</span>
</button>
</div>
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
<script>
        // Simple JS to toggle active state on payment methods
        document.addEventListener('DOMContentLoaded', () => {
            const paymentRadios = document.querySelectorAll('input[name="payment_method"]');
            
            paymentRadios.forEach(radio => {
                radio.addEventListener('change', (e) => {
                    // Reset all borders
                    document.querySelectorAll('input[name="payment_method"]').forEach(r => {
                        const container = r.closest('label').querySelector('div');
                        container.classList.remove('border-primary');
                        container.classList.add('border-outline-variant');
                    });
                    
                    // Set active border
                    if(e.target.checked) {
                        const activeContainer = e.target.closest('label').querySelector('div');
                        activeContainer.classList.remove('border-outline-variant');
                        activeContainer.classList.add('border-primary');
                    }
                });
            });
        });
    </script>
</body></html>