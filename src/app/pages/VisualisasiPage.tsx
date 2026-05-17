import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Check,
  Edit,
  Lightbulb,
  CircleDot,
  AlertCircle,
  Info,
  Pause,
  Play,
  RotateCcw,
  SkipBack,
  SkipForward,
  Table2,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { FeistelRoundsVisualization, type FeistelRoundData } from '../components/FeistelRoundsVisualization';
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
    badgeLabel: 'Langkah 1',
    breadcrumbLabel: 'Initial Permutation',
    slug: 'initial-permutation',
    title: 'Mengubah teks menjadi biner',
    subtitle: 'Setiap 8 byte plaintext dipecah menjadi 64 bit sebelum masuk ke DES.',
    analogy: 'Bayangkan setiap huruf harus diubah dulu jadi kartu angka 0 dan 1 agar mesin DES bisa membacanya.',
    why: 'DES bekerja penuh pada bit. Karena itu, plaintext perlu diubah ke representasi 64-bit yang stabil sebelum permutasi dan ronde Feistel dimulai.',
    tagColor: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' },
  },
  {
    num: 2,
    badgeLabel: 'Langkah 2',
    breadcrumbLabel: 'Split L0 dan R0',
    slug: 'split-l0-r0',
    title: 'Initial Permutation (IP)',
    subtitle: '64 bit plaintext diatur ulang sesuai tabel IP tanpa mengubah nilainya.',
    analogy: 'Bit-bit ini seperti 64 orang yang diminta pindah posisi mengikuti daftar kursi baru.',
    why: 'Permutasi awal menyebarkan posisi bit sejak awal agar difusi DES dimulai sebelum ronde pertama.',
    tagColor: { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D' },
  },
  {
    num: 3,
    badgeLabel: 'Langkah 3',
    breadcrumbLabel: 'Key Schedule',
    slug: 'key-schedule',
    title: 'Key Schedule dan 16 Subkey',
    subtitle: 'Key 64-bit diproses lewat PC-1, shift kiri, dan PC-2 untuk membentuk K1 sampai K16.',
    analogy: 'Satu kunci utama diputar dan dipotong berkali-kali sampai terbentuk 16 kunci turunan dengan urutan berbeda.',
    why: 'Subkey yang berubah di tiap ronde membuat relasi antara plaintext dan ciphertext jauh lebih sulit ditebak.',
    tagColor: { bg: '#F3E8FF', border: '#C4B5FD', text: '#7C3AED' },
  },
  {
    num: 4,
    badgeLabel: 'Langkah 4',
    breadcrumbLabel: '16 Ronde Feistel',
    slug: 'feistel-rounds',
    title: '16 Ronde Feistel',
    subtitle: 'Setiap ronde menghitung E, XOR, S-Box, P, lalu membentuk L_i dan R_i baru.',
    analogy: 'Setiap putaran mengacak sisi kanan, mencampurnya dengan subkey, lalu menukar posisinya dengan sisi kiri.',
    why: 'Inilah inti DES. Pengacakan berulang membuat perubahan kecil pada input menyebar ke banyak posisi bit.',
    tagColor: { bg: '#FFF7ED', border: '#FED7AA', text: '#C2410C' },
  },
  {
    num: 5,
    badgeLabel: 'Langkah 5',
    breadcrumbLabel: 'Final Permutation',
    slug: 'final-permutation',
    title: 'Final Swap, FP, dan Ciphertext',
    subtitle: 'Setelah 16 ronde, blok ditukar lalu dipermutasi akhir untuk menghasilkan ciphertext.',
    analogy: 'Setelah semua pencampuran selesai, hasilnya disusun ulang sekali lagi sebelum keluar sebagai pesan rahasia.',
    why: 'Final swap dan final permutation menutup struktur DES dan menghasilkan blok keluaran 64-bit yang baku.',
    tagColor: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' },
  },
  {
    num: 6,
    badgeLabel: 'Langkah 6',
    breadcrumbLabel: 'Analisis Avalanche',
    slug: 'avalanche-effect',
    title: 'Avalanche Effect',
    subtitle: 'Setelah ciphertext final dihasilkan, kita dapat menguji Avalanche Effect untuk melihat seberapa besar perubahan output ketika input diubah sedikit.',
    analogy: 'Seperti mendorong domino pertama setelah proses selesai, lalu melihat seberapa banyak hasil akhir ikut berubah.',
    why: 'Analisis ini membantu menunjukkan bahwa DES memiliki difusi yang kuat: perubahan kecil pada input bisa menghasilkan ciphertext yang sangat berbeda.',
    tagColor: { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D' },
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
  const [activeOutputIndex, setActiveOutputIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [mode, setMode] = useState<'beginner' | 'detail'>('beginner');
  const [splitVisible, setSplitVisible] = useState(false);
  const [selectedHalf, setSelectedHalf] = useState<'L0' | 'R0' | null>(null);
  const [hoveredOutputIndex, setHoveredOutputIndex] = useState<number | null>(null);
  const sourceBits = parseBitString(details.inputBits);
  const outputBits = parseBitString(details.initialPermutationBits);
  const l0Bits = details.initialPermutationBits.slice(0, 32);
  const r0Bits = details.initialPermutationBits.slice(32, 64);
  const sourcePosition = DES_INITIAL_PERMUTATION_TABLE[activeOutputIndex];
  const sourceIndex = sourcePosition - 1;
  const destinationPosition = activeOutputIndex + 1;
  const activeBit = outputBits[activeOutputIndex];
  const showDetail = mode === 'detail';
  const activeHalf = activeOutputIndex < 32 ? 'L0' : 'R0';
  const hoveredHalf = hoveredOutputIndex === null ? null : hoveredOutputIndex < 32 ? 'L0' : 'R0';

  const bitChunksToHex = (bits: string) => bits.match(/.{1,8}/g)?.map((chunk) => ({
    bits: chunk,
    nibbles: chunk.match(/.{1,4}/g) ?? [],
    hex: parseInt(chunk, 2).toString(16).toUpperCase().padStart(2, '0'),
  })) ?? [];

  const selectedBits = selectedHalf === 'R0' ? r0Bits : l0Bits;
  const selectedHex = selectedHalf === 'R0' ? details.r0 : details.l0;
  const selectedSubtext = selectedHalf === 'R0' ? '32 bit terakhir hasil IP' : '32 bit pertama hasil IP';
  const selectedGrouping = bitChunksToHex(selectedBits);

  const explanationText = selectedHalf === 'L0'
    ? `Nilai L0 (${details.l0}) berasal dari 32 bit pertama hasil IP.`
    : selectedHalf === 'R0'
      ? `Nilai R0 (${details.r0}) berasal dari 32 bit terakhir hasil IP.`
      : hoveredHalf
        ? `Bit yang sedang disentuh termasuk ${hoveredHalf}. ${hoveredHalf === 'L0' ? 'L0 diambil dari 32 bit pertama.' : 'R0 diambil dari 32 bit terakhir.'}`
        : 'Setelah Initial Permutation, 64 bit dibagi menjadi dua bagian. 32 bit pertama menjadi L0, dan 32 bit terakhir menjadi R0.';

  useEffect(() => {
    if (!isPlaying) return undefined;

    const timer = window.setInterval(() => {
      setActiveOutputIndex((current) => {
        if (current >= DES_INITIAL_PERMUTATION_TABLE.length - 1) {
          setIsPlaying(false);
          return current;
        }

        return current + 1;
      });
    }, 900);

    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const goNext = () => {
    setIsPlaying(false);
    setActiveOutputIndex((current) => Math.min(current + 1, DES_INITIAL_PERMUTATION_TABLE.length - 1));
  };

  const goPrevious = () => {
    setIsPlaying(false);
    setActiveOutputIndex((current) => Math.max(current - 1, 0));
  };

  const reset = () => {
    setIsPlaying(false);
    setActiveOutputIndex(0);
    setSplitVisible(false);
    setSelectedHalf(null);
    setHoveredOutputIndex(null);
  };

  const start = () => {
    setActiveOutputIndex((current) => (current >= DES_INITIAL_PERMUTATION_TABLE.length - 1 ? 0 : current));
    setIsPlaying(true);
  };

  const renderLearningGrid = (bits: string[], type: 'source' | 'output') => (
    <div className="grid grid-cols-8 gap-1 sm:gap-1.5">
      {bits.map((bit, index) => {
        const isSourceActive = type === 'source' && index === sourceIndex;
        const isOutputActive = type === 'output' && index === activeOutputIndex;
        const stateClass = isSourceActive
          ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)]'
          : isOutputActive
            ? 'bg-[#22C55E] border-[#22C55E] text-white shadow-[0_10px_24px_rgba(34,197,94,0.2)]'
            : bit === '1'
              ? 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]'
              : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#94A3B8]';

        return (
          <motion.button
            key={`${type}-${index}`}
            type="button"
            onClick={() => {
              setIsPlaying(false);
              if (type === 'output') {
                setActiveOutputIndex(index);
                return;
              }

              const mappedOutputIndex = DES_INITIAL_PERMUTATION_TABLE.findIndex((position) => position === index + 1);
              if (mappedOutputIndex >= 0) {
                setActiveOutputIndex(mappedOutputIndex);
              }
            }}
            animate={{ scale: isSourceActive || isOutputActive ? 1.06 : 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            title={
              type === 'source'
                ? `Input posisi ${index + 1}`
                : `Output posisi ${index + 1} mengambil input posisi ${DES_INITIAL_PERMUTATION_TABLE[index]}`
            }
            className={`relative aspect-square min-h-[28px] rounded-[8px] border text-[12px] font-semibold transition-colors ${stateClass}`}
          >
            <span className="block leading-none">{bit}</span>
            {showDetail && (
              <span className={`absolute bottom-0.5 left-0 right-0 text-[8px] leading-none ${isSourceActive || isOutputActive ? 'text-white/80' : 'text-[#94A3B8]'}`}>
                {index + 1}
              </span>
            )}
          </motion.button>
        );
      })}
    </div>
  );

  const renderOutputBit = (bit: string, index: number) => {
    const isOutputActive = index === activeOutputIndex;
    const bitHalf = index < 32 ? 'L0' : 'R0';
    const baseClass = bitHalf === 'L0'
      ? 'bg-white/80 border-[#BFDBFE] text-[#1D4ED8] hover:bg-white'
      : 'bg-white/80 border-[#BBF7D0] text-[#15803D] hover:bg-white';
    const activeClass = isOutputActive
      ? bitHalf === 'L0'
        ? 'bg-[#2563EB] border-[#2563EB] text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)]'
        : 'bg-[#22C55E] border-[#22C55E] text-white shadow-[0_10px_24px_rgba(34,197,94,0.22)]'
      : baseClass;

    return (
      <motion.button
        key={`output-${index}`}
        type="button"
        onClick={() => {
          setIsPlaying(false);
          setActiveOutputIndex(index);
          setSelectedHalf(bitHalf);
        }}
        onMouseEnter={() => setHoveredOutputIndex(index)}
        onMouseLeave={() => setHoveredOutputIndex(null)}
        animate={{ scale: isOutputActive ? 1.07 : 1 }}
        transition={{ type: 'spring', stiffness: 320, damping: 22 }}
        title={`Bit ini termasuk ${bitHalf}`}
        className={`relative aspect-square min-h-[28px] rounded-[8px] border text-[12px] font-semibold transition-colors ${activeClass}`}
      >
        <span className="block leading-none">{bit}</span>
        {showDetail && (
          <span className={`absolute bottom-0.5 left-0 right-0 text-[8px] leading-none ${isOutputActive ? 'text-white/80' : 'text-[#64748B]'}`}>
            {index + 1}
          </span>
        )}
      </motion.button>
    );
  };

  const renderSplitGroup = (label: 'L0' | 'R0', bits: string, text: string) => {
    const isL0 = label === 'L0';
    const offset = splitVisible ? (isL0 ? { x: -18, y: 18 } : { x: 18, y: 18 }) : { x: 0, y: 0 };
    const backgroundClass = isL0
      ? 'border-[#BFDBFE] bg-[#EFF6FF]'
      : 'border-[#BBF7D0] bg-[#F0FDF4]';
    const labelClass = isL0 ? 'bg-[#2563EB] text-white' : 'bg-[#22C55E] text-white';
    const textClass = isL0 ? 'text-[#1D4ED8]' : 'text-[#15803D]';

    return (
      <motion.div
        animate={offset}
        transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        className={`relative rounded-[14px] border p-3 ${backgroundClass}`}
      >
        <div className="mb-2 flex items-center justify-between gap-2">
          <span className={`rounded-full px-3 py-1 text-[12px] font-semibold ${labelClass}`}>{label}</span>
          <span className={`text-[11px] font-medium ${textClass}`}>{text}</span>
        </div>
        <div className="pointer-events-none absolute inset-x-3 top-[48px] rounded-[10px] bg-white/45 px-2 py-1 text-center text-[10px] font-medium text-[#334155]">
          {text}
        </div>
        <div className="grid grid-cols-8 gap-1 sm:gap-1.5 pt-7">
          {bits.split('').map((bit, localIndex) => renderOutputBit(bit, isL0 ? localIndex : localIndex + 32))}
        </div>
      </motion.div>
    );
  };

  const renderHexMapping = () => (
    <motion.div
      key={selectedHalf ?? 'default-mapping'}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25 }}
      className="mt-4 rounded-[16px] border border-[#E2E8F0] bg-white p-4 shadow-sm"
    >
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="text-[13px] font-semibold text-[#0F172A]">
            Mapping bit ke hex {selectedHalf ?? activeHalf}
          </div>
          <div className="text-[11px] text-[#64748B]">
            Setiap 8 bit dibaca menjadi 2 digit hex.
          </div>
        </div>
        <div className="font-mono text-[13px] font-semibold text-[#0F172A]">{selectedHex}</div>
      </div>

      <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
        {selectedGrouping.map((group, index) => (
          <div key={`${group.bits}-${index}`} className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-3">
            <div className="flex items-center justify-between gap-3">
              <div className="font-mono text-[12px] text-[#0F172A]">{group.bits}</div>
              <ArrowRight className="h-4 w-4 flex-shrink-0 text-[#94A3B8]" />
              <div className="rounded-[8px] bg-white px-3 py-1.5 font-mono text-[13px] font-semibold text-[#2563EB] ring-1 ring-[#BFDBFE]">
                {group.hex}
              </div>
            </div>
            {showDetail && (
              <div className="mt-2 flex gap-1">
                {group.nibbles.map((nibble, nibbleIndex) => (
                  <span key={`${nibble}-${nibbleIndex}`} className="rounded-[6px] bg-white px-2 py-1 font-mono text-[10px] text-[#64748B] ring-1 ring-[#E2E8F0]">
                    {nibble}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </motion.div>
  );

  return (
    <div className="bg-[#F8FAFC] border-[0.5px] border-[#E2E8F0] rounded-[18px] overflow-hidden mb-3">
      <div className="px-5 py-5 md:px-6 md:py-6 border-b-[0.5px] border-[#E2E8F0] bg-white">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#EFF6FF] px-3 py-1 text-[11px] font-medium text-[#1D4ED8] ring-1 ring-[#BFDBFE]">
              <CircleDot className="h-3.5 w-3.5" />
              Visualisasi perpindahan bit
            </div>
            <h2 className="mt-3 text-[22px] font-semibold text-[#0F172A] md:text-[28px]">
              Langkah 2: Initial Permutation (IP)
            </h2>
            <p className="mt-1.5 max-w-[620px] text-[13px] text-[#64748B] md:text-[14px]" style={{ lineHeight: 1.7 }}>
              Bit hanya dipindahkan posisinya tanpa mengubah nilainya.
            </p>
          </div>

          <div className="inline-flex w-full rounded-[12px] bg-[#F1F5F9] p-1 sm:w-auto">
            <button
              type="button"
              onClick={() => setMode('beginner')}
              className={`flex-1 rounded-[9px] px-4 py-2 text-[12px] font-medium transition-colors sm:flex-none ${
                mode === 'beginner' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Mode Pemula
            </button>
            <button
              type="button"
              onClick={() => setMode('detail')}
              className={`flex-1 rounded-[9px] px-4 py-2 text-[12px] font-medium transition-colors sm:flex-none ${
                mode === 'detail' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Mode Detail
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="grid grid-cols-1 items-stretch gap-4 lg:grid-cols-[1fr_auto_1fr] lg:gap-5">
          <section className="rounded-[16px] border border-[#E2E8F0] bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-[13px] font-semibold text-[#0F172A]">Sebelum IP</div>
                <div className="text-[11px] text-[#64748B]">Susunan bit dari plaintext</div>
              </div>
              <div className="rounded-full bg-[#EFF6FF] px-2.5 py-1 text-[11px] font-medium text-[#1D4ED8]">
                Posisi {sourcePosition}
              </div>
            </div>
            {renderLearningGrid(sourceBits, 'source')}
          </section>

          <div className="flex items-center justify-center py-1 lg:px-1">
            <div className="relative flex h-16 w-full items-center justify-center lg:h-full lg:w-20">
              <motion.div
                key={activeOutputIndex}
                initial={{ x: -18, opacity: 0 }}
                animate={{ x: 18, opacity: 1 }}
                transition={{ duration: 0.75, ease: 'easeInOut', repeat: isPlaying ? Infinity : 0, repeatType: 'reverse' }}
                className="hidden h-11 w-11 items-center justify-center rounded-full bg-white text-[#2563EB] shadow-sm ring-1 ring-[#BFDBFE] lg:flex"
              >
                <ArrowRight className="h-5 w-5" />
              </motion.div>
              <motion.div
                key={`mobile-${activeOutputIndex}`}
                initial={{ y: -10, opacity: 0 }}
                animate={{ y: 10, opacity: 1 }}
                transition={{ duration: 0.75, ease: 'easeInOut', repeat: isPlaying ? Infinity : 0, repeatType: 'reverse' }}
                className="flex h-10 w-10 rotate-90 items-center justify-center rounded-full bg-white text-[#2563EB] shadow-sm ring-1 ring-[#BFDBFE] lg:hidden"
              >
                <ArrowRight className="h-5 w-5" />
              </motion.div>
            </div>
          </div>

          <section className="rounded-[16px] border border-[#E2E8F0] bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <div className="text-[13px] font-semibold text-[#0F172A]">Sesudah IP</div>
                <div className="text-[11px] text-[#64748B]">Hasil susunan ulang, lalu dibagi menjadi L0 dan R0</div>
              </div>
              <div className={`rounded-full px-2.5 py-1 text-[11px] font-medium ${activeHalf === 'L0' ? 'bg-[#EFF6FF] text-[#1D4ED8]' : 'bg-[#F0FDF4] text-[#15803D]'}`}>
                {activeHalf} - Posisi {destinationPosition}
              </div>
            </div>
            <div className="space-y-3">
              {renderSplitGroup('L0', l0Bits, 'L0 diambil dari 32 bit pertama')}
              {renderSplitGroup('R0', r0Bits, 'R0 diambil dari 32 bit terakhir')}
            </div>
          </section>
        </div>

        <motion.div
          key={`explain-${activeOutputIndex}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-4 rounded-[14px] border border-[#BFDBFE] bg-white px-4 py-3 shadow-sm"
        >
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <p className="text-[13px] text-[#1D4ED8]" style={{ lineHeight: 1.65 }}>
              {explanationText} Bit aktif saat ini berasal dari posisi{' '}
              <span className="font-semibold">{sourcePosition}</span> dan masuk ke posisi{' '}
              <span className="font-semibold">{destinationPosition}</span> dengan nilai{' '}
              <span className="font-mono font-semibold">{activeBit}</span>.
            </p>
            <div className="flex items-center gap-2 text-[11px] text-[#64748B]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2563EB]" />
              L0
              <span className="ml-2 h-2.5 w-2.5 rounded-full bg-[#22C55E]" />
              R0
            </div>
          </div>
        </motion.div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={isPlaying ? () => setIsPlaying(false) : start}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#2563EB] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#1D4ED8]"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            Mulai
          </button>
          <button
            type="button"
            onClick={goNext}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
          >
            <SkipForward className="h-4 w-4" />
            Next Step
          </button>
          <button
            type="button"
            onClick={goPrevious}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
          >
            <SkipBack className="h-4 w-4" />
            Previous
          </button>
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
          <button
            type="button"
            onClick={() => {
              setSplitVisible((current) => !current);
              setSelectedHalf((current) => current ?? 'L0');
            }}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#0F172A] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#1E293B]"
          >
            <ArrowRight className="h-4 w-4" />
            Tampilkan L0 & R0
          </button>
        </div>

        {(selectedHalf || showDetail) && renderHexMapping()}

        {showDetail && (
          <div className="mt-5 grid grid-cols-1 gap-4 xl:grid-cols-[1.25fr_0.75fr]">
            <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-[#0F172A]">
                <Table2 className="h-4 w-4 text-[#2563EB]" />
                Tabel IP
              </div>
              <div className="grid grid-cols-8 gap-1">
                {DES_INITIAL_PERMUTATION_TABLE.map((position, index) => {
                  const isActive = index === activeOutputIndex;
                  return (
                    <button
                      key={`${position}-${index}`}
                      type="button"
                      onClick={() => {
                        setIsPlaying(false);
                        setActiveOutputIndex(index);
                      }}
                      className={`rounded-[7px] border px-1.5 py-2 text-center text-[11px] font-medium transition-colors ${
                        isActive
                          ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]'
                          : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:bg-[#EFF6FF]'
                      }`}
                      title={`Output ${index + 1} mengambil input ${position}`}
                    >
                      {position}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-4 shadow-sm">
              <div className="text-[13px] font-semibold text-[#0F172A]">Hex result</div>
              <div className="mt-2 rounded-[10px] bg-[#F8FAFC] px-3 py-3 font-mono text-[13px] text-[#0F172A]">
                {details.initialPermutation}
              </div>
              <p className="mt-3 text-[12px] text-[#64748B]" style={{ lineHeight: 1.6 }}>
                Ini adalah bentuk hex dari 64 bit setelah IP. Nilai bit tidak berubah, hanya urutannya yang berbeda.
              </p>
            </div>
          </div>
        )}

        <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-2">
          <motion.button
            type="button"
            onClick={() => setSelectedHalf('L0')}
            animate={{ scale: splitVisible || selectedHalf === 'L0' ? 1.02 : 1 }}
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
            className={`rounded-[16px] border bg-white p-5 text-left shadow-sm transition-colors ${
              selectedHalf === 'L0' ? 'border-[#2563EB] ring-2 ring-[#BFDBFE]' : 'border-[#BFDBFE] hover:bg-[#EFF6FF]'
            }`}
          >
            <div className="mb-2 text-[24px] font-semibold text-[#1D4ED8]">L0</div>
            <div className="break-all font-mono text-[18px] font-semibold text-[#0F172A]">{details.l0}</div>
            <div className="mt-2 text-[12px] text-[#64748B]">32 bit pertama hasil IP</div>
            {showDetail && (
              <div className="mt-2 break-all font-mono text-[11px] text-[#64748B]">
                {details.initialPermutationBits.slice(0, 32)}
              </div>
            )}
          </motion.button>
          <motion.button
            type="button"
            onClick={() => setSelectedHalf('R0')}
            animate={{ scale: splitVisible || selectedHalf === 'R0' ? 1.02 : 1 }}
            transition={{ type: 'spring', stiffness: 180, damping: 18 }}
            className={`rounded-[16px] border bg-white p-5 text-left shadow-sm transition-colors ${
              selectedHalf === 'R0' ? 'border-[#22C55E] ring-2 ring-[#BBF7D0]' : 'border-[#BBF7D0] hover:bg-[#F0FDF4]'
            }`}
          >
            <div className="mb-2 text-[24px] font-semibold text-[#15803D]">R0</div>
            <div className="break-all font-mono text-[18px] font-semibold text-[#0F172A]">{details.r0}</div>
            <div className="mt-2 text-[12px] text-[#64748B]">32 bit terakhir hasil IP</div>
            {showDetail && (
              <div className="mt-2 break-all font-mono text-[11px] text-[#64748B]">
                {details.initialPermutationBits.slice(32, 64)}
              </div>
            )}
          </motion.button>
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
  const [mode, setMode] = useState<'beginner' | 'detail'>('beginner');
  const [activeStage, setActiveStage] = useState<'pc1' | 'split' | 'shift' | 'merge' | 'pc2' | 'subkey'>('pc1');
  const [showShift, setShowShift] = useState(false);
  const [hoverMessage, setHoverMessage] = useState('');
  const showDetail = mode === 'detail';
  const c0 = details.keyAfterPc1.slice(0, 28);
  const d0 = details.keyAfterPc1.slice(28, 56);
  const pc1Table = [
    57, 49, 41, 33, 25, 17, 9,
    1, 58, 50, 42, 34, 26, 18,
    10, 2, 59, 51, 43, 35, 27,
    19, 11, 3, 60, 52, 44, 36,
    63, 55, 47, 39, 31, 23, 15,
    7, 62, 54, 46, 38, 30, 22,
    14, 6, 61, 53, 45, 37, 29,
    21, 13, 5, 28, 20, 12, 4,
  ];
  const pc2Table = [
    14, 17, 11, 24, 1, 5,
    3, 28, 15, 6, 21, 10,
    23, 19, 12, 4, 26, 8,
    16, 7, 27, 20, 13, 2,
    41, 52, 31, 37, 47, 55,
    30, 40, 51, 45, 33, 48,
    44, 49, 39, 56, 34, 53,
    46, 42, 50, 36, 29, 32,
  ];
  const pc1Selected = new Set(pc1Table);
  const pc2Selected = new Set(pc2Table);
  const subkeyBinary = schedule.subkey
    .split('')
    .map((char) => parseInt(char, 16).toString(2).padStart(4, '0'))
    .join('');
  const stageText = {
    pc1: 'DES mengubah key 64-bit menjadi 56-bit dengan membuang parity bit.',
    split: 'Key dibagi menjadi dua bagian: C dan D.',
    shift: 'Kedua bagian digeser ke kiri agar setiap ronde memiliki key berbeda.',
    merge: `Setelah shift, C${currentRound} dan D${currentRound} digabung kembali menjadi 56 bit.`,
    pc2: '48 bit dipilih untuk membentuk subkey ronde.',
    subkey: 'Subkey ini digunakan pada ronde DES.',
  }[activeStage];

  const renderMiniBits = (
    bits: string,
    tone: 'blue' | 'green' | 'purple' | 'slate',
    options?: {
      selectedPositions?: Set<number>;
      positionOffset?: number;
      compact?: boolean;
      animatedShift?: boolean;
      onHoverSelected?: string;
      onHoverMuted?: string;
    },
  ) => {
    const toneClass = {
      blue: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]',
      green: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]',
      purple: 'bg-[#F5F3FF] border-[#DDD6FE] text-[#6D28D9]',
      slate: 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]',
    }[tone];

    return (
      <div className={`grid ${options?.compact ? 'grid-cols-8' : 'grid-cols-7'} gap-1`}>
        {bits.split('').map((bit, index) => {
          const position = index + 1 + (options?.positionOffset ?? 0);
          const selected = options?.selectedPositions ? options.selectedPositions.has(position) : true;
          const isShiftedOut = options?.animatedShift && index < schedule.shift;

          return (
            <motion.div
              key={`${bit}-${index}-${position}`}
              animate={options?.animatedShift && showShift ? { x: isShiftedOut ? 88 : -18 } : { x: 0 }}
              transition={{ duration: 0.8, ease: 'easeInOut', repeat: options?.animatedShift && showShift ? Infinity : 0, repeatType: 'loop' }}
              onMouseEnter={() => {
                if (options?.onHoverSelected || options?.onHoverMuted) {
                  setHoverMessage(selected ? options.onHoverSelected ?? '' : options.onHoverMuted ?? '');
                }
              }}
              onMouseLeave={() => setHoverMessage('')}
              className={`relative flex aspect-square min-h-[24px] items-center justify-center rounded-[7px] border font-mono text-[11px] font-semibold ${
                selected ? toneClass : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#CBD5E1] opacity-45'
              }`}
            >
              {bit}
              {showDetail && (
                <span className="absolute bottom-0.5 left-0 right-0 text-center text-[7px] leading-none text-current opacity-60">
                  {position}
                </span>
              )}
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderFlowNode = (
    stage: typeof activeStage,
    title: string,
    subtitle: string,
    content: ReactNode,
  ) => (
    <motion.button
      type="button"
      onClick={() => setActiveStage(stage)}
      whileHover={{ y: -2 }}
      className={`min-w-0 rounded-[16px] border bg-white p-4 text-left shadow-sm transition-colors ${
        activeStage === stage ? 'border-[#2563EB] ring-2 ring-[#BFDBFE]' : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'
      }`}
    >
      <div className="mb-3">
        <div className="text-[13px] font-semibold text-[#0F172A]">{title}</div>
        <div className="text-[11px] text-[#64748B]">{subtitle}</div>
      </div>
      {content}
    </motion.button>
  );

  const FlowArrow = () => (
    <div className="flex items-center justify-center text-[#94A3B8] lg:pt-14">
      <ArrowRight className="h-5 w-5 rotate-90 lg:rotate-0" />
    </div>
  );

  return (
    <div className="bg-[#F8FAFC] border-[0.5px] border-[#E2E8F0] rounded-[18px] overflow-hidden mb-3">
      <div className="border-b-[0.5px] border-[#E2E8F0] bg-white px-5 py-5 md:px-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F5F3FF] px-3 py-1 text-[11px] font-medium text-[#6D28D9] ring-1 ring-[#DDD6FE]">
              <CircleDot className="h-3.5 w-3.5" />
              Key schedule ronde {currentRound}
            </div>
            <h2 className="mt-3 text-[22px] font-semibold text-[#0F172A] md:text-[28px]">
              Key Schedule & 16 Subkeys
            </h2>
            <p className="mt-1.5 max-w-[680px] text-[13px] text-[#64748B] md:text-[14px]" style={{ lineHeight: 1.7 }}>
              Key utama dipilih, dibagi, digeser, lalu dipilih lagi untuk membentuk subkey berbeda di setiap ronde.
            </p>
          </div>

          <div className="inline-flex w-full rounded-[12px] bg-[#F1F5F9] p-1 sm:w-auto">
            <button
              type="button"
              onClick={() => setMode('beginner')}
              className={`flex-1 rounded-[9px] px-4 py-2 text-[12px] font-medium transition-colors sm:flex-none ${
                mode === 'beginner' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Mode Pemula
            </button>
            <button
              type="button"
              onClick={() => setMode('detail')}
              className={`flex-1 rounded-[9px] px-4 py-2 text-[12px] font-medium transition-colors sm:flex-none ${
                mode === 'detail' ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
              }`}
            >
              Mode Detail
            </button>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="mb-4 flex flex-wrap gap-1.5">
          {details.keySchedule.map((item) => (
            <button
              key={item.round}
              type="button"
              onClick={() => {
                setCurrentRound(item.round);
                setShowShift(false);
                setActiveStage('shift');
              }}
              className={`h-8 rounded-[8px] border px-2.5 text-[10px] font-medium transition-colors ${
                item.round === currentRound
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-[#EFF6FF]'
              }`}
            >
              K{item.round}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {renderFlowNode(
            'pc1',
            '64-bit Key',
            'PC-1 membuang parity bit',
            <>
              <div className="mb-2 flex items-center justify-between text-[11px]">
                <span className="font-medium text-[#1D4ED8]">56 dipilih</span>
                <span className="text-[#94A3B8]">8 parity faded</span>
              </div>
              {renderMiniBits(details.keyBits, 'blue', {
                selectedPositions: pc1Selected,
                compact: true,
                onHoverSelected: 'Bit ini dipilih oleh PC-1.',
                onHoverMuted: 'Bit ini adalah parity bit dan dibuang oleh PC-1.',
              })}
            </>,
          )}
          <FlowArrow />
          {renderFlowNode(
            'split',
            '56-bit Key',
            'Split menjadi C0 dan D0',
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
              <div className="rounded-[12px] border border-[#DDD6FE] bg-[#F5F3FF] p-3">
                <div className="text-[20px] font-semibold text-[#6D28D9]">C0</div>
                <div className="mb-2 text-[11px] text-[#7C3AED]">28 bit kiri</div>
                {renderMiniBits(c0, 'purple')}
              </div>
              <div className="rounded-[12px] border border-[#BBF7D0] bg-[#F0FDF4] p-3">
                <div className="text-[20px] font-semibold text-[#15803D]">D0</div>
                <div className="mb-2 text-[11px] text-[#15803D]">28 bit kanan</div>
                {renderMiniBits(d0, 'green')}
              </div>
            </div>,
          )}
          <FlowArrow />
          {renderFlowNode(
            'shift',
            `Left Shift Ronde ${currentRound}`,
            `Round ${currentRound} Shift = ${schedule.shift}`,
            <div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  setShowShift((current) => !current);
                  setActiveStage('shift');
                }}
                className="mb-3 inline-flex items-center gap-2 rounded-[9px] bg-[#0F172A] px-3 py-2 text-[12px] font-medium text-white hover:bg-[#1E293B]"
              >
                <Play className="h-3.5 w-3.5" />
                Tampilkan Shift
              </button>
              <div className="space-y-2">
                <div>
                  <div className="mb-1 text-[11px] font-medium text-[#6D28D9]">C{currentRound}</div>
                  {renderMiniBits(schedule.c, 'purple', { animatedShift: true })}
                </div>
                <div>
                  <div className="mb-1 text-[11px] font-medium text-[#15803D]">D{currentRound}</div>
                  {renderMiniBits(schedule.d, 'green', { animatedShift: true })}
                </div>
              </div>
            </div>,
          )}
        </div>

        <div className="mt-3 grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_1fr_auto_1fr]">
          {renderFlowNode(
            'merge',
            'Merge',
            `C${currentRound} dan D${currentRound} digabung`,
            <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-3">
              {renderMiniBits(schedule.combined, 'slate', { compact: true })}
            </div>,
          )}
          <FlowArrow />
          {renderFlowNode(
            'pc2',
            'PC-2',
            '56 bit -> 48 bit',
            <>
              <div className="mb-2 text-[11px] text-[#64748B]">PC-2 memilih 48 bit untuk membentuk subkey ronde.</div>
              {renderMiniBits(schedule.combined, 'blue', {
                selectedPositions: pc2Selected,
                compact: true,
                onHoverSelected: 'Bit ini dipilih oleh PC-2.',
                onHoverMuted: 'Bit ini tidak digunakan untuk subkey ronde ini.',
              })}
            </>,
          )}
          <FlowArrow />
          {renderFlowNode(
            'subkey',
            `K${currentRound}`,
            '48-bit round key',
            <div className="rounded-[16px] border border-white/60 bg-gradient-to-br from-white via-[#EFF6FF] to-[#F5F3FF] p-4 shadow-[0_18px_45px_rgba(37,99,235,0.12)]">
              <div className="mb-2 text-[30px] font-semibold text-[#2563EB]">K{currentRound}</div>
              <div className="break-all font-mono text-[16px] font-semibold text-[#0F172A]">{schedule.subkey}</div>
              <div className="mt-2 text-[11px] text-[#64748B]">48-bit round key</div>
              <div className="mt-3 break-all rounded-[10px] bg-white/70 px-3 py-2 font-mono text-[11px] text-[#475569] ring-1 ring-[#DBEAFE]">
                {showDetail ? formatBinaryGroups(subkeyBinary, 4) : `${subkeyBinary.slice(0, 16)} ... ${subkeyBinary.slice(-16)}`}
              </div>
            </div>,
          )}
        </div>

        <motion.div
          key={`${activeStage}-${hoverMessage}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-4 rounded-[14px] border border-[#BFDBFE] bg-white px-4 py-3 shadow-sm"
        >
          <p className="text-[13px] text-[#1D4ED8]" style={{ lineHeight: 1.65 }}>
            {hoverMessage || stageText}
          </p>
        </motion.div>

        <div className="mt-4 rounded-[14px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3">
          <div className="text-[12px] font-semibold text-[#78350F]">Kenapa Ini Penting?</div>
          <p className="mt-1 text-[12px] text-[#92400E]" style={{ lineHeight: 1.65 }}>
            DES menggunakan subkey berbeda di setiap ronde agar hubungan plaintext dan ciphertext lebih sulit ditebak.
          </p>
        </div>

        {showDetail && (
          <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-2">
            <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-[#0F172A]">
                <Table2 className="h-4 w-4 text-[#2563EB]" />
                Tabel PC-1
              </div>
              <div className="grid grid-cols-7 gap-1">
                {pc1Table.map((position, index) => (
                  <div key={`pc1-${position}-${index}`} className="rounded-[7px] border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 py-2 text-center text-[11px] text-[#64748B]">
                    {position}
                  </div>
                ))}
              </div>
              <div className="mt-3 break-all font-mono text-[11px] text-[#475569]">
                PC-1 output: {formatBinaryGroups(details.keyAfterPc1, 7)}
              </div>
            </div>
            <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-4 shadow-sm">
              <div className="mb-3 flex items-center gap-2 text-[13px] font-semibold text-[#0F172A]">
                <Table2 className="h-4 w-4 text-[#2563EB]" />
                Tabel PC-2
              </div>
              <div className="grid grid-cols-6 gap-1">
                {pc2Table.map((position, index) => (
                  <div key={`pc2-${position}-${index}`} className="rounded-[7px] border border-[#E2E8F0] bg-[#F8FAFC] px-1.5 py-2 text-center text-[11px] text-[#64748B]">
                    {position}
                  </div>
                ))}
              </div>
              <div className="mt-3 text-[11px] text-[#64748B]">
                Shift detail: ronde {currentRound} memakai shift kiri sebanyak {schedule.shift}.
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function Step3StoryVisual({
  currentRound,
  setCurrentRound,
  details,
}: {
  currentRound: number;
  setCurrentRound: (round: number) => void;
  details: DESDetails;
}) {
  const [stageIndex, setStageIndex] = useState(0);
  const [hoverMessage, setHoverMessage] = useState('');
  const schedule = details.keySchedule[currentRound - 1];
  const previousSchedule = details.keySchedule[currentRound - 2];
  const c0 = details.keyAfterPc1.slice(0, 28);
  const d0 = details.keyAfterPc1.slice(28, 56);
  const beforeC = previousSchedule?.c ?? c0;
  const beforeD = previousSchedule?.d ?? d0;
  const subkeyBinary = schedule.subkey
    .split('')
    .map((char) => parseInt(char, 16).toString(2).padStart(4, '0'))
    .join('');
  const pc1Table = [
    57, 49, 41, 33, 25, 17, 9,
    1, 58, 50, 42, 34, 26, 18,
    10, 2, 59, 51, 43, 35, 27,
    19, 11, 3, 60, 52, 44, 36,
    63, 55, 47, 39, 31, 23, 15,
    7, 62, 54, 46, 38, 30, 22,
    14, 6, 61, 53, 45, 37, 29,
    21, 13, 5, 28, 20, 12, 4,
  ];
  const pc2Table = [
    14, 17, 11, 24, 1, 5,
    3, 28, 15, 6, 21, 10,
    23, 19, 12, 4, 26, 8,
    16, 7, 27, 20, 13, 2,
    41, 52, 31, 37, 47, 55,
    30, 40, 51, 45, 33, 48,
    44, 49, 39, 56, 34, 53,
    46, 42, 50, 36, 29, 32,
  ];
  const pc1Selected = new Set(pc1Table);
  const pc2Selected = new Set(pc2Table);
  const pc2PickedBits = pc2Table.map((position) => schedule.combined[position - 1] ?? '0').join('');
  const subkeyHexGroups = schedule.subkey.match(/.{1,2}/g) ?? [];
  const subkeyBinaryGroups = pc2PickedBits.match(/.{1,8}/g) ?? [];
  const stages = [
    { title: '64-bit Key', short: 'Key', text: 'Kita mulai dari key utama 64 bit. Ini adalah bahan mentah untuk membuat key ronde.' },
    { title: 'PC-1', short: 'PC-1', text: 'DES memilih bit penting dan membuang bit parity. Key jadi lebih ringkas: 64 bit menjadi 56 bit.' },
    { title: '56-bit Key', short: '56 bit', text: 'Inilah key 56 bit setelah PC-1. Dari sini DES mulai membentuk dua bagian.' },
    { title: 'Split', short: 'Split', text: '56 bit dibelah tepat di tengah: 28 bit kiri menjadi C0, 28 bit kanan menjadi D0.' },
    { title: 'Left Shift', short: 'Shift', text: 'C dan D diputar ke kiri. Rotasi ini membuat bahan subkey tiap ronde berbeda.' },
    { title: 'Merge', short: 'Merge', text: `C${currentRound} dan D${currentRound} disatukan lagi menjadi 56 bit.` },
    { title: 'PC-2', short: 'PC-2', text: 'DES hanya menjaga bit tertentu untuk membuat key ronde. Bit lain tidak dipakai pada subkey ini.' },
    { title: `K${currentRound} Generated`, short: `K${currentRound}`, text: `48 bit terpilih menjadi K${currentRound}. Subkey ini dipakai pada ronde DES ke-${currentRound}.` },
  ];
  const activeStage = stages[stageIndex];

  const goToStage = (index: number) => setStageIndex(Math.max(0, Math.min(index, stages.length - 1)));

  const Bit = ({
    bit,
    selected = true,
    tone = 'blue',
    index,
    animated = false,
  }: {
    bit: string;
    selected?: boolean;
    tone?: 'blue' | 'green' | 'purple' | 'slate' | 'amber';
    index?: number;
    animated?: boolean;
  }) => {
    const toneClass = {
      blue: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]',
      green: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]',
      purple: 'bg-[#F5F3FF] border-[#DDD6FE] text-[#6D28D9]',
      slate: 'bg-[#F8FAFC] border-[#E2E8F0] text-[#475569]',
      amber: 'bg-[#FFFBEB] border-[#FDE68A] text-[#B45309]',
    }[tone];

    return (
      <motion.div
        initial={animated ? { y: -10, opacity: 0 } : false}
        animate={animated ? { y: 0, opacity: selected ? 1 : 0.22 } : { opacity: selected ? 1 : 0.22 }}
        transition={{ duration: 0.32, delay: animated && index !== undefined ? Math.min(index * 0.015, 0.35) : 0 }}
        className={`relative flex aspect-square min-h-[24px] items-center justify-center rounded-[7px] border font-mono text-[11px] font-semibold ${selected ? toneClass : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#CBD5E1]'}`}
      >
        {bit}
      </motion.div>
    );
  };

  const BitGrid = ({
    bits,
    columns = 'grid-cols-8',
    tone = 'blue',
    selectedPositions,
    offset = 0,
    selectedMessage,
    mutedMessage,
    animated = false,
  }: {
    bits: string;
    columns?: string;
    tone?: 'blue' | 'green' | 'purple' | 'slate' | 'amber';
    selectedPositions?: Set<number>;
    offset?: number;
    selectedMessage?: string;
    mutedMessage?: string;
    animated?: boolean;
  }) => (
    <div className={`grid ${columns} gap-1 sm:gap-1.5`}>
      {bits.split('').map((bit, index) => {
        const position = index + 1 + offset;
        const selected = selectedPositions ? selectedPositions.has(position) : true;
        return (
          <div
            key={`${bit}-${index}-${position}`}
            onMouseEnter={() => setHoverMessage(selected ? selectedMessage ?? '' : mutedMessage ?? '')}
            onMouseLeave={() => setHoverMessage('')}
          >
            <Bit bit={bit} selected={selected} tone={tone} index={index} animated={animated} />
          </div>
        );
      })}
    </div>
  );

  const StoryCard = ({ children }: { children: ReactNode }) => (
    <motion.div
      key={`${stageIndex}-${currentRound}`}
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -16 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-sm md:p-6"
    >
      {children}
    </motion.div>
  );

  const ShiftRow = ({ label, before, after, tone }: { label: string; before: string; after: string; tone: 'purple' | 'green' }) => {
    const moved = before.slice(0, schedule.shift);
    const shiftedBody = before.slice(schedule.shift);
    const processBits = `${shiftedBody}${moved}`;
    const moveLabel = `Shift Left ${schedule.shift}x`;
    const toneText = tone === 'purple' ? 'text-[#6D28D9]' : 'text-[#15803D]';
    const toneBg = tone === 'purple' ? 'bg-[#F5F3FF] border-[#DDD6FE]' : 'bg-[#F0FDF4] border-[#BBF7D0]';
    const toneDot = tone === 'purple' ? 'bg-[#6D28D9]' : 'bg-[#16A34A]';

    const ShiftBitGrid = ({
      bits,
      stage,
      animated = false,
    }: {
      bits: string;
      stage: 'before' | 'process' | 'after';
      animated?: boolean;
    }) => (
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {bits.split('').map((bit, index) => {
          const isMovedBefore = stage === 'before' && index < schedule.shift;
          const isMovedAtBack = (stage === 'process' || stage === 'after') && index >= bits.length - schedule.shift;
          const isMoved = isMovedBefore || isMovedAtBack;
          const delay = animated ? Math.min(index * 0.012, 0.28) : 0;

          return (
            <motion.div
              key={`${label}-${stage}-${index}-${bit}`}
              initial={animated ? { y: stage === 'process' ? -8 : 8, opacity: 0 } : false}
              animate={animated ? { y: 0, opacity: 1 } : { opacity: 1 }}
              transition={{ duration: 0.28, delay }}
              className={`relative flex aspect-square min-h-[24px] items-center justify-center rounded-[7px] border font-mono text-[11px] font-semibold ${
                isMoved
                  ? 'border-[#F59E0B] bg-[#FEF3C7] text-[#92400E] shadow-[0_8px_18px_rgba(245,158,11,0.18)]'
                  : `${toneBg} ${toneText}`
              }`}
              title={isMoved ? `Bit yang dipindahkan ke belakang: ${bit}` : `Bit ${index + 1}`}
            >
              {bit}
              {isMoved && (
                <span className="absolute -right-1 -top-1 h-2 w-2 rounded-full bg-[#F59E0B] ring-2 ring-white" />
              )}
            </motion.div>
          );
        })}
      </div>
    );

    return (
      <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
        <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className={`text-[13px] font-semibold ${toneText}`}>{label}</div>
          <div className="inline-flex w-fit items-center gap-2 rounded-full bg-white px-3 py-1 text-[11px] font-semibold text-[#0F172A] ring-1 ring-[#E2E8F0]">
            <span className={`h-2 w-2 rounded-full ${toneDot}`} />
            {moveLabel}
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[1fr_auto_1fr_auto_1fr] xl:items-start">
          <div className="rounded-[14px] border border-[#E2E8F0] bg-white p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-[12px] font-semibold text-[#0F172A]">1. Sebelum shift</div>
              <div className="text-[10px] text-[#64748B]">28 bit</div>
            </div>
            <ShiftBitGrid bits={before} stage="before" />
          </div>

          <div className="flex items-center justify-center xl:pt-20">
            <motion.div
              animate={{ x: [-10, 10, -10] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="rounded-full bg-white p-2 text-[#2563EB] ring-1 ring-[#BFDBFE]"
            >
              <ArrowRight className="h-4 w-4 rotate-90 md:rotate-0" />
            </motion.div>
          </div>

          <div className="rounded-[14px] border border-[#BFDBFE] bg-[#EFF6FF] p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-[12px] font-semibold text-[#1D4ED8]">2. Proses shift</div>
              <div className="rounded-full bg-white px-2 py-0.5 text-[10px] font-semibold text-[#1D4ED8] ring-1 ring-[#BFDBFE]">
                {moveLabel}
              </div>
            </div>
            <ShiftBitGrid bits={processBits} stage="process" animated />
            <div className="mt-2 flex items-center justify-between gap-2 text-[11px] text-[#1D4ED8]">
              <span>Bit lain maju ke kiri</span>
              <span className="font-mono font-semibold">{moved} {'->'} belakang</span>
            </div>
          </div>

          <div className="flex items-center justify-center xl:pt-20">
            <motion.div
              animate={{ x: [-10, 10, -10] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.2 }}
              className="rounded-full bg-white p-2 text-[#2563EB] ring-1 ring-[#BFDBFE]"
            >
              <ArrowRight className="h-4 w-4 rotate-90 md:rotate-0" />
            </motion.div>
          </div>

          <div className="rounded-[14px] border border-[#E2E8F0] bg-white p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-[12px] font-semibold text-[#0F172A]">3. Hasil shift</div>
              <div className="text-[10px] text-[#64748B]">28 bit</div>
            </div>
            <ShiftBitGrid bits={after} stage="after" animated />
          </div>
        </div>
        <div className="mt-3 rounded-[10px] bg-white px-3 py-2 text-[12px] text-[#64748B] ring-1 ring-[#E2E8F0]">
          Bit paling kiri <span className="font-mono font-semibold text-[#92400E]">{moved}</span> diberi warna amber dan dipindahkan ke belakang, bukan dibuang.
        </div>
      </div>
    );
  };

  const stageContent = () => {
    if (stageIndex === 0) {
      return (
        <StoryCard>
          <div className="mb-4">
            <div className="text-[18px] font-semibold text-[#0F172A]">Key utama masuk sebagai 64 bit</div>
            <p className="mt-1 text-[13px] text-[#64748B]">Jangan fokus menghafal bitnya. Anggap ini sebagai deretan kartu yang akan dipilih dan diputar.</p>
          </div>
          <BitGrid bits={details.keyBits} columns="grid-cols-8" tone="blue" animated />
        </StoryCard>
      );
    }

    if (stageIndex === 1) {
      return (
        <StoryCard>
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-[18px] font-semibold text-[#0F172A]">PC-1 membuang parity bit</div>
              <p className="mt-1 text-[13px] text-[#64748B]">Bit yang redup tidak dibawa ke tahap berikutnya. Yang menyala menjadi 56-bit key.</p>
            </div>
            <div className="rounded-full bg-[#EFF6FF] px-3 py-1 text-[12px] font-medium text-[#1D4ED8]">64 bit {'->'} 56 bit</div>
          </div>
          <BitGrid
            bits={details.keyBits}
            columns="grid-cols-8"
            tone="blue"
            selectedPositions={pc1Selected}
            selectedMessage="Bit ini dipilih oleh PC-1."
            mutedMessage="Bit parity ini dibuang agar key menjadi 56 bit."
            animated
          />
        </StoryCard>
      );
    }

    if (stageIndex === 2) {
      return (
        <StoryCard>
          <div className="mb-4">
            <div className="text-[18px] font-semibold text-[#0F172A]">Hasil PC-1: key 56 bit</div>
            <p className="mt-1 text-[13px] text-[#64748B]">Ini adalah bahan baru yang akan dibelah menjadi dua setengah bagian.</p>
          </div>
          <BitGrid bits={details.keyAfterPc1} columns="grid-cols-7" tone="slate" animated />
        </StoryCard>
      );
    }

    if (stageIndex === 3) {
      return (
        <StoryCard>
          <div className="mb-5">
            <div className="text-[18px] font-semibold text-[#0F172A]">56 bit dibelah tepat di tengah</div>
            <p className="mt-1 text-[13px] text-[#64748B]">Bagian kiri menjadi C0. Bagian kanan menjadi D0. Dari sinilah shift akan bekerja.</p>
          </div>
          <div className="relative mb-4 rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <div className="absolute bottom-4 left-1/2 top-4 w-px bg-[#CBD5E1]" />
            <BitGrid bits={details.keyAfterPc1} columns="grid-cols-7" tone="slate" />
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <motion.div initial={{ x: 30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.45 }} className="rounded-[16px] border border-[#DDD6FE] bg-[#F5F3FF] p-4">
              <div className="mb-2 text-[22px] font-semibold text-[#6D28D9]">C0</div>
              <div className="mb-3 text-[12px] text-[#7C3AED]">LEFT 28 BITS {'->'} C0</div>
              <BitGrid bits={c0} columns="grid-cols-7" tone="purple" />
            </motion.div>
            <motion.div initial={{ x: -30, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ duration: 0.45 }} className="rounded-[16px] border border-[#BBF7D0] bg-[#F0FDF4] p-4">
              <div className="mb-2 text-[22px] font-semibold text-[#15803D]">D0</div>
              <div className="mb-3 text-[12px] text-[#15803D]">RIGHT 28 BITS {'->'} D0</div>
              <BitGrid bits={d0} columns="grid-cols-7" tone="green" />
            </motion.div>
          </div>
        </StoryCard>
      );
    }

    if (stageIndex === 4) {
      return (
        <StoryCard>
          <div className="mb-4">
            <div className="text-[18px] font-semibold text-[#0F172A]">C dan D diputar ke kiri</div>
            <p className="mt-1 text-[13px] text-[#64748B]">DES rotates both halves left to create a different key every round.</p>
          </div>
          <div className="space-y-3">
            <ShiftRow label={`C${currentRound - 1} -> C${currentRound}`} before={beforeC} after={schedule.c} tone="purple" />
            <ShiftRow label={`D${currentRound - 1} -> D${currentRound}`} before={beforeD} after={schedule.d} tone="green" />
          </div>
        </StoryCard>
      );
    }

    if (stageIndex === 5) {
      return (
        <StoryCard>
          <div className="mb-4">
            <div className="text-[18px] font-semibold text-[#0F172A]">C dan D disatukan kembali</div>
            <p className="mt-1 text-[13px] text-[#64748B]">Setelah diputar, dua bagian ini digabung menjadi satu deretan 56 bit.</p>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <div className="rounded-[16px] border border-[#DDD6FE] bg-[#F5F3FF] p-4">
              <div className="mb-2 text-[13px] font-semibold text-[#6D28D9]">C{currentRound}</div>
              <BitGrid bits={schedule.c} columns="grid-cols-7" tone="purple" />
            </div>
            <ArrowRight className="mx-auto h-5 w-5 rotate-90 text-[#94A3B8] md:rotate-0" />
            <div className="rounded-[16px] border border-[#BBF7D0] bg-[#F0FDF4] p-4">
              <div className="mb-2 text-[13px] font-semibold text-[#15803D]">D{currentRound}</div>
              <BitGrid bits={schedule.d} columns="grid-cols-7" tone="green" />
            </div>
          </div>
          <motion.div initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-4 rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <div className="mb-2 text-[13px] font-semibold text-[#0F172A]">Merged 56-bit key</div>
            <BitGrid bits={schedule.combined} columns="grid-cols-7" tone="slate" />
          </motion.div>
        </StoryCard>
      );
    }

    if (stageIndex === 6) {
      return (
        <StoryCard>
          <div className="mb-4">
            <div className="text-[18px] font-semibold text-[#0F172A]">PC-2 memilih bit untuk round key</div>
            <p className="mt-1 text-[13px] text-[#64748B]">DES only keeps certain bits to build a new round key. Bit yang redup tidak masuk K{currentRound}.</p>
          </div>
          <BitGrid
            bits={schedule.combined}
            columns="grid-cols-7"
            tone="blue"
            selectedPositions={pc2Selected}
            selectedMessage="Bit ini dipilih oleh PC-2."
            mutedMessage="Bit ini tidak digunakan untuk subkey ronde ini."
            animated
          />
          <motion.div initial={{ y: -10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.35 }} className="mt-4 flex justify-center">
            <div className="rounded-full bg-[#EFF6FF] px-4 py-2 text-[12px] font-medium text-[#1D4ED8] ring-1 ring-[#BFDBFE]">
              48 bit terpilih bergerak menjadi K{currentRound}
            </div>
          </motion.div>
        </StoryCard>
      );
    }

    return (
      <StoryCard>
        <div className="mb-4">
          <div className="text-[18px] font-semibold text-[#0F172A]">K{currentRound} berhasil dibentuk</div>
          <p className="mt-1 text-[13px] text-[#64748B]">
            K{currentRound} bukan muncul tiba-tiba. Nilai ini berasal dari C dan D yang digeser, digabung, lalu dipilih oleh PC-2.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-stretch">
          <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <div className="mb-3 text-[13px] font-semibold text-[#0F172A]">Kenapa K{currentRound} berbeda?</div>
            <div className="space-y-2 text-[12px] text-[#64748B]">
              <div className="rounded-[10px] bg-white px-3 py-2 ring-1 ring-[#E2E8F0]">
                1. Mulai dari C{currentRound - 1} dan D{currentRound - 1}.
              </div>
              <div className="rounded-[10px] bg-white px-3 py-2 ring-1 ring-[#E2E8F0]">
                2. Keduanya diputar kiri sebanyak <span className="font-semibold text-[#0F172A]">{schedule.shift}</span> bit, menjadi C{currentRound} dan D{currentRound}.
              </div>
              <div className="rounded-[10px] bg-white px-3 py-2 ring-1 ring-[#E2E8F0]">
                3. C{currentRound} + D{currentRound} digabung menjadi 56 bit.
              </div>
              <div className="rounded-[10px] bg-white px-3 py-2 ring-1 ring-[#E2E8F0]">
                4. PC-2 memilih 48 bit dari gabungan itu. Hasil 48 bit inilah K{currentRound}.
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center">
            <motion.div
              animate={{ y: [-6, 6, -6] }}
              transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
              className="rounded-full bg-white p-2 text-[#2563EB] ring-1 ring-[#BFDBFE]"
            >
              <ArrowRight className="h-5 w-5 rotate-90 lg:rotate-0" />
            </motion.div>
          </div>

          <motion.div
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 170, damping: 18 }}
            className="rounded-[18px] border border-white/70 bg-gradient-to-br from-white via-[#EFF6FF] to-[#F5F3FF] p-5 shadow-[0_22px_70px_rgba(37,99,235,0.16)]"
          >
            <div className="text-[40px] font-semibold text-[#2563EB]">K{currentRound}</div>
            <div className="mt-2 break-all font-mono text-[20px] font-semibold text-[#0F172A]">{schedule.subkey}</div>
            <div className="mt-2 text-[12px] text-[#64748B]">48-bit round key dari hasil PC-2</div>

            <div className="mt-4 rounded-[14px] bg-white/75 p-3 ring-1 ring-[#DBEAFE]">
              <div className="mb-2 text-[11px] font-semibold text-[#1D4ED8]">48 bit terpilih dibaca menjadi hex</div>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {subkeyBinaryGroups.map((bits, index) => (
                  <div key={`${bits}-${index}`} className="flex items-center justify-between gap-2 rounded-[10px] bg-[#F8FAFC] px-3 py-2 ring-1 ring-[#E2E8F0]">
                    <span className="font-mono text-[11px] text-[#475569]">{bits}</span>
                    <ArrowRight className="h-3.5 w-3.5 text-[#94A3B8]" />
                    <span className="rounded-[7px] bg-white px-2 py-1 font-mono text-[12px] font-semibold text-[#2563EB] ring-1 ring-[#BFDBFE]">
                      {subkeyHexGroups[index]}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>

        <div className="mt-4 rounded-[14px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3">
          <p className="text-[13px] text-[#1D4ED8]" style={{ lineHeight: 1.65 }}>
            Jadi untuk K{currentRound}, hasil <span className="font-mono font-semibold">{schedule.subkey}</span> muncul karena urutan bit gabungan C{currentRound}/D{currentRound} sudah berubah oleh shift, lalu PC-2 mengambil posisi tertentu dari gabungan tersebut.
          </p>
        </div>
      </StoryCard>
    );
  };

  return (
    <div className="bg-[#F8FAFC] border-[0.5px] border-[#E2E8F0] rounded-[18px] overflow-hidden mb-3">
      <div className="border-b-[0.5px] border-[#E2E8F0] bg-white px-5 py-5 md:px-6">
        <div>
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-[#F5F3FF] px-3 py-1 text-[11px] font-medium text-[#6D28D9] ring-1 ring-[#DDD6FE]">
              <CircleDot className="h-3.5 w-3.5" />
              Guided key transformation
            </div>
            <h2 className="mt-3 text-[22px] font-semibold text-[#0F172A] md:text-[28px]">
              Key Schedule & 16 Subkeys
            </h2>
            <p className="mt-1.5 max-w-[720px] text-[13px] text-[#64748B] md:text-[14px]" style={{ lineHeight: 1.7 }}>
              Ikuti bagaimana satu key utama dipilih, dibelah, diputar, lalu disaring menjadi subkey untuk setiap ronde.
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 md:p-6">
        <div className="mb-4 flex flex-wrap gap-1.5">
          {details.keySchedule.map((item) => (
            <button
              key={item.round}
              type="button"
              onClick={() => {
                setCurrentRound(item.round);
                setStageIndex(0);
              }}
              className={`h-8 rounded-[8px] border px-2.5 text-[10px] font-medium transition-colors ${
                item.round === currentRound
                  ? 'bg-[#2563EB] text-white border-[#2563EB]'
                  : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-[#EFF6FF]'
              }`}
            >
              K{item.round}
            </button>
          ))}
        </div>

        <div className="mb-5 rounded-[18px] border border-[#E2E8F0] bg-white p-4 shadow-sm">
          <div className="grid grid-cols-2 gap-2 md:grid-cols-4 xl:grid-cols-8">
            {stages.map((stage, index) => {
              const active = index === stageIndex;
              const past = index < stageIndex;
              return (
                <button
                  key={stage.title}
                  type="button"
                  onClick={() => goToStage(index)}
                  className={`relative rounded-[12px] border px-3 py-3 text-left transition-all ${
                    active
                      ? 'border-[#2563EB] bg-[#EFF6FF] shadow-[0_0_0_3px_rgba(191,219,254,0.85)]'
                      : past
                        ? 'border-[#BBF7D0] bg-[#F0FDF4]'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] opacity-60'
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="key-schedule-stage-glow"
                      className="absolute inset-0 rounded-[12px] ring-2 ring-[#93C5FD]"
                    />
                  )}
                  <div className={`relative text-[11px] font-semibold ${active ? 'text-[#1D4ED8]' : past ? 'text-[#15803D]' : 'text-[#64748B]'}`}>
                    {stage.short}
                  </div>
                  <div className="relative mt-1 h-1 rounded-full bg-white/70">
                    <motion.div
                      animate={{ width: active || past ? '100%' : '0%' }}
                      transition={{ duration: 0.35 }}
                      className={`h-full rounded-full ${active ? 'bg-[#2563EB]' : 'bg-[#22C55E]'}`}
                    />
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {stageContent()}

        <motion.div
          key={`${stageIndex}-${hoverMessage}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="mt-4 rounded-[14px] border border-[#BFDBFE] bg-white px-4 py-3 shadow-sm"
        >
          <div className="text-[12px] font-semibold text-[#1D4ED8]">{activeStage.title}</div>
          <p className="mt-1 text-[13px] text-[#1D4ED8]" style={{ lineHeight: 1.65 }}>
            {hoverMessage || activeStage.text}
          </p>
        </motion.div>

        <div className="mt-4 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={() => goToStage(stageIndex - 1)}
            disabled={stageIndex === 0}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#0F172A] transition-colors hover:bg-[#F8FAFC] disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" />
            Tahap Sebelumnya
          </button>
          <button
            type="button"
            onClick={() => goToStage(stageIndex + 1)}
            disabled={stageIndex === stages.length - 1}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#2563EB] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-40"
          >
            Tahap Berikutnya
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-4 rounded-[14px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3">
          <div className="text-[12px] font-semibold text-[#78350F]">Kenapa Ini Penting?</div>
          <p className="mt-1 text-[12px] text-[#92400E]" style={{ lineHeight: 1.65 }}>
            DES membuat subkey berbeda di setiap ronde agar hubungan plaintext dan ciphertext lebih sulit ditebak.
          </p>
        </div>

      </div>
    </div>
  );
}

function Step4Visual({ details }: { details: DESDetails }) {
  const roundsData: FeistelRoundData[] = details.rounds.map((round) => ({
    round: round.round,
    leftInput: round.L,
    rightInput: round.R,
    expansion: round.expandedR,
    xorWithKey: round.xorWithSubkey,
    sboxOutput: round.sBoxOutput,
    permutationOutput: round.pOutput,
    leftOutput: round.newL,
    rightOutput: round.newR,
    subkey: details.keySchedule[round.subkeyIndex - 1]?.subkey ?? '',
  }));

  return <FeistelRoundsVisualization data={roundsData} />;
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

function Step5Visual({ details }: { details: DESDetails }) {
  const finalBits = parseBitString(details.finalOutputBits);

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Langkah 5: Final Swap, Final Permutation, dan ciphertext</span>
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

function Step6Visual({ avalanche }: { avalanche: DESAvalancheResult }) {
  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Langkah 6: Analisis Avalanche Effect</span>
      </div>
      <div className="p-4">
        <div className="mb-4 rounded-[10px] border-[0.5px] border-[#BFDBFE] bg-[#EFF6FF] px-3.5 py-3">
          <p className="text-[12px] text-[#1D4ED8]" style={{ lineHeight: 1.65 }}>
            Setelah ciphertext final dihasilkan, kita dapat menguji Avalanche Effect untuk melihat seberapa besar perubahan output ketika input diubah sedikit.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

  useEffect(() => {
    document.title = `${step.badgeLabel}: ${step.title} | Visualisasi DES`;
  }, [step]);

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
          <div className="mb-2 text-[11px] text-[#94A3B8]">
            DES / {step.badgeLabel} / {step.breadcrumbLabel}
          </div>
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
            <span className="text-[11px] font-medium">{step.badgeLabel}</span>
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
            {currentStep === 2 && <Step3StoryVisual currentRound={currentRound} setCurrentRound={setCurrentRound} details={details} />}
            {currentStep === 3 && <Step4Visual details={details} />}
            {currentStep === 4 && <Step5Visual details={details} />}
            {currentStep === 5 && <Step6Visual avalanche={avalanche} />}
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
              onClick={() =>
                navigate('/uji-coba', {
                  state: {
                    mode: 'encrypt',
                    algorithm: 'DES',
                    input: plaintext,
                    key,
                  },
                })
              }
              className="flex items-center gap-2 px-4 py-2 rounded-[8px] border-[0.5px] border-[#E2E8F0] bg-transparent text-[13px] text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Ubah input
            </button>
            {currentStep === 5 ? (
              <button
                onClick={() =>
                  navigate('/uji-coba', {
                    state: {
                      mode: 'encrypt',
                      algorithm: 'DES',
                      input: plaintext,
                      key,
                    },
                  })
                }
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
