import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Edit, Lightbulb, CircleDot } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAlgorithm } from '../context/AlgorithmContext';
import { VisualisasiChaCha20Page } from './VisualisasiChaCha20Page';
import { encryptDES, getDESDetails } from '../utils/des';

const stepData = [
  {
    num: 1,
    title: 'Mengubah teks menjadi angka (biner)',
    subtitle: 'Setiap karakter diubah ke kode ASCII, lalu direpresentasikan dalam bentuk bit 0 dan 1',
    analogy: 'Bayangkan kamu ingin mengirim surat rahasia, tapi kurir hanya bisa membawa kartu angka 0 dan 1. Maka setiap huruf harus kamu ubah dulu ke kode angka sebelum dikirim.',
    why: 'DES bekerja sepenuhnya pada bit. Mengubah teks ke biner membuat setiap karakter punya bentuk tetap yang bisa dipermutasi, dibagi, dan diproses konsisten di semua ronde.',
    tagColor: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' },
  },
  {
    num: 2,
    title: 'Permutasi awal (Initial Permutation)',
    subtitle: 'Mengatur ulang urutan bit menggunakan tabel IP tanpa mengubah isi bit',
    why: 'Permutasi awal menyebarkan posisi bit sejak langkah pertama. Ini membantu DES membangun difusi, sehingga pola plaintext tidak langsung terlihat saat ronde-ronde berikutnya berjalan.',
    analogy: 'Bayangkan 64 orang berdiri berjajar dengan nomor urut. Tiba-tiba ada instruksi: orang nomor 58 pindah ke posisi 1, orang nomor 50 pindah ke posisi 2. Semua berpindah sesuai aturan tabel — tidak ada yang hilang, hanya berpindah tempat.',
    tagColor: { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D' },
  },
  {
    num: 3,
    title: 'Membuat 16 subkey dari key utama',
    subtitle: 'Key 64-bit dibagi dan dipermutasi untuk menghasilkan 16 subkey unik (masing-masing 48-bit)',
    why: 'Subkey yang berbeda di tiap ronde mencegah pola enkripsi yang berulang. Dengan begitu, hubungan antara plaintext, key utama, dan ciphertext jadi lebih sulit ditebak.',
    analogy: 'Bayangkan kamu punya 1 password utama, lalu aplikasi membuatkan 16 password turunan yang berbeda. Ronde 1 pakai turunan #1, ronde 2 pakai #2, dan seterusnya.',
    tagColor: { bg: '#F3E8FF', border: '#C4B5FD', text: '#7C3AED' },
  },
  {
    num: 4,
    title: 'Feistel Network (16 ronde enkripsi)',
    subtitle: 'Data dipecah jadi L dan R, lalu diproses bergantian 16 kali dengan subkey berbeda',
    why: 'Di sinilah kekuatan utama DES muncul. Pertukaran dan pengacakan berulang membuat perubahan kecil menyebar ke banyak posisi bit, sehingga struktur data asli makin sulit dilacak.',
    analogy: 'Bayangkan kamu dan temanmu saling bertukar isi tas sebanyak 16 kali, tapi setiap pertukaran isi tasmu diacak dulu pakai kode rahasia yang berbeda tiap putaran. Setelah 16 kali tukar, isi tas sangat berbeda dari aslinya.',
    tagColor: { bg: '#FFF7ED', border: '#FED7AA', text: '#C2410C' },
  },
  {
    num: 5,
    title: 'Avalanche Effect (efek bola salju)',
    subtitle: 'Perubahan 1 bit di plaintext mengubah lebih dari 50% bit di ciphertext',
    why: 'Avalanche effect menunjukkan bahwa DES berhasil menyamarkan pola input. Cipher yang baik harus membuat perubahan kecil pada plaintext menghasilkan output yang tampak sangat berbeda.',
    analogy: 'Bayangkan mengubah satu huruf saja di pesan asli bisa mengubah lebih dari setengah isi ciphertext — seperti efek bola salju dari perubahan yang sangat kecil.',
    tagColor: { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D' },
  },
  {
    num: 6,
    title: 'Permutasi akhir dan ciphertext',
    subtitle: 'Hasil 16 ronde dipermutasi kembali dengan tabel FP untuk menghasilkan ciphertext final',
    why: 'Permutasi akhir menempatkan hasil ronde ke format keluaran DES yang baku. Ini memastikan ciphertext bisa diproses balik dengan urutan yang benar saat dekripsi.',
    analogy: 'Setelah semua proses selesai, hasilnya dikemas ulang dalam urutan khusus dan diserahkan sebagai ciphertext. Hanya yang tahu kunci dan urutan yang sama bisa membukanya.',
    tagColor: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' },
  },
];

type DESDetails = ReturnType<typeof getDESDetails>;

function hexToBitArray(hex: string): string[] {
  const bits: string[] = [];
  for (let i = 0; i < hex.length; i++) {
    const nibble = parseInt(hex[i], 16);
    for (let j = 3; j >= 0; j--) {
      bits.push(((nibble >> j) & 1).toString());
    }
  }
  return bits;
}

function stringToBitArray(value: string): string[] {
  return Array.from(value).flatMap((char) =>
    char.charCodeAt(0).toString(2).padStart(8, '0').split('')
  );
}

function formatCharForDisplay(char: string): string {
  if (char === '\0') return '∅';
  if (char === ' ') return '␠';
  return char;
}

function formatTextForDisplay(value: string): string {
  return Array.from(value).map(formatCharForDisplay).join('');
}

function flipFirstBitOfBlock(block: string): string {
  const paddedBlock = block.padEnd(8, '\0').slice(0, 8);
  const firstCharCode = paddedBlock.charCodeAt(0) ^ 0b00000001;
  return String.fromCharCode(firstCharCode) + paddedBlock.slice(1);
}

function groupBits(bits: string[]): string {
  return bits.join('').match(/.{1,8}/g)?.join(' ') || bits.join('');
}

export function VisualisasiPage() {
  const { algorithm, plaintext, key } = useAlgorithm();
  const [currentStep, setCurrentStep] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const navigate = useNavigate();

  // If ChaCha20 is selected, show ChaCha20 visualization
  if (algorithm === 'ChaCha20') {
    return <VisualisasiChaCha20Page />;
  }

  const step = stepData[currentStep];
  const desDetails = getDESDetails(plaintext || '', key || '');

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
                  i < currentStep ? 'bg-[#2563EB]' : i === currentStep ? 'bg-[#93C5FD]' : 'bg-[#E2E8F0]'
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
            <span className="text-[11px] font-medium">Langkah {step.num}</span>
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
            {step.why}
          </p>
        </div>

        {/* Visual Card - Different per step */}
        {currentStep === 0 && <Step1Visual />}
        {currentStep === 1 && <Step2Visual plaintext={plaintext} />}
        {currentStep === 2 && <Step3Visual currentRound={currentRound} setCurrentRound={setCurrentRound} keyValue={key} desDetails={desDetails} />}
        {currentStep === 3 && <Step4Visual currentRound={currentRound} setCurrentRound={setCurrentRound} desDetails={desDetails} />}
        {currentStep === 4 && <Step5Visual plaintext={plaintext} keyValue={key} />}
        {currentStep === 5 && <Step6Visual plaintext={plaintext} keyValue={key} />}

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
              onClick={() => navigate('/enkripsi')}
              className="flex items-center gap-2 px-4 py-2 rounded-[8px] border-[0.5px] border-[#E2E8F0] bg-transparent text-[13px] text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Ubah input
            </button>
            {currentStep === 5 ? (
              <button
                onClick={() => navigate('/enkripsi')}
                className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#16A34A] text-white text-[13px] font-medium hover:bg-[#15803D] transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Selesai
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#2563EB] text-white text-[13px] font-medium hover:bg-[#1D4ED8] transition-colors"
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

// Step 1: Character conversion table
function Step1Visual() {
  const chars = ['H', 'E', 'L', 'L', 'O', '1', '2', '3'];
  const ascii = [72, 69, 76, 76, 79, 49, 50, 51];
  const binary = [
    '01001000',
    '01000101',
    '01001100',
    '01001100',
    '01001111',
    '00110001',
    '00110010',
    '00110011',
  ];

  const allBits = binary.join('').split('');

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Konversi karakter ke bit</span>
      </div>
      <div className="p-4">
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex flex-wrap gap-1.5 mb-4 min-w-[320px]">
            {chars.map((char, i) => (
              <div key={i} className="flex flex-col items-center gap-1">
                <div className="w-9 h-9 rounded-[7px] bg-[#EFF6FF] border-[0.5px] border-[#BFDBFE] flex items-center justify-center text-[15px] font-medium text-[#1D4ED8]">
                  {char}
                </div>
                <div className="text-[10px] text-[#64748B] font-mono">{ascii[i]}</div>
                <div className="text-[10px] text-[#64748B] font-mono">{binary[i]}</div>
                {i < chars.length - 1 && <span className="text-[#94A3B8]">·</span>}
              </div>
            ))}
          </div>
        </div>

        <div className="mb-3">
          <div className="text-[11px] font-medium text-[#64748B] mb-2">
            64-bit gabungan (8 karakter × 8 bit):
          </div>
          <div className="overflow-x-auto -mx-4 px-4">
            <div className="flex flex-wrap gap-[3px] min-w-[340px]">
              {allBits.map((bit, i) => (
                <div
                  key={i}
                  className={`w-5 h-5 rounded-[3px] border-[0.5px] flex items-center justify-center text-[10px] font-mono font-medium ${
                    bit === '1'
                      ? 'bg-[#DBEAFE] border-[#93C5FD] text-[#1D4ED8]'
                      : 'bg-[#F1F5F9] border-[#CBD5E1] text-[#64748B]'
                  } ${(i + 1) % 8 === 0 && i !== 63 ? 'mr-1.5' : ''}`}
                >
                  {bit}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="border-t-[0.5px] border-[#E2E8F0] px-4 py-2.5 flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-[3px] bg-[#DBEAFE] border-[#93C5FD]" />
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

// Step 2: Permutation before/after
function Step2VisualLegacy() {
  const originalBits = Array.from({ length: 64 }, () => (Math.random() > 0.5 ? '1' : '0'));
  const changedIndices = new Set([5, 12, 19, 23, 28, 34, 41, 47, 52, 56, 60, 63, 7, 15, 30, 45]);

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Permutasi bit</span>
      </div>
      <div className="px-4 py-3.5">
        <div className="text-[11px] font-medium text-[#64748B] mb-2">
          Sebelum permutasi (plaintext asli):
        </div>
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex flex-wrap gap-[3px] mb-4 min-w-[340px]">
            {originalBits.map((bit, i) => (
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

        <div className="text-center py-2 text-[12px] text-[#64748B]">
          ↓ tabel IP mengatur ulang urutan bit ↓
        </div>

        <div className="text-[11px] font-medium text-[#64748B] mb-2">
          Setelah permutasi (urutan berubah, isi tetap sama):
        </div>
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex flex-wrap gap-[3px] min-w-[340px]">
            {originalBits.map((bit, i) => {
              const isChanged = changedIndices.has(i);
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
          <div className="w-3.5 h-3.5 rounded-[3px] bg-[#DBEAFE] border-[#93C5FD]" />
          <span className="text-[11px] text-[#64748B]">Bit 1</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-[3px] bg-[#F1F5F9] border-[#CBD5E1]" />
          <span className="text-[11px] text-[#64748B]">Bit 0</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-[3px] bg-[#FEF3C7] border-[#FCD34D]" />
          <span className="text-[11px] text-[#64748B]">Bit yang berpindah posisi</span>
        </div>
      </div>
    </div>
  );
}

// Step 2: Initial permutation bit map
function Step2Visual({ plaintext }: { plaintext: string }) {
  const [activeIndex, setActiveIndex] = useState(0);

  const ipTable = [
    58, 50, 42, 34, 26, 18, 10, 2,
    60, 52, 44, 36, 28, 20, 12, 4,
    62, 54, 46, 38, 30, 22, 14, 6,
    64, 56, 48, 40, 32, 24, 16, 8,
    57, 49, 41, 33, 25, 17, 9, 1,
    59, 51, 43, 35, 27, 19, 11, 3,
    61, 53, 45, 37, 29, 21, 13, 5,
    63, 55, 47, 39, 31, 23, 15, 7,
  ];

  const paddedPlaintext = (plaintext || '').padEnd(8, '\0').slice(0, 8);
  const originalBits = Array.from(paddedPlaintext).flatMap((char) =>
    char.charCodeAt(0).toString(2).padStart(8, '0').split('')
  );
  const permutedBits = ipTable.map((sourcePosition) => originalBits[sourcePosition - 1]);
  const sourcePosition = ipTable[activeIndex];

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Peta perpindahan bit tabel IP</span>
      </div>
      <div className="px-4 py-4">
        <div className="text-[11px] font-medium text-[#64748B] mb-3">
          Hasil Initial Permutation untuk 64 bit pertama plaintext:
        </div>

        <div className="flex justify-center">
          <div className="flex flex-wrap gap-[5px] w-[211px]">
            {permutedBits.map((bit, i) => {
              const isActive = i === activeIndex;

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  className={`w-[22px] h-[22px] rounded-[4px] flex items-center justify-center text-[11px] font-mono font-bold transition-colors ${
                    isActive
                      ? 'bg-[#2563EB] text-white'
                      : bit === '1'
                      ? 'bg-[#EFF6FF] text-[#1D4ED8] border-[0.5px] border-[#BFDBFE]'
                      : 'bg-[#F1F5F9] text-[#94A3B8] border-[0.5px] border-[#E2E8F0]'
                  }`}
                  title={`Posisi ${i + 1} mengambil bit dari posisi ${ipTable[i]}`}
                >
                  {bit}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 border-l-[2px] border-[#2563EB] bg-[#EFF6FF] rounded-l-none rounded-r-[6px] px-3 py-2.5">
          <p className="text-[12px] text-[#1D4ED8]" style={{ lineHeight: 1.6 }}>
            Bit di posisi {activeIndex + 1} berpindah dari posisi asalnya sesuai tabel IP. Warna biru = bit yang bergerak.
          </p>
          <p className="text-[12px] text-[#1D4ED8]/80 mt-1" style={{ lineHeight: 1.6 }}>
            Pada contoh ini, posisi {activeIndex + 1} mengambil nilai dari bit ke-{sourcePosition}.
          </p>
        </div>
      </div>
    </div>
  );
}

// Step 3: Key schedule
function Step3VisualLegacy({ currentRound, setCurrentRound }: { currentRound: number; setCurrentRound: (n: number) => void }) {
  const keyChars = ['M', 'Y', 'K', 'E', 'Y', '1', '2', '3'];
  const bits4 = ['0100', '0101', '0100', '0100', '0101', '0011', '0011', '0011'];
  const subkeyBits = Array.from({ length: 48 }, () => (Math.random() > 0.5 ? '1' : '0'));

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Pembangkitan subkey</span>
      </div>
      <div className="p-4">
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
          Subkey K{currentRound} yang dipakai di ronde {currentRound === 1 ? 'pertama' : currentRound} (48-bit):
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
            Total: <span className="font-medium text-[#0F172A]">16 subkey</span> dibuat (K1–K16),
            masing-masing <span className="font-medium text-[#0F172A]">48-bit</span>. Setiap subkey
            dipakai sekali per ronde.
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
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : isDone
                      ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]'
                      : 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0]'
                  }`}
                >
                  K{num}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 4: Feistel round diagram
function Step4VisualLegacy({ currentRound, setCurrentRound }: { currentRound: number; setCurrentRound: (n: number) => void }) {
  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Ronde Feistel #{currentRound}</span>
      </div>
      <div className="p-4 flex flex-col gap-2.5">
        <div className="flex flex-col md:flex-row gap-2 items-center">
          <div className="flex-1 bg-[#EFF6FF] border-[0.5px] border-[#BFDBFE] rounded-[8px] px-3 py-2.5 w-full">
            <div className="text-[12px] font-medium text-[#1D4ED8] mb-1">L (32-bit kiri)</div>
            <div className="text-[10px] text-[#1D4ED8] font-mono">11001100 01010101...</div>
          </div>
          <div className="text-[16px] text-[#94A3B8]">⟶</div>
          <div className="flex-1 bg-[#FFF7ED] border-[0.5px] border-[#FED7AA] rounded-[8px] px-3 py-2.5 w-full">
            <div className="text-[12px] font-medium text-[#C2410C] mb-1">Menjadi R baru</div>
            <div className="text-[10px] text-[#C2410C]">(L lama tidak diubah dulu)</div>
          </div>
        </div>

        <div className="flex gap-2 items-center px-1">
          <div className="w-9 h-9 rounded-full bg-[#FFFBEB] border-[0.5px] border-[#FDE68A] flex items-center justify-center text-[14px] font-semibold text-[#92400E] flex-shrink-0">
            ⊕
          </div>
          <div className="flex-1">
            <div className="text-[11px] text-[#64748B]" style={{ lineHeight: 1.5 }}>
              XOR: menggabungkan bit L dengan hasil fungsi F
            </div>
            <div className="text-[10px] font-mono text-[#94A3B8]">
              0⊕0=0&nbsp;&nbsp;&nbsp;1⊕1=0&nbsp;&nbsp;&nbsp;0⊕1=1&nbsp;&nbsp;&nbsp;1⊕0=1
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-2 items-center">
          <div className="flex-1 bg-[#F0FDF4] border-[0.5px] border-[#86EFAC] rounded-[8px] px-3 py-2.5 w-full">
            <div className="text-[12px] font-medium text-[#15803D] mb-1">R (32-bit kanan)</div>
            <div className="text-[10px] text-[#15803D] font-mono">10110010 11001100...</div>
          </div>
          <div className="text-[16px] text-[#94A3B8]">⟶</div>
          <div className="flex-1 bg-[#F3E8FF] border-[0.5px] border-[#C4B5FD] rounded-[8px] px-3 py-2.5 w-full">
            <div className="text-[12px] font-medium text-[#7C3AED] mb-1">Fungsi F + Subkey K{currentRound}</div>
            <div className="text-[10px] text-[#7C3AED]">R diperluas → XOR K{currentRound} → S-box → permutasi</div>
          </div>
        </div>

        <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5 mt-1">
          <p className="text-[12px] text-[#64748B]" style={{ lineHeight: 1.6 }}>
            Hasil setelah satu ronde: R lama → L baru, (L lama ⊕ F(R,K{currentRound})) → R baru. Proses
            ini diulang 16 kali dengan subkey yang berbeda.
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
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
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

// Step 5: Avalanche Effect
function Step5VisualLegacy() {
  const bitsA = Array.from({ length: 64 }, () => (Math.random() > 0.5 ? '1' : '0'));
  const bitsB = bitsA.map((bit, i) => (Math.random() > 0.53 ? (bit === '1' ? '0' : '1') : bit));
  let diffCount = 0;
  bitsA.forEach((bit, i) => {
    if (bit !== bitsB[i]) diffCount++;
  });
  const percentage = Math.round((diffCount / 64) * 100);

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Efek avalanche</span>
      </div>
      <div className="p-3.5 grid grid-cols-1 md:grid-cols-2 gap-2.5">
        <div>
          <div className="text-[11px] font-medium text-[#64748B] mb-2">
            Plaintext: "HELLO123" → Ciphertext A
          </div>
          <div className="overflow-x-auto -mx-3.5 px-3.5">
            <div className="flex flex-wrap gap-[2px] mb-2 min-w-[280px]">
              {bitsA.map((bit, i) => {
                const same = bit === bitsB[i];
                return (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-[3px] border-[0.5px] flex items-center justify-center text-[10px] font-mono ${
                      same
                        ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#15803D]'
                        : 'bg-[#FEE2E2] border-[#FCA5A5] text-[#DC2626]'
                    }`}
                  >
                    {bit}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-[12px] text-[#64748B]">
            Hex: <span className="font-medium text-[#0F172A]">A3F48C2DB1E79A40</span>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-medium text-[#64748B] mb-2">
            Plaintext: "HELLO223" → Ciphertext B
          </div>
          <div className="overflow-x-auto -mx-3.5 px-3.5">
            <div className="flex flex-wrap gap-[2px] mb-2 min-w-[280px]">
              {bitsB.map((bit, i) => {
                const same = bit === bitsA[i];
                return (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-[3px] border-[0.5px] flex items-center justify-center text-[10px] font-mono ${
                      same
                        ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#15803D]'
                        : 'bg-[#FEE2E2] border-[#FCA5A5] text-[#DC2626]'
                    }`}
                  >
                    {bit}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-[12px] text-[#64748B]">
            Hex: <span className="font-medium text-[#0F172A]">7E921DB4F5C3A068</span>
          </div>
        </div>
      </div>

      <div className="px-3.5 pb-3.5">
        <div className="bg-[#F0FDF4] border-[0.5px] border-[#86EFAC] rounded-[8px] px-3 py-3">
          <p className="text-[12px] text-[#15803D]" style={{ lineHeight: 1.65 }}>
            Hanya 1 karakter berbeda ("1" → "2"), tapi{' '}
            <span className="font-medium">{diffCount} dari 64 bit ({percentage}%)</span> ciphertext
            berubah. Ini disebut <span className="font-medium">Avalanche Effect</span> — tanda
            enkripsi bekerja dengan baik.
          </p>
        </div>
      </div>

      <div className="border-t-[0.5px] border-[#E2E8F0] px-4 py-2.5 flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-[3px] bg-[#DCFCE7] border-[#86EFAC]" />
          <span className="text-[11px] text-[#64748B]">Bit sama</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-[3px] bg-[#FEE2E2] border-[#FCA5A5]" />
          <span className="text-[11px] text-[#64748B]">Bit berbeda</span>
        </div>
      </div>
    </div>
  );
}

// Step 3: Key schedule
function Step3Visual({
  currentRound,
  setCurrentRound,
  keyValue,
  desDetails,
}: {
  currentRound: number;
  setCurrentRound: (n: number) => void;
  keyValue: string;
  desDetails: DESDetails;
}) {
  const keyChars = keyValue.padEnd(8, '\0').slice(0, 8).split('');
  const keyBits = keyChars.map((char) => char.charCodeAt(0).toString(2).padStart(8, '0'));
  const subkeyHex = desDetails.rounds[currentRound - 1]?.subkey ?? '';
  const subkeyBits = hexToBitArray(subkeyHex);

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Pembangkitan subkey</span>
      </div>
      <div className="p-4">
        <div className="overflow-x-auto -mx-4 px-4">
          <div className="flex rounded-[8px] border-[0.5px] border-[#E2E8F0] overflow-hidden mb-4 min-w-[320px]">
            {keyChars.map((char, i) => (
              <div
                key={i}
                className={`flex-1 py-2.5 px-1 text-center ${i < keyChars.length - 1 ? 'border-r-[0.5px] border-[#E2E8F0]' : ''}`}
              >
                <div className="text-[15px] font-medium text-[#7C3AED]">{formatCharForDisplay(char)}</div>
                <div className="text-[9px] font-mono text-[#64748B]">{keyBits[i]}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="text-[11px] text-[#64748B] mb-2">
          Subkey K{currentRound} yang dipakai di ronde {currentRound === 1 ? 'pertama' : currentRound} (48-bit):
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
            Key user <span className="font-medium text-[#0F172A]">"{formatTextForDisplay(keyValue.padEnd(8, '\0').slice(0, 8))}"</span>{' '}
            diubah menjadi 16 subkey unik. Pada ronde ini, nilai subkey riil yang dipakai adalah{' '}
            <span className="font-medium text-[#0F172A]">{subkeyHex}</span>.
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
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
                      : isDone
                      ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]'
                      : 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0]'
                  }`}
                >
                  K{num}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

// Step 4: Feistel round diagram
function Step4Visual({
  currentRound,
  setCurrentRound,
  desDetails,
}: {
  currentRound: number;
  setCurrentRound: (n: number) => void;
  desDetails: DESDetails;
}) {
  const roundData = desDetails.rounds[currentRound - 1];
  const leftBits = hexToBitArray(roundData?.L ?? '');
  const rightBits = hexToBitArray(roundData?.R ?? '');
  const newLeftBits = hexToBitArray(roundData?.newL ?? '');
  const newRightBits = hexToBitArray(roundData?.newR ?? '');

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Ronde Feistel #{currentRound}</span>
      </div>
      <div className="p-4 flex flex-col gap-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-[#EFF6FF] border-[0.5px] border-[#BFDBFE] rounded-[8px] px-3 py-3">
            <div className="text-[12px] font-medium text-[#1D4ED8] mb-1">L{currentRound - 1} / blok kiri sebelum ronde</div>
            <div className="text-[12px] font-mono text-[#1D4ED8] mb-1">{roundData.L}</div>
            <div className="text-[10px] font-mono text-[#64748B]">{groupBits(leftBits)}</div>
          </div>
          <div className="bg-[#F0FDF4] border-[0.5px] border-[#86EFAC] rounded-[8px] px-3 py-3">
            <div className="text-[12px] font-medium text-[#15803D] mb-1">R{currentRound - 1} / blok kanan sebelum ronde</div>
            <div className="text-[12px] font-mono text-[#15803D] mb-1">{roundData.R}</div>
            <div className="text-[10px] font-mono text-[#64748B]">{groupBits(rightBits)}</div>
          </div>
        </div>

        <div className="bg-[#F3E8FF] border-[0.5px] border-[#C4B5FD] rounded-[8px] px-3 py-2.5">
          <div className="text-[12px] font-medium text-[#7C3AED] mb-1">Subkey K{currentRound}</div>
          <div className="text-[12px] font-mono text-[#7C3AED] mb-1">{roundData.subkey}</div>
          <div className="text-[10px] font-mono text-[#64748B]">{groupBits(hexToBitArray(roundData.subkey))}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-[#FFF7ED] border-[0.5px] border-[#FED7AA] rounded-[8px] px-3 py-3">
            <div className="text-[12px] font-medium text-[#C2410C] mb-1">L{currentRound} / hasil tukar</div>
            <div className="text-[12px] font-mono text-[#C2410C] mb-1">{roundData.newL}</div>
            <div className="text-[10px] font-mono text-[#64748B]">{groupBits(newLeftBits)}</div>
          </div>
          <div className="bg-[#FFFBEB] border-[0.5px] border-[#FDE68A] rounded-[8px] px-3 py-3">
            <div className="text-[12px] font-medium text-[#92400E] mb-1">R{currentRound} / hasil XOR dengan F</div>
            <div className="text-[12px] font-mono text-[#92400E] mb-1">{roundData.newR}</div>
            <div className="text-[10px] font-mono text-[#64748B]">{groupBits(newRightBits)}</div>
          </div>
        </div>

        <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5">
          <p className="text-[12px] text-[#64748B]" style={{ lineHeight: 1.6 }}>
            Pada ronde {currentRound}, nilai kiri lama menjadi kanan baru setelah fungsi F dan XOR diterapkan dengan subkey K{currentRound}.
            Nilai riil per ronde sekarang mengikuti plaintext dan key yang user masukkan.
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
                      ? 'bg-[#2563EB] text-white border-[#2563EB]'
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

// Step 5: Avalanche Effect
function Step5Visual({ plaintext, keyValue }: { plaintext: string; keyValue: string }) {
  const baseBlock = (plaintext || '').padEnd(8, '\0').slice(0, 8);
  const variantBlock = flipFirstBitOfBlock(baseBlock);
  const ciphertextA = encryptDES(baseBlock, keyValue || '');
  const ciphertextB = encryptDES(variantBlock, keyValue || '');
  const bitsA = hexToBitArray(ciphertextA);
  const bitsB = hexToBitArray(ciphertextB);
  const diffCount = bitsA.filter((bit, i) => bit !== bitsB[i]).length;
  const percentage = Math.round((diffCount / Math.max(bitsA.length, 1)) * 100);
  const isTruncated = (plaintext || '').length > 8;

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Efek avalanche</span>
      </div>
      <div className="p-3.5 grid grid-cols-1 md:grid-cols-2 gap-2.5">
        <div>
          <div className="text-[11px] font-medium text-[#64748B] mb-2">
            Plaintext user → Ciphertext A
          </div>
          <div className="text-[12px] text-[#0F172A] mb-2 font-mono">
            "{formatTextForDisplay(baseBlock)}"
          </div>
          <div className="overflow-x-auto -mx-3.5 px-3.5">
            <div className="flex flex-wrap gap-[2px] mb-2 min-w-[280px]">
              {bitsA.map((bit, i) => {
                const same = bit === bitsB[i];
                return (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-[3px] border-[0.5px] flex items-center justify-center text-[10px] font-mono ${
                      same
                        ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#15803D]'
                        : 'bg-[#FEE2E2] border-[#FCA5A5] text-[#DC2626]'
                    }`}
                  >
                    {bit}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-[12px] text-[#64748B]">
            Hex: <span className="font-medium text-[#0F172A]">{ciphertextA}</span>
          </div>
        </div>

        <div>
          <div className="text-[11px] font-medium text-[#64748B] mb-2">
            Plaintext dengan 1 bit dibalik → Ciphertext B
          </div>
          <div className="text-[12px] text-[#0F172A] mb-2 font-mono">
            "{formatTextForDisplay(variantBlock)}"
          </div>
          <div className="overflow-x-auto -mx-3.5 px-3.5">
            <div className="flex flex-wrap gap-[2px] mb-2 min-w-[280px]">
              {bitsB.map((bit, i) => {
                const same = bit === bitsA[i];
                return (
                  <div
                    key={i}
                    className={`w-4 h-4 rounded-[3px] border-[0.5px] flex items-center justify-center text-[10px] font-mono ${
                      same
                        ? 'bg-[#DCFCE7] border-[#86EFAC] text-[#15803D]'
                        : 'bg-[#FEE2E2] border-[#FCA5A5] text-[#DC2626]'
                    }`}
                  >
                    {bit}
                  </div>
                );
              })}
            </div>
          </div>
          <div className="text-[12px] text-[#64748B]">
            Hex: <span className="font-medium text-[#0F172A]">{ciphertextB}</span>
          </div>
        </div>
      </div>

      <div className="px-3.5 pb-3.5">
        <div className="bg-[#F0FDF4] border-[0.5px] border-[#86EFAC] rounded-[8px] px-3 py-3">
          <p className="text-[12px] text-[#15803D]" style={{ lineHeight: 1.65 }}>
            Dengan membalik 1 bit pada blok plaintext yang sama, <span className="font-medium">{diffCount} dari 64 bit ({percentage}%)</span>{' '}
            ciphertext ikut berubah. Ini dihitung dari input user yang sedang divisualisasikan.
          </p>
          {isTruncated && (
            <p className="text-[11px] text-[#15803D]/80 mt-2" style={{ lineHeight: 1.6 }}>
              Catatan: visualisasi DES bekerja pada 1 blok (8 karakter pertama), jadi avalanche dihitung dari blok pertama input.
            </p>
          )}
        </div>
      </div>

      <div className="border-t-[0.5px] border-[#E2E8F0] px-4 py-2.5 flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-[3px] bg-[#DCFCE7] border-[#86EFAC]" />
          <span className="text-[11px] text-[#64748B]">Bit sama</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-[3px] bg-[#FEE2E2] border-[#FCA5A5]" />
          <span className="text-[11px] text-[#64748B]">Bit berbeda</span>
        </div>
      </div>
    </div>
  );
}

// Step 6: Final output
function Step6Visual({ plaintext, keyValue }: { plaintext: string; keyValue: string }) {
  // Get real DES encryption result
  const desDetails = getDESDetails(plaintext, keyValue);
  const ciphertextHex = desDetails.finalCiphertext;

  // Convert hex to bits for visualization
  const hexToBits = (hex: string): string[] => {
    const bits: string[] = [];
    for (let i = 0; i < hex.length; i++) {
      const nibble = parseInt(hex[i], 16);
      for (let j = 3; j >= 0; j--) {
        bits.push(((nibble >> j) & 1).toString());
      }
    }
    return bits;
  };

  const finalBits = hexToBits(ciphertextHex);

  // Format hex with spaces for display
  const formatHex = (hex: string): string => {
    return hex.match(/.{1,4}/g)?.join(' ') || hex;
  };

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Output final</span>
      </div>
      <div className="p-4 text-center">
        <div className="text-[12px] text-[#64748B] mb-2">Ciphertext (format Hexadecimal):</div>
        <div className="bg-[#EFF6FF] border-[0.5px] border-[#BFDBFE] rounded-[10px] px-5 py-3.5 inline-block mb-3">
          <div className="text-[20px] font-medium font-mono text-[#1D4ED8]" style={{ letterSpacing: '0.08em' }}>
            {formatHex(ciphertextHex)}
          </div>
        </div>
        <p className="text-[12px] text-[#64748B] mb-4 max-w-lg mx-auto" style={{ lineHeight: 1.6 }}>
          64-bit hasil enkripsi direpresentasikan sebagai 16 karakter heksadesimal. Hanya bisa
          dikembalikan ke "{plaintext}" menggunakan key "{keyValue}" yang sama.
        </p>

        <div className="text-[11px] font-medium text-[#64748B] mb-2 text-left">
          Bit ciphertext final (64-bit):
        </div>
        <div className="overflow-x-auto -mx-4 px-4 mb-4">
          <div className="flex flex-wrap gap-[3px] min-w-[340px]">
            {finalBits.slice(0, 64).map((bit, i) => (
              <div
                key={i}
                className="w-5 h-5 rounded-[3px] border-[0.5px] bg-[#DCFCE7] border-[#86EFAC] text-[#15803D] flex items-center justify-center text-[10px] font-mono font-medium"
              >
                {bit}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 px-4">
          <div className="bg-[#F0FDF4] border-[0.5px] border-[#86EFAC] rounded-[8px] px-3 py-2.5 text-center">
            <div className="text-[11px] text-[#15803D] mb-0.5">Total ronde</div>
            <div className="text-[18px] font-medium text-[#15803D]">16</div>
          </div>
          <div className="bg-[#EFF6FF] border-[0.5px] border-[#BFDBFE] rounded-[8px] px-3 py-2.5 text-center">
            <div className="text-[11px] text-[#1D4ED8] mb-0.5">Ukuran blok</div>
            <div className="text-[18px] font-medium text-[#1D4ED8]">64 bit</div>
          </div>
          <div className="bg-[#F3E8FF] border-[0.5px] border-[#C4B5FD] rounded-[8px] px-3 py-2.5 text-center">
            <div className="text-[11px] text-[#7C3AED] mb-0.5">Panjang key</div>
            <div className="text-[18px] font-medium text-[#7C3AED]">56 bit</div>
          </div>
        </div>
      </div>
    </div>
  );
}
