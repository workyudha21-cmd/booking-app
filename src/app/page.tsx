import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Header */}
      <header className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">B</span>
              </div>
              <span className="font-semibold text-xl">BookingApp</span>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/pricing" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Pricing
              </Link>
              <Link href="/features" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Features
              </Link>
              <Link href="/login" className="text-gray-600 hover:text-gray-900 text-sm font-medium">
                Login
              </Link>
              <Link href="/register" className="bg-black text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition">
                Get Started
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl font-bold tracking-tight text-gray-900 mb-6">
              Kelola Booking Bisnis Anda dengan Mudah
            </h1>
            <p className="text-xl text-gray-600 mb-10">
              Platform booking online untuk salon, klinik, bengkel, dan bisnis lainnya. 
              Jadwalkan appointment, kelola pelanggan, dan terima pembayaran dalam satu tempat.
            </p>
            <div className="flex justify-center gap-4">
              <Link href="/register" className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition">
                Mulai Gratis
              </Link>
              <Link href="/features" className="border border-gray-300 px-8 py-3 rounded-lg font-medium hover:bg-gray-50 transition">
                Pelajari Lebih Lanjut
              </Link>
            </div>
          </div>
        </div>

        {/* Features */}
        <div className="bg-gray-50 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-center mb-12">Kenapa BookingApp?</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Jadwal Fleksibel</h3>
                <p className="text-gray-600">Atur jam kerja, buffer time, dan batasan booking sesuai kebutuhan bisnis Anda.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Manajemen Pelanggan</h3>
                <p className="text-gray-600">Simpan data pelanggan, riwayat booking, dan statistik dalam satu dashboard.</p>
              </div>
              <div className="bg-white p-6 rounded-xl shadow-sm">
                <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-lg mb-2">Pembayaran Mudah</h3>
                <p className="text-gray-600">Terima pembayaran tunai, transfer, e-wallet, dan kartu kredit/debit.</p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="py-24">
          <div className="max-w-3xl mx-auto text-center px-4">
            <h2 className="text-3xl font-bold mb-4">Siap Memulai?</h2>
            <p className="text-gray-600 mb-8">Daftar sekarang dan dapatkan akses gratis selama 14 hari.</p>
            <Link href="/register" className="bg-black text-white px-8 py-3 rounded-lg font-medium hover:bg-gray-800 transition">
              Daftar Sekarang
            </Link>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-500 text-sm">
          © 2026 BookingApp. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
