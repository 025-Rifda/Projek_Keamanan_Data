import { Link } from 'react-router-dom';
import { UnlockKeyhole, Zap, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export function DekripsiSelectionPage() {
  return (
    <div className="w-full min-h-[calc(100vh-56px)] relative overflow-hidden bg-[#F8FAFC]">
      <section className="relative px-4 md:px-8 lg:px-16 xl:px-[160px] pt-12 md:pt-16 pb-10 md:pb-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-gradient-to-r from-[#FFFBEB] to-[#FEF3C7] border-[0.5px] border-[#FDE68A] mb-6 shadow-sm">
            <UnlockKeyhole className="w-4 h-4 text-[#D97706]" />
            <span className="text-[12px] font-medium text-[#92400E]" style={{ letterSpacing: '0.05em' }}>
              Mode Dekripsi
            </span>
          </div>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-[28px] md:text-[36px] lg:text-[42px] font-semibold bg-gradient-to-br from-[#0F172A] via-[#92400E] to-[#D97706] bg-clip-text text-transparent max-w-[620px] mx-auto mb-4 px-4"
          style={{ lineHeight: 1.2 }}
        >
          Dekripsi Ciphertext
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[13px] md:text-[15px] text-[#64748B] max-w-[540px] mx-auto px-4"
          style={{ lineHeight: 1.7 }}
        >
          Pilih algoritma yang digunakan saat mengenkripsi. Dekripsi tersedia sebagai uji input dan output tanpa visualisasi langkah internal.
        </motion.p>
      </section>

      <section className="relative px-4 md:px-8 lg:px-16 xl:px-[160px] pb-12 md:pb-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-5 max-w-[900px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="group relative bg-white/80 backdrop-blur-md border-[0.5px] border-[#E2E8F0] rounded-[20px] p-6 md:p-7 hover:border-[#FDE68A] hover:shadow-[0_20px_60px_rgba(217,119,6,0.1)] transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#D97706] to-[#B45309] flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                <UnlockKeyhole className="w-6 h-6 text-white" />
              </div>
              <div className="px-2.5 py-1 rounded-[20px] bg-[#F1F5F9] border-[0.5px] border-[#E2E8F0]">
                <span className="text-[11px] font-medium text-[#64748B]">Klasik</span>
              </div>
            </div>

            <h3 className="text-[18px] font-semibold text-[#0F172A] mb-1">DES Dekripsi</h3>
            <p className="text-[12px] font-medium text-[#D97706] mb-3">Data Encryption Standard</p>
            <p className="text-[13px] text-[#64748B] mb-5" style={{ lineHeight: 1.7 }}>
              Masukkan ciphertext DES dan key untuk mendapatkan plaintext secara langsung di halaman uji coba.
            </p>

            <div className="bg-[#FFFBEB] border-[0.5px] border-[#FDE68A] rounded-[10px] px-3 py-2.5 mb-5">
              <div className="text-[11px] text-[#92400E]" style={{ lineHeight: 1.6 }}>
                <span className="font-medium">Butuh:</span> Ciphertext (hex) + Key (8 karakter)
              </div>
            </div>

            <Link
              to="/uji-coba"
              state={{ mode: 'decrypt', algorithm: 'DES' }}
              className="flex items-center justify-center gap-2 w-full h-10 rounded-[10px] bg-gradient-to-r from-[#D97706] to-[#B45309] text-white text-[13px] font-medium shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all"
            >
              Uji dekripsi DES
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="group relative bg-white/80 backdrop-blur-md border-[0.5px] border-[#E2E8F0] rounded-[20px] p-6 md:p-7 hover:border-[#FDE68A] hover:shadow-[0_20px_60px_rgba(217,119,6,0.1)] transition-all duration-300 hover:-translate-y-1"
          >
            <div className="flex items-start justify-between mb-5">
              <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#D97706] to-[#B45309] flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div className="px-2.5 py-1 rounded-[20px] bg-[#F3E8FF] border-[0.5px] border-[#C4B5FD]">
                <span className="text-[11px] font-medium text-[#7C3AED]">Modern</span>
              </div>
            </div>

            <h3 className="text-[18px] font-semibold text-[#0F172A] mb-1">ChaCha20 Dekripsi</h3>
            <p className="text-[12px] font-medium text-[#7C3AED] mb-3">Stream Cipher Simetris</p>
            <p className="text-[13px] text-[#64748B] mb-5" style={{ lineHeight: 1.7 }}>
              Masukkan ciphertext ChaCha20, key, nonce, dan counter untuk mendapatkan plaintext langsung.
            </p>

            <div className="bg-[#EFF6FF] border-[0.5px] border-[#BFDBFE] rounded-[10px] px-3 py-2.5 mb-5">
              <div className="text-[11px] text-[#1D4ED8]" style={{ lineHeight: 1.6 }}>
                <span className="font-medium">Butuh:</span> Ciphertext (hex) + Key (32 karakter) + Nonce
              </div>
            </div>

            <Link
              to="/uji-coba"
              state={{ mode: 'decrypt', algorithm: 'ChaCha20' }}
              className="flex items-center justify-center gap-2 w-full h-10 rounded-[10px] bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white text-[13px] font-medium shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all"
            >
              Uji dekripsi ChaCha20
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </motion.div>
        </div>
      </section>

      <section className="relative px-4 md:px-8 lg:px-16 xl:px-[160px] pb-12 md:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="max-w-[900px] mx-auto bg-gradient-to-br from-[#FFFBEB] to-[#FEF3C7] border-[0.5px] border-[#FDE68A] rounded-[16px] p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#D97706] to-[#B45309] flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-[16px] font-semibold text-[#0F172A] mb-3">Tips Dekripsi</h3>
              <p className="text-[13px] text-[#92400E]" style={{ lineHeight: 1.7 }}>
                Pastikan key, nonce, dan counter sama seperti saat enkripsi. Ciphertext harus dalam format hexadecimal yang valid.
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
