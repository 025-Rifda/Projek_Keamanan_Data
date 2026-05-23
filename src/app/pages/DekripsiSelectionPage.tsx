import { Link } from 'react-router-dom';
import { UnlockKeyhole, Lock, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

export function DekripsiSelectionPage() {
  const { isDark } = useTheme();

  return (
    <div
      className="w-full min-h-[calc(100vh-56px)] relative overflow-hidden"
      style={{
        background: 'var(--bg-primary)',
        color: 'var(--text-primary)',
        transition: 'all 0.3s ease',
      }}
    >
      <section className="relative px-4 md:px-8 lg:px-16 xl:px-[160px] pt-12 md:pt-16 pb-10 md:pb-12 text-center">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
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
          className="text-[28px] md:text-[36px] lg:text-[42px] font-semibold bg-gradient-to-br bg-clip-text text-transparent max-w-[620px] mx-auto mb-4 px-4"
          style={{
            lineHeight: 1.2,
            backgroundImage: isDark
              ? 'linear-gradient(to bottom right, #F1F5F9, #FBBF24, #D97706)'
              : 'linear-gradient(to bottom right, #0F172A, #92400E, #D97706)',
          }}
        >
          Dekripsi Ciphertext DES
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-[13px] md:text-[15px] max-w-[540px] mx-auto px-4"
          style={{ lineHeight: 1.7, color: 'var(--text-secondary)', transition: 'all 0.3s ease' }}
        >
          Dekripsi tersedia untuk ciphertext DES sebagai uji input dan output tanpa visualisasi langkah internal.
        </motion.p>
      </section>

      <section className="relative px-4 md:px-8 lg:px-16 xl:px-[160px] pb-12 md:pb-16">
        <div className="max-w-[900px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="group relative backdrop-blur-md border-[0.5px] rounded-[20px] p-6 md:p-7 hover:border-[#FDE68A] hover:shadow-[0_20px_60px_rgba(217,119,6,0.1)] hover:-translate-y-1"
            style={{
              background: 'var(--bg-card)',
              borderColor: 'var(--border-color)',
              boxShadow: 'var(--card-shadow)',
              transition: 'all 0.3s ease',
            }}
          >
            <div className="flex items-start justify-between mb-5">
              <div className="w-14 h-14 rounded-[16px] bg-gradient-to-br from-[#D97706] to-[#B45309] flex items-center justify-center shadow-lg shadow-amber-500/30 group-hover:scale-110 transition-transform">
                <UnlockKeyhole className="w-6 h-6 text-white" />
              </div>
              <div
                className="px-2.5 py-1 rounded-[20px] border-[0.5px]"
                style={{
                  background: isDark ? '#1E293B' : '#F1F5F9',
                  borderColor: isDark ? '#334155' : '#E2E8F0',
                  transition: 'all 0.3s ease',
                }}
              >
                <span className="text-[11px] font-medium" style={{ color: isDark ? '#94A3B8' : '#64748B', transition: 'all 0.3s ease' }}>DES</span>
              </div>
            </div>

            <h3 className="text-[18px] font-semibold mb-1" style={{ color: 'var(--text-primary)', transition: 'all 0.3s ease' }}>DES Dekripsi</h3>
            <p className="text-[12px] font-medium text-[#D97706] mb-3">Data Encryption Standard</p>
            <p className="text-[13px] mb-5" style={{ lineHeight: 1.7, color: 'var(--text-secondary)', transition: 'all 0.3s ease' }}>
              Masukkan ciphertext DES dan key untuk mendapatkan plaintext secara langsung di halaman uji coba.
            </p>

            <div
              className="border-[0.5px] rounded-[10px] px-3 py-2.5 mb-5"
              style={{
                background: isDark ? '#1E293B' : '#FFFBEB',
                borderColor: isDark ? '#334155' : '#FDE68A',
                transition: 'all 0.3s ease',
              }}
            >
              <div className="text-[11px]" style={{ lineHeight: 1.6, color: isDark ? '#94A3B8' : '#92400E', transition: 'all 0.3s ease' }}>
                <span className="font-medium">Butuh:</span> Ciphertext hex 16 karakter + key 8 karakter
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
        </div>
      </section>

      <section className="relative px-4 md:px-8 lg:px-16 xl:px-[160px] pb-12 md:pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="max-w-[900px] mx-auto border-[0.5px] rounded-[16px] p-6 md:p-8"
          style={{
            background: isDark ? '#0F172A' : 'linear-gradient(to bottom right, #FFFBEB, #FEF3C7)',
            borderColor: isDark ? '#1E3A64' : '#FDE68A',
            boxShadow: isDark ? '0 2px 12px rgba(0,0,0,0.4)' : '0 2px 12px rgba(37,99,235,0.05)',
            transition: 'all 0.3s ease',
          }}
        >
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <div className="w-12 h-12 rounded-[14px] bg-gradient-to-br from-[#D97706] to-[#B45309] flex items-center justify-center shadow-lg shadow-amber-500/30 flex-shrink-0">
              <Lock className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-[16px] font-semibold mb-3" style={{ color: isDark ? '#F1F5F9' : '#0F172A', transition: 'all 0.3s ease' }}>Tips Dekripsi</h3>
              <p className="text-[13px]" style={{ lineHeight: 1.7, color: isDark ? '#94A3B8' : '#92400E', transition: 'all 0.3s ease' }}>
                Pastikan key sama seperti saat enkripsi. Ciphertext harus dalam format hexadecimal DES yang valid, tepat 16 karakter.
              </p>
            </div>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
