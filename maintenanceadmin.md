<!DOCTYPE html><html class="light" lang="en"><head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>KostHub Admin Dashboard</title>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "primary-fixed": "#dbe1ff",
                    "surface-container-low": "#eff4ff",
                    "on-secondary-fixed": "#191c1e",
                    "primary-fixed-dim": "#b4c5ff",
                    "primary-container": "#2563eb",
                    "on-surface": "#0b1c30",
                    "on-surface-variant": "#434655",
                    "surface-container-highest": "#d3e4fe",
                    "secondary-fixed-dim": "#c4c7c9",
                    "surface-variant": "#d3e4fe",
                    "error-container": "#ffdad6",
                    "tertiary-fixed-dim": "#ffb596",
                    "secondary-container": "#e0e3e5",
                    "tertiary": "#943700",
                    "on-tertiary-fixed-variant": "#7d2d00",
                    "on-tertiary-fixed": "#360f00",
                    "outline": "#737686",
                    "surface-dim": "#cbdbf5",
                    "secondary-fixed": "#e0e3e5",
                    "surface-bright": "#f8f9ff",
                    "surface": "#f8f9ff",
                    "inverse-primary": "#b4c5ff",
                    "secondary": "#5c5f61",
                    "surface-container-high": "#dce9ff",
                    "outline-variant": "#c3c6d7",
                    "on-tertiary-container": "#ffede6",
                    "on-tertiary": "#ffffff",
                    "on-error": "#ffffff",
                    "on-secondary-container": "#626567",
                    "on-secondary": "#ffffff",
                    "on-primary-container": "#eeefff",
                    "on-secondary-fixed-variant": "#444749",
                    "error": "#ba1a1a",
                    "surface-container": "#e5eeff",
                    "on-primary-fixed": "#00174b",
                    "inverse-surface": "#213145",
                    "tertiary-fixed": "#ffdbcd",
                    "on-primary": "#ffffff",
                    "inverse-on-surface": "#eaf1ff",
                    "tertiary-container": "#bc4800",
                    "on-error-container": "#93000a",
                    "primary": "#004ac6",
                    "background": "#f8f9ff",
                    "on-primary-fixed-variant": "#003ea8",
                    "surface-container-lowest": "#ffffff",
                    "on-background": "#0b1c30",
                    "surface-tint": "#0053db"
            },
            "borderRadius": {
                    "DEFAULT": "0.125rem",
                    "lg": "0.25rem",
                    "xl": "0.5rem",
                    "full": "0.75rem"
            },
            "spacing": {
                    "margin-desktop": "32px",
                    "gutter": "24px",
                    "stack-md": "24px",
                    "stack-xs": "4px",
                    "base": "8px",
                    "stack-lg": "48px",
                    "container-max": "1280px",
                    "margin-mobile": "16px",
                    "stack-sm": "12px"
            },
            "fontFamily": {
                    "headline-md": [
                            "Inter"
                    ],
                    "body-lg": [
                            "Inter"
                    ],
                    "display": [
                            "Inter"
                    ],
                    "headline-lg": [
                            "Inter"
                    ],
                    "label-sm": [
                            "Inter"
                    ],
                    "body-sm": [
                            "Inter"
                    ],
                    "headline-sm": [
                            "Inter"
                    ],
                    "body-md": [
                            "Inter"
                    ],
                    "label-md": [
                            "Inter"
                    ],
                    "headline-lg-mobile": [
                            "Inter"
                    ]
            },
            "fontSize": {
                    "headline-md": [
                            "24px",
                            {
                                    "lineHeight": "1.3",
                                    "fontWeight": "600"
                            }
                    ],
                    "body-lg": [
                            "18px",
                            {
                                    "lineHeight": "1.6",
                                    "fontWeight": "400"
                            }
                    ],
                    "display": [
                            "48px",
                            {
                                    "lineHeight": "1.1",
                                    "letterSpacing": "-0.02em",
                                    "fontWeight": "700"
                            }
                    ],
                    "headline-lg": [
                            "32px",
                            {
                                    "lineHeight": "1.2",
                                    "letterSpacing": "-0.01em",
                                    "fontWeight": "600"
                            }
                    ],
                    "label-sm": [
                            "12px",
                            {
                                    "lineHeight": "1",
                                    "letterSpacing": "0.02em",
                                    "fontWeight": "500"
                            }
                    ],
                    "body-sm": [
                            "14px",
                            {
                                    "lineHeight": "1.5",
                                    "fontWeight": "400"
                            }
                    ],
                    "headline-sm": [
                            "18px",
                            {
                                    "lineHeight": "1.4",
                                    "fontWeight": "600"
                            }
                    ],
                    "body-md": [
                            "16px",
                            {
                                    "lineHeight": "1.5",
                                    "fontWeight": "400"
                            }
                    ],
                    "label-md": [
                            "14px",
                            {
                                    "lineHeight": "1",
                                    "letterSpacing": "0.01em",
                                    "fontWeight": "500"
                            }
                    ],
                    "headline-lg-mobile": [
                            "24px",
                            {
                                    "lineHeight": "1.2",
                                    "fontWeight": "600"
                            }
                    ]
            }
          },
        },
      }
    </script>
