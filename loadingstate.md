<!DOCTYPE html><html lang="en" style=""><head>
<meta charset="utf-8">
<meta content="width=device-width, initial-scale=1.0" name="viewport">
<title>KostHub - Loading</title>
<!-- Google Fonts: Inter -->
<link href="https://fonts.googleapis.com" rel="preconnect">
<link crossorigin="" href="https://fonts.gstatic.com" rel="preconnect">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&amp;display=swap" rel="stylesheet">
<!-- Material Symbols -->
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&amp;display=swap" rel="stylesheet">
<!-- Tailwind CSS -->
<script src="https://cdn.tailwindcss.com?plugins=forms,container-queries"></script>
<!-- Tailwind Configuration -->
<script id="tailwind-config">
      tailwind.config = {
        darkMode: "class",
        theme: {
          extend: {
            "colors": {
                    "surface-container-high": "#dce9ff",
                    "surface-container": "#e5eeff",
                    "on-primary": "#ffffff",
                    "tertiary-container": "#bc4800",
                    "primary-container": "#2563eb",
                    "tertiary-fixed": "#ffdbcd",
                    "surface-tint": "#0053db",
                    "primary": "#004ac6",
                    "inverse-on-surface": "#eaf1ff",
                    "on-tertiary-container": "#ffede6",
                    "inverse-primary": "#b4c5ff",
                    "surface-bright": "#f8f9ff",
                    "on-error": "#ffffff",
                    "on-secondary-fixed": "#191c1e",
                    "on-secondary-fixed-variant": "#444749",
                    "on-tertiary-fixed-variant": "#7d2d00",
                    "secondary-fixed-dim": "#c4c7c9",
                    "surface-variant": "#d3e4fe",
                    "secondary-fixed": "#e0e3e5",
                    "on-tertiary-fixed": "#360f00",
                    "surface-container-low": "#eff4ff",
                    "surface-container-lowest": "#ffffff",
                    "outline-variant": "#c3c6d7",
                    "primary-fixed-dim": "#b4c5ff",
                    "surface": "#f8f9ff",
                    "tertiary": "#943700",
                    "on-background": "#0b1c30",
                    "primary-fixed": "#dbe1ff",
                    "outline": "#737686",
                    "on-tertiary": "#ffffff",
                    "on-primary-container": "#eeefff",
                    "on-error-container": "#93000a",
                    "on-surface": "#0b1c30",
                    "on-primary-fixed-variant": "#003ea8",
                    "error": "#ba1a1a",
                    "on-secondary-container": "#626567",
                    "surface-container-highest": "#d3e4fe",
                    "surface-dim": "#cbdbf5",
                    "tertiary-fixed-dim": "#ffb596",
                    "secondary": "#5c5f61",
                    "error-container": "#ffdad6",
                    "secondary-container": "#e0e3e5",
                    "on-surface-variant": "#434655",
                    "on-secondary": "#ffffff",
                    "background": "#f8f9ff",
                    "on-primary-fixed": "#00174b",
                    "inverse-surface": "#213145"
            },
            "borderRadius": {
                    "DEFAULT": "0.125rem",
                    "lg": "0.25rem",
                    "xl": "0.5rem",
                    "full": "0.75rem"
            },
            "spacing": {
                    "stack-xs": "4px",
                    "margin-mobile": "16px",
                    "gutter": "24px",
                    "stack-lg": "48px",
                    "base": "8px",
                    "margin-desktop": "32px",
                    "stack-md": "24px",
                    "stack-sm": "12px",
                    "container-max": "1280px"
            },
            "fontFamily": {
                    "body-sm": ["Inter"],
                    "label-md": ["Inter"],
                    "body-md": ["Inter"],
                    "headline-sm": ["Inter"],
                    "headline-md": ["Inter"],
                    "headline-lg": ["Inter"],
                    "label-sm": ["Inter"],
                    "display": ["Inter"],
                    "headline-lg-mobile": ["Inter"],
                    "body-lg": ["Inter"]
            },
            "fontSize": {
                    "body-sm": ["14px", { "lineHeight": "1.5", "fontWeight": "400" }],
                    "label-md": ["14px", { "lineHeight": "1", "letterSpacing": "0.01em", "fontWeight": "500" }],
                    "body-md": ["16px", { "lineHeight": "1.5", "fontWeight": "400" }],
                    "headline-sm": ["18px", { "lineHeight": "1.4", "fontWeight": "600" }],
                    "headline-md": ["24px", { "lineHeight": "1.3", "fontWeight": "600" }],
                    "headline-lg": ["32px", { "lineHeight": "1.2", "letterSpacing": "-0.01em", "fontWeight": "600" }],
                    "label-sm": ["12px", { "lineHeight": "1", "letterSpacing": "0.02em", "fontWeight": "500" }],
                    "display": ["48px", { "lineHeight": "1.1", "letterSpacing": "-0.02em", "fontWeight": "700" }],
                    "headline-lg-mobile": ["24px", { "lineHeight": "1.2", "fontWeight": "600" }],
                    "body-lg": ["18px", { "lineHeight": "1.6", "fontWeight": "400" }]
            },
            "animation": {
                'spin-slow': 'spin 2s linear infinite',
                'dash': 'dash 1.5s ease-in-out infinite',
                'fade-in-up': 'fadeInUp 0.8s ease-out forwards',
                'text-pulse': 'textPulse 3s ease-in-out infinite'
            },
            "keyframes": {
                dash: {
                  '0%': { strokeDasharray: '1, 150', strokeDashoffset: '0' },
                  '50%': { strokeDasharray: '90, 150', strokeDashoffset: '-35' },
                  '100%': { strokeDasharray: '90, 150', strokeDashoffset: '-124' },
                },
                fadeInUp: {
                  '0%': { opacity: '0', transform: 'translateY(16px)' },
                  '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                textPulse: {
                    '0%, 100%': { opacity: '0.6' },
                    '50%': { opacity: '1' },
                }
            }
          }
        }
      }
    </script>
