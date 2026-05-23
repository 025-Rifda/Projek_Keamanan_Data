import { Link, useLocation } from 'react-router-dom';
import { Lock, Moon, Sun } from 'lucide-react';
import { motion } from 'motion/react';
import { useTheme } from '../context/ThemeContext';

export function Navbar() {
  const location = useLocation();
  const { isDark, toggleTheme } = useTheme();

  const navItems = [
    { path: '/beranda', label: 'Beranda' },
    { path: '/uji-coba', label: 'Uji Coba' },
    { path: '/pengembang', label: 'Pengembang' },
  ];

  return (
    <nav
      className="h-[56px] w-full border-b flex items-center px-4 md:px-8"
      style={{
        background: 'var(--bg-card)',
        borderColor: 'var(--border-color)',
        transition: 'all 0.3s ease',
      }}
    >
      <div className="flex items-center gap-2">
        <div className="relative w-[28px] h-[28px] rounded-[7px] bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Lock className="w-4 h-4 text-white" />
        </div>
        <span
          className="text-[14px] font-medium"
          style={{ color: 'var(--text-primary)', transition: 'all 0.3s ease' }}
        >
          CryptoDES
        </span>
      </div>

      <div className="ml-auto flex items-center gap-0.5 md:gap-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className="text-[11px] md:text-[13px] px-2 md:px-[14px] py-[6px] rounded-[6px] transition-colors"
            style={{
              background: location.pathname === item.path ? 'var(--bg-input)' : 'transparent',
              color: location.pathname === item.path ? 'var(--text-primary)' : 'var(--text-secondary)',
              transition: 'all 0.3s ease',
            }}
          >
            {item.label}
          </Link>
        ))}
        <button
          type="button"
          onClick={toggleTheme}
          className="ml-2 h-9 w-14 rounded-full border flex items-center justify-center overflow-hidden"
          style={{
            background: 'var(--bg-input)',
            borderColor: 'var(--border-color)',
            color: 'var(--text-primary)',
            transition: 'all 0.3s ease',
          }}
          aria-label={isDark ? 'Beralih ke tema terang' : 'Beralih ke tema gelap'}
        >
          <motion.span
            key={isDark ? 'sun' : 'moon'}
            initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
            animate={{ rotate: 0, opacity: 1, scale: 1 }}
            exit={{ rotate: 90, opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="flex items-center justify-center"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-[#2563EB]" />}
          </motion.span>
        </button>
      </div>
    </nav>
  );
}