<style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-background text-on-background font-body-md min-h-screen">
<!-- TopNavBar -->
<nav class="fixed top-0 w-full z-50 flex justify-between items-center px-margin-desktop h-16 bg-surface-container-lowest border-b border-outline-variant flat no shadows transition-colors duration-200 left-0 right-0">
<div class="flex items-center space-x-4"><a class="text-2xl font-bold text-on-surface tracking-tight flex items-center gap-1" href="#">KostHub<span class="text-primary text-3xl leading-[0.5]">.</span></a></div>
<div class="flex items-center space-x-6">
<button class="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors duration-200">
<span class="material-symbols-outlined">notifications</span>
</button>
<button class="text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full transition-colors duration-200">
<span class="material-symbols-outlined">help</span>
</button>
<div class="flex items-center space-x-2">
<img alt="Partner Profile" class="w-8 h-8 rounded-full border border-outline-variant" data-alt="A professional headshot of a person looking directly at the camera. The lighting is soft and even, highlighting their features. The background is simple and out of focus, drawing attention to the subject. This profile picture is used to represent an administrator in a digital platform." src="https://lh3.googleusercontent.com/aida-public/AB6AXuDT0AdV5Z5MUcPbHK72cL-plOTymvr7uuBk_yFfOKmFw6N8eFX5bLkJvVmL36BnchaNyQQvKniLE6v3dRpZ9fGAII4TxeHz_SQr9qp5-Ozy-EvMWWxwAVJlQJjVI8PgAwxi4iKwYgjuIwrgOIF89jQag9GTQwZNhx50L8lKH2qCyr_AKiZ9sxJ3Mw2dzts4Glv4-kKTMPrDGQJMBGYptN6XAlTDbWX7y2MPHrMDHiI4Vq573jjkeF_4shWpCCn2_9J1WE7UPgVAHOw">
<span class="text-label-md font-label-md text-on-surface hidden md:block">Admin Central</span>
</div>
</div>
</nav>
<!-- SideNavBar -->
<aside class="fixed left-0 top-16 h-[calc(100vh-64px)] flex flex-col p-4 space-y-4 bg-surface-container-lowest border-r border-outline-variant z-40 w-64 hidden md:flex">
<div class="mb-2 px-2 flex flex-col items-center border-b border-outline-variant pb-4">
<div class="flex flex-col items-center space-y-2 justify-center">
<img alt="KostHub Admin" class="w-10 h-10 rounded-full border-2 border-primary-fixed" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBGYjeqX8fHQwiwWoGM55Tn_S265O77UcwSQ3I9oxzC6VEKAGOGmw5DlCMtPIJOrkS8hlluH2N6Qkd9h0nhOGuzQTCOngYr6OBPYGqHFog3-ALhupmVMNuC--NVRSQPHp8G-TJ-jLE02ulMXaS2ung3sH358WWxnDijTa7VKK4-dL2vI0n3-wrlT8unw7tsQcrAR7c_SPpSumAqsqPGAVMj9n0qzdPFCSJclO3iNv06yRgnW9bD94wiVS0wjKVWW3u-uJJ22gppitU">
<div class="text-center">
<h2 class="text-label-md font-bold text-on-surface">Admin Panel</h2>
<p class="text-label-sm text-on-surface-variant">System Control</p>
</div>
</div>
</div>
<nav class="flex-1 space-y-1">
<a class="flex items-center px-4 py-3 font-bold rounded-xl transition-all duration-150 text-on-surface-variant" href="#">
<span class="material-symbols-outlined mr-3">dashboard</span>
<span class="text-label-md">Overview</span>
</a>
<a class="flex items-center px-4 py-3 hover:text-on-surface hover:bg-surface-container-high rounded-xl transition-colors duration-200 text-on-surface-variant" href="#">
<span class="material-symbols-outlined mr-3">inventory_2</span>
<span class="text-label-md">Inventory</span>
</a>
<a class="flex items-center px-4 py-3 hover:text-on-surface hover:bg-surface-container-high rounded-xl transition-colors duration-200 text-on-surface-variant" href="#">
<span class="material-symbols-outlined mr-3">group</span>
<span class="text-label-md">Partners List</span>
</a>
<a class="flex items-center px-4 py-3 hover:text-on-surface hover:bg-surface-container-high rounded-xl transition-colors duration-200 font-bold text-on-surface-variant" href="#">
<span class="material-symbols-outlined mr-3">security</span>
<span class="text-label-md">Security</span>
</a>
<a class="flex items-center px-4 py-3 hover:text-on-surface hover:bg-surface-container-high rounded-xl transition-colors duration-200 bg-primary text-white shadow-md font-bold" href="#">
<span class="material-symbols-outlined mr-3">build</span>
<span class="text-label-md">Maintenance</span>
</a>
<a class="flex items-center px-4 py-3 text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high rounded-xl transition-colors duration-200" href="#">
<span class="material-symbols-outlined mr-3">settings</span>
<span class="text-label-md">Settings</span>
</a>
</nav>
<div class="mt-auto px-2 py-4 border-t border-outline-variant">
<button class="w-full py-2 bg-surface-container-low text-primary border border-outline-variant rounded-lg text-label-md font-medium hover:bg-surface-container-high transition-colors">Quick Support</button>
</div>
</aside>
<!-- Main Content -->
<main class="md:ml-64 min-h-screen p-margin-mobile md:p-margin-desktop pb-24" style="padding-top: 80px;">
<div class="max-w-container-max mx-auto space-y-stack-lg">
<!-- Platform Stats Bento -->
<section>
<header class="mb-stack-md mt-2"><h1 class="text-headline-lg font-headline-lg text-on-surface mb-1">Pemeliharaan Sistem</h1><p class="text-body-md text-on-surface-variant">Manajemen jadwal pemeliharaan, cadangan data, dan pembaruan sistem.</p></header>
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-gutter mb-stack-lg"><div class="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:border-primary transition-colors flex flex-col justify-between"><div class="flex justify-between items-start"><span class="text-label-md font-label-md text-on-surface-variant mb-2">Status Server</span><span class="material-symbols-outlined text-primary">cloud_done</span></div><div class="text-headline-lg font-headline-lg text-on-surface font-bold">Optimal</div><div class="text-label-sm font-label-sm text-on-surface-variant mt-2">Semua sistem berjalan normal</div></div><div class="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:border-primary transition-colors flex flex-col justify-between"><div class="flex justify-between items-start"><span class="text-label-md font-label-md text-on-surface-variant mb-2">Cadangan Terakhir</span><span class="material-symbols-outlined text-primary">backup</span></div><div class="text-headline-lg font-headline-lg text-on-surface font-bold">2 Jam Lalu</div><div class="text-label-sm font-label-sm text-on-surface-variant mt-2">Otomatis ke Cloud Storage</div></div><div class="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:border-primary transition-colors flex flex-col justify-between"><div class="flex justify-between items-start"><span class="text-label-md font-label-md text-on-surface-variant mb-2">Versi Sistem</span><span class="material-symbols-outlined text-primary">update</span></div><div class="text-headline-lg font-headline-lg text-on-surface font-bold">v2.4.1</div><div class="text-label-sm font-label-sm text-tertiary mt-2">Pembaruan tersedia (v2.5.0)</div></div><div class="bg-surface-container-lowest p-6 rounded-xl border border-outline-variant hover:border-primary transition-colors flex flex-col justify-between"><div class="flex justify-between items-start"><span class="text-label-md font-label-md text-on-surface-variant mb-2">Jadwal MT Berikutnya</span><span class="material-symbols-outlined text-primary">event_repeat</span></div><div class="text-headline-lg font-headline-lg text-on-surface font-bold">15 Jan, 02:00</div><div class="text-label-sm font-label-sm text-on-surface-variant mt-2">Estimasi durasi: 30 menit</div></div></div>
</section>
<section class="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden flex flex-col"><div class="p-6 border-b border-outline-variant flex flex-col md:flex-row justify-between items-start md:items-center gap-4"><h2 class="text-headline-sm font-headline-sm text-on-surface font-bold">Riwayat Pemeliharaan &amp; Update</h2><div class="flex flex-wrap gap-3"><div class="relative"><span class="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-sm">search</span><input class="bg-surface-container-low border border-outline-variant rounded-lg pl-9 pr-4 py-2 text-label-md focus:ring-1 focus:ring-primary outline-none w-48" placeholder="Cari log..." type="text"></div><button class="flex items-center gap-2 bg-surface-container-low border border-outline-variant rounded-lg px-4 py-2 text-label-md hover:bg-surface-container-high transition-colors"><span class="material-symbols-outlined text-sm">calendar_today</span> Rentang Waktu</button></div></div><div class="overflow-x-auto"><table class="w-full text-left border-collapse"><thead><tr class="bg-surface-container-low text-label-sm font-label-sm text-on-surface-variant border-b border-outline-variant"><th class="p-4 font-medium">Waktu</th><th class="p-4 font-medium">Kategori</th><th class="p-4 font-medium">Deskripsi Aktivitas</th><th class="p-4 font-medium">Petugas</th><th class="p-4 font-medium text-right">Status</th></tr></thead><tbody class="text-body-sm font-body-sm text-on-surface divide-y divide-outline-variant/30"><tr class="hover:bg-surface-bright transition-colors"><td class="p-4">10:45:22</td><td class="p-4 font-medium">Database</td><td class="p-4">Optimasi indeks tabel transaksi</td><td class="p-4 text-on-surface-variant">Sistem</td><td class="p-4 text-right"><span class="bg-surface-container-highest text-on-surface px-2.5 py-1 rounded-full text-label-sm font-medium">Berhasil</span></td></tr><tr class="hover:bg-surface-bright transition-colors"><td class="p-4">Yesterday</td><td class="p-4 font-medium">Security</td><td class="p-4">Pembaruan Patch Keamanan Mingguan</td><td class="p-4 text-on-surface-variant">Admin Central</td><td class="p-4 text-right"><span class="bg-surface-container-highest text-on-surface px-2.5 py-1 rounded-full text-label-sm font-medium">Selesai</span></td></tr><tr class="hover:bg-surface-bright transition-colors"><td class="p-4">05 Jan 2024</td><td class="p-4 font-medium">Backup</td><td class="p-4">Full System Backup - Data Marketplace</td><td class="p-4 text-on-surface-variant">Cloud Bot</td><td class="p-4 text-right"><span class="bg-surface-container-highest text-on-surface px-2.5 py-1 rounded-full text-label-sm font-medium">Berhasil</span></td></tr></tbody></table></div></section><section class="bg-surface-container-lowest rounded-xl border border-outline-variant overflow-hidden flex flex-col mt-stack-lg"><div class="p-6 border-b border-outline-variant"><h2 class="text-headline-sm font-headline-sm text-on-surface font-bold">Pusat Kontrol Pemeliharaan</h2></div><div class="p-6 space-y-6"><div class="flex items-center justify-between p-4 bg-surface-container-low rounded-lg"><div class="flex flex-col"> <span class="font-medium text-on-surface">Mode Pemeliharaan (Maintenance Mode)</span> <span class="text-label-sm text-on-surface-variant">Tampilkan halaman 'Sedang Perbaikan' ke pengguna</span></div><button class="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none bg-outline-variant"><span class="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span></button></div><div class="grid grid-cols-1 md:grid-cols-2 gap-4"> <button class="flex items-center justify-center gap-2 bg-surface-container-high border border-outline-variant rounded-lg px-4 py-3 text-label-md font-medium hover:bg-surface-variant transition-colors"><span class="material-symbols-outlined">cloud_upload</span> Jalankan Backup Sekarang</button> <button class="flex items-center justify-center gap-2 bg-primary text-white rounded-lg px-4 py-3 text-label-md font-medium hover:bg-primary-container transition-colors"><span class="material-symbols-outlined">system_update_alt</span> Cek Pembaruan</button></div></div></section>
<!-- Security & Maintenance Section -->
</div>
</main>
<!-- Footer -->
<footer class="w-full py-8 px-margin-desktop flex flex-col md:flex-row justify-between items-center bg-surface-container-lowest border-t border-outline-variant flat no shadows opacity-80 hover:opacity-100 transition-opacity mt-auto z-10 relative md:ml-64">
<div class="mb-4 md:mb-0">
<span class="text-xl font-bold text-on-surface tracking-tight flex items-center gap-1">KostHub<span class="text-primary text-2xl leading-[0.5]">.</span></span>
<p class="text-label-sm font-label-sm text-on-secondary-container mt-1">© 2024 KostHub Hyperlocal Marketplace</p>
</div>
<div class="flex space-x-6"><a class="text-label-sm font-label-sm text-on-secondary-container hover:text-primary transition-colors" href="#">Privacy Policy</a><a class="text-label-sm font-label-sm text-on-secondary-container hover:text-primary transition-colors" href="#">Terms of Service</a><a class="text-label-sm font-label-sm text-on-secondary-container hover:text-primary transition-colors" href="#">Partner Support</a></div>
</footer>




</body></html>