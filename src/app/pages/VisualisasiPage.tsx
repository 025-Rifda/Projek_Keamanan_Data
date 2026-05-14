import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Edit, Lightbulb, CircleDot, AlertCircle, Info } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAlgorithm } from '../context/AlgorithmContext';
import { VisualisasiChaCha20Page } from './VisualisasiChaCha20Page';
import {
  calculateDESAvalanche,
  DES_INITIAL_PERMUTATION_TABLE,
  formatBinaryGroups,
  getDESDetails,
  type DESAvalancheResult,
  type DESDetails,
} from '../utils/des';
import { validateDESEncryptInput } from '../utils/validation';

const stepData = [
  {
    num: 1,
    title: 'Mengubah teks menjadi biner',
    subtitle: 'Setiap 8 byte plaintext dipecah menjadi 64 bit sebelum masuk ke DES.',
    analogy: 'Bayangkan setiap huruf harus diubah dulu jadi kartu angka 0 dan 1 agar mesin DES bisa membacanya.',
    why: 'DES bekerja penuh pada bit. Karena itu, plaintext perlu diubah ke representasi 64-bit yang stabil sebelum permutasi dan ronde Feistel dimulai.',
    tagColor: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' },
  },
  {
    num: 2,
    title: 'Initial Permutation (IP)',
    subtitle: '64 bit plaintext diatur ulang sesuai tabel IP tanpa mengubah nilainya.',
    analogy: 'Bit-bit ini seperti 64 orang yang diminta pindah posisi mengikuti daftar kursi baru.',
    why: 'Permutasi awal menyebarkan posisi bit sejak awal agar difusi DES dimulai sebelum ronde pertama.',
    tagColor: { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D' },
  },
  {
    num: 3,
    title: 'Key Schedule dan 16 Subkey',
    subtitle: 'Key 64-bit diproses lewat PC-1, shift kiri, dan PC-2 untuk membentuk K1 sampai K16.',
    analogy: 'Satu kunci utama diputar dan dipotong berkali-kali sampai terbentuk 16 kunci turunan dengan urutan berbeda.',
    why: 'Subkey yang berubah di tiap ronde membuat relasi antara plaintext dan ciphertext jauh lebih sulit ditebak.',
    tagColor: { bg: '#F3E8FF', border: '#C4B5FD', text: '#7C3AED' },
  },
  {
    num: 4,
    title: '16 Ronde Feistel',
    subtitle: 'Setiap ronde menghitung E, XOR, S-Box, P, lalu membentuk L_i dan R_i baru.',
    analogy: 'Setiap putaran mengacak sisi kanan, mencampurnya dengan subkey, lalu menukar posisinya dengan sisi kiri.',
    why: 'Inilah inti DES. Pengacakan berulang membuat perubahan kecil pada input menyebar ke banyak posisi bit.',
    tagColor: { bg: '#FFF7ED', border: '#FED7AA', text: '#C2410C' },
  },
  {
    num: 5,
    title: 'Avalanche Effect',
    subtitle: '1 bit plaintext dibalik lalu dibandingkan dampaknya terhadap ciphertext.',
    analogy: 'Seperti mendorong domino pertama dan melihat berapa banyak domino lain yang ikut berubah.',
    why: 'Cipher yang baik harus memperlihatkan efek perubahan besar meski perubahan pada input sangat kecil.',
    tagColor: { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D' },
  },
  {
    num: 6,
    title: 'Final Swap, FP, dan Ciphertext',
    subtitle: 'Setelah 16 ronde, blok ditukar lalu dipermutasi akhir untuk menghasilkan ciphertext.',
    analogy: 'Setelah semua pencampuran selesai, hasilnya disusun ulang sekali lagi sebelum keluar sebagai pesan rahasia.',
    why: 'Final swap dan final permutation menutup struktur DES dan menghasilkan blok keluaran 64-bit yang baku.',
    tagColor: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' },
  },
];

function formatChar(char: string): string {
  if (char === '\0') return '∅';
  if (char === ' ') return '␠';
  return char;
}

function parseBitString(bitString: string): string[] {
  return bitString.split('');
}

function renderBitColor(bit: string, isActive = false, isAccent = false) {
  if (isActive) {
    return 'bg-[#2563EB] text-white';
  }

  if (isAccent && bit === '1') {
    return 'bg-[#EFF6FF] text-[#1D4ED8] border-[0.5px] border-[#BFDBFE]';
  }

  if (bit === '1') {
    return 'bg-[#DBEAFE] text-[#1D4ED8] border-[0.5px] border-[#93C5FD]';
  }

  return 'bg-[#F1F5F9] text-[#94A3B8] border-[0.5px] border-[#E2E8F0]';
}

function StepStateNotice({ title, text, tone = 'default' }: { title: string; text: string; tone?: 'default' | 'error' }) {
  const toneClass = tone === 'error'
    ? 'bg-red-50 border-red-200 text-red-700'
    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]';

  return (
    <div className={`border rounded-[12px] p-5 ${toneClass}`}>
      <div className="flex items-start gap-3">
        {tone === 'error' ? (
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
        ) : (
          <Info className="w-5 h-5 flex-shrink-0 mt-0.5 text-[#2563EB]" />
        )}
        <div>
          <div className="text-[13px] font-medium text-[#0F172A] mb-1">{title}</div>
          <p className="text-[12px]" style={{ lineHeight: 1.6 }}>
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

function Step1Visual({ details }: { details: DESDetails }) {
  const chars = details.inputText.padEnd(8, '\0').slice(0, 8).split('');
  const ascii = chars.map((char) => char.charCodeAt(0));
  const bytes = details.inputBits.match(/.{1,8}/g) ?? [];

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Konversi plaintext ke 64 bit</span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {chars.map((char, index) => (
            <div key={`${char}-${index}`} className="bg-[#F8FAFC] border-[0.5px] border-[#E2E8F0] rounded-[8px] px-3 py-2.5">
              <div className="text-[18px] font-medium text-[#1D4ED8] mb-1">{formatChar(char)}</div>
              <div className="text-[10px] text-[#64748B] mb-1">ASCII: {ascii[index]}</div>
              <div className="text-[11px] font-mono text-[#0F172A]">{bytes[index]}</div>
            </div>
          ))}
        </div>

        <div className="text-[11px] font-medium text-[#64748B] mb-2">Binary plaintext (64 bit)</div>
        <div className="bg-[#EFF6FF] border-[0.5px] border-[#BFDBFE] rounded-[10px] px-3 py-3 text-[12px] font-mono text-[#1D4ED8] break-all">
          {formatBinaryGroups(details.inputBits, 8)}
        </div>
      </div>
    </div>
  );
}

function Step2Visual({ details }: { details: DESDetails }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const bits = parseBitString(details.initialPermutationBits);
  const sourcePosition = DES_INITIAL_PERMUTATION_TABLE[activeIndex];

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Hasil Initial Permutation</span>
      </div>
      <div className="px-4 py-4">
        <div className="flex justify-center">
          <div className="flex flex-wrap gap-[5px] w-[211px]">
            {bits.map((bit, index) => (
              <button
                key={index}
                type="button"
                onClick={() => setActiveIndex(index)}
                title={`Posisi ${index + 1} mengambil bit dari posisi ${DES_INITIAL_PERMUTATION_TABLE[index]}`}
                className={`w-[22px] h-[22px] rounded-[4px] flex items-center justify-center text-[11px] font-mono font-bold transition-colors ${renderBitColor(bit, index === activeIndex, true)}`}
              >
                {bit}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 border-l-[2px] border-[#2563EB] bg-[#EFF6FF] rounded-l-none rounded-r-[6px] px-3 py-2.5">
          <p className="text-[12px] text-[#1D4ED8]" style={{ lineHeight: 1.6 }}>
            Bit di posisi {activeIndex + 1} berpindah dari posisi {sourcePosition} sesuai tabel IP. Warna biru = bit yang sedang difokuskan.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
          <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5">
            <div className="text-[11px] text-[#64748B] mb-1">L0</div>
            <div className="text-[12px] font-mono text-[#0F172A]">{details.l0}</div>
          </div>
          <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5">
            <div className="text-[11px] text-[#64748B] mb-1">R0</div>
            <div className="text-[12px] font-mono text-[#0F172A]">{details.r0}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Step3Visual({
  currentRound,
  setCurrentRound,
  details,
}: {
  currentRound: number;
  setCurrentRound: (round: number) => void;
  details: DESDetails;
}) {
  const schedule = details.keySchedule[currentRound - 1];

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Key schedule ronde {currentRound}</span>
      </div>
      <div className="p-4">
        <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5 mb-3">
          <div className="text-[11px] text-[#64748B] mb-1">Binary key (64 bit)</div>
          <div className="text-[12px] font-mono text-[#0F172A] break-all">{formatBinaryGroups(details.keyBits, 8)}</div>
        </div>

        <div className="bg-[#EFF6FF] border-[0.5px] border-[#BFDBFE] rounded-[8px] px-3 py-2.5 mb-3">
          <div className="text-[11px] text-[#1D4ED8] mb-1">PC-1 output (56 bit)</div>
          <div className="text-[12px] font-mono text-[#1D4ED8] break-all">{formatBinaryGroups(details.keyAfterPc1, 7)}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
          <div className="bg-[#F3E8FF] border-[0.5px] border-[#C4B5FD] rounded-[8px] px-3 py-2.5">
            <div className="text-[11px] text-[#7C3AED] mb-1">C{currentRound} setelah shift {schedule.shift}</div>
            <div className="text-[11px] font-mono text-[#4C1D95] break-all">{formatBinaryGroups(schedule.c, 7)}</div>
          </div>
          <div className="bg-[#F3E8FF] border-[0.5px] border-[#C4B5FD] rounded-[8px] px-3 py-2.5">
            <div className="text-[11px] text-[#7C3AED] mb-1">D{currentRound} setelah shift {schedule.shift}</div>
            <div className="text-[11px] font-mono text-[#4C1D95] break-all">{formatBinaryGroups(schedule.d, 7)}</div>
          </div>
        </div>

        <div className="bg-[#FFF7ED] border-[0.5px] border-[#FED7AA] rounded-[8px] px-3 py-2.5">
          <div className="text-[11px] text-[#C2410C] mb-1">Subkey K{currentRound} (48 bit hasil PC-2)</div>
          <div className="text-[12px] font-mono text-[#C2410C] mb-1">{schedule.subkey}</div>
          <div className="text-[11px] font-mono text-[#92400E] break-all">{formatBinaryGroups(schedule.subkey, 6)}</div>
        </div>
      </div>

      <div className="border-t-[0.5px] border-[#E2E8F0] px-4 py-3.5">
        <div className="flex flex-wrap gap-1">
          {details.keySchedule.map((item) => (
            <button
              key={item.round}
              onClick={() => setCurrentRound(item.round)}
              className={`px-2.5 py-1.5 rounded-[6px] text-[10px] font-medium border-[0.5px] transition-colors ${
                item.round === currentRound
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-[#EFF6FF]'
              }`}
            >
              K{item.round}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step4Visual({
  currentRound,
  setCurrentRound,
  details,
}: {
  currentRound: number;
  setCurrentRound: (round: number) => void;
  details: DESDetails;
}) {
  const round = details.rounds[currentRound - 1];

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Detail ronde Feistel {currentRound}</span>
      </div>
      <div className="p-4 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-[#EFF6FF] border-[0.5px] border-[#BFDBFE] rounded-[8px] px-3 py-2.5">
            <div className="text-[11px] text-[#1D4ED8] mb-1">L{currentRound - 1}</div>
            <div className="text-[12px] font-mono text-[#1D4ED8]">{round.L}</div>
          </div>
          <div className="bg-[#F0FDF4] border-[0.5px] border-[#86EFAC] rounded-[8px] px-3 py-2.5">
            <div className="text-[11px] text-[#15803D] mb-1">R{currentRound - 1}</div>
            <div className="text-[12px] font-mono text-[#15803D]">{round.R}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5">
            <div className="text-[11px] text-[#64748B] mb-1">Expansion E(R)</div>
            <div className="text-[12px] font-mono text-[#0F172A]">{round.expandedR}</div>
          </div>
          <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5">
            <div className="text-[11px] text-[#64748B] mb-1">XOR dengan subkey K{round.subkeyIndex}</div>
            <div className="text-[12px] font-mono text-[#0F172A]">{round.xorWithSubkey}</div>
          </div>
          <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5">
            <div className="text-[11px] text-[#64748B] mb-1">Output S-Box</div>
            <div className="text-[12px] font-mono text-[#0F172A]">{round.sBoxOutput}</div>
          </div>
          <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5">
            <div className="text-[11px] text-[#64748B] mb-1">P Permutation / F(R, K)</div>
            <div className="text-[12px] font-mono text-[#0F172A]">{round.pOutput}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-[#FFF7ED] border-[0.5px] border-[#FED7AA] rounded-[8px] px-3 py-2.5">
            <div className="text-[11px] text-[#C2410C] mb-1">L{currentRound}</div>
            <div className="text-[12px] font-mono text-[#C2410C]">{round.newL}</div>
          </div>
          <div className="bg-[#FFFBEB] border-[0.5px] border-[#FDE68A] rounded-[8px] px-3 py-2.5">
            <div className="text-[11px] text-[#92400E] mb-1">R{currentRound}</div>
            <div className="text-[12px] font-mono text-[#92400E]">{round.newR}</div>
          </div>
        </div>
      </div>

      <div className="border-t-[0.5px] border-[#E2E8F0] px-4 py-3.5">
        <div className="flex flex-wrap gap-1">
          {details.rounds.map((item) => (
            <button
              key={item.round}
              onClick={() => setCurrentRound(item.round)}
              className={`w-8 h-8 rounded-[6px] text-[10px] font-medium border-[0.5px] transition-colors ${
                item.round === currentRound
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-[#EFF6FF]'
              }`}
            >
              {item.round}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function AvalancheBitGrid({
  sourceBits,
  comparisonBits,
}: {
  sourceBits: string;
  comparisonBits: string;
}) {
  return (
    <div className="flex flex-wrap gap-[2px]">
      {sourceBits.split('').map((bit, index) => {
        const different = bit !== comparisonBits[index];
        return (
          <div
            key={index}
            className={`w-4 h-4 rounded-[3px] border-[0.5px] flex items-center justify-center text-[9px] font-mono ${
              different
                ? 'bg-[#FEE2E2] border-[#FCA5A5] text-[#DC2626]'
                : 'bg-[#DCFCE7] border-[#86EFAC] text-[#15803D]'
            }`}
          >
            {bit}
          </div>
        );
      })}
    </div>
  );
}

function Step5Visual({ avalanche }: { avalanche: DESAvalancheResult }) {
  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Avalanche effect dari input user</span>
      </div>
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="text-[11px] font-medium text-[#64748B] mb-2">Plaintext asli</div>
          <div className="text-[12px] font-mono text-[#0F172A] mb-2">"{avalanche.originalPlaintext}"</div>
          <div className="text-[12px] text-[#64748B] mb-2">Ciphertext: <span className="font-mono text-[#0F172A]">{avalanche.originalCiphertext}</span></div>
          <AvalancheBitGrid sourceBits={avalanche.originalCipherBits} comparisonBits={avalanche.modifiedCipherBits} />
        </div>
        <div>
          <div className="text-[11px] font-medium text-[#64748B] mb-2">Plaintext dengan 1 bit dibalik</div>
          <div className="text-[12px] font-mono text-[#0F172A] mb-2">"{avalanche.modifiedPlaintext}"</div>
          <div className="text-[12px] text-[#64748B] mb-2">Ciphertext: <span className="font-mono text-[#0F172A]">{avalanche.modifiedCiphertext}</span></div>
          <AvalancheBitGrid sourceBits={avalanche.modifiedCipherBits} comparisonBits={avalanche.originalCipherBits} />
        </div>
      </div>
      <div className="px-4 pb-4">
        <div className="bg-[#F0FDF4] border-[0.5px] border-[#86EFAC] rounded-[8px] px-3 py-3">
          <p className="text-[12px] text-[#15803D]" style={{ lineHeight: 1.6 }}>
            Bit yang diubah ada di posisi <span className="font-medium">{avalanche.changedBitIndex + 1}</span>. Hasilnya,
            <span className="font-medium"> {avalanche.differentBits} dari {avalanche.totalBits} bit</span> ciphertext berubah
            atau <span className="font-medium">{avalanche.percentage.toFixed(2)}%</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

function Step6Visual({ details }: { details: DESDetails }) {
  const finalBits = parseBitString(details.finalOutputBits);

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Final output DES</span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5">
            <div className="text-[11px] text-[#64748B] mb-1">Final swap (R16 || L16)</div>
            <div className="text-[12px] font-mono text-[#0F172A] break-all">{details.preOutput}</div>
          </div>
          <div className="bg-[#EFF6FF] border-[0.5px] border-[#BFDBFE] rounded-[8px] px-3 py-2.5">
            <div className="text-[11px] text-[#1D4ED8] mb-1">Final Permutation output</div>
            <div className="text-[12px] font-mono text-[#1D4ED8] break-all">{details.finalOutput}</div>
          </div>
        </div>

        <div className="text-[11px] font-medium text-[#64748B] mb-2">Ciphertext final (64 bit)</div>
        <div className="flex flex-wrap gap-[3px] mb-4">
          {finalBits.map((bit, index) => (
            <div
              key={index}
              className="w-5 h-5 rounded-[3px] border-[0.5px] bg-[#DCFCE7] border-[#86EFAC] text-[#15803D] flex items-center justify-center text-[10px] font-mono font-medium"
            >
              {bit}
            </div>
          ))}
        </div>

        <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5">
          <p className="text-[12px] text-[#64748B]" style={{ lineHeight: 1.6 }}>
            Ciphertext akhir dalam hex adalah <span className="font-mono text-[#0F172A]">{details.finalOutput}</span>.
            Nilai ini dihasilkan langsung dari 16 ronde, final swap, dan final permutation untuk input user saat ini.
          </p>
        </div>
      </div>
    </div>
  );
}

export function VisualisasiPage() {
  const { algorithm, plaintext, key } = useAlgorithm();
  const [currentStep, setCurrentStep] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const navigate = useNavigate();

  if (algorithm === 'ChaCha20') {
    return <VisualisasiChaCha20Page />;
  }

  const validation = useMemo(() => validateDESEncryptInput(plaintext, key), [plaintext, key]);
  const details = useMemo(() => {
    if (!validation.isValid) {
      return null;
    }

    try {
      return getDESDetails(plaintext, key);
    } catch {
      return null;
    }
  }, [validation.isValid, plaintext, key]);

  const avalanche = useMemo(() => {
    if (!validation.isValid) {
      return null;
    }

    try {
      return calculateDESAvalanche(plaintext, key);
    } catch {
      return null;
    }
  }, [validation.isValid, plaintext, key]);

  const step = stepData[currentStep];

  const handleNext = () => {
    if (currentStep < 5) {
      setCurrentStep((previous) => previous + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((previous) => previous - 1);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-56px)] bg-[#F8FAFC] pt-6 md:pt-8 pb-8 md:pb-12 px-4 md:px-8 lg:px-16 xl:px-[290px]">
      <div className="max-w-[860px] mx-auto">
        <div className="mb-3.5">
          <div className="flex gap-1 mb-2">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className={`flex-1 h-1 rounded-[2px] ${
                  index < currentStep ? 'bg-[#2563EB]' : index === currentStep ? 'bg-[#93C5FD]' : 'bg-[#E2E8F0]'
                }`}
              />
            ))}
          </div>
          <p className="text-[11px] text-[#64748B]">
            Langkah {currentStep + 1} dari 6 — {step.title}
          </p>
        </div>

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

        {!plaintext && !key ? (
          <StepStateNotice
            title="Belum ada input"
            text="Masukkan plaintext dan key untuk melihat proses."
          />
        ) : !validation.isValid ? (
          <StepStateNotice
            title="Input belum valid"
            text={validation.error ?? 'Input DES belum memenuhi syarat.'}
            tone="error"
          />
        ) : !details || !avalanche ? (
          <StepStateNotice
            title="Perhitungan gagal dibuat"
            text="Terjadi masalah saat membangun visualisasi DES dari input user."
            tone="error"
          />
        ) : (
          <>
            {currentStep === 0 && <Step1Visual details={details} />}
            {currentStep === 1 && <Step2Visual details={details} />}
            {currentStep === 2 && <Step3Visual currentRound={currentRound} setCurrentRound={setCurrentRound} details={details} />}
            {currentStep === 3 && <Step4Visual currentRound={currentRound} setCurrentRound={setCurrentRound} details={details} />}
            {currentStep === 4 && <Step5Visual avalanche={avalanche} />}
            {currentStep === 5 && <Step6Visual details={details} />}
          </>
        )}

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
