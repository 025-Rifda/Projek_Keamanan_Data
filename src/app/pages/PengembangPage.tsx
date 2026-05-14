import { Github, Linkedin, Mail } from 'lucide-react';
import { motion } from 'motion/react';

const developers = [
  {
    name: 'Ahmad Rizki',
    role: 'Full Stack Developer',
    description: 'Spesialisasi dalam React, TypeScript, dan algoritma kriptografi. Fokus pada implementasi DES dan visualisasi interaktif.',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Ahmad',
    github: 'https://github.com/ahmadrizki',
    linkedin: 'https://linkedin.com/in/ahmadrizki',
    email: 'ahmad.rizki@cryptodes.com',
  },
  {
    name: 'Siti Nurhaliza',
    role: 'UI/UX Designer',
    description: 'Merancang antarmuka yang intuitif dan modern. Bertanggung jawab atas design system dan user experience CryptoDES.',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Siti',
    github: 'https://github.com/sitinur',
    linkedin: 'https://linkedin.com/in/sitinur',
    email: 'siti.nur@cryptodes.com',
  },
  {
    name: 'Budi Santoso',
    role: 'Cryptography Expert',
    description: 'Ahli kriptografi dengan pengalaman dalam implementasi ChaCha20 dan analisis keamanan algoritma enkripsi modern.',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Budi',
    github: 'https://github.com/budisantoso',
    linkedin: 'https://linkedin.com/in/budisantoso',
    email: 'budi.santoso@cryptodes.com',
  },
  {
    name: 'Diana Putri',
    role: 'Backend Engineer',
    description: 'Mengembangkan arsitektur backend yang scalable dan aman. Fokus pada optimasi performa dan keamanan data.',
    photo: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Diana',
    github: 'https://github.com/dianaputri',
    linkedin: 'https://linkedin.com/in/dianaputri',
    email: 'diana.putri@cryptodes.com',
  },
];

export function PengembangPage() {
  return (
    <div className="w-full min-h-[calc(100vh-56px)] bg-[#F8FAFC]">
      {/* Hero Section */}
      <section className="relative px-4 md:px-8 lg:px-16 xl:px-[160px] pt-12 md:pt-16 pb-10 md:pb-12 bg-gradient-to-br from-blue-50/50 via-white to-cyan-50/30">
        <div className="max-w-[1200px] mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200/50 backdrop-blur-sm mb-6 shadow-sm">
              <span className="text-[12px] font-medium text-[#2563EB] tracking-wide">Tim Pengembang</span>
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-[32px] md:text-[42px] font-semibold bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#2563EB] bg-clip-text text-transparent mb-4"
            style={{ lineHeight: 1.2 }}
          >
            Kenalan dengan Tim CryptoDES
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-[14px] md:text-[15px] text-[#64748B] max-w-[600px] mx-auto"
            style={{ lineHeight: 1.7 }}
          >
            Kami adalah tim yang bersemangat dalam menghadirkan pendidikan kriptografi yang interaktif dan mudah dipahami
          </motion.p>
        </div>
      </section>

      {/* Developers Grid */}
      <section className="relative px-4 md:px-8 lg:px-16 xl:px-[160px] py-12 md:py-16">
        <div className="max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {developers.map((dev, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group bg-white border-[0.5px] border-[#E2E8F0] rounded-[16px] p-6 hover:border-[#BFDBFE] hover:shadow-[0_20px_60px_rgba(37,99,235,0.1)] transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex flex-col md:flex-row gap-5">
                  {/* Photo */}
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 md:w-28 md:h-28 rounded-[16px] overflow-hidden bg-gradient-to-br from-blue-100 to-cyan-100 border-2 border-blue-200 shadow-lg group-hover:scale-105 transition-transform">
                      <img
                        src={dev.photo}
                        alt={dev.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1">
                    <h3 className="text-[18px] font-semibold text-[#0F172A] mb-1">{dev.name}</h3>
                    <p className="text-[13px] font-medium text-[#2563EB] mb-3">{dev.role}</p>
                    <p className="text-[13px] text-[#64748B] mb-4" style={{ lineHeight: 1.6 }}>
                      {dev.description}
                    </p>

                    {/* Social Links */}
                    <div className="flex items-center gap-2">
                      <a
                        href={dev.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-9 h-9 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:bg-[#2563EB] hover:text-white hover:border-[#2563EB] transition-all"
                        title="GitHub"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                      <a
                        href={dev.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-center w-9 h-9 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:bg-[#0077B5] hover:text-white hover:border-[#0077B5] transition-all"
                        title="LinkedIn"
                      >
                        <Linkedin className="w-4 h-4" />
                      </a>
                      <a
                        href={`mailto:${dev.email}`}
                        className="flex items-center justify-center w-9 h-9 rounded-[8px] bg-[#F8FAFC] border border-[#E2E8F0] text-[#64748B] hover:bg-[#EA4335] hover:text-white hover:border-[#EA4335] transition-all"
                        title="Email"
                      >
                        <Mail className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* About Project */}
      <section className="relative px-4 md:px-8 lg:px-16 xl:px-[160px] pb-12 md:pb-16">
        <div className="max-w-[1200px] mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="bg-gradient-to-br from-[#EFF6FF] to-[#F0FDF4] border-[0.5px] border-[#BFDBFE] rounded-[20px] p-6 md:p-8"
          >
            <h2 className="text-[20px] font-semibold text-[#0F172A] mb-4">Tentang Proyek</h2>
            <p className="text-[14px] text-[#64748B] mb-4" style={{ lineHeight: 1.7 }}>
              CryptoDES adalah platform edukasi kriptografi yang dikembangkan untuk membantu siswa dan mahasiswa memahami
              algoritma enkripsi DES dan ChaCha20 melalui visualisasi interaktif dan penjelasan yang mudah dipahami.
            </p>
            <p className="text-[14px] text-[#64748B]" style={{ lineHeight: 1.7 }}>
              Proyek ini open source dan tersedia di{' '}
              <a
                href="https://github.com/cryptodes/cryptodes"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#2563EB] font-medium hover:underline"
              >
                GitHub
              </a>
              . Kami sangat terbuka untuk kontribusi dan saran dari komunitas.
            </p>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
