import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './LandingPage.css';

const LandingPage = () => {
    const navigate = useNavigate();

    // Intersection Observer for scroll animations
    useEffect(() => {
        const observerOptions = {
            threshold: 0.1,
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('opacity-100', 'translate-y-0');
                    entry.target.classList.remove('opacity-0', 'translate-y-8');
                }
            });
        }, observerOptions);

        const animatedElements = document.querySelectorAll('.animate-on-scroll');
        animatedElements.forEach((el) => {
            el.classList.add('transition-all', 'duration-700', 'opacity-0', 'translate-y-8');
            observer.observe(el);
        });

        return () => {
            animatedElements.forEach((el) => observer.unobserve(el));
        };
    }, []);

    return (
        <div className="landing-page selection:bg-primary-container selection:text-white bg-[#ffffff] min-h-screen font-sans text-[#0b1c30]">
            {/* TopNavBar */}
            <nav className="sticky top-0 z-50 bg-white border-b border-[#c3c6d7] w-full">
                <div className="flex items-center h-16 w-full px-4 md:px-8 max-w-7xl mx-auto">
                    {/* Brand Logo */}
                    <div className="flex-1 flex justify-start">
                        <Link to="/" className="text-2xl font-bold text-[#0b1c30] tracking-tight flex items-baseline">
                            KostHub<span className="text-[#2563EB] text-3xl leading-none">.</span>
                        </Link>
                    </div>

                    {/* Navigation Links (Center) */}
                    <ul className="hidden md:flex justify-center items-center gap-8 h-full">
                        <li className="h-full flex items-center">
                            <a className="text-[#004ac6] font-bold border-b-2 border-[#004ac6] h-full flex items-center px-2 cursor-pointer active:scale-95" href="#">Home</a>
                        </li>
                        <li className="h-full flex items-center">
                            <a className="text-[#434655] hover:text-[#004ac6] transition-colors duration-200 h-full flex items-center px-2 cursor-pointer active:scale-95" href="#">Gas &amp; Galon</a>
                        </li>
                        <li className="h-full flex items-center">
                            <a className="text-[#434655] hover:text-[#004ac6] transition-colors duration-200 h-full flex items-center px-2 cursor-pointer active:scale-95" href="#">Laundry Express</a>
                        </li>
                        <li className="h-full flex items-center">
                            <a className="text-[#434655] hover:text-[#004ac6] transition-colors duration-200 h-full flex items-center px-2 cursor-pointer active:scale-95" href="#">Daily Cleaning</a>
                        </li>
                        <li className="h-full flex items-center">
                            <a className="text-[#434655] hover:text-[#004ac6] transition-colors duration-200 h-full flex items-center px-2 cursor-pointer active:scale-95" href="#">Tentang Kami</a>
                        </li>
                    </ul>

                    {/* Trailing Action */}
                    <div className="flex-1 flex items-center justify-end">
                        <button 
                            onClick={() => navigate('/login')}
                            className="bg-[#2563EB] text-white hover:brightness-90 transition-all duration-200 px-6 py-2.5 rounded text-sm font-medium cursor-pointer active:scale-95"
                        >
                            Masuk / Daftar
                        </button>
                    </div>
                </div>
            </nav>

            <main className="min-h-screen">
                {/* Hero Section */}
                <section className="relative min-h-[819px] flex flex-col items-center justify-center text-center px-4 md:px-8 py-12 bg-[#f8f9ff]">
                    <div className="max-w-4xl mx-auto space-y-6 z-10 animate-on-scroll">
                        <span className="inline-block px-4 py-1.5 rounded-full bg-[#e5eeff] text-[#004ac6] text-xs font-medium border border-[#2563eb]/20">
                            Trusted Marketplace di Solo
                        </span>
                        <h1 className="text-4xl md:text-[64px] font-bold text-[#0b1c30] max-w-3xl mx-auto leading-tight tracking-tight">
                            Layanan Kos Instan, Aman &amp; Anti-Cemas
                        </h1>
                        <p className="text-lg text-[#5c5f61] max-w-2xl mx-auto">
                            Temukan layanan harian terbaik untuk kosmu di Solo dengan jaminan keamanan 100%.
                        </p>

                        {/* Search Bar Container */}
                        <div className="w-full max-w-2xl mx-auto mt-12 p-2 bg-white border border-[#c3c6d7] shadow-lg md:rounded-lg rounded-xl flex flex-col md:flex-row gap-2 transition-all duration-300 focus-within:ring-2 focus-within:ring-[#2563eb]/20 focus-within:border-[#2563eb]">
                            <div className="flex-1 flex items-center px-4 gap-3">
                                <span className="material-symbols-outlined text-[#5c5f61]">location_on</span>
                                <input 
                                    className="w-full border-none focus:ring-0 text-[#0b1c30] py-4 outline-none" 
                                    placeholder="Masukkan alamat kos atau apartemenmu di Solo..." 
                                    type="text" 
                                />
                            </div>
                            <button className="bg-[#2563EB] text-white px-8 py-4 rounded text-lg font-semibold whitespace-nowrap hover:brightness-90 transition-all">
                                Cari Layanan
                            </button>
                        </div>
                    </div>

                    {/* Abstract Background Element */}
                    <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden">
                        <div className="absolute top-1/4 -right-20 w-96 h-96 bg-[#004ac6]/10 rounded-full blur-[100px]"></div>
                        <div class="absolute bottom-1/4 -left-20 w-80 h-80 bg-[#d3e4fe] rounded-full blur-[80px]"></div>
                    </div>
                </section>

                {/* Interactive Escrow Section (The Workflow) */}
                <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto border-y border-[#c3c6d7]/20">
                    <div className="text-center mb-12 animate-on-scroll">
                        <h2 className="text-3xl font-semibold text-[#0b1c30] tracking-tight">Bagaimana KostHub Melindungimu?</h2>
                        <div className="w-20 h-1 bg-[#004ac6] mx-auto mt-4 rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative animate-on-scroll">
                        {/* Connector Line (Desktop Only) */}
                        <div className="hidden md:block absolute top-12 left-[15%] right-[15%] h-[1px] bg-[#c3c6d7] z-0"></div>
                        
                        {/* Step 1 */}
                        <div className="relative z-10 flex flex-col items-center text-center space-y-3 group">
                            <div className="w-20 h-20 bg-white border border-[#c3c6d7] flex items-center justify-center rounded-full group-hover:border-[#004ac6] transition-colors">
                                <span className="material-symbols-outlined text-[#004ac6] text-[32px]">account_balance_wallet</span>
                            </div>
                            <h3 className="text-lg font-semibold text-[#0b1c30]">Bayar Lunas 100% di Depan</h3>
                            <p className="text-sm text-[#5c5f61]">Dana Anda aman ditahan sementara oleh platform KostHub.</p>
                        </div>

                        {/* Step 2 */}
                        <div className="relative z-10 flex flex-col items-center text-center space-y-3 group">
                            <div className="w-20 h-20 bg-white border border-[#c3c6d7] flex items-center justify-center rounded-full group-hover:border-[#004ac6] transition-colors">
                                <span className="material-symbols-outlined text-[#004ac6] text-[32px]">moped</span>
                            </div>
                            <h3 className="text-lg font-semibold text-[#0b1c30]">Mitra Mengerjakan Pesanan</h3>
                            <p className="text-sm text-[#5c5f61]">Kurir atau staff cleaner datang menyelesaikan kebutuhan kos Anda.</p>
                        </div>

                        {/* Step 3 */}
                        <div className="relative z-10 flex flex-col items-center text-center space-y-3 group">
                            <div className="w-20 h-20 bg-white border border-[#c3c6d7] flex items-center justify-center rounded-full group-hover:border-[#004ac6] transition-colors">
                                <span className="material-symbols-outlined text-[#004ac6] text-[32px]">verified</span>
                            </div>
                            <h3 className="text-lg font-semibold text-[#0b1c30]">Konfirmasi &amp; Dana Cair</h3>
                            <p className="text-sm text-[#5c5f61]">Uang baru diteruskan ke rekening mitra setelah Anda konfirmasi semuanya beres.</p>
                        </div>
                    </div>
                </section>

                {/* Service Cards Section (Bento Inspired Grid) */}
                <section className="py-12 px-4 md:px-8 max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-12 animate-on-scroll">
                        <div>
                            <h2 className="text-3xl font-semibold text-[#0b1c30] tracking-tight">Pilih Layanan KostHub</h2>
                            <p className="text-base text-[#5c5f61] mt-2">Dapatkan layanan esensial langsung ke pintu kamarmu.</p>
                        </div>
                        <a className="hidden md:flex items-center gap-2 text-[#004ac6] text-sm font-medium group" href="#">
                            Lihat semua layanan <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">arrow_forward</span>
                        </a>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-on-scroll">
                        {/* Gas & Galon Card */}
                        <div className="group relative overflow-hidden border border-[#c3c6d7] bg-white p-6 h-[400px] flex flex-col justify-end card-hover transition-all duration-300 rounded-lg">
                            <img 
                                alt="Layanan Gas dan Galon" 
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDn68W3rFM4GudQFBrdGbGAcbh3fY2Hl7ApVpf5dQ3YCw5INPj172n_KRsTcKEJkJQ2XcXrpfQ1yqIRx3hrYqxpX8RsXzWuV9VsJcqYhjoJWY5sERqHASD4DSfwqn9mRTykLTx-aimRG6SbXzPT2RuSClhdGf7FljkGwz-bh4s0Jtz1GmV39Hi02xFIAnyRAuENhZQXkiqcS7uBGrrBYUnXOeX-6Y0Q7kamYKrBGcosh99_1bnXXJNuCnlHA9GaLhxbIAjEiwYY4V0" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c30]/80 via-transparent to-transparent"></div>
                            <div className="relative z-10 text-white space-y-1">
                                <span className="inline-block px-3 py-1 bg-[#004ac6] text-white text-[10px] font-bold tracking-widest uppercase mb-2 rounded-sm">Terpopuler</span>
                                <h3 className="text-2xl font-semibold">Gas &amp; Galon</h3>
                                <p className="text-base opacity-90 text-white">Antar cepat &amp; gratis jemput</p>
                                <button className="mt-4 w-full py-3 border border-white/30 bg-white/10 glass-effect text-white text-sm font-medium hover:bg-white hover:text-[#004ac6] transition-all rounded">Pesan Sekarang</button>
                            </div>
                        </div>

                        {/* Laundry Express Card */}
                        <div className="group relative overflow-hidden border border-[#c3c6d7] bg-white p-6 h-[400px] flex flex-col justify-end card-hover transition-all duration-300 rounded-lg">
                            <img 
                                alt="Laundry Express" 
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuCLoMsMeQDJox5uHwi7g8W9LOMW0uI-_WBzencNuurllWzxLeyOKBxyUd3et-XUK27wMgmHR8JDyQ057CTdrU40vtsNbGwcAt8_GBiuMR_Clv_cE1zOiwv82VwfUYDaFITtplTOvrCvi5V_m9F4yY9N2iEaLClVFAnGSlocM9ay3pZvU67AH-fS2E-yIcingNhSLIXXiMOj7U56tCnplrEgjFSqkNkJ5FH4PbjiMGnrtBRsIYap0ZLagvUNCXlLQh-aD9SMIQbGlu8" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c30]/80 via-transparent to-transparent"></div>
                            <div className="relative z-10 text-white space-y-1">
                                <span className="inline-block px-3 py-1 bg-[#d3e4fe] text-[#004ac6] text-[10px] font-bold tracking-widest uppercase mb-2 rounded-sm">Kilat</span>
                                <h3 className="text-2xl font-semibold">Laundry Express</h3>
                                <p className="text-base opacity-90 text-white">Cuci &amp; lipat mulai 24 jam</p>
                                <button className="mt-4 w-full py-3 border border-white/30 bg-white/10 glass-effect text-white text-sm font-medium hover:bg-white hover:text-[#004ac6] transition-all rounded">Pesan Sekarang</button>
                            </div>
                        </div>

                        {/* Daily Cleaning Card */}
                        <div className="group relative overflow-hidden border border-[#c3c6d7] bg-white p-6 h-[400px] flex flex-col justify-end card-hover transition-all duration-300 rounded-lg">
                            <img 
                                alt="Daily Cleaning" 
                                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90" 
                                src="https://lh3.googleusercontent.com/aida-public/AB6AXuBahTHHcsbnLrH2d1sYgl2LFaA_tYi3UBqcn0fMpk2ktaL-UTY9JikZaMr_UmYexLZKQYWGAYEq6XmBHUevi1G4Yra1sLbnyeQtPYh9464mRPv0OSOrdvMvKCe9kHzBTNItQVoFZ3CfWmOs56h3M97i-pqEgmBco2D-pE51ezyAN297xjp07ulfd2hFoCxAmYFY7PfmcvfwUmZqb_qfHFANXaz4as-TdnbVU4k0xz6vcIXSdxbDU7Rgfh0mhVJnsIVQH-aiYR7JkmU" 
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1c30]/80 via-transparent to-transparent"></div>
                            <div className="relative z-10 text-white space-y-1">
                                <span className="inline-block px-3 py-1 bg-[#ffdbcd] text-[#943700] text-[10px] font-bold tracking-widest uppercase mb-2 rounded-sm">Higienis</span>
                                <h3 className="text-2xl font-semibold">Daily Cleaning</h3>
                                <p className="text-base opacity-90 text-white">Bersih-bersih kamar kos</p>
                                <button className="mt-4 w-full py-3 border border-white/30 bg-white/10 glass-effect text-white text-sm font-medium hover:bg-white hover:text-[#004ac6] transition-all rounded">Pesan Sekarang</button>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Trust Section */}
                <section className="py-12 bg-[#eff4ff] mt-12 animate-on-scroll">
                    <div className="px-4 md:px-8 max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="max-w-xl">
                            <h2 className="text-3xl font-semibold text-[#0b1c30] mb-4 tracking-tight">Aman. Transparan. Tanpa Khawatir.</h2>
                            <p className="text-base text-[#5c5f61]">Kami mengerti mahasiswa butuh kepastian. KostHub hadir sebagai penengah terpercaya antara kamu dan mitra penyedia layanan. Setiap transaksi dilindungi sistem escrow yang memastikan layanan dikerjakan sesuai standar sebelum pembayaran dilepaskan.</p>
                        </div>
                        <div className="flex gap-8 md:gap-12">
                            <div className="text-center">
                                <div className="text-[40px] font-bold text-[#004ac6] leading-none mb-1 tracking-tight">1.2k+</div>
                                <div className="text-sm font-medium text-[#5c5f61]">Mahasiswa Aktif</div>
                            </div>
                            <div className="text-center">
                                <div className="text-[40px] font-bold text-[#004ac6] leading-none mb-1 tracking-tight">100%</div>
                                <div className="text-sm font-medium text-[#5c5f61]">Garansi Aman</div>
                            </div>
                            <div className="text-center">
                                <div className="text-[40px] font-bold text-[#004ac6] leading-none mb-1 tracking-tight">50+</div>
                                <div className="text-sm font-medium text-[#5c5f61]">Mitra Terverifikasi</div>
                            </div>
                        </div>
                    </div>
                </section>
            </main>

            {/* Footer */}
            <footer className="bg-white border-t border-[#e0e3e5] mt-auto">
                <div className="flex flex-col md:flex-row justify-between items-center py-6 px-4 md:px-8 max-w-7xl mx-auto w-full">
                    <div className="flex flex-col items-center md:items-start mb-4 md:mb-0">
                        <Link to="/" className="text-lg font-bold text-[#0b1c30]">
                            KostHub<span className="text-[#2563eb] text-2xl leading-none">.</span>
                        </Link>
                        <p className="text-xs font-medium text-[#5c5f61] mt-1">Solusi praktis anak kos di Solo.</p>
                    </div>
                    <div className="flex gap-6 mb-4 md:mb-0">
                        <a className="text-sm font-medium text-[#5c5f61] hover:text-[#004ac6] transition-colors" href="#">Syarat &amp; Ketentuan</a>
                        <a className="text-sm font-medium text-[#5c5f61] hover:text-[#004ac6] transition-colors" href="#">Kebijakan Privasi</a>
                        <a className="text-sm font-medium text-[#5c5f61] hover:text-[#004ac6] transition-colors" href="#">Hubungi Kami</a>
                    </div>
                    <p className="text-sm font-medium text-[#5c5f61]">
                        © 2024 KostHub. All rights reserved.
                    </p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
