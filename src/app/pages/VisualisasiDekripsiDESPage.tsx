import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Edit, Lightbulb, CircleDot, ArrowLeftRight, Info, Copy } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { decryptDES } from '../utils/des';

const stepData = [
  {
    num: 1,
    title: 'Membaca ciphertext: dari Hex ke bit',
    subtitle: 'Ciphertext hex dikonversi ke 64-bit biner — titik awal dekripsi',
    analogy: 'Bayangkan kamu menerima kartu angka 0 dan 1 dari kurir. Sebelum bisa dibaca, kamu harus tahu bahwa setiap 8 kartu mewakili satu "kode" yang nanti akan dikembalikan ke huruf aslinya.',
    tagColor: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' },
  },
  {
    num: 2,
    title: 'Membuka susunan akhir (Inverse Final Permutation)',
    subtitle: 'Tabel IP⁻¹ mengembalikan urutan bit ke posisi sebelum permutasi akhir — langkah pertama membuka cipher',
    analogy: 'Bayangkan 64 orang sudah berpindah posisi saat dikunci. Sekarang mereka disuruh balik ke posisi semula. Orang yang di posisi 1 kembali ke posisi 58, dan seterusnya — proses pembalikan untuk membuka kunci.',
    tagColor: { bg: '#FEF3C7', border: '#FCD34D', text: '#92400E' },
  },
  {
    num: 3,
    title: 'Subkey dibangkitkan sama — tapi dipakai terbalik',
    subtitle: 'Key schedule menghasilkan K1–K16 yang sama, tapi dekripsi memakainya dari K16 → K15 → ... → K1',
    analogy: 'Bayangkan kamu punya 16 kunci turunan dari 1 kunci utama. Untuk membuka kunci yang terkunci dengan urutan 1→16, kamu harus membukanya dengan urutan terbalik 16→1 — seperti membuka gembok berlapis dari luar ke dalam.',
    tagColor: { bg: '#F3E8FF', border: '#C4B5FD', text: '#7C3AED' },
  },
  {
    num: 4,
    title: 'Feistel Network dijalankan terbalik — 16 ronde membuka cipher',
    subtitle: 'L dan R ditukar balik: R baru = L lama, L baru = R lama ⊕ F(L baru, K16..K1)',
    analogy: 'Kamu dan temanmu saling bertukar isi tas — tapi sekarang mulai dari tas terakhir, dan membuka kode rahasia dari urutan 16 balik ke 1. Setelah 16 kali pertukaran terbalik, tas kembali ke isi semula.',
    tagColor: { bg: '#FFF7ED', border: '#FED7AA', text: '#C2410C' },
  },
  {
    num: 5,
    title: 'Permutasi terakhir: mengembalikan susunan awal',
    subtitle: 'Hasil 16 ronde Feistel dipermutasi dengan tabel IP untuk mengembalikan ke susunan plaintext asli',
    analogy: 'Ini langkah "membuka kemasan" terakhir. Seperti membuka hadiah dalam kotak berlapis — setelah semua lapisan dalam dibuka (16 ronde), kamu membuka lapisan terluar terakhir dan menemukan isi aslinya.',
    tagColor: { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D' },
  },
  {
    num: 6,
    title: 'Dekripsi selesai — plaintext berhasil dikembalikan',
    subtitle: '64-bit biner hasil IP dikonversi kembali ke ASCII, menghasilkan teks asli',
    analogy: 'Kartu-kartu angka 0 dan 1 akhirnya bisa dibaca kembali. Setiap 8 kartu dikelompokkan, dikonversi ke kode ASCII, dan muncullah huruf-huruf asli — pesan yang tersembunyi di dalam cipher berhasil dibuka!',
    tagColor: { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D' },
  },
];

const stepWhyData = [
  'DES dekripsi juga bekerja pada bit. Ciphertext harus diubah dulu ke bentuk biner agar setiap permutasi dan ronde bisa dijalankan dengan urutan yang tepat.',
  'Enkripsi DES menutup proses dengan permutasi akhir. Saat dekripsi, langkah itu harus dibalik lebih dulu supaya struktur internal blok kembali ke kondisi sebelum ronde dibuka.',
  'Feistel network memungkinkan DES memakai subkey yang sama saat dekripsi, asalkan urutannya dibalik. Ini yang membuat proses buka-kunci tetap konsisten dengan struktur enkripsinya.',
  'Bagian ini membalik efek pengacakan utama DES. Dengan 16 ronde terbalik, hubungan bit di dalam blok dikembalikan bertahap hingga mendekati susunan plaintext.',
  'Setelah semua ronde selesai dibalik, bit-bit masih perlu dikembalikan ke urutan plaintext standar. Permutasi ini menyusun ulang hasil internal menjadi bentuk akhir yang bisa dibaca.',
  'Bit hasil dekripsi belum bermakna bagi pengguna sampai diterjemahkan kembali ke karakter. Konversi akhir ini mengubah representasi mesin menjadi teks yang bisa dibaca manusia.',
];

const DES_IP_TABLE = [
  58, 50, 42, 34, 26, 18, 10, 2,
  60, 52, 44, 36, 28, 20, 12, 4,
  62, 54, 46, 38, 30, 22, 14, 6,
  64, 56, 48, 40, 32, 24, 16, 8,
  57, 49, 41, 33, 25, 17, 9, 1,
  59, 51, 43, 35, 27, 19, 11, 3,
  61, 53, 45, 37, 29, 21, 13, 5,
  63, 55, 47, 39, 31, 23, 15, 7,
];

function hexToBinaryString(hex: string) {
  return hex
    .split('')
    .map((char) => parseInt(char, 16).toString(2).padStart(4, '0'))
    .join('');
}

function stringToBitArray(value: string) {
  return Array.from(value)
    .flatMap((char) => char.charCodeAt(0).toString(2).padStart(8, '0').split(''))
    .slice(0, 64);
}

export function VisualisasiDekripsiDESPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();

  const routeState = (location.state as { ciphertext?: string; key?: string } | null) ?? null;
  const ciphertext = (routeState?.ciphertext ?? '').trim().toUpperCase();
  const key = routeState?.key ?? '';
  let decryptedPlaintext = '';

  if (ciphertext && key.length === 8) {
    try {
      decryptedPlaintext = decryptDES(ciphertext, key);
    } catch {
      decryptedPlaintext = '';
    }
  }

  const step = stepData[currentStep];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-56px)] bg-[#F8FAFC] pt-6 md:pt-8 pb-8 md:pb-12 px-4 md:px-8 lg:px-16 xl:px-[290px]">
      <div className="max-w-[860px] mx-auto">
        {/* Progress Bar Area */}
        <div className="mb-3.5">
          <div className="flex gap-1 mb-2">
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className={`flex-1 h-1 rounded-[2px] ${
                  i < currentStep ? 'bg-[#D97706]' : i === currentStep ? 'bg-[#FCD34D]' : 'bg-[#E2E8F0]'
                }`}
              />
            ))}
          </div>
          <p className="text-[11px] text-[#64748B]">
            Langkah {currentStep + 1} dari 6 — {step.title}
          </p>
        </div>

        {/* Step Header Card */}
        <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] px-5 py-4 mb-3">
          <div
            className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[20px] border-[0.5px]"
            style={{
              backgroundColor: step.tagColor.bg,
              borderColor: step.tagColor.border,
              color: step.tagColor.text,
            }}
          >
            <CircleDot className="w-3 h-3" />
            <span className="text-[11px] font-medium">Dekripsi Langkah {step.num}</span>
          </div>
          <h2 className="text-[16px] font-medium text-[#0F172A] mt-2.5 mb-1.5">{step.title}</h2>
          <p className="text-[13px] text-[#64748B]" style={{ lineHeight: 1.6 }}>
            {step.subtitle}
          </p>
        </div>

        {/* Analogy Box */}
        <div className="bg-[#FFFBEB] border-[0.5px] border-[#FDE68A] rounded-[10px] px-3.5 py-3 mb-3 flex gap-2.5">
          <Lightbulb className="w-5 h-5 text-[#F59E0B] flex-shrink-0" />
          <div>
            <div className="text-[12px] font-medium text-[#78350F] mb-1">Analogi:</div>
            <p className="text-[12px] text-[#92400E]" style={{ lineHeight: 1.65 }}>
              {step.analogy}
            </p>
          </div>
        </div>

        <div className="bg-[#F8FAFC] border-[0.5px] border-[#E2E8F0] rounded-[8px] px-3 py-2.5 mt-2 mb-3">
          <div className="text-[12px] font-medium text-[#0F172A] mb-1">Kenapa perlu dilakukan?</div>
          <p className="text-[12px] text-[#64748B]" style={{ lineHeight: 1.6 }}>
            {stepWhyData[currentStep]}
          </p>
        </div>

        {/* Visual Card - Different per step */}
        {currentStep === 0 && <Step1VisualDekripsi ciphertext={ciphertext} />}
        {currentStep === 1 && <Step2VisualDekripsi ciphertext={ciphertext} />}
        {currentStep === 2 && <Step3VisualDekripsi currentRound={currentRound} setCurrentRound={setCurrentRound} keyValue={key} />}
        {currentStep === 3 && <Step4VisualDekripsi currentRound={currentRound} setCurrentRound={setCurrentRound} />}
        {currentStep === 4 && <Step5VisualDekripsi plaintext={decryptedPlaintext} />}
        {currentStep === 5 && <Step6VisualDekripsi ciphertext={ciphertext} keyValue={key} plaintext={decryptedPlaintext} />}

        {/* Navigation Row */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 md:gap-0 mt-4">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-[8px] border-[0.5px] border-[#E2E8F0] bg-transparent text-[13px] text-[#0F172A] hover:bg-[#F8FAFC] transition-colors disabled:opacity-35 order-2 md:order-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Sebelumnya
          </button>

          <div className="flex items-center gap-2 order-1 md:order-2">
            <button
              onClick={() => navigate('/dekripsi/des')}
              className="flex items-center gap-2 px-4 py-2 rounded-[8px] border-[0.5px] border-[#E2E8F0] bg-transparent text-[13px] text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Ubah input
            </button>
            {currentStep === 5 ? (
              <button
                onClick={() => navigate('/beranda')}
                className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#16A34A] text-white text-[13px] font-medium hover:bg-[#15803D] transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Selesai
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-gradient-to-r from-[#D97706] to-[#B45309] text-white text-[13px] font-medium hover:shadow-lg hover:shadow-amber-500/30 transition-all"
              >
                Selanjutnya
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 1: Ciphertext to Binary (reversed from encryption)
function Step1VisualDekripsi({ ciphertext }: { ciphertext: string }) {
  const hexToBinary = (hex: string) => {
    return hex.split('').map(h => parseInt(h, 16).toString(2).padStart(4, '0')).join('');
  };

  const binary = hexToBinary(ciphertext.slice(0, 16));
  const allBits = binary.split('');

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Konversi Hex ke Biner</span>
      </div>
      <div className="p-4">
        {/* Dekripsi flow */}
        <div className="bg-[#FFFBEB] border-[0.5px] border-[#FDE68A] rounded-[8px] px-3 py-2.5 mb-4 flex items-center gap-2">
          <ArrowLeftRight className="w-4 h-4 text-[#D97706]" />
          <div className="text-[11px] text-[#92400E]">
            Alur dekripsi: <span className="font-medium">Ciphertext Hex → Biner → Proses DES → Plaintext</span>
          </div>
        </div>

        <div className="mb-4">
          <div className="text-[11px] font-medium text-[#64748B] mb-2">
            Ciphertext dalam Hex: {ciphertext.slice(0, 16)}
          </div>
          <div className="text-[11px] font-medium text-[#64748B] mb-2">
            64-bit biner (belum bisa dibaca):
          </div>
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="flex flex-wrap gap-[3px] min-w-[340px]">
              {allBits.map((bit, i) => (
                <div
                  key={i}
                  className={`w-5 h-5 rounded-[3px] border-[0.5px] flex items-center justify-center text-[10px] font-mono font-medium ${
                    bit === '1'
                      ? 'bg-[#FEF3C7] border-[#FCD34D] text-[#92400E]'
                      : 'bg-[#F1F5F9] border-[#CBD5E1] text-[#64748B]'
                  } ${(i + 1) % 8 === 0 && i !== 63 ? 'mr-1.5' : ''}`}
                >
                  {bit}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="text-[11px] text-[#64748B] bg-[#F8FAFC] rounded-[8px] px-3 py-2">
          64-bit ciphertext dalam bentuk biner — langkah berikutnya akan membuka cipher ini menjadi plaintext
        </div>
      </div>

      <div className="border-t-[0.5px] border-[#E2E8F0] px-4 py-2.5 flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-[3px] bg-[#FEF3C7] border-[#FCD34D]" />
          <span className="text-[11px] text-[#64748B]">Bit 1</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-[3px] bg-[#F1F5F9] border-[#CBD5E1]" />
          <span className="text-[11px] text-[#64748B]">Bit 0</span>
        </div>
      </div>
    </div>
  );
}

// Step 2: Inverse Final Permutation
function Step2VisualDekripsi({ ciphertext }: { ciphertext: string }) {
  const originalBits = hexToBinaryString(ciphertext.slice(0, 16)).padEnd(64, '0').slice(0, 64).split('');
  const permutedBits = DES_IP_TABLE.map((position) => originalBits[position - 1] ?? '0');

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Inverse Final Permutation (IP⁻¹)</span>
      </div>
      <div className="px-4 py-3.5">
        <div className="bg-[#FFFBEB] border-[0.5px] border-[#FDE68A] rounded-[8px] px-3 py-2.5 mb-4 flex items-center gap-2">
          <Info className="w-4 h-4 text-[#D97706]" />
          <div className="text-[11px] text-[#92400E]">
            Dekripsi dimulai dengan membuka lapisan terakhir. Tabel IP⁻¹ mengembalikan bit ke posisi setelah permutasi awal, siap masuk ke 16 ronde Feistel.
          </div>
        </div>

        <div className="text-[11px] font-medium text-[#64748B] mb-2">
          Ciphertext (sebelum IP⁻¹):
        </div>
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex flex-wrap gap-[3px] mb-4 min-w-[340px]">
            {originalBits.map((bit, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-[3px] border-[0.5px] flex items-center justify-center text-[10px] font-mono font-medium ${
                  bit === '1'
                    ? 'bg-[#FEF3C7] border-[#FCD34D] text-[#92400E]'
                    : 'bg-[#F1F5F9] border-[#CBD5E1] text-[#64748B]'
                }`}
              >
                {bit}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center py-2 text-[12px] text-[#D97706]">
          ↓ Tabel IP⁻¹ mengembalikan posisi bit ↓
        </div>

        <div className="text-[11px] font-medium text-[#64748B] mb-2">
          Setelah IP⁻¹ (siap untuk 16 ronde Feistel dekripsi):
        </div>
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex flex-wrap gap-[3px] min-w-[340px]">
            {permutedBits.map((bit, i) => {
              const isChanged = bit !== originalBits[i];
              return (
                <div
                  key={i}
                  className={`w-5 h-5 rounded-[3px] border-[0.5px] flex items-center justify-center text-[10px] font-mono font-medium ${
                    isChanged
                      ? 'bg-[#FEF3C7] border-[#FCD34D] text-[#92400E]'
                      : bit === '1'
                      ? 'bg-[#DBEAFE] border-[#93C5FD] text-[#1D4ED8]'
                      : 'bg-[#F1F5F9] border-[#CBD5E1] text-[#64748B]'
                  }`}
                >
                  {bit}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t-[0.5px] border-[#E2E8F0] px-4 py-2.5 flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-[3px] bg-[#FEF3C7] border-[#FCD34D]" />
          <span className="text-[11px] text-[#64748B]">Bit yang berpindah posisi</span>
        </div>
      </div>
    </div>
  );
}

// Step 3: Key Schedule with Reversed Order Table
function Step3VisualDekripsi({ currentRound, setCurrentRound, keyValue }: { currentRound: number; setCurrentRound: (n: number) => void; keyValue: string }) {
  const keyChars = keyValue.split('').slice(0, 8);
  const bits4 = ['0100', '0101', '0100', '0100', '0101', '0011', '0011', '0011'];
  const subkeyBits = Array.from({ length: 48 }, () => (Math.random() > 0.5 ? '1' : '0'));

  const getSubkeyForRound = (round: number) => {
    return 17 - round; // R1 uses K16, R2 uses K15, etc.
  };

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Pembangkitan Subkey (Urutan Terbalik)</span>
      </div>
      <div className="p-4">
        {/* Dekripsi key order */}
        <div className="bg-[#FFFBEB] border-[0.5px] border-[#FDE68A] rounded-[8px] p-4 mb-4">
          <div className="text-[12px] font-medium text-[#D97706] mb-3">Urutan Subkey pada Dekripsi (terbalik dari enkripsi)</div>
          <div className="space-y-1.5 text-[11px] text-[#92400E]">
            <div className={currentRound === 1 ? 'bg-[#FEF3C7] px-2 py-1 rounded-[6px] font-medium' : ''}>Ronde 1 → menggunakan K16</div>
            <div className={currentRound === 2 ? 'bg-[#FEF3C7] px-2 py-1 rounded-[6px] font-medium' : ''}>Ronde 2 → menggunakan K15</div>
            <div className="px-2 py-1 text-[#94A3B8]">... (ronde 3-15)</div>
            <div className={currentRound === 16 ? 'bg-[#FEF3C7] px-2 py-1 rounded-[6px] font-medium' : ''}>Ronde 16 → menggunakan K1</div>
          </div>
          <div className="mt-3 pt-3 border-t border-[#FDE68A] text-[10px] text-[#92400E]">
            💡 Subkey dibuat dengan cara yang sama, tetapi urutan pemakaian dibalik untuk membuka cipher
          </div>
        </div>

        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex rounded-[8px] border-[0.5px] border-[#E2E8F0] overflow-hidden mb-4 min-w-[280px]">
            {keyChars.map((char, i) => (
              <div
                key={i}
                className={`flex-1 py-2.5 text-center ${i < keyChars.length - 1 ? 'border-r-[0.5px] border-[#E2E8F0]' : ''}`}
              >
                <div className="text-[15px] font-medium text-[#7C3AED]">{char}</div>
                <div className="text-[9px] font-mono text-[#64748B]">{bits4[i]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-[#64748B] mb-2">
          Ronde dekripsi #{currentRound} memakai subkey K{getSubkeyForRound(currentRound)} (48-bit):
        </div>
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex flex-wrap gap-[3px] mb-3 min-w-[260px]">
            {subkeyBits.map((bit, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-[3px] border-[0.5px] flex items-center justify-center text-[10px] font-mono font-medium ${
                  bit === '1'
                    ? 'bg-[#F3E8FF] border-[#C4B5FD] text-[#7C3AED]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#94A3B8]'
                }`}
              >
                {bit}
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5 mb-3">
          <p className="text-[12px] text-[#64748B]" style={{ lineHeight: 1.6 }}>
            Key schedule membangkitkan <span className="font-medium text-[#0F172A]">16 subkey</span> (K1–K16) masing-masing <span className="font-medium text-[#0F172A]">48-bit</span>. Dekripsi menggunakan subkey dengan urutan terbalik: K16 → K15 → ... → K1.
          </p>
        </div>
      </div>

      <div className="border-t-[0.5px] border-[#E2E8F0] px-4 py-3.5">
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex flex-wrap gap-1 min-w-[280px]">
            {Array.from({ length: 16 }, (_, i) => {
              const num = i + 1;
              const isDone = num < currentRound;
              const isActive = num === currentRound;

              return (
                <button
                  key={i}
                  onClick={() => setCurrentRound(num)}
                  className={`w-7 h-7 rounded-[6px] text-[10px] font-medium border-[0.5px] transition-colors ${
                    isActive
                      ? 'bg-[#D97706] text-white border-[#D97706]'
                      : isDone
                      ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]'
                      : 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0]'
                  }`}
                >
                  K{getSubkeyForRound(num)}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 4: Feistel (Reversed)
function Step4VisualDekripsi({ currentRound, setCurrentRound }: { currentRound: number; setCurrentRound: (n: number) => void }) {
  const getSubkeyForRound = (round: number) => 17 - round;

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Ronde Feistel Terbalik #{currentRound}</span>
      </div>
      <div className="p-4 flex flex-col gap-2.5">
        {/* Dekripsi formula */}
        <div className="bg-[#FFFBEB] border-[0.5px] border-[#FDE68A] rounded-[8px] px-3 py-2.5">
          <div className="text-[11px] font-medium text-[#D97706] mb-1.5">Formula Dekripsi Feistel:</div>
          <div className="text-[12px] text-[#92400E] font-mono">R<sub>n-1</sub> = L<sub>n</sub> &nbsp;&nbsp;|&nbsp;&nbsp; L<sub>n-1</sub> = R<sub>n</sub> ⊕ F(L<sub>n</sub>, K<sub>{getSubkeyForRound(currentRound)}</sub>)</div>
          <div className="text-[10px] text-[#92400E] mt-2">Proses ini membuka cipher dengan menukar L dan R secara terbalik menggunakan subkey K16→K1</div>
        </div>

        <div className="flex flex-col md:flex-row gap-2 items-center">
          <div className="flex-1 bg-[#FFF7ED] border-[0.5px] border-[#FED7AA] rounded-[8px] px-3 py-2.5 w-full">
            <div className="text-[12px] font-medium text-[#C2410C] mb-1">R (32-bit kanan)</div>
            <div className="text-[10px] text-[#C2410C] font-mono">10110010 11001100...</div>
          </div>
          <div className="text-[16px] text-[#94A3B8]">←</div>
          <div className="flex-1 bg-[#EFF6FF] border-[0.5px] border-[#BFDBFE] rounded-[8px] px-3 py-2.5 w-full">
            <div className="text-[12px] font-medium text-[#1D4ED8] mb-1">Menjadi L baru</div>
            <div className="text-[10px] text-[#1D4ED8]">(R lama langsung jadi L)</div>
          </div>
        </div>

        <div className="flex gap-2 items-center px-1">
          <div className="w-9 h-9 rounded-full bg-[#FFFBEB] border-[0.5px] border-[#FDE68A] flex items-center justify-center text-[14px] font-semibold text-[#92400E] flex-shrink-0">
            ⊕
          </div>
          <div className="flex-1">
            <div className="text-[11px] text-[#64748B]" style={{ lineHeight: 1.5 }}>
              XOR: menggabungkan bit R dengan hasil fungsi F
            </div>
            <div className="text-[10px] font-mono text-[#94A3B8]">
              0⊕0=0&nbsp;&nbsp;&nbsp;1⊕1=0&nbsp;&nbsp;&nbsp;0⊕1=1&nbsp;&nbsp;&nbsp;1⊕0=1
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-2 items-center">
          <div className="flex-1 bg-[#EFF6FF] border-[0.5px] border-[#BFDBFE] rounded-[8px] px-3 py-2.5 w-full">
            <div className="text-[12px] font-medium text-[#1D4ED8] mb-1">L (32-bit kiri)</div>
            <div className="text-[10px] text-[#1D4ED8] font-mono">11001100 00000000...</div>
          </div>
          <div className="text-[16px] text-[#94A3B8]">←</div>
          <div className="flex-1 bg-[#FFFBEB] border-[0.5px] border-[#FDE68A] rounded-[8px] px-3 py-2.5 w-full">
            <div className="text-[12px] font-medium text-[#D97706] mb-1">Fungsi F + Subkey K{getSubkeyForRound(currentRound)}</div>
            <div className="text-[10px] text-[#D97706]">L diperluas → XOR K{getSubkeyForRound(currentRound)} → S-box → permutasi</div>
          </div>
        </div>

        <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5 mt-1">
          <p className="text-[12px] text-[#64748B]" style={{ lineHeight: 1.6 }}>
            Setiap ronde dekripsi: L lama → R baru, (R lama ⊕ F(L,K{getSubkeyForRound(currentRound)})) → L baru. Proses
            ini diulang 16 kali dengan subkey K16→K1, secara bertahap membuka cipher hingga kembali ke plaintext.
          </p>
        </div>
      </div>

      <div className="border-t-[0.5px] border-[#E2E8F0] px-4 py-3.5">
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex flex-wrap gap-1 min-w-[280px]">
            {Array.from({ length: 16 }, (_, i) => {
              const num = i + 1;
              const isDone = num < currentRound;
              const isActive = num === currentRound;

              return (
                <button
                  key={i}
                  onClick={() => setCurrentRound(num)}
                  className={`w-7 h-7 rounded-[6px] text-[10px] font-medium border-[0.5px] transition-colors ${
                    isActive
                      ? 'bg-[#D97706] text-white border-[#D97706]'
                      : isDone
                      ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]'
                      : 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0]'
                  }`}
                >
                  R{num}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 5: Inverse IP
function Step5VisualDekripsi({ plaintext }: { plaintext: string }) {
  const finalPlaintext = plaintext.padEnd(8, '\0').slice(0, 8);
  const afterBits = stringToBitArray(finalPlaintext);
  const beforeBits = DES_IP_TABLE.map((position) => afterBits[position - 1] ?? '0');

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Inverse Initial Permutation</span>
      </div>
      <div className="px-4 py-3.5">
        <div className="text-[11px] font-medium text-[#64748B] mb-2">
          Setelah 16 ronde dekripsi Feistel (belum tersusun seperti plaintext):
        </div>
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex flex-wrap gap-[3px] mb-4 min-w-[340px]">
            {beforeBits.map((bit, i) => (
              <div
                key={i}
                className={`w-5 h-5 rounded-[3px] border-[0.5px] flex items-center justify-center text-[10px] font-mono font-medium ${
                  bit === '1'
                    ? 'bg-[#DBEAFE] border-[#93C5FD] text-[#1D4ED8]'
                    : 'bg-[#F1F5F9] border-[#CBD5E1] text-[#64748B]'
                }`}
              >
                {bit}
              </div>
            ))}
          </div>
        </div>

        <div className="text-center py-2 text-[12px] text-[#15803D]">
          ↓ Tabel IP (Inverse Initial Permutation) mengembalikan ke urutan plaintext ↓
        </div>

        <div className="text-[11px] font-medium text-[#15803D] mb-2">
          Setelah IP (plaintext berhasil dikembalikan):
        </div>
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex flex-wrap gap-[3px] mb-4 min-w-[340px]">
            {afterBits.map((bit, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-[3px] border-[0.5px] bg-[#DCFCE7] border-[#86EFAC] text-[#15803D] flex items-center justify-center text-[10px] font-mono font-medium"
              >
                {bit}
              </div>
            ))}
          </div>
        </div>

        {/* Progress pipeline */}
        <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5 flex items-center justify-center gap-2 text-[11px] text-[#64748B]">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#D97706]" />
            <span>Ciphertext</span>
          </div>
          →
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#D97706]" />
            <span>IP⁻¹</span>
          </div>
          →
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#D97706]" />
            <span>16 Ronde</span>
          </div>
          →
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#D97706]" />
            <span>IP</span>
          </div>
          →
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-[#E2E8F0]" />
            <span>Plaintext</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 6: Final Plaintext Reveal
function Step6VisualDekripsi({ ciphertext, keyValue, plaintext }: { ciphertext: string; keyValue: string; plaintext: string }) {
  const navigate = useNavigate();
  const chars = plaintext.split('');
  const ascii = chars.map((char) => char.charCodeAt(0));
  const binary = chars.map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'));
  const hasPlaintext = plaintext.length > 0;

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Plaintext Berhasil Didekripsi</span>
      </div>
      <div className="p-4 md:p-6">
        {/* Reveal moment */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="bg-gradient-to-br from-[#F0FDF4] to-[#FFFBEB] border-[0.5px] border-[#86EFAC] rounded-[16px] p-6 text-center mb-6"
        >
          <div className="text-[32px] mb-3">🔓</div>
          <div className="text-[14px] text-[#15803D] font-medium mb-4">
            {hasPlaintext ? 'Plaintext berhasil didekripsi:' : 'Plaintext belum tersedia'}
          </div>

          <div className="flex justify-center gap-1.5 mb-6">
            {chars.map((char, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-[#DCFCE7] border-[0.5px] border-[#86EFAC] rounded-[8px] px-3 py-2 text-[24px] font-semibold text-[#0F172A]"
              >
                {char}
              </motion.div>
            ))}
          </div>

          <div className="text-[12px] text-[#64748B] space-y-1">
            <div>dari ciphertext: <span className="font-mono text-[#92400E]">{ciphertext.slice(0, 16) || '-'}</span></div>
            <div>menggunakan key: <span className="font-mono text-[#92400E]">{keyValue || '-'}</span></div>
          </div>
        </motion.div>

        {/* Conversion table */}
        <div className="mb-6">
          <div className="text-[11px] font-medium text-[#64748B] mb-3">Konversi Biner → ASCII → Karakter:</div>
          <div className="space-y-2">
            {chars.map((char, i) => (
              <div key={i} className="flex items-center gap-2 text-[11px]">
                <div className="font-mono text-[#1D4ED8]">{binary[i]}</div>
                <span className="text-[#64748B]">→</span>
                <div className="text-[#64748B]">{ascii[i]}</div>
                <span className="text-[#64748B]">→</span>
                <div className="font-semibold text-[#0F172A]">{char}</div>
                <div className="text-[#15803D]">✓</div>
              </div>
            ))}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-6">
          <div className="bg-[#EFF6FF] border-[0.5px] border-[#BFDBFE] rounded-[8px] p-3 text-center">
            <div className="text-[11px] text-[#1D4ED8] mb-0.5">Ciphertext</div>
            <div className="text-[18px] font-medium text-[#1D4ED8]">{ciphertext.length / 2 || 0} byte</div>
            <div className="text-[10px] text-[#94A3B8]">(input)</div>
          </div>
          <div className="bg-[#F0FDF4] border-[0.5px] border-[#86EFAC] rounded-[8px] p-3 text-center">
            <div className="text-[11px] text-[#15803D] mb-0.5">Plaintext</div>
            <div className="text-[18px] font-medium text-[#15803D]">{plaintext.length} karakter</div>
            <div className="text-[10px] text-[#94A3B8]">(output)</div>
          </div>
          <div className="bg-[#F0FDF4] border-[0.5px] border-[#86EFAC] rounded-[8px] p-3 text-center">
            <div className="text-[11px] text-[#15803D] mb-0.5">Status</div>
            <div className="text-[18px] font-medium text-[#15803D]">{hasPlaintext ? '✓ Berhasil' : 'Belum valid'}</div>
            <div className="text-[10px] text-[#94A3B8]">(valid)</div>
          </div>
        </div>

        {/* Action buttons */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(plaintext)}
            disabled={!hasPlaintext}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] bg-gradient-to-r from-[#D97706] to-[#B45309] text-white text-[13px] font-medium hover:shadow-lg hover:shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Copy className="w-3.5 h-3.5" />
            Salin Plaintext
          </button>
          <button
            onClick={() => navigate('/dekripsi/des')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] border-[0.5px] border-[#E2E8F0] bg-transparent text-[#0F172A] text-[13px] font-medium hover:bg-[#F8FAFC] transition-colors"
          >
            🔄 Dekripsi Lagi
          </button>
          <button
            onClick={() => navigate('/beranda')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] border-[0.5px] border-[#E2E8F0] bg-transparent text-[#0F172A] text-[13px] font-medium hover:bg-[#F8FAFC] transition-colors"
          >
            🏠 Ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}
