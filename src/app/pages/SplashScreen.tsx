import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, ShieldCheck, Sparkles } from 'lucide-react';
import { motion } from 'motion/react';

export function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/beranda');
    }, 3500);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div
      className="relative w-full h-screen overflow-hidden flex items-center justify-center"
      style={{
        background: '#020817', // gelap solid
        transition: 'all 0.3s ease',
      }}
    >
      {/* Background Gradient - selalu gelap */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom right, #0F172A, #1E3A8A, #2563EB)',
        }}
      />

      {/* Glow Effects */}
      <div className="absolute top-[-120px] left-[-100px] w-[420px] h-[420px] bg-blue-500/30 blur-[120px] rounded-full" />
      <div className="absolute bottom-[-140px] right-[-120px] w-[420px] h-[420px] bg-cyan-400/20 blur-[140px] rounded-full" />

      {/* Floating Orbs */}
      <motion.div
        animate={{
          y: [0, -25, 0],
          x: [0, 12, 0],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
        }}
        className="absolute top-[18%] left-[12%] w-28 h-28 rounded-full bg-white/10 backdrop-blur-3xl border border-white/10 shadow-[0_0_80px_rgba(59,130,246,0.35)]"
      />

      <motion.div
        animate={{
          y: [0, 18, 0],
          x: [0, -12, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
        }}
        className="absolute bottom-[16%] right-[14%] w-40 h-40 rounded-full bg-cyan-300/10 backdrop-blur-3xl border border-white/10 shadow-[0_0_100px_rgba(34,211,238,0.25)]"
      />

      {/* Grid Overlay */}
      <div
        className="absolute inset-0 opacity-[0.08]"
        style={{
          backgroundImage: `
            linear-gradient(to right, white 1px, transparent 1px),
            linear-gradient(to bottom, white 1px, transparent 1px)
          `,
          backgroundSize: '70px 70px',
        }}
      />

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8, rotateX: 30 }}
        animate={{ opacity: 1, scale: 1, rotateX: 0 }}
        transition={{ duration: 1.2, ease: 'easeOut' }}
        className="relative z-10"
      >
        <div
          className="relative w-[360px] rounded-[34px] border backdrop-blur-2xl overflow-hidden"
          style={{
            background: 'rgba(255,255,255,0.1)', // selalu transparan gelap
            borderColor: 'rgba(255,255,255,0.15)',
            boxShadow: '0 20px 120px rgba(37,99,235,0.45)',
          }}
        >
          {/* Glass Shine */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent pointer-events-none" />

          {/* Top Blur Glow */}
          <div className="absolute top-[-60px] left-1/2 -translate-x-1/2 w-[220px] h-[220px] bg-cyan-300/20 blur-[90px]" />

          <div className="relative px-10 py-14 text-center">
            {/* Logo */}
            <motion.div
              animate={{
                y: [0, -10, 0],
                rotateY: [0, 8, 0],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
              }}
              className="relative w-28 h-28 mx-auto mb-8"
            >
              {/* Outer Glow Ring */}
              <div className="absolute inset-0 rounded-[30px] bg-gradient-to-br from-cyan-300 to-blue-500 blur-xl opacity-70" />

              {/* Main Glass Icon */}
              <div className="relative w-full h-full rounded-[30px] bg-white/10 backdrop-blur-2xl border border-white/20 flex items-center justify-center shadow-[0_10px_50px_rgba(59,130,246,0.5)]">
                <Lock className="w-14 h-14 text-white drop-shadow-2xl" />
              </div>

              {/* Floating Mini Icons */}
              <motion.div
                animate={{ y: [0, -8, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-3 -right-3 w-10 h-10 rounded-2xl bg-white/10 border border-white/10 backdrop-blur-xl flex items-center justify-center"
              >
                <ShieldCheck className="w-5 h-5 text-cyan-200" />
              </motion.div>

              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-2 -left-2 w-9 h-9 rounded-xl bg-white/10 border border-white/10 backdrop-blur-xl flex items-center justify-center"
              >
                <Sparkles className="w-4 h-4 text-blue-100" />
              </motion.div>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="text-[42px] font-bold tracking-wide drop-shadow-xl"
              style={{ color: '#ffffff' }}
            >
              CryptoDES
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="mt-3 text-[15px] tracking-[0.2em] uppercase"
              style={{ color: 'rgba(219,234,254,0.8)' }}
            >
              Secure Academic Encryption
            </motion.p>

            {/* Loading */}
            <div className="mt-10 flex justify-center gap-3">
              {[0, 1, 2].map((item) => (
                <motion.div
                  key={item}
                  animate={{
                    y: [0, -10, 0],
                    opacity: [0.4, 1, 0.4],
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 1.2,
                    repeat: Infinity,
                    delay: item * 0.2,
                  }}
                  className="w-3 h-3 rounded-full bg-white shadow-[0_0_20px_rgba(255,255,255,0.9)]"
                />
              ))}
            </div>
          </div>

          {/* Bottom Light */}
          <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-cyan-300 to-transparent opacity-80" />
        </div>
      </motion.div>

      {/* Floating Particles */}
      {[...Array(14)].map((_, i) => (
        <motion.div
          key={i}
          animate={{
            y: [0, -40, 0],
            opacity: [0.2, 1, 0.2],
          }}
          transition={{
            duration: 4 + i,
            repeat: Infinity,
          }}
          className="absolute rounded-full bg-white/30"
          style={{
            width: `${Math.random() * 6 + 2}px`,
            height: `${Math.random() * 6 + 2}px`,
            top: `${Math.random() * 100}%`,
            left: `${Math.random() * 100}%`,
          }}
        />
      ))}
    </div>
  );
}