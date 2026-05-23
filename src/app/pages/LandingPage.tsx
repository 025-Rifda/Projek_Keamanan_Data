import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, Lock, ArrowRight, Sparkles,
  CheckCircle2, AlertCircle, Copy, Clock, Package,
  Rocket, Zap, BarChart3, BookOpen, Shield
} from 'lucide-react';
import { motion } from 'motion/react';
import { useAlgorithm } from '../context/AlgorithmContext';
import { useTheme } from '../context/ThemeContext';

export function LandingPage() {
  const navigate = useNavigate();
  const { setAlgorithm } = useAlgorithm();
  const { isDark } = useTheme();

  const theme = {
    pageBg: isDark ? '#0B1120' : '#F0F4FF',
    cardBg: isDark ? '#0F172A' : '#ffffff',
    inputBg: isDark ? '#1E293B' : '#F8FAFC',
    border: isDark ? '#1E3A64' : '#E2E8F0',
    borderSubtle: isDark ? '#334155' : '#F1F5F9',
    text: isDark ? '#F1F5F9' : '#0F172A',
    secondary: isDark ? '#94A3B8' : '#64748B',
    muted: isDark ? '#64748B' : '#94A3B8',
    shadow: isDark ? '0 2px 12px rgba(0,0,0,0.4)' : '0 2px 12px rgba(37,99,235,0.05)',
  };

  const cardStyle = {
    background: theme.cardBg,
    border: `1px solid ${theme.border}`,
    boxShadow: theme.shadow,
    transition: 'all 0.3s ease',
  };

  const inputStyle = {
    background: theme.inputBg,
    border: `1px solid ${theme.borderSubtle}`,
    color: theme.text,
    transition: 'all 0.3s ease',
  };

  const handleDESClick = () => {
    setAlgorithm('DES');
    navigate('/uji-coba');
  };

  const processSteps = [
    { label: 'IP',   sub: 'Initial\nPermutation', active: false },
    { label: 'R1',   sub: 'Fungsi F',             active: false },
    { label: 'R2',   sub: 'Fungsi F',             active: false },
    { label: '···',  sub: '',                      active: false, isDot: true },
    { label: 'R16',  sub: 'Fungsi F',             active: false },
    { label: 'FP',   sub: 'Final\nPermutation',   active: false },
  ];

  return (
    <div
      className="w-full relative overflow-hidden"
      style={{
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        background: theme.pageBg,
        color: theme.text,
        transition: 'all 0.3s ease',
      }}
    >

      {/* ── BACKGROUND ── */}
      <div className="absolute inset-0 pointer-events-none">
        {/* soft blue mesh */}
        <div className="absolute top-0 left-0 w-full h-[520px]"
          style={{
            background: isDark
              ? 'linear-gradient(160deg, #0B1120 0%, #0F172A 55%, #111C33 100%)'
              : 'linear-gradient(160deg, #EEF2FF 0%, #F8FAFF 50%, #EDF5FF 100%)',
            transition: 'all 0.3s ease',
          }} />
        {/* glow blobs */}
        <div className="absolute top-[-60px] right-[8%] w-[420px] h-[420px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(99,102,241,0.10) 0%, transparent 70%)' }} />
        <div className="absolute top-[180px] left-[5%] w-[300px] h-[300px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)' }} />
        {/* subtle grid */}
        <div className="absolute inset-0 opacity-[0.018]"
          style={{
            backgroundImage: 'linear-gradient(#3B82F6 1px,transparent 1px),linear-gradient(90deg,#3B82F6 1px,transparent 1px)',
            backgroundSize: '56px 56px',
          }} />
      </div>

      {/* ══════════════════════════════════
          HERO  (2-col)
      ══════════════════════════════════ */}
      <section className="relative px-6 md:px-12 lg:px-20 xl:px-28 pt-14 pb-10 max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">

          {/* LEFT */}
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55 }}>
            {/* badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-6 shadow-sm"
              style={{ background: isDark ? '#0F172A' : 'rgba(255,255,255,0.85)', border: `1px solid ${isDark ? '#1E3A64' : 'rgba(59,130,246,0.2)'}`, backdropFilter: 'blur(8px)', transition: 'all 0.3s ease' }}>
              <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
              <span className="text-[11px] font-semibold text-blue-700 tracking-wide">Sistem Enkripsi Akademik</span>
              <Sparkles className="w-3 h-3 text-cyan-500" />
            </div>

            <h1 className="font-extrabold leading-[1.12] mb-4"
              style={{
                fontSize: 'clamp(32px, 4vw, 52px)',
                fontFamily: "'Plus Jakarta Sans', sans-serif",
                color: 'var(--text-primary)',
                transition: 'all 0.3s ease',
              }}>
              Pelajari enkripsi DES<br />
              secara{' '}
              <span style={{
                background: 'linear-gradient(90deg, #2563EB, #06B6D4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}>interaktif</span>
            </h1>

            <p
              className="text-[15px] leading-[1.75] mb-8 max-w-[460px]"
              style={{ color: 'var(--text-secondary)', transition: 'all 0.3s ease' }}
            >
              Aplikasi ini difokuskan untuk DES, lengkap dengan enkripsi, dekripsi, dan visualisasi langkah demi langkah yang mudah dipahami.
            </p>

            <div className="flex gap-3 flex-wrap">
              <button onClick={handleDESClick}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-[14px] text-white transition-all hover:-translate-y-0.5 active:translate-y-0"
                style={{ background: 'linear-gradient(135deg, #2563EB 0%, #3B82F6 100%)', boxShadow: '0 6px 28px rgba(37,99,235,0.35)' }}>
                <Rocket className="w-4 h-4" /> Mulai Belajar DES
              </button>
            </div>
          </motion.div>

          {/* RIGHT — DES visual diagram */}
          <motion.div initial={{ opacity: 0, y: 22 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.55, delay: 0.15 }}
            className="hidden lg:flex justify-center items-center">
            <div className="relative w-full max-w-[480px]">
              {/* floating glow behind */}
              <div className="absolute inset-0 rounded-3xl blur-3xl opacity-30"
                style={{ background: 'linear-gradient(135deg, #BFDBFE, #A5F3FC)' }} />

              {/* main diagram card */}
              <div className="relative rounded-3xl p-6 shadow-2xl"
                style={{ ...cardStyle, backdropFilter: 'blur(20px)' }}>

                {/* flow row */}
                <div className="flex items-center gap-3 mb-5">
                  {/* Plaintext */}
                  <div className="flex-1 rounded-2xl p-3 text-center shadow-sm"
                    style={{ ...inputStyle }}>
                    <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: theme.muted }}>Plaintext</div>
                    <div className="text-[13px] font-bold font-mono" style={{ color: theme.text }}>HELLO DES</div>
                  </div>

                  {/* arrow */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-0.5 rounded" style={{ background: 'linear-gradient(90deg,#3B82F6,#06B6D4)' }} />
                    <ArrowRight className="w-4 h-4 text-blue-500 -mt-2" />
                  </div>

                  {/* DES core */}
                  <div className="w-24 h-24 rounded-2xl flex flex-col items-center justify-center shadow-xl flex-shrink-0"
                    style={{ background: 'linear-gradient(145deg, #3B82F6 0%, #2563EB 60%, #1D4ED8 100%)', boxShadow: '0 8px 32px rgba(37,99,235,0.45)' }}>
                    <span className="text-[26px] font-black text-white" style={{ fontFamily: "'Plus Jakarta Sans',sans-serif" }}>DES</span>
                    <span className="text-[8px] text-blue-200 tracking-widest">16 ROUNDS</span>
                  </div>

                  {/* arrow */}
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-8 h-0.5 rounded" style={{ background: 'linear-gradient(90deg,#3B82F6,#06B6D4)' }} />
                    <ArrowRight className="w-4 h-4 text-blue-500 -mt-2" />
                  </div>

                  {/* Ciphertext */}
                  <div className="flex-1 rounded-2xl p-3 text-center shadow-sm"
                    style={{ ...inputStyle }}>
                    <div className="text-[9px] uppercase tracking-widest mb-1" style={{ color: theme.muted }}>Ciphertext</div>
                    <div className="text-[11px] font-bold font-mono" style={{ color: '#2563EB' }}>8F 3A 7B<br />9C 2D 1E<br />6F 90</div>
                  </div>
                </div>

                {/* Key row */}
                <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl mb-4"
                  style={{ background: isDark ? '#1E293B' : 'linear-gradient(135deg, #EEF2FF, #F0FEFF)', border: `1px solid ${isDark ? '#334155' : 'rgba(99,102,241,0.15)'}`, transition: 'all 0.3s ease' }}>
                  <Lock className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <span className="text-[11px] font-semibold text-indigo-600">Key (56-bit):</span>
                  <span className="text-[11px] font-mono" style={{ color: theme.secondary }}>A1 3F 5D 7E 9C2B 4D</span>
                </div>

                {/* round dots */}
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="w-2 h-2 rounded-full flex-shrink-0 transition-all"
                      style={{
                        background: i < 8 ? 'linear-gradient(135deg,#3B82F6,#06B6D4)' : '#E2E8F0',
                        boxShadow: i < 8 ? '0 0 4px rgba(59,130,246,0.5)' : 'none',
                      }} />
                  ))}
                  <span className="ml-auto text-[9px] whitespace-nowrap" style={{ color: theme.muted }}>Ronde 8/16</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ══════════════════════════════════
          KENAPA BELAJAR DES
      ══════════════════════════════════ */}
      <section className="relative px-6 md:px-12 lg:px-20 xl:px-28 pb-12 max-w-[1280px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.25 }}>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-4 h-4 text-blue-500" />
            <h2 className="text-[15px] font-bold" style={{ color: theme.text, transition: 'all 0.3s ease' }}>Kenapa Belajar DES di CryptoDES?</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { emoji: '🛡️', bg: '#EFF6FF', iconBg: '#DBEAFE', color: '#1D4ED8', title: 'Fondasi Kriptografi',    desc: 'DES adalah dasar penting untuk memahami algoritma enkripsi modern.' },
              { emoji: '⚡', bg: '#F5F3FF', iconBg: '#EDE9FE', color: '#7C3AED', title: 'Mudah Dipelajari',       desc: 'Konsep jelas, langkah terstruktur, dan visualisasi interaktif.' },
              { emoji: '📊', bg: '#ECFDF5', iconBg: '#D1FAE5', color: '#059669', title: 'Visualisasi Interaktif', desc: 'Setiap proses enkripsi dan dekripsi divisualisasikan secara detail.' },
              { emoji: '🎓', bg: '#FFF7ED', iconBg: '#FED7AA', color: '#C2410C', title: 'Pembelajaran Mandiri',   desc: 'Belajar kapan saja, di mana saja, dengan pengalaman terbaik.' },
            ].map((f, i) => (
              <motion.div key={f.title}
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, delay: 0.3 + i * 0.08 }}
                className="rounded-2xl p-5 transition-all duration-300 cursor-default group hover:-translate-y-1 hover:shadow-lg"
                style={{ ...cardStyle, backdropFilter: 'blur(8px)' }}>
                <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl mb-4 transition-transform group-hover:scale-110"
                  style={{ background: f.iconBg }}>
                  {f.emoji}
                </div>
                <h3 className="text-[14px] font-bold mb-1.5" style={{ color: theme.text, transition: 'all 0.3s ease' }}>{f.title}</h3>
                <p className="text-[12px] leading-[1.65]" style={{ color: theme.secondary, transition: 'all 0.3s ease' }}>{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════
          SIMULASI ENKRIPSI DES
      ══════════════════════════════════ */}
      <section className="relative px-6 md:px-12 lg:px-20 xl:px-28 pb-14 max-w-[1280px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.4 }}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

            {/* ── CARD 1: INPUT ── */}
            <div className="rounded-2xl p-5 shadow-sm"
              style={{ ...cardStyle, backdropFilter: 'blur(8px)' }}>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#DBEAFE,#BAE6FD)' }}>
                  <Lock className="w-4 h-4 text-blue-600" />
                </div>
                <span className="font-bold text-[13px]" style={{ color: theme.text, transition: 'all 0.3s ease' }}>Simulasi Enkripsi DES</span>
              </div>

              <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: theme.muted, transition: 'all 0.3s ease' }}>Plaintext</label>
              <input readOnly value="HELLO DES"
                className="w-full rounded-xl px-3.5 py-2.5 text-[13px] font-mono mb-4 outline-none"
                style={{ ...inputStyle }} />

              <div className="grid grid-cols-2 gap-3 mb-4">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: theme.muted, transition: 'all 0.3s ease' }}>Key (56-bit)</label>
                  <input readOnly value="A1 3F 5D 7E 9C 2B 4D"
                    className="w-full rounded-xl px-3 py-2.5 text-[10px] font-mono outline-none"
                    style={{ ...inputStyle }} />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-widest block mb-1.5" style={{ color: theme.muted, transition: 'all 0.3s ease' }}>Mode</label>
                  <div className="flex items-center justify-between rounded-xl px-3 py-2.5 text-[13px] cursor-pointer"
                    style={{ ...inputStyle }}>
                    <span>ECB</span>
                    <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              <button onClick={handleDESClick}
                className="w-full py-2.5 rounded-xl text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg,#2563EB,#3B82F6)', boxShadow: '0 4px 20px rgba(37,99,235,0.35)' }}>
                <Lock className="w-3.5 h-3.5" /> Enkripsi Sekarang
              </button>
            </div>

            {/* ── CARD 2: PROSES ── */}
            <div className="rounded-2xl p-5 shadow-sm"
              style={{ ...cardStyle, backdropFilter: 'blur(8px)' }}>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#DBEAFE,#BAE6FD)' }}>
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <span className="font-bold text-[13px]" style={{ color: theme.text, transition: 'all 0.3s ease' }}>Proses Enkripsi DES (16 Ronde)</span>
              </div>

              {/* Step nodes */}
              <div className="flex items-center justify-between mb-1">
                {processSteps.map((step, i) => (
                  <div key={i} className="flex items-center">
                    {step.isDot ? (
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[14px] font-bold text-slate-400 flex-shrink-0"
                        style={{ background: theme.inputBg, border: `1px solid ${theme.borderSubtle}`, color: theme.secondary, transition: 'all 0.3s ease' }}>···</div>
                    ) : (
                      <div className="w-9 h-9 rounded-full flex items-center justify-center text-[11px] font-bold flex-shrink-0"
                        style={{
                          background: step.active ? 'linear-gradient(135deg,#2563EB,#3B82F6)' : theme.inputBg,
                          border: step.active ? '2px solid #93C5FD' : `1px solid ${theme.borderSubtle}`,
                          color: step.active ? '#fff' : theme.secondary,
                          boxShadow: step.active ? '0 0 14px rgba(59,130,246,0.4)' : 'none',
                          transition: 'all 0.3s ease',
                        }}>
                        {step.label}
                      </div>
                    )}
                    {i < processSteps.length - 1 && (
                      <div className="flex items-center mx-0.5 flex-shrink-0">
                        <svg width="14" height="8" viewBox="0 0 14 8" fill="none">
                          <path d="M0 4H11M11 4L8 1.5M11 4L8 6.5" stroke="#CBD5E1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Sub-labels */}
              <div className="flex items-start justify-between mb-5">
                {processSteps.map((step, i) => (
                  <div key={i} className="flex items-start">
                    <div className="w-9 text-center"
                      style={{ fontSize: '8px', color: theme.muted, lineHeight: 1.4, whiteSpace: 'pre-wrap', transition: 'all 0.3s ease' }}>
                      {step.sub}
                    </div>
                    {i < processSteps.length - 1 && <div className="w-[18px] flex-shrink-0" />}
                  </div>
                ))}
              </div>

              {/* Progress */}
              <div className="h-1.5 rounded-full mb-2 overflow-hidden" style={{ background: isDark ? '#1E293B' : '#EFF6FF', transition: 'all 0.3s ease' }}>
                <div className="h-full w-1/2 rounded-full"
                  style={{ background: 'linear-gradient(90deg,#3B82F6,#06B6D4)' }} />
              </div>
              <div className="flex justify-between text-[11px] mb-4" style={{ color: theme.muted, transition: 'all 0.3s ease' }}>
                <span>Ronde 8 dari 16</span><span>50%</span>
              </div>

              <div className="px-3 py-2.5 rounded-xl text-center text-[11px]"
                style={{ ...inputStyle, color: theme.secondary }}>
                ⚙ Setiap ronde melibatkan substitusi, permutasi, dan XOR.
              </div>
            </div>

            {/* ── CARD 3: HASIL ── */}
            <div className="rounded-2xl p-5 shadow-sm"
              style={{ ...cardStyle, backdropFilter: 'blur(8px)' }}>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-xl flex items-center justify-center"
                  style={{ background: 'linear-gradient(135deg,#D1FAE5,#A7F3D0)' }}>
                  <Shield className="w-4 h-4 text-emerald-600" />
                </div>
                <span className="font-bold text-[13px]" style={{ color: theme.text, transition: 'all 0.3s ease' }}>Hasil Enkripsi</span>
              </div>

              {/* Cipher output */}
              <div className="p-4 rounded-xl mb-4"
                style={{ background: isDark ? '#1E293B' : 'linear-gradient(135deg,#EFF6FF,#F0FEFF)', border: `1px solid ${isDark ? '#334155' : '#BFDBFE'}`, transition: 'all 0.3s ease' }}>
                <div className="text-[9px] font-bold uppercase tracking-widest mb-2" style={{ color: theme.muted, transition: 'all 0.3s ease' }}>Ciphertext (64-bit)</div>
                <div className="text-[20px] font-black font-mono" style={{ letterSpacing: '0.06em', color: theme.text, transition: 'all 0.3s ease' }}>
                  8F 3A 7B 9C 2D 1E 6F 90
                </div>
              </div>

              {/* Meta */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="flex items-center gap-2 p-3 rounded-xl"
                  style={{ ...inputStyle }}>
                  <Clock className="w-4 h-4 text-cyan-500 flex-shrink-0" />
                  <div>
                    <div className="text-[13px] font-bold text-cyan-600">0.023 detik</div>
                    <div className="text-[9px]" style={{ color: theme.muted }}>Waktu Proses</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-xl"
                  style={{ ...inputStyle }}>
                  <Package className="w-4 h-4 text-indigo-500 flex-shrink-0" />
                  <div>
                    <div className="text-[13px] font-bold text-indigo-600">64 bit</div>
                    <div className="text-[9px]" style={{ color: theme.muted }}>Panjang Output</div>
                  </div>
                </div>
              </div>

              <button
                className="w-full py-2.5 rounded-xl text-[13px] font-bold flex items-center justify-center gap-2 text-white transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg,#2563EB,#3B82F6)', boxShadow: '0 4px 20px rgba(37,99,235,0.3)' }}>
                <Copy className="w-3.5 h-3.5" /> Salin Hasil
              </button>
            </div>

          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════
          FOKUS PEMBELAJARAN (TABLE)
      ══════════════════════════════════ */}
      <section className="relative px-6 md:px-12 lg:px-20 xl:px-28 pb-12 max-w-[1280px] mx-auto">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 }}>
          <h2 className="text-[15px] font-bold mb-4" style={{ color: theme.text, transition: 'all 0.3s ease' }}>Fokus pembelajaran DES</h2>
          <div className="rounded-2xl overflow-hidden shadow-sm"
            style={{ ...cardStyle }}>
            <div className="grid grid-cols-2 h-11" style={{ borderBottom: `1px solid ${theme.border}`, transition: 'all 0.3s ease' }}>
              <div className="flex items-center px-6 text-[11px] font-bold uppercase tracking-wider" style={{ color: theme.muted, transition: 'all 0.3s ease' }}>Aspek</div>
              <div className="flex items-center px-6 text-[11px] font-bold text-blue-600 uppercase tracking-wider"
                style={{ borderLeft: `1px solid ${theme.border}`, transition: 'all 0.3s ease' }}>DES</div>
            </div>
            {[
              ['Tipe',              'Block cipher'],
              ['Panjang kunci',     '56-bit efektif'],
              ['Struktur inti',     'Feistel Network'],
              ['Jumlah ronde',      '16 ronde Feistel'],
              ['Keamanan saat ini', 'Lemah untuk produksi, tepat untuk edukasi'],
              ['Cocok digunakan di','Studi kriptografi dan visualisasi algoritma'],
            ].map((row, idx, arr) => (
              <div key={row[0]} className="grid grid-cols-2 min-h-[44px]"
                style={{ borderBottom: idx < arr.length - 1 ? `1px solid ${theme.borderSubtle}` : 'none', transition: 'all 0.3s ease' }}>
                <div className="flex items-center px-6 py-2 text-[13px]" style={{ color: theme.secondary, transition: 'all 0.3s ease' }}>{row[0]}</div>
                <div className="flex items-center px-6 py-2 text-[13px] font-medium"
                  style={{ borderLeft: `1px solid ${theme.borderSubtle}`, color: theme.text, transition: 'all 0.3s ease' }}>{row[1]}</div>
              </div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════
          APA ITU DES
      ══════════════════════════════════ */}
      <section className="relative px-6 md:px-12 lg:px-20 xl:px-28 pb-16 max-w-[1280px] mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.6 }}
          className="rounded-2xl p-6 md:p-8"
          style={{ background: isDark ? '#0F172A' : 'linear-gradient(135deg, #EFF6FF 0%, #F0FEFF 100%)', border: `1px solid ${isDark ? '#1E3A64' : 'rgba(191,219,254,0.6)'}`, boxShadow: theme.shadow, transition: 'all 0.3s ease' }}>

          <div className="flex flex-col md:flex-row gap-5">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg flex-shrink-0"
              style={{ background: 'linear-gradient(135deg,#2563EB,#3B82F6)', boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}>
              <Lock className="w-5 h-5 text-white" />
            </div>

            <div className="flex-1">
              <div className="flex items-center justify-between flex-wrap gap-2 mb-3">
                <h3 className="text-[16px] font-bold" style={{ color: theme.text, transition: 'all 0.3s ease' }}>Apa itu DES?</h3>
                <div className="px-3 py-1 rounded-full text-[11px] font-semibold text-blue-600"
                  style={{ background: isDark ? '#1E293B' : 'rgba(255,255,255,0.8)', border: `1px solid ${isDark ? '#334155' : '#BFDBFE'}`, transition: 'all 0.3s ease' }}>
                  Standar federal sejak 1977
                </div>
              </div>

              <p className="text-[13px] mb-5" style={{ lineHeight: 1.75, color: theme.secondary, transition: 'all 0.3s ease' }}>
                Data Encryption Standard (DES) adalah algoritma enkripsi simetris yang dikembangkan untuk mengenkripsi data 64-bit dengan kunci efektif 56-bit melalui 16 ronde transformasi Feistel.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-5">
                {[
                  { icon: CheckCircle2, color: '#2563EB', title: 'Struktur Feistel',    desc: 'Memudahkan pembelajaran ronde, subkey, dan pertukaran blok kiri-kanan.' },
                  { icon: CheckCircle2, color: '#15803D', title: 'Mudah dipelajari',    desc: 'Cocok untuk memahami bit permutation, XOR, S-box, dan avalanche effect.' },
                  { icon: AlertCircle,  color: '#DC2626', title: 'Kunci terlalu pendek',desc: '56-bit sudah tidak aman untuk kebutuhan modern karena rentan brute force.' },
                  { icon: AlertCircle,  color: '#EA580C', title: 'Hanya untuk edukasi', desc: 'Jangan gunakan DES untuk data sensitif di produksi modern.' },
                ].map((f) => {
                  const Icon = f.icon;
                  return (
                    <div key={f.title} className="flex gap-3 px-4 py-3.5 rounded-xl"
                      style={{ background: isDark ? '#1E293B' : 'rgba(255,255,255,0.7)', border: `1px solid ${isDark ? '#334155' : 'rgba(255,255,255,0.9)'}`, transition: 'all 0.3s ease' }}>
                      <Icon className="w-4 h-4 mt-0.5 flex-shrink-0" style={{ color: f.color }} />
                      <div>
                        <div className="text-[12px] font-bold mb-0.5" style={{ color: theme.text, transition: 'all 0.3s ease' }}>{f.title}</div>
                        <div className="text-[11px]" style={{ lineHeight: 1.6, color: theme.secondary, transition: 'all 0.3s ease' }}>{f.desc}</div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button onClick={handleDESClick}
                className="inline-flex items-center gap-2 h-10 px-5 rounded-xl text-white text-[13px] font-bold transition-all hover:-translate-y-0.5"
                style={{ background: 'linear-gradient(135deg,#2563EB,#3B82F6)', boxShadow: '0 4px 16px rgba(37,99,235,0.35)' }}>
                <Lock className="w-3.5 h-3.5" />
                Coba enkripsi DES
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ══════════════════════════════════
          FOOTER STATS
      ══════════════════════════════════ */}
      <div className="relative border-t px-6 md:px-12 lg:px-20 xl:px-28 py-6 max-w-[1280px] mx-auto grid grid-cols-2 lg:grid-cols-4 gap-4"
        style={{ borderColor: theme.border, transition: 'all 0.3s ease' }}>
        {[
          { icon: '📄', val: 'FIPS 46-3', lbl: 'Standar' },
          { icon: '📅', val: '1977',      lbl: 'Tahun Publikasi' },
          { icon: '🔑', val: '56 bit',    lbl: 'Panjang Key' },
          { icon: '📦', val: '64 bit',    lbl: 'Panjang Block' },
        ].map((s) => (
          <div key={s.lbl} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg flex-shrink-0"
              style={{ background: theme.inputBg, border: `1px solid ${theme.borderSubtle}`, transition: 'all 0.3s ease' }}>
              {s.icon}
            </div>
            <div>
              <div className="text-[15px] font-bold" style={{ color: theme.text, transition: 'all 0.3s ease' }}>{s.val}</div>
              <div className="text-[10px] tracking-wide" style={{ color: theme.muted, transition: 'all 0.3s ease' }}>{s.lbl}</div>
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}
