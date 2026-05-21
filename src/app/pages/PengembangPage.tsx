import { Github, Instagram, Mail, Users, Code2, Shield, BookOpen, ExternalLink } from 'lucide-react';
import { motion } from 'motion/react';

const developers = [
  {
    name: 'Almas Rifda Zatadin',
    badge: 'Ketua Anggota',
    badgeColor: '#2563EB',
    badgeBg: '#EFF6FF',
    description: 'Memimpin, mengarahkan, dan mengkoordinasikan seluruh kegiatan tim.',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad',
    github: 'https://github.com/025-Rifda',
    instagram: 'https://www.instagram.com/rizenka.airin0701',
    email: 'ahmad.rizki@cryptodes.com',
  },
  {
    name: 'Elysa Hayu Noorhaini',
    badge: 'Anggota 1',
    badgeColor: '#7C3AED',
    badgeBg: '#F5F3FF',
    description: 'Membantu ketua dalam pelaksanaan tugas dan mendukung kelancaran kerja tim.',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti',
    github: 'https://github.com/Elysa-21',
    instagram: 'https://www.instagram.com/elysaaa21_',
    email: 'siti.nur@cryptodes.com',
  },
  {
    name: 'Desta Berlianda Faathir',
    badge: 'Anggota 2',
    badgeColor: '#0891B2',
    badgeBg: '#ECFEFF',
    description: 'Memberikan dukungan teknis/kreatif dan membantu tugas operasional tim.',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
    github: 'https://github.com/DestaBerlianda',
    instagram: 'https://www.instagram.com/taa_malaka?igsh=MWN6eW1tZWl5cmt4Ng==',
    email: 'DestaBerlianda1205@gmail.com',
  },
  {
    name: 'Dea Suci Ramadhani putri',
    badge: 'Anggota 3',
    badgeColor: '#059669',
    badgeBg: '#ECFDF5',
    description: 'Mengelola data, dokumentasi, serta membantu penyusunan laporan.',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana',
    github: 'https://github.com/dianaputri',
    instagram: 'https://instagram.com/dianaputri',
    email: 'diana.putri@cryptodes.com',
  },
];

const stats = [
  { icon: <Users size={18} />, value: '4', label: 'Developer' },
  { icon: <Code2 size={18} />, value: '100%', label: 'Open Source' },
  { icon: <Shield size={18} />, value: 'Aman', label: 'Secure by Design' },
  { icon: <BookOpen size={18} />, value: 'Edukasi', label: 'Untuk Semua' },
];