<style>
        .material-symbols-outlined {
            font-variation-settings: 'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24;
        }
    </style>
</head>
<body class="bg-surface-container-lowest text-on-surface antialiased min-h-screen flex items-center justify-center overflow-hidden h-screen">
<!-- Loading Container -->
<main class="flex flex-col items-center justify-center w-full max-w-sm px-margin-desktop gap-stack-lg animate-fade-in-up">
<!-- Brand Identity -->
<div class="flex flex-col items-center"><a class="text-2xl font-bold text-on-surface tracking-tight flex items-center gap-1" href="#">
                    KostHub<span class="text-primary-container text-3xl leading-none">.</span>
</a></div>
<!-- Progress Indicator -->
<div class="relative w-12 h-12 flex items-center justify-center">
<svg class="animate-spin-slow w-full h-full text-primary" viewBox="25 25 50 50">
<circle class="animate-dash stroke-current" cx="50" cy="50" fill="none" r="20" stroke-linecap="round" stroke-width="3"></circle>
</svg>
<div class="absolute inset-0 rounded-full border border-surface-variant opacity-20"></div>
</div>
<!-- Status Messaging -->
<div class="h-8 flex items-center justify-center relative w-full overflow-hidden">
<p class="font-body-md text-body-md text-on-surface-variant animate-text-pulse absolute transition-opacity duration-500 text-center w-full" id="loading-text" style="opacity: 1;">Mempersiapkan dashboard Anda...</p>
</div>
</main>
<!-- Micro-interaction JS for sequence simulation -->
<script>
        document.addEventListener('DOMContentLoaded', () => {
            const loadingText = document.getElementById('loading-text');
            const messages = [
                "Mempersiapkan dashboard Anda...",
                "Mengambil data lokasi...",
                "Menyiapkan preferensi..."
            ];
            let currentIndex = 0;

            setInterval(() => {
                loadingText.style.opacity = '0';
                
                setTimeout(() => {
                    currentIndex = (currentIndex + 1) % messages.length;
                    loadingText.textContent = messages[currentIndex];
                    loadingText.style.opacity = '1';
                }, 500); // Wait for fade out to complete

            }, 3500); // Change message every 3.5 seconds
        });
    </script>
</body></html>