import { Github, Instagram, Mail, Users, Code2, Shield, BookOpen, ExternalLink, Lock } from 'lucide-react';
import { motion } from 'motion/react';
import kakPhoto from '../../assets/developers/kak.jpeg';
import elPhoto from '../../assets/developers/el.jpeg';
import desPhoto from '../../assets/developers/des.jpeg';
import raPhoto from '../../assets/developers/ra.jpeg';

const createGmailComposeLink = (email: string) =>
  `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(email)}`;

const developers = [
  {
    name: 'Almas Rifda Zatadin',
    badge: 'Ketua Anggota',
    badgeColor: '#2563EB',
    badgeBg: '#EFF6FF',
    description: 'Memimpin, mengarahkan, dan mengkoordinasikan seluruh kegiatan tim.',
    photo: kakPhoto,
    github: 'https://github.com/025-Rifda',
    instagram: 'https://www.instagram.com/rizenka.airin0701',
    email: '25051204256@unesa.ac.id',
  },
  {
    name: 'Elysa Hayu Noorhaini',
    badge: 'Anggota 1',
    badgeColor: '#7C3AED',
    badgeBg: '#F5F3FF',
    description: 'Membantu ketua dalam pelaksanaan tugas dan mendukung kelancaran kerja tim.',
    photo: elPhoto,
    github: 'https://github.com/Elysa-21',
    instagram: 'https://www.instagram.com/elysaaa21_',
    email: '25051204363@unesa.ac.id',
  },
  {
    name: 'Desta Berlianda Faathir',
    badge: 'Anggota 2',
    badgeColor: '#0891B2',
    badgeBg: '#ECFEFF',
    description: 'Memberikan dukungan teknis/kreatif dan membantu tugas operasional tim.',
    photo: desPhoto,
    github: 'https://github.com/DestaBerlianda',
    instagram: 'https://www.instagram.com/taa_malaka?igsh=MWN6eW1tZWl5cmt4Ng==',
    email: '25051204350@unesa.ac.id',
  },
  {
    name: 'Dea Suci Ramadani',
    badge: 'Anggota 3',
    badgeColor: '#059669',
    badgeBg: '#ECFDF5',
    description: 'Mengelola data, dokumentasi, serta membantu penyusunan laporan.',
    photo: raPhoto,
    github: 'https://github.com/128-Dea',
    instagram: 'https://www.instagram.com/dhesurha_?igsh=bmM2aXEzYXlrcXJy',
    email: '25051204296@gmail.com',
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
          overflow-x: hidden;
        }

        .pengembang-page * {
          box-sizing: border-box;
        }

        .hero-section {
          position: relative;
          padding: clamp(32px, 7vw, 52px) clamp(16px, 4vw, 24px) clamp(28px, 6vw, 40px);
          text-align: center;
          overflow: hidden;
        }

        .blob {
          position: absolute;
          border-radius: 50%;
          opacity: 0.18;
          pointer-events: none;
        }

        .blob-1 { width: 90px; height: 90px; background: #BFDBFE; top: 30px; left: 6%; }
        .blob-2 { width: 56px; height: 56px; background: #C7D2FE; top: 80px; left: 12%; opacity: 0.12; }
        .blob-3 { width: 70px; height: 70px; background: #A5B4FC; top: 20px; right: 8%; opacity: 0.15; }

        .dot-grid, .dot-grid-right {
          position: absolute;
          top: 24px;
          width: 80px;
          height: 80px;
          background-size: 12px 12px;
        }
        .dot-grid {
          left: 3%;
          background-image: radial-gradient(circle, #93C5FD 1.2px, transparent 1.2px);
        }
        .dot-grid-right {
          right: 3%;
          background-image: radial-gradient(circle, #A5B4FC 1.2px, transparent 1.2px);
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
          margin-bottom: 20px;
          backdrop-filter: blur(6px);
          z-index: 2;
        }

        .hero-title {
          font-size: clamp(26px, 4vw, 40px);
          font-weight: 700;
          color: #0F172A;
          margin: 0 0 14px;
          line-height: 1.2;
          z-index: 2;
        }

        .hero-title span {
          background: linear-gradient(135deg, #2563EB, #4F46E5);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        .hero-desc {
          font-size: clamp(13px, 2.5vw, 14px);
          color: #475569;
          max-width: 560px;
          margin: 0 auto 36px;
          line-height: 1.75;
          z-index: 2;
        }

        .stats-bar {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 10px;
          max-width: 780px;
          margin: 0 auto;
          z-index: 2;
        }

        .stat-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 20px;
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          min-width: 0;
        }

        .stat-icon {
          width: 34px;
          height: 34px;
          background: #EEF2FF;
          border-radius: 9px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2563EB;
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
        }

        .dev-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 18px;
          max-width: 1120px;
          margin: 0 auto;
          padding: clamp(28px, 6vw, 40px) clamp(16px, 4vw, 24px);
        }

        .dev-card {
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 18px;
          padding: 22px;
          display: flex;
          gap: 18px;
          position: relative;
          min-width: 0;
          box-shadow: 0 2px 12px rgba(37, 99, 235, 0.05);
          transition: 0.2s;
        }

        .dev-card:hover {
          transform: translateY(-3px);
          box-shadow: 0 12px 36px rgba(37, 99, 235, 0.12);
          border-color: #BFDBFE;
        }

        .card-dots {
          position: absolute;
          top: 14px;
          right: 14px;
          display: grid;
          grid-template-columns: repeat(3, 4px);
          gap: 3px;
          opacity: 0.25;
        }

        .card-dots span {
          width: 4px;
          height: 4px;
          background: #94A3B8;
          border-radius: 50%;
        }

        .dev-photo {
          width: clamp(76px, 18vw, 100px);
          height: clamp(76px, 18vw, 100px);
          border-radius: 16px;
          overflow: hidden;
          background: linear-gradient(135deg, #DBEAFE, #E0E7FF);
          border: 2px solid #BFDBFE;
          box-shadow: 0 4px 12px rgba(37,99,235,0.12);
          flex: 0 0 auto;
        }

        .dev-photo img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .dev-info {
          flex: 1;
          min-width: 0;
        }

        .dev-name {
          font-size: 16px;
          font-weight: 700;
          color: #0F172A;
          overflow-wrap: anywhere;
        }

        .dev-badge {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          padding: 3px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          margin: 6px 0 10px;
        }

        .dev-desc {
          font-size: 12.5px;
          color: #64748B;
          line-height: 1.65;
          margin-bottom: 14px;
        }

        .social-links {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .social-btn {
          width: 34px;
          height: 34px;
          border-radius: 9px;
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #64748B;
          transition: 0.15s;
        }

        .social-btn:hover {
          transform: translateY(-1px);
        }

        .social-btn.github:hover {
          background: #0F172A;
          border-color: #0F172A;
          color: white;
        }

        .social-btn.instagram:hover {
          background: linear-gradient(135deg, #f09433, #e6683c, #dc2743, #cc2366, #bc1888);
          color: white;
        }

        .social-btn.email:hover {
          background: #EA4335;
          border-color: #EA4335;
          color: white;
        }

        .about-section {
          padding: 0 clamp(16px, 4vw, 24px) clamp(36px, 7vw, 52px);
        }

        .about-card {
          max-width: 1120px;
          margin: 0 auto;
          background: white;
          border: 1px solid #E2E8F0;
          border-radius: 20px;
          padding: clamp(20px, 4vw, 28px) clamp(18px, 5vw, 32px);
          display: flex;
          gap: 28px;
          min-width: 0;
        }

        .about-icon-bg {
          width: 80px;
          height: 80px;
          border-radius: 18px;
          background: linear-gradient(135deg, #EEF2FF, #DBEAFE);
          border: 1.5px solid #C7D2FE;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2563EB;
          flex: 0 0 auto;
        }

        .about-title {
          font-size: 18px;
          font-weight: 700;
          color: #0F172A;
          margin-bottom: 10px;
        }

        .about-desc {
          font-size: 13.5px;
          color: #475569;
          line-height: 1.75;
        }

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
          margin: 14px 0;
          max-width: 100%;
        }

        .about-github-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 11px 20px;
          border-radius: 10px;
          font-size: 13px;
          font-weight: 600;
          background: linear-gradient(135deg, #2563EB, #4F46E5);
          color: white;
          text-decoration: none;
          max-width: 100%;
          justify-content: center;
        }

        .footer-note {
          text-align: center;
          font-size: 13px;
          color: #94A3B8;
          padding: 20px 0 32px;
        }

        .heart {
          color: #F43F5E;
        }

        @media (max-width: 900px) {
          .stats-bar {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .dev-grid {
            grid-template-columns: 1fr;
            max-width: 680px;
          }
        }

        @media (max-width: 640px) {
          .blob,
          .dot-grid,
          .dot-grid-right {
            display: none;
          }

          .badge-pill {
            margin-bottom: 14px;
          }

          .hero-desc {
            margin-bottom: 24px;
          }

          .stats-bar {
            grid-template-columns: 1fr;
            max-width: 360px;
          }

          .stat-item {
            padding: 12px 14px;
          }

          .dev-card {
            flex-direction: column;
            padding: 18px;
            gap: 14px;
          }

          .dev-photo {
            width: 86px;
            height: 86px;
          }

          .about-card {
            flex-direction: column;
            gap: 18px;
          }

          .about-icon-bg {
            width: 64px;
            height: 64px;
          }

          .about-note,
          .about-github-btn {
            width: 100%;
          }

          .footer-note {
            padding-left: 16px;
            padding-right: 16px;
          }
        }

        @media (max-width: 380px) {
          .dev-card {
            padding: 16px;
          }

          .social-btn {
            width: 32px;
            height: 32px;
          }
        }
      `}</style>

      <div className="pengembang-page">
        <section className="hero-section">
          <div className="blob blob-1" />
          <div className="blob blob-2" />
          <div className="blob blob-3" />
          <div className="dot-grid" />
          <div className="dot-grid-right" />

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            <div className="badge-pill">
              <Users size={13} /> Tim Pengembang
            </div>
          </motion.div>

          <motion.h1 className="hero-title" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            Kenalan dengan Tim <span>CryptoDES</span>
          </motion.h1>

          <motion.p className="hero-desc" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            Kami adalah tim yang bersemangat dalam menghadirkan pendidikan kriptografi yang interaktif dan mudah dipahami.
          </motion.p>

          <motion.div className="stats-bar" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
            {stats.map((s, i) => (
              <div key={i} className="stat-item">
                <div className="stat-icon">{s.icon}</div>
                <div>
                  <div className="stat-value">{s.value}</div>
                  <div className="stat-label">{s.label}</div>
                </div>
              </div>
            ))}
          </motion.div>
        </section>

        <div className="dev-grid">
          {developers.map((dev, index) => (
            <motion.div
              key={index}
              className="dev-card"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="card-dots">
                {[...Array(9)].map((_, i) => <span key={i} />)}
              </div>

              <div className="dev-photo">
                <img src={dev.photo} alt={dev.name} />
              </div>

              <div className="dev-info">
                <div className="dev-name">{dev.name}</div>

                <div
                  className="dev-badge"
                  style={{
                    color: dev.badgeColor,
                    background: dev.badgeBg,
                    borderColor: dev.badgeColor + '33',
                  }}
                >
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: dev.badgeColor }} />
                  {dev.badge}
                </div>

                <p className="dev-desc">{dev.description}</p>

                <div className="social-links">
                  <a href={dev.github} className="social-btn github" target="_blank" rel="noreferrer">
                    <Github size={15} />
                  </a>
                  <a href={dev.instagram} className="social-btn instagram" target="_blank" rel="noreferrer">
                    <Instagram size={15} />
                  </a>
                  <a
                    href={createGmailComposeLink(dev.email)}
                    className="social-btn email"
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Mail size={15} />
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        <section className="about-section">
          <div className="about-card">
            <div className="about-icon-bg">
              <div
                style={{
                  width: 46,
                  height: 46,
                  borderRadius: 14,
                  background: 'linear-gradient(135deg, #1E3A8A, #3B82F6)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 10px 24px rgba(37,99,235,0.24)',
                }}
              >
                <Lock size={22} color="#FFFFFF" />
              </div>
            </div>

            <div>
              <div className="about-title">Tentang Proyek</div>

              <p className="about-desc">
                CryptoDES adalah platform edukasi kriptografi untuk memahami algoritma enkripsi DES melalui
                visualisasi interaktif serta penjelasan yang mudah dipahami.
              </p>

              <div className="about-note">
                <Github size={14} />
                Proyek ini open source dan tersedia di GitHub.
              </div>

              <a
                href="https://github.com/025-Rifda/CryptoDES"
                className="about-github-btn"
                target="_blank"
                rel="noreferrer"
              >
                <Github size={15} /> Lihat di GitHub <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </section>

        <div className="footer-note">
          <span className="heart">♥</span> Dibuat dengan semangat untuk pendidikan.
        </div>
      </div>
    </>
  );
}