export function PengembangPage() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500&family=Sora:wght@400;500;600;700&display=swap');

        .pengembang-page {
          font-family: 'Sora', sans-serif;
          background: #F0F4FF;
          background-image:
            radial-gradient(ellipse at 15% 0%, rgba(37,99,235,0.08) 0%, transparent 55%),
            radial-gradient(ellipse at 85% 5%, rgba(99,102,241,0.06) 0%, transparent 50%);
          min-height: calc(100vh - 56px);
        }

        .hero-section {
          position: relative;
          padding: 52px 24px 40px;
          text-align: center;
          overflow: hidden;
        }

        /* DIHAPUS: hero-section::before yang bikin overlay putih di atas teks */

        .blob {
          position: absolute;
          border-radius: 50%;
          opacity: 0.18;
          pointer-events: none;
        }
        .blob-1 { width: 90px; height: 90px; background: #BFDBFE; top: 30px; left: 6%; }
        .blob-2 { width: 56px; height: 56px; background: #C7D2FE; top: 80px; left: 12%; opacity: 0.12; }
        .blob-3 { width: 70px; height: 70px; background: #A5B4FC; top: 20px; right: 8%; opacity: 0.15; }

        .hex-deco {
          position: absolute;
          right: 4%;
          top: 50%;
          transform: translateY(-50%);
          width: 96px;
          height: 96px;
          opacity: 0.22;
        }

        .dot-grid {
          position: absolute;
          top: 24px; left: 3%;
          width: 80px; height: 80px;
          background-image: radial-gradient(circle, #93C5FD 1.2px, transparent 1.2px);
          background-size: 12px 12px;
          opacity: 0.5;
        }
        .dot-grid-right {
          position: absolute;
          top: 24px; right: 3%;
          width: 80px; height: 80px;
          background-image: radial-gradient(circle, #A5B4FC 1.2px, transparent 1.2px);
          background-size: 12px 12px;
          opacity: 0.4;
        }

        .badge-pill {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 7px 16px;
          border-radius: 999px;
          background: rgba(255,255,255,0.85);
          border: 1px solid #BFDBFE;
          box-shadow: 0 2px 8px rgba(37,99,235,0.10);
          font-size: 12px;
          font-weight: 600;
          color: #2563EB;
          letter-spacing: 0.04em;
          margin-bottom: 20px;
          backdrop-filter: blur(6px);
          position: relative;
          z-index: 2;
        }

        .hero-title {
          font-size: clamp(26px, 4vw, 40px);
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 14px;
          line-height: 1.2;
          position: relative;
          z-index: 2;
        }
        .hero-title span {
          background: linear-gradient(135deg, #2563EB, #4F46E5);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .hero-desc {
          font-size: 14px;
          color: #475569;
          max-width: 560px;
          margin: 0 auto 36px;
          line-height: 1.75;
          position: relative;
          z-index: 2;
        }

        .stats-bar {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
          max-width: 780px;
          margin: 0 auto;
          position: relative;
          z-index: 2;
        }
        .stat-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          box-shadow: 0 1px 6px rgba(37,99,235,0.06);
          min-width: 140px;
          flex: 1;
        }
        .stat-icon {
          width: 34px; height: 34px;
          border-radius: 9px;
          background: #EEF2FF;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2563EB;
          flex-shrink: 0;
        }
        .stat-value {
          font-size: 16px;
          font-weight: 700;
          color: #0F172A;
          line-height: 1;
          font-family: 'IBM Plex Mono', monospace;
        }
        .stat-label {
          font-size: 11px;
          color: #94A3B8;
          margin-top: 2px;
        }

        .dev-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 18px;
          max-width: 1120px;
          margin: 0 auto;
          padding: 40px 24px;
        }

        .dev-card {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 18px;
          padding: 22px;
          display: flex;
          gap: 18px;
          position: relative;
          box-shadow: 0 2px 12px rgba(37,99,235,0.05), 0 1px 2px rgba(0,0,0,0.04);
          transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
          overflow: hidden;
        }
        .dev-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 3px;
          background: linear-gradient(90deg, #2563EB, #4F46E5);
          opacity: 0;
          transition: opacity 0.2s;
          border-radius: 18px 18px 0 0;
        }
        .dev-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 36px rgba(37,99,235,0.12), 0 2px 4px rgba(0,0,0,0.05);
          border-color: #BFDBFE;
        }
        .dev-card:hover::before { opacity: 1; }

        .card-dots {
          position: absolute;
          top: 14px; right: 14px;
          display: grid;
          grid-template-columns: repeat(3, 4px);
          gap: 3px;
          opacity: 0.25;
        }
        .card-dots span {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: #94A3B8;
          display: block;
        }

        .dev-photo {
          width: 100px; height: 100px;
          border-radius: 16px;
          overflow: hidden;
          background: linear-gradient(135deg, #DBEAFE, #E0E7FF);
          border: 2px solid #BFDBFE;
          box-shadow: 0 4px 12px rgba(37,99,235,0.12);
          transition: transform 0.2s;
          flex-shrink: 0;
          align-self: flex-start;
        }
        .dev-card:hover .dev-photo { transform: scale(1.04); }
        .dev-photo img { width: 100%; height: 100%; object-fit: cover; }

        .dev-info { flex: 1; min-width: 0; }
        .dev-name { font-size: 16px; font-weight: 700; color: #0F172A; margin: 0 0 2px; }
        .dev-role { font-size: 13px; font-weight: 600; color: #2563EB; margin: 0 0 8px; }
        .dev-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          margin-bottom: 10px;
          border: 1px solid transparent;
        }
        .dev-desc { font-size: 12.5px; color: #64748B; line-height: 1.65; margin: 0 0 14px; }

        .social-links { display: flex; gap: 8px; }
        .social-btn {
          width: 34px; height: 34px;
          border-radius: 9px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          color: #64748B;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          transition: all 0.15s;
        }
        .social-btn:hover { transform: translateY(-1px); }
        .social-btn.github:hover { background: #0F172A; border-color: #0F172A; color: #fff; }
        .social-btn.instagram:hover { background: linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888); border-color: #cc2366; color: #fff; }
        .social-btn.email:hover { background: #EA4335; border-color: #EA4335; color: #fff; }

        .about-section { padding: 0 24px 52px; }
        .about-card {
          max-width: 1120px;
          margin: 0 auto;
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: 28px 32px;
          display: flex;
          gap: 28px;
          align-items: flex-start;
          box-shadow: 0 2px 16px rgba(37,99,235,0.07);
          position: relative;
          overflow: hidden;
        }
        .about-card::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(239,246,255,0.6) 0%, rgba(238,242,255,0.4) 100%);
          pointer-events: none;
          border-radius: 20px;
        }
        .about-icon-bg {
          width: 80px; height: 80px;
          border-radius: 18px;
          background: linear-gradient(135deg, #EEF2FF, #DBEAFE);
          border: 1.5px solid #C7D2FE;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2563EB;
          box-shadow: 0 4px 16px rgba(37,99,235,0.14);
          flex-shrink: 0;
          position: relative;
          z-index: 1;
        }
        .about-content { flex: 1; position: relative; z-index: 1; }
        .about-title { font-size: 18px; font-weight: 700; color: #0F172A; margin: 0 0 10px; }
        .about-desc { font-size: 13.5px; color: #475569; line-height: 1.75; margin: 0 0 14px; }
        .about-note {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          background: #EEF2FF;
          border: 1px solid #C7D2FE;
          border-radius: 9px;
          font-size: 12.5px;
          color: #3730A3;
          font-weight: 500;
          margin-bottom: 10px;
        }
        .about-sub { font-size: 13px; color: #64748B; line-height: 1.7; margin: 0; }
        .about-github-btn {
          flex-shrink: 0;
          position: relative;
          z-index: 1;
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 20px;
          border-radius: 10px;
          background: linear-gradient(135deg, #2563EB, #4F46E5);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          text-decoration: none;
          box-shadow: 0 4px 14px rgba(37,99,235,0.28);
          transition: transform 0.15s, box-shadow 0.15s;
          white-space: nowrap;
          font-family: 'Sora', sans-serif;
        }
        .about-github-btn:hover {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37,99,235,0.36);
        }

        .footer-note {
          text-align: center;
          padding: 20px 0 32px;
          font-size: 13px;
          color: #94A3B8;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
        }
        .heart { color: #F43F5E; font-size: 15px; }

        @media (max-width: 768px) {
          .dev-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 640px) {
          .about-card { flex-direction: column; }
          .about-icon-bg { display: none; }
          .about-github-btn { width: 100%; justify-content: center; }
          .stat-item { min-width: 120px; }
          .dev-card { flex-direction: column; }
          .dev-photo { width: 72px; height: 72px; }
        }
      `}</style>

      <div className="pengembang-page">

        {/* Hero */}
        <section className="hero-section">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
          <div className="dot-grid" />
          <div className="dot-grid-right" />
          <svg className="hex-deco" viewBox="0 0 100 115" fill="none">
            <path d="M50 5 L93 28 L93 87 L50 110 L7 87 L7 28 Z" stroke="#3B82F6" strokeWidth="1.5" fill="rgba(219,234,254,0.35)" />
            <path d="M50 22 L79 38 L79 77 L50 93 L21 77 L21 38 Z" stroke="#6366F1" strokeWidth="1" fill="rgba(199,210,254,0.2)" />
            <g transform="translate(38,42)">
              <rect x="2" y="0" width="20" height="20" rx="3" fill="#2563EB" opacity="0.7" />
              <path d="M12 5 L12 15 M7 10 L17 10" stroke="white" strokeWidth="2" strokeLinecap="round" />
            </g>
          </svg>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <div className="badge-pill">
              <Users size={13} />
              Tim Pengembang
            </div>
          </motion.div>

          <motion.h1 className="hero-title" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.1 }}>
            Kenalan dengan Tim <span>CryptoDES</span>
          </motion.h1>

          <motion.p className="hero-desc" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.2 }}>
            Kami adalah tim yang bersemangat dalam menghadirkan pendidikan kriptografi yang interaktif dan mudah dipahami.
          </motion.p>

          <motion.div className="stats-bar" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.3 }}>
            {stats.map((s, i) => (
              <div className="stat-item" key={i}>
                <div className="stat-icon">{s.icon}</div>
                <div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </section>

        {/* Developer Cards */}
        <div className="dev-grid">
          {developers.map((dev, index) => (
            <motion.div
              key={index}
              className="dev-card"
              initial={{ opacity: 0, y: 28 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.45, delay: 0.1 + index * 0.09 }}
            >
              <div className="card-dots">
                {Array.from({ length: 9 }).map((_, i) => <span key={i} />)}
              </div>

              <div className="dev-photo">
                <img src={dev.photo} alt={dev.name} />
              </div>

              <div className="dev-info">
                <div className="dev-name">{dev.name}</div>
                <div className="dev-badge" style={{ color: dev.badgeColor, background: dev.badgeBg, borderColor: dev.badgeColor + '33' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: dev.badgeColor, display: 'inline-block', flexShrink: 0 }} />
                  {dev.badge}
                </div>
                <p className="dev-desc">{dev.description}</p>
                <div className="social-links">
                  <a href={dev.github} target="_blank" rel="noopener noreferrer" className="social-btn github" title="GitHub"><Github size={15} /></a>
                  <a href={dev.instagram} target="_blank" rel="noopener noreferrer" className="social-btn instagram" title="Instagram"><Instagram size={15} /></a>
                  <a href={`mailto:${dev.email}`} className="social-btn email" title="Email"><Mail size={15} /></a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* About Project */}
        <section className="about-section">
          <motion.div className="about-card" initial={{ opacity: 0, y: 28 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.55 }}>
            <div className="about-icon-bg">
              <svg width="36" height="36" viewBox="0 0 36 36" fill="none">
                <rect x="6" y="6" width="24" height="24" rx="5" fill="#2563EB" opacity="0.15" />
                <rect x="10" y="10" width="16" height="16" rx="3" fill="#2563EB" opacity="0.25" />
                <path d="M18 13 L18 23 M13 18 L23 18" stroke="#2563EB" strokeWidth="2.2" strokeLinecap="round" />
              </svg>
            </div>
            <div className="about-content">
              <div className="about-title">Tentang Proyek</div>
              <p className="about-desc">
                CryptoDES adalah platform edukasi kriptografi yang dikembangkan untuk membantu siswa dan
                mahasiswa memahami algoritma enkripsi DES melalui visualisasi interaktif dan penjelasan yang mudah dipahami.
              </p>
              <div className="about-note">
                <Github size={14} />
                Proyek ini open source dan tersedia di GitHub.
              </div>
              <p className="about-sub">Kami sangat terbuka untuk kontribusi dan saran dari komunitas.</p>
            </div>
            <a href="https://github.com/cryptodes/cryptodes" target="_blank" rel="noopener noreferrer" className="about-github-btn">
              <Github size={15} />
              Lihat di GitHub
              <ExternalLink size={12} style={{ opacity: 0.7 }} />
            </a>
          </motion.div>
        </section>

        {/* Footer */}
        <div className="footer-note">
          <span className="heart">♥</span>
          Dibuat dengan semangat untuk pendidikan dan kemajuan bersama.
        </div>

      </div>
    </>
  );
}