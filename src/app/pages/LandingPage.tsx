import { Link, useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, Eye, Zap, ArrowRight, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';
import { motion } from 'motion/react';
import { useAlgorithm } from '../context/AlgorithmContext';

export function LandingPage() {
  const navigate = useNavigate();
  const { setAlgorithm } = useAlgorithm();

  const handleDESClick = () => {
    setAlgorithm('DES');
    navigate('/uji-coba');
  };

  const handleChaCha20Click = () => {
    setAlgorithm('ChaCha20');
    navigate('/uji-coba');
  };
  return (
    <div className="w-full relative overflow-hidden bg-[#F8FAFC]">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/30 pointer-events-none" />
      <div className="absolute top-0 right-[10%] w-[300px] h-[300px] bg-blue-400/10 blur-[100px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-[8%] w-[250px] h-[250px] bg-cyan-300/10 blur-[90px] rounded-full pointer-events-none" />

      {/* Grid Pattern */}
      <div
        className="absolute inset-0 opacity-[0.025] pointer-events-none"
        style={{
          backgroundImage: `
            linear-gradient(to right, #2563EB 1px, transparent 1px),
            linear-gradient(to bottom, #2563EB 1px, transparent 1px)
          `,
          backgroundSize: '60px 60px',
        }}
      />

      {/* Hero Section */}
      <section className="relative px-4 md:px-8 lg:px-16 xl:px-[160px] pt-12 md:pt-16 lg:pt-[72px] pb-10 md:pb-12 lg:pb-[56px] text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-[#EFF6FF] to-[#ECFEFF] border-[0.5px] border-[#BFDBFE] mb-6 shadow-sm">
            <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
            <span className="text-[12px] font-medium text-[#1D4ED8]" style={{ letterSpacing: '0.05em' }}>
              Sistem Enkripsi Akademik
            </span>
            <Sparkles className="w-3.5 h-3.5 text-[#06B6D4]" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[28px] md:text-[36px] lg:text-[46px] font-semibold bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#2563EB] bg-clip-text text-transparent max-w-[620px] mx-auto mb-4 px-4"
          style={{ lineHeight: 1.2 }}
        >
          Pelajari enkripsi modern secara interaktif
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[13px] md:text-[15px] text-[#64748B] max-w-[480px] mx-auto px-4"
          style={{ lineHeight: 1.7 }}
        >
          Eksplorasi dua algoritma enkripsi — DES dan ChaCha20 — dengan visualisasi langkah demi langkah yang mudah dipahami
        </motion.p>
      </section>

      {/* Algorithm Picker */}
      <section className="relative px-4 md:px-8 lg:px-16 xl:px-[160px] pb-12 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5">
          {/* DES Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="group relative bg-white/80 backdrop-blur-md border-[0.5px] border-[#E2E8F0] rounded-[20px] p-7 hover:border-[#BFDBFE] hover:shadow-[0_20px_60px_rgba(37,99,235,0.1)] transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#3B82F6] to-[#2563EB] flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                <Lock className="w-6 h-6 text-white" />
              </div>
              <div className="px-2.5 py-1 rounded-[20px] bg-[#F1F5F9] border-[0.5px] border-[#E2E8F0]">
                <span className="text-[11px] font-medium text-[#64748B]">Klasik</span>
              </div>
            </div>

            <h3 className="text-[18px] font-semibold text-[#0F172A] mb-1">DES</h3>
            <p className="text-[12px] font-medium text-[#2563EB] mb-3">Data Encryption Standard</p>
            <p className="text-[13px] text-[#64748B] mb-5" style={{ lineHeight: 1.7 }}>
              Algoritma enkripsi simetris berbasis Feistel Network dengan 16 ronde. Standar enkripsi yang digunakan luas sejak 1977.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="bg-[#F8FAFC] border-[0.5px] border-[#E2E8F0] rounded-[8px] p-2 text-center">
                <div className="text-[13px] font-semibold text-[#1D4ED8]">64-bit</div>
                <div className="text-[10px] text-[#94A3B8]">Ukuran blok</div>
              </div>
              <div className="bg-[#F8FAFC] border-[0.5px] border-[#E2E8F0] rounded-[8px] p-2 text-center">
                <div className="text-[13px] font-semibold text-[#1D4ED8]">56-bit</div>
                <div className="text-[10px] text-[#94A3B8]">Kunci efektif</div>
              </div>
              <div className="bg-[#F8FAFC] border-[0.5px] border-[#E2E8F0] rounded-[8px] p-2 text-center">
                <div className="text-[13px] font-semibold text-[#1D4ED8]">16×</div>
                <div className="text-[10px] text-[#94A3B8]">Ronde</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleDESClick}
                className="flex-1 h-10 rounded-[10px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white text-[13px] font-medium flex items-center justify-center gap-2 shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
              >
                Mulai uji coba
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <Link
                to="/visualisasi"
                className="h-10 px-4 rounded-[10px] border-[0.5px] border-[#E2E8F0] bg-transparent text-[#64748B] text-[13px] flex items-center gap-2 hover:bg-[#F8FAFC] transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                Visualisasi
              </Link>
            </div>
          </motion.div>

          {/* ChaCha20 Card */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="group relative bg-white/80 backdrop-blur-md border-[0.5px] border-[#E2E8F0] rounded-[20px] p-7 hover:border-[#C4B5FD] hover:shadow-[0_20px_60px_rgba(124,58,237,0.1)] transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="px-2.5 py-1 rounded-[20px] bg-[#F3E8FF] border-[0.5px] border-[#C4B5FD]">
                <span className="text-[11px] font-medium text-[#7C3AED]">Modern</span>
              </div>
            </div>

            <h3 className="text-[18px] font-semibold text-[#0F172A] mb-1">ChaCha20</h3>
            <p className="text-[12px] font-medium text-[#7C3AED] mb-3">Stream Cipher berbasis ARX</p>
            <p className="text-[13px] text-[#64748B] mb-5" style={{ lineHeight: 1.7 }}>
              Algoritma stream cipher modern yang sangat cepat tanpa hardware khusus. Digunakan di TLS 1.3, WireGuard, dan QUIC.
            </p>

            <div className="grid grid-cols-3 gap-2 mb-6">
              <div className="bg-[#F8FAFC] border-[0.5px] border-[#E2E8F0] rounded-[8px] p-2 text-center">
                <div className="text-[13px] font-semibold text-[#7C3AED]">256-bit</div>
                <div className="text-[10px] text-[#94A3B8]">Ukuran kunci</div>
              </div>
              <div className="bg-[#F8FAFC] border-[0.5px] border-[#E2E8F0] rounded-[8px] p-2 text-center">
                <div className="text-[13px] font-semibold text-[#7C3AED]">96-bit</div>
                <div className="text-[10px] text-[#94A3B8]">Nonce</div>
              </div>
              <div className="bg-[#F8FAFC] border-[0.5px] border-[#E2E8F0] rounded-[8px] p-2 text-center">
                <div className="text-[13px] font-semibold text-[#7C3AED]">20×</div>
                <div className="text-[10px] text-[#94A3B8]">Putaran</div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleChaCha20Click}
                className="flex-1 h-10 rounded-[10px] bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white text-[13px] font-medium flex items-center justify-center gap-2 shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all"
              >
                Mulai uji coba
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              <Link
                to="/visualisasi"
                className="h-10 px-4 rounded-[10px] border-[0.5px] border-[#E2E8F0] bg-transparent text-[#64748B] text-[13px] flex items-center gap-2 hover:bg-[#F8FAFC] transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                Visualisasi
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Comparison Table */}
      <section className="relative px-4 md:px-8 lg:px-16 xl:px-[160px] pb-12 md:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <h2 className="text-[15px] font-semibold text-[#0F172A] mb-4">Perbandingan algoritma</h2>
          <div className="bg-white/70 backdrop-blur-sm border-[0.5px] border-[#E2E8F0] rounded-[16px] overflow-hidden shadow-sm">
            <div className="grid grid-cols-3 h-10 md:h-11 border-b-[0.5px] border-[#E2E8F0]">
              <div className="flex items-center px-3 md:px-6 text-[11px] md:text-[12px] font-medium text-[#94A3B8]">Aspek</div>
              <div className="flex items-center px-3 md:px-6 text-[11px] md:text-[12px] font-medium text-[#2563EB] border-l-[0.5px] border-[#E2E8F0]">DES</div>
              <div className="flex items-center px-3 md:px-6 text-[11px] md:text-[12px] font-medium text-[#7C3AED] border-l-[0.5px] border-[#E2E8F0]">ChaCha20</div>
            </div>
            {[
              ['Tipe', 'Block cipher', 'Stream cipher'],
              ['Panjang kunci', '56-bit efektif', '256-bit'],
              ['Struktur inti', 'Feistel Network', 'ARX (Add-Rotate-XOR)'],
              ['Kecepatan (software)', 'Sedang', 'Sangat cepat'],
              ['Keamanan saat ini', 'Dianggap lemah', 'Aman & aktif digunakan'],
              ['Digunakan di', 'Studi kriptografi', 'TLS 1.3 · WireGuard · QUIC'],
            ].map((row, i, arr) => (
              <div
                key={i}
                className={`grid grid-cols-3 min-h-10 md:h-11 ${i < arr.length - 1 ? 'border-b-[0.5px] border-[#F1F5F9]' : ''}`}
              >
                <div className="flex items-center px-3 md:px-6 text-[11px] md:text-[13px] text-[#64748B] py-2">{row[0]}</div>
                <div className="flex items-center px-3 md:px-6 text-[11px] md:text-[13px] text-[#0F172A] border-l-[0.5px] border-[#F1F5F9] py-2">{row[1]}</div>
                <div className="flex items-center px-3 md:px-6 text-[11px] md:text-[13px] text-[#0F172A] border-l-[0.5px] border-[#F1F5F9] py-2">{row[2]}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* DES Explainer */}
      <section className="relative px-4 md:px-8 lg:px-16 xl:px-[160px] pb-12 md:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.6 }}
          className="bg-gradient-to-br from-[#EFF6FF] to-[#F0FDF4] border-[0.5px] border-[#BFDBFE]/50 rounded-[16px] md:rounded-[20px] p-5 md:p-8"
        >
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#2563EB] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-blue-500/30 flex-shrink-0">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[16px] font-semibold text-[#0F172A]">Apa itu DES?</h3>
                <div className="px-2.5 py-0.5 rounded-[20px] bg-white/70 border-[0.5px] border-[#BFDBFE]">
                  <span className="text-[11px] font-medium text-[#2563EB]">Standar federal sejak 1977</span>
                </div>
              </div>

              <p className="text-[13px] text-[#1E3A8A] mb-5" style={{ lineHeight: 1.75 }}>
                Data Encryption Standard (DES) adalah algoritma enkripsi simetris yang dikembangkan oleh IBM pada tahun 1970-an dan diadopsi sebagai standar federal oleh NIST. DES menggunakan kunci 56-bit untuk mengenkripsi data dalam blok 64-bit melalui 16 ronde transformasi menggunakan struktur Feistel Network.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                {[
                  { icon: CheckCircle2, color: '#2563EB', title: 'Struktur Feistel', desc: 'Menggunakan Feistel Network yang terstandar dan mudah dipahami untuk pembelajaran kriptografi' },
                  { icon: CheckCircle2, color: '#15803D', title: 'Mudah dipelajari', desc: 'Cocok untuk memahami konsep dasar enkripsi: permutasi, substitusi, S-box, dan XOR operation' },
                  { icon: AlertCircle, color: '#DC2626', title: 'Kunci terlalu pendek', desc: '56-bit sudah tidak aman di era modern — bisa di-brute force dengan hardware khusus dalam waktu singkat' },
                  { icon: AlertCircle, color: '#EA580C', title: 'Hanya untuk edukasi', desc: 'Sudah digantikan oleh AES sejak 2001. Jangan gunakan untuk data sensitif di produksi' },
                ].map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <div key={i} className="bg-white/60 border-[0.5px] border-white/80 rounded-[12px] px-4 py-3.5 flex gap-3">
                      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: feature.color }} />
                      <div>
                        <div className="text-[12px] font-semibold text-[#0F172A] mb-0.5">{feature.title}</div>
                        <div className="text-[11px] text-[#64748B]" style={{ lineHeight: 1.6 }}>{feature.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleDESClick}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-[10px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white text-[13px] font-medium shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all"
              >
                <Lock className="w-3.5 h-3.5" />
                Coba enkripsi DES
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ChaCha20 Explainer */}
      <section className="relative px-4 md:px-8 lg:px-16 xl:px-[160px] pb-12 md:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="bg-gradient-to-br from-[#F3E8FF] to-[#EFF6FF] border-[0.5px] border-[#C4B5FD]/50 rounded-[16px] md:rounded-[20px] p-5 md:p-8"
        >
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#8B5CF6] to-[#7C3AED] flex items-center justify-center shadow-lg shadow-purple-500/30 flex-shrink-0">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-[16px] font-semibold text-[#0F172A]">Apa itu ChaCha20?</h3>
                <div className="px-2.5 py-0.5 rounded-[20px] bg-white/70 border-[0.5px] border-[#C4B5FD]">
                  <span className="text-[11px] font-medium text-[#7C3AED]">Dirancang oleh Daniel J. Bernstein, 2008</span>
                </div>
              </div>

              <p className="text-[13px] text-[#4C1D95] mb-5" style={{ lineHeight: 1.75 }}>
                ChaCha20 adalah stream cipher modern yang dirancang sebagai alternatif AES yang lebih cepat di perangkat tanpa akselerasi hardware. Namanya berasal dari "ChaCha" (versi awal dengan 8 putaran) dan "20" yang merujuk pada 20 putaran penuh yang dijalankan.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                {[
                  { icon: CheckCircle2, color: '#7C3AED', title: 'Tanpa S-box', desc: 'Tidak butuh tabel lookup seperti AES — hanya operasi matematika sederhana (ARX)' },
                  { icon: CheckCircle2, color: '#2563EB', title: 'Aman dari timing attack', desc: 'Operasi ARX berjalan dalam waktu konstan, tidak bocorkan informasi lewat waktu eksekusi' },
                  { icon: CheckCircle2, color: '#15803D', title: 'Paralel & cepat', desc: 'Setiap blok keystream bisa dihitung independen — cocok untuk multi-core dan enkripsi massal' },
                  { icon: CheckCircle2, color: '#C2410C', title: 'Dipakai di dunia nyata', desc: 'TLS 1.3, HTTPS di Chrome/Firefox, WireGuard VPN, dan protokol QUIC semuanya menggunakan ChaCha20' },
                ].map((feature, i) => {
                  const Icon = feature.icon;
                  return (
                    <div key={i} className="bg-white/60 border-[0.5px] border-white/80 rounded-[12px] px-4 py-3.5 flex gap-3">
                      <Icon className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: feature.color }} />
                      <div>
                        <div className="text-[12px] font-semibold text-[#0F172A] mb-0.5">{feature.title}</div>
                        <div className="text-[11px] text-[#64748B]" style={{ lineHeight: 1.6 }}>{feature.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={handleChaCha20Click}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-[10px] bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white text-[13px] font-medium shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all"
              >
                <Zap className="w-3.5 h-3.5" />
                Coba enkripsi ChaCha20
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

    </div>
  );
}
