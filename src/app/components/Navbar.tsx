import { Link, useLocation } from 'react-router-dom';
import { Lock } from 'lucide-react';

export function Navbar() {
  const location = useLocation();

  const navItems = [
    { path: '/beranda', label: 'Beranda' },
    { path: '/uji-coba', label: 'Uji Coba' },
    { path: '/pengembang', label: 'Pengembang' },
  ];

  return (
    <nav className="h-[56px] w-full border-b border-[#E2E8F0] bg-white flex items-center px-4 md:px-8">
      <div className="flex items-center gap-2">
        <div className="relative w-[28px] h-[28px] rounded-[7px] bg-gradient-to-br from-[#1E3A8A] via-[#2563EB] to-[#3B82F6] flex items-center justify-center shadow-lg shadow-blue-500/30">
          <Lock className="w-4 h-4 text-white" />
        </div>
        <span className="text-[14px] font-medium text-[#0F172A]">CryptoDES</span>
      </div>

      <div className="ml-auto flex items-center gap-0.5 md:gap-1">
        {navItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`text-[11px] md:text-[13px] px-2 md:px-[14px] py-[6px] rounded-[6px] transition-colors ${
              location.pathname === item.path
                ? 'bg-[#F1F5F9] text-[#0F172A]'
                : 'text-[#64748B] hover:bg-[#F8FAFC]'
            }`}
          >
            {item.label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
