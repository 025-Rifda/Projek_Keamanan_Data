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
  FlaskConical,
  LockKeyhole,
} from 'lucide-react';
import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { FeistelRoundsVisualization, type FeistelRoundData } from '../components/FeistelRoundsVisualization';
import { useAlgorithm } from '../context/AlgorithmContext';
import {
  calculateDESAvalanche,
  DES_FINAL_PERMUTATION_TABLE,
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
    why: 'DES bekerja penuh pada bit. Karena itu, plaintext perlu diubah ke representasi 64-bit yang stabil sebelum proses pengacakan berlapis dimulai. Kamu akan melihat bagaimana bit-bit ini bergerak di langkah-langkah berikutnya.',
    tagColor: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' },
  },
  {
    num: 2,
    badgeLabel: 'Langkah 2',
    breadcrumbLabel: 'Split L0 dan R0',
    slug: 'split-l0-r0',
    title: 'Initial Permutation (IP)',
    subtitle: '64 bit plaintext diatur ulang sesuai tabel IP tanpa mengubah nilainya.',
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
];

const stepRoadmapLabels = ['Biner', 'IP', 'Key', 'Feistel', 'FP'];

function formatChar(char: string): ReactNode {
  if (char === '\0') return <span title="Karakter padding (posisi kosong)">∅</span>;
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

interface TutorialContent {
  happening: ReactNode;
  why: ReactNode;
  effect: ReactNode;
  connector: ReactNode;
}

function TutorialPanel({ enabled, content }: { enabled: boolean; content: TutorialContent }) {
  if (!enabled) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.22 }}
      className="mb-4 rounded-[16px] border border-[#BFDBFE] bg-white p-4 shadow-sm"
    >
      <div className="grid gap-3 md:grid-cols-3">
        {[
          ['Apa yang terjadi?', content.happening],
          ['Kenapa ini perlu?', content.why],
          ['Efeknya apa?', content.effect],
        ].map(([title, body]) => (
          <div key={String(title)} className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-3">
            <div className="mb-1 text-[12px] font-semibold text-[#0F172A]">{title}</div>
            <div className="text-[12px] text-[#64748B]" style={{ lineHeight: 1.65 }}>
              {body}
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3 rounded-[12px] border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-3 text-[12px] text-[#15803D]">
        {content.connector}
      </div>
    </motion.div>
  );
}

function Step1Visual({ details, tutorialMode }: { details: DESDetails; tutorialMode: boolean }) {
  const chars = details.inputText.padEnd(8, '\0').slice(0, 8).split('');
  const ascii = chars.map((char) => char.charCodeAt(0));
  const bytes = details.inputBits.match(/.{1,8}/g) ?? [];
  const keyChars = details.keyText.padEnd(8, '\0').slice(0, 8).split('');
  const keyAscii = keyChars.map((char) => char.charCodeAt(0));
  const keyBytes = details.keyBits.match(/.{1,8}/g) ?? [];
  const hasPaddingChar = chars.some((char) => char === '\0');
  const [activeCharIndex, setActiveCharIndex] = useState(0);
  const [activeKeyCharIndex, setActiveKeyCharIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isKeyPlaying, setIsKeyPlaying] = useState(false);

  useEffect(() => {
    if (!isPlaying) return undefined;

    const timer = window.setInterval(() => {
      setActiveCharIndex((current) => (current + 1) % chars.length);
    }, 1400);

    return () => window.clearInterval(timer);
  }, [chars.length, isPlaying]);

  useEffect(() => {
    if (!isKeyPlaying) return undefined;

    const timer = window.setInterval(() => {
      setActiveKeyCharIndex((current) => (current + 1) % keyChars.length);
    }, 1400);

    return () => window.clearInterval(timer);
  }, [isKeyPlaying, keyChars.length]);

  const activeChar = chars[activeCharIndex] ?? '\0';
  const activeCharLabel = activeChar === '\0' ? 'posisi kosong' : activeChar === ' ' ? 'spasi' : activeChar;
  const activeAscii = ascii[activeCharIndex] ?? 0;
  const activeByte = bytes[activeCharIndex] ?? '00000000';
  const activeKeyChar = keyChars[activeKeyCharIndex] ?? '\0';
  const activeKeyCharLabel = activeKeyChar === '\0' ? 'posisi kosong' : activeKeyChar === ' ' ? 'spasi' : activeKeyChar;
  const activeKeyAscii = keyAscii[activeKeyCharIndex] ?? 0;
  const activeKeyByte = keyBytes[activeKeyCharIndex] ?? '00000000';

  const renderCharCard = (
    char: string,
    index: number,
    asciiValue: number,
    byte: string | undefined,
    tone: 'blue' | 'purple',
  ) => {
    const isPadding = char === '\0';
    const isActive = tone === 'blue' ? index === activeCharIndex : index === activeKeyCharIndex;
    const toneClass = tone === 'blue' ? 'text-[#1D4ED8]' : 'text-[#6D28D9]';
    const activeRingClass = tone === 'blue' ? 'ring-2 ring-[#93C5FD]' : 'ring-2 ring-[#C4B5FD]';
    const cardClass = isPadding
      ? 'bg-[#F8FAFC] border-[0.5px] border-dashed border-[#CBD5E1] opacity-60'
      : 'bg-[#F8FAFC] border-[0.5px] border-[#E2E8F0]';
    const readableChar = char === '\0' ? 'posisi kosong' : char === ' ' ? 'spasi' : char;

    return (
      <motion.div
        key={`${tone}-${char}-${index}`}
        animate={{ scale: isActive ? 1.04 : 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 20 }}
        title={`Huruf '${readableChar}' punya kode ASCII ${asciiValue}. ${asciiValue} dalam biner adalah ${byte}.`}
        className={`${cardClass} ${isActive ? activeRingClass : ''} rounded-[8px] px-3 py-2.5`}
      >
        <div className={`text-[18px] font-medium ${toneClass} mb-1`}>{formatChar(char)}</div>
        <div className="text-[10px] text-[#64748B] mb-1">ASCII: {asciiValue}</div>
        <div className="text-[11px] font-mono text-[#0F172A]">{byte}</div>
      </motion.div>
    );
  };

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Konversi plaintext ke 64 bit</span>
      </div>
      <div className="p-4">
        <TutorialPanel
          enabled={tutorialMode}
          content={{
            happening: 'Setiap karakter plaintext dibaca sebagai angka ASCII, lalu angka itu ditulis menjadi 8 bit. Karena DES bekerja per blok 64 bit, 8 karakter menghasilkan 8 x 8 bit.',
            why: 'DES tidak membaca huruf, hanya angka 0 dan 1. Konversi ini seperti mengganti huruf menjadi kartu angka agar mesin DES bisa mengocok dan mencampurnya.',
            effect: 'Setelah selesai, plaintext dan key sama-sama menjadi deretan 64 bit. Deretan bit plaintext akan masuk ke Initial Permutation, sedangkan key akan masuk ke Key Schedule.',
            connector: 'Setelah ini, hasil 64 bit plaintext akan dipakai di Step 2 sebagai input Initial Permutation.',
          }}
        />

        <div className="mb-4 rounded-[14px] border border-[#BFDBFE] bg-[#EFF6FF] p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[12px] font-semibold text-[#1D4ED8]">Animasi karakter ke biner</div>
            <button
              type="button"
              onClick={() => setIsPlaying((current) => !current)}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#2563EB] px-3 py-2 text-[12px] font-medium text-white transition-colors hover:bg-[#1D4ED8]"
            >
              {isPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {isPlaying ? 'Pause' : 'Mulai'}
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1.4fr] md:items-center">
            <div className="rounded-[12px] bg-white px-4 py-3 text-center ring-1 ring-[#BFDBFE]">
              <div className="text-[10px] font-semibold text-[#64748B]">Karakter</div>
              <div className="mt-1 text-[28px] font-semibold text-[#1D4ED8]">{formatChar(activeChar)}</div>
            </div>
            <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-[#2563EB] md:rotate-0" />
            <div className="rounded-[12px] bg-white px-4 py-3 text-center ring-1 ring-[#BFDBFE]">
              <div className="text-[10px] font-semibold text-[#64748B]">ASCII</div>
              <div className="mt-1 font-mono text-[22px] font-semibold text-[#0F172A]">{activeAscii}</div>
            </div>
            <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-[#2563EB] md:rotate-0" />
            <div className="rounded-[12px] bg-white px-4 py-3 text-center ring-1 ring-[#BFDBFE]">
              <div className="text-[10px] font-semibold text-[#64748B]">Binary 8 bit</div>
              <div className="mt-1 font-mono text-[18px] font-semibold text-[#1D4ED8]">{activeByte}</div>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-[#1D4ED8]" style={{ lineHeight: 1.65 }}>
            Huruf '{activeCharLabel}' punya kode ASCII {activeAscii}. {activeAscii} dalam biner adalah {activeByte}.
          </p>
        </div>

        <div className="mb-4 rounded-[10px] border-[0.5px] border-[#BFDBFE] bg-[#EFF6FF] px-3.5 py-3">
          <p className="text-[12px] text-[#1D4ED8]" style={{ lineHeight: 1.65 }}>
            DES tidak membaca huruf, hanya angka 0 dan 1. Itulah kenapa plaintext dan key dikonversi dulu menjadi bit.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {chars.map((char, index) => renderCharCard(char, index, ascii[index], bytes[index], 'blue'))}
        </div>
        {hasPaddingChar && (
          <div className="mb-4 rounded-[8px] border-[0.5px] border-[#FDE68A] bg-[#FFFBEB] px-3 py-2 text-[11px] text-[#92400E]">
            Posisi yang kosong diisi karakter padding agar mencapai 8 byte.
          </div>
        )}

        <div className="text-[11px] font-medium text-[#64748B] mb-2">Binary plaintext (64 bit)</div>
        <div className="bg-[#EFF6FF] border-[0.5px] border-[#BFDBFE] rounded-[10px] px-3 py-3 text-[12px] font-mono text-[#1D4ED8] break-all">
          {formatBinaryGroups(details.inputBits, 8)}
        </div>

        <div className="my-4 border-t-[0.5px] border-[#E2E8F0]" />

        <div className="mb-3 text-[11px] font-medium text-[#64748B]">Konversi key ke 64 bit</div>
        <div className="mb-4 rounded-[14px] border border-[#C4B5FD] bg-[#F5F3FF] p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[12px] font-semibold text-[#6D28D9]">Animasi key ke biner</div>
            <button
              type="button"
              onClick={() => setIsKeyPlaying((current) => !current)}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#7C3AED] px-3 py-2 text-[12px] font-medium text-white transition-colors hover:bg-[#6D28D9]"
            >
              {isKeyPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {isKeyPlaying ? 'Pause' : 'Mulai'}
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-[1fr_auto_1fr_auto_1.4fr] md:items-center">
            <div className="rounded-[12px] bg-white px-4 py-3 text-center ring-1 ring-[#C4B5FD]">
              <div className="text-[10px] font-semibold text-[#64748B]">Karakter</div>
              <div className="mt-1 text-[28px] font-semibold text-[#6D28D9]">{formatChar(activeKeyChar)}</div>
            </div>
            <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-[#7C3AED] md:rotate-0" />
            <div className="rounded-[12px] bg-white px-4 py-3 text-center ring-1 ring-[#C4B5FD]">
              <div className="text-[10px] font-semibold text-[#64748B]">ASCII</div>
              <div className="mt-1 font-mono text-[22px] font-semibold text-[#0F172A]">{activeKeyAscii}</div>
            </div>
            <ArrowRight className="mx-auto h-4 w-4 rotate-90 text-[#7C3AED] md:rotate-0" />
            <div className="rounded-[12px] bg-white px-4 py-3 text-center ring-1 ring-[#C4B5FD]">
              <div className="text-[10px] font-semibold text-[#64748B]">Binary 8 bit</div>
              <div className="mt-1 font-mono text-[18px] font-semibold text-[#6D28D9]">{activeKeyByte}</div>
            </div>
          </div>
          <p className="mt-3 text-[12px] text-[#6D28D9]" style={{ lineHeight: 1.65 }}>
            Huruf '{activeKeyCharLabel}' punya kode ASCII {activeKeyAscii}. {activeKeyAscii} dalam biner adalah {activeKeyByte}.
          </p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {keyChars.map((char, index) => renderCharCard(char, index, keyAscii[index], keyBytes[index], 'purple'))}
        </div>
        <div className="text-[11px] font-medium text-[#64748B] mb-2">Binary key (64 bit)</div>
        <div className="bg-[#F5F3FF] border-[0.5px] border-[#C4B5FD] rounded-[10px] px-3 py-3 text-[12px] font-mono text-[#6D28D9] break-all mb-4">
          {formatBinaryGroups(details.keyBits, 8)}
        </div>
        <div className="rounded-[8px] border-[0.5px] border-[#FDE68A] bg-[#FFFBEB] px-3 py-2 text-[11px] text-[#92400E]">
          Key akan diproses lebih lanjut di Langkah 3 (Key Schedule) untuk menghasilkan 16 subkey berbeda.
        </div>
      </div>
    </div>
  );
}

function Step2Visual({ details, tutorialMode }: { details: DESDetails; tutorialMode: boolean }) {
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
        <TutorialPanel
          enabled={tutorialMode}
          content={{
            happening: 'Initial Permutation memindahkan posisi 64 bit plaintext sesuai tabel IP. Permutasi bukan enkripsi: nilai bit tetap 0 atau 1, hanya kursinya yang berubah.',
            why: 'Bayangkan mengocok urutan kartu tanpa mengubah nilai kartunya. IP menyebarkan bit dari awal sehingga perubahan kecil langsung memengaruhi banyak posisi; ini disebut difusi awal.',
            effect: 'Output IP masih 64 bit, tetapi susunannya baru. Setelah itu hasilnya dibagi menjadi L0 dan R0 untuk masuk ke ronde Feistel.',
            connector: 'Setelah ini, hasil IP akan dipakai di Step 4 sebagai L0 dan R0, sedangkan key untuk ronde disiapkan di Step 3.',
          }}
        />

        <div className="mb-4 rounded-[14px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3">
          <p className="text-[13px] text-[#1D4ED8]" style={{ lineHeight: 1.65 }}>
            Permutasi bukan enkripsi: bit tidak berubah nilainya, hanya posisinya yang dipindah. Bayangkan mengocok urutan kartu tanpa mengubah nilai kartunya.
          </p>
        </div>

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
              Bit di posisi <span className="font-semibold">{sourcePosition}</span> pindah ke posisi{' '}
              <span className="font-semibold">{destinationPosition}</span>. {explanationText} Bit aktif saat ini berasal dari posisi{' '}
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
          {showDetail && (
            <>
              <button
                type="button"
                onClick={goNext}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
              >
                <SkipForward className="h-4 w-4" />
                Bit Selanjutnya →
              </button>
              <button
                type="button"
                onClick={goPrevious}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
              >
                <SkipBack className="h-4 w-4" />
                ← Bit Sebelumnya
              </button>
              <button
                type="button"
                onClick={reset}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-white px-4 py-2.5 text-[13px] font-medium text-[#0F172A] transition-colors hover:bg-[#F8FAFC]"
              >
                <RotateCcw className="h-4 w-4" />
                Reset
              </button>
            </>
          )}
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

function Step3StoryVisual({
  currentRound,
  setCurrentRound,
  details,
  tutorialMode,
}: {
  currentRound: number;
  setCurrentRound: (round: number) => void;
  details: DESDetails;
  tutorialMode: boolean;
}) {
  const [stageIndex, setStageIndex] = useState(0);
  const [hoverMessage, setHoverMessage] = useState('');
  const [isSplitPlaying, setIsSplitPlaying] = useState(false);
  const [splitActiveIndex, setSplitActiveIndex] = useState(-1);
  const [splitRunId, setSplitRunId] = useState(0);
  const [isMergePlaying, setIsMergePlaying] = useState(false);
  const [mergeActiveIndex, setMergeActiveIndex] = useState(-1);
  const [isPc2Playing, setIsPc2Playing] = useState(false);
  const [pc2ActiveOutputIndex, setPc2ActiveOutputIndex] = useState(-1);
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
  const parityPositions = [8, 16, 24, 32, 40, 48, 56, 64];
  const pc2OutputIndexByInput = new Map(pc2Table.map((position, index) => [position, index + 1]));
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
    { title: 'PC-2', short: 'PC-2', text: 'PC-2 memilih 48 bit sekaligus menyusun ulang urutannya. Sel aktif menunjukkan posisi output K yang sedang dibentuk.' },
    { title: `K${currentRound} Generated`, short: `K${currentRound}`, text: `48 bit terpilih menjadi K${currentRound}. Subkey ini dipakai pada ronde DES ke-${currentRound}.` },
  ];
  const activeStage = stages[stageIndex];

  const goToStage = (index: number) => setStageIndex(Math.max(0, Math.min(index, stages.length - 1)));

  useEffect(() => {
    setIsSplitPlaying(false);
    setSplitActiveIndex(-1);
    setIsMergePlaying(false);
    setMergeActiveIndex(-1);
    setIsPc2Playing(false);
    setPc2ActiveOutputIndex(-1);
  }, [currentRound, stageIndex]);

  useEffect(() => {
    if (!isSplitPlaying) return undefined;

    const timer = window.setInterval(() => {
      setSplitActiveIndex((current) => {
        if (current >= details.keyAfterPc1.length - 1) {
          setIsSplitPlaying(false);
          return current;
        }

        return current + 1;
      });
    }, 420);

    return () => window.clearInterval(timer);
  }, [details.keyAfterPc1.length, isSplitPlaying]);

  useEffect(() => {
    if (!isMergePlaying) return undefined;

    const timer = window.setInterval(() => {
      setMergeActiveIndex((current) => {
        if (current >= schedule.combined.length - 1) {
          setIsMergePlaying(false);
          return current;
        }

        return current + 1;
      });
    }, 420);

    return () => window.clearInterval(timer);
  }, [isMergePlaying, schedule.combined.length]);

  useEffect(() => {
    if (!isPc2Playing) return undefined;

    const timer = window.setInterval(() => {
      setPc2ActiveOutputIndex((current) => {
        if (current >= pc2Table.length - 1) {
          setIsPc2Playing(false);
          return current;
        }

        return current + 1;
      });
    }, 620);

    return () => window.clearInterval(timer);
  }, [isPc2Playing, pc2Table.length]);

  const startSplit = () => {
    setSplitRunId((current) => current + 1);
    setSplitActiveIndex(0);
    setIsSplitPlaying(true);
  };

  const startMerge = () => {
    setMergeActiveIndex(0);
    setIsMergePlaying(true);
  };

  const startPc2 = () => {
    setPc2ActiveOutputIndex((current) => (current >= pc2Table.length - 1 ? 0 : Math.max(current, 0)));
    setIsPc2Playing(true);
  };

  const Bit = ({
    bit,
    selected = true,
    tone = 'blue',
    index,
    animated = false,
    outputIndex,
  }: {
    bit: string;
    selected?: boolean;
    tone?: 'blue' | 'green' | 'purple' | 'slate' | 'amber';
    index?: number;
    animated?: boolean;
    outputIndex?: number;
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
    parityPositions,
    offset = 0,
    selectedMessage,
    mutedMessage,
    animated = false,
    outputOrderMap,
    enableHover = true,
  }: {
    bits: string;
    columns?: string;
    tone?: 'blue' | 'green' | 'purple' | 'slate' | 'amber';
    selectedPositions?: Set<number>;
    parityPositions?: Set<number>;
    offset?: number;
    selectedMessage?: string;
    mutedMessage?: string;
    animated?: boolean;
    outputOrderMap?: Map<number, number>;
    enableHover?: boolean;
  }) => (
    <div className={`grid min-w-0 ${columns} gap-1 sm:gap-1.5`}>
      {bits.split('').map((bit, index) => {
        const position = index + 1 + offset;
        const isParity = parityPositions ? parityPositions.has(position) : false;
        const selected = selectedPositions ? selectedPositions.has(position) : true;
        const outputIndex = outputOrderMap?.get(position);
        return (
          <div
            key={`${bit}-${index}-${position}`}
            onMouseEnter={
              enableHover
                ? () => {
                    if (outputIndex !== undefined) {
                      setHoverMessage(`Output bit ke-${outputIndex} K${currentRound} berasal dari input bit ke-${position}.`);
                      return;
                    }
                    setHoverMessage(isParity ? 'Bit parity ini dipakai untuk error checking dan dibuang oleh PC-1.' : selected ? selectedMessage ?? '' : mutedMessage ?? '');
                  }
                : undefined
            }
            onMouseLeave={enableHover ? () => setHoverMessage('') : undefined}
          >
            <Bit bit={bit} selected={selected || isParity} tone={isParity ? 'amber' : tone} index={index} animated={animated} outputIndex={outputIndex} />
          </div>
        );
      })}
    </div>
  );

  const AnimatedBitGrid = ({
    bits,
    columns = 'grid-cols-7',
    tone = 'blue',
    activeIndex = -1,
    revealUntil,
    offset = 0,
  }: {
    bits: string;
    columns?: string;
    tone?: 'blue' | 'green' | 'purple' | 'slate';
    activeIndex?: number;
    revealUntil?: number;
    offset?: number;
  }) => {
    const toneClass = {
      blue: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]',
      green: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]',
      purple: 'bg-[#F5F3FF] border-[#DDD6FE] text-[#6D28D9]',
      slate: 'bg-white border-[#CBD5E1] text-[#475569]',
    }[tone];

    return (
      <div className={`grid min-w-0 ${columns} gap-1 sm:gap-1.5`}>
        {bits.split('').map((bit, index) => {
          const globalIndex = index + offset;
          const isActive = globalIndex === activeIndex;
          const isVisible = revealUntil === undefined || globalIndex <= revealUntil;
          return (
            <motion.div
              key={`animated-${tone}-${globalIndex}-${bit}`}
              initial={false}
              animate={{ scale: isActive ? 1.14 : 1, opacity: isVisible ? 1 : 0.14 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className={`relative flex aspect-square min-h-[24px] items-center justify-center rounded-[7px] border font-mono text-[11px] font-semibold ${
                isActive
                  ? 'border-[#2563EB] bg-[#2563EB] text-white shadow-[0_10px_22px_rgba(37,99,235,0.24)]'
                  : toneClass
              }`}
            >
              {isVisible ? bit : ''}
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderPc2InputGrid = () => {
    const activeInputPosition = pc2ActiveOutputIndex >= 0 ? pc2Table[pc2ActiveOutputIndex] : null;

    return (
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {schedule.combined.split('').map((bit, index) => {
          const position = index + 1;
          const selected = pc2Selected.has(position);
          const outputIndex = pc2OutputIndexByInput.get(position);
          const isActive = activeInputPosition === position;

          return (
            <motion.div
              key={`pc2-input-${position}-${bit}`}
              animate={{ scale: isActive ? 1.12 : 1, opacity: selected ? 1 : 0.24 }}
              transition={{ type: 'spring', stiffness: 320, damping: 22 }}
              className={`relative flex aspect-square min-h-[24px] items-center justify-center rounded-[7px] border font-mono text-[11px] font-semibold ${
                isActive
                  ? 'border-[#2563EB] bg-[#2563EB] text-white shadow-[0_10px_24px_rgba(37,99,235,0.24)]'
                  : selected
                    ? 'border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]'
                    : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#CBD5E1]'
              }`}
              title={outputIndex ? `Input bit ke-${position} menjadi output bit ke-${outputIndex}` : `Input bit ke-${position} tidak dipilih PC-2`}
            >
              {bit}
            </motion.div>
          );
        })}
      </div>
    );
  };

  const renderPc2OutputGrid = () => (
    <div className="grid grid-cols-6 gap-1">
      {pc2Table.map((position, index) => {
        const bit = pc2PickedBits[index];
        const isActive = index === pc2ActiveOutputIndex;
        const isRevealed = true;

        return (
          <motion.div
            key={`pc2-output-${position}-${index}`}
            animate={{ scale: isActive ? 1.1 : 1, opacity: isRevealed ? 1 : 0.2 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className={`flex min-h-[40px] flex-col items-center justify-center rounded-[7px] border px-1 py-1.5 text-center font-mono ${
              isActive
                ? 'border-[#2563EB] bg-[#2563EB] text-white shadow-[0_10px_24px_rgba(37,99,235,0.24)]'
                : bit === '1'
                  ? 'border-[#BFDBFE] bg-[#DBEAFE] text-[#1E3A8A]'
                  : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]'
            }`}
            title={`Bit output ke-${index + 1} = input bit ke-${position}`}
          >
            <span className={`text-[8px] font-medium leading-none ${isActive ? 'text-white/80' : 'text-[#94A3B8]'}`}>
              {index + 1}
            </span>
            <span className="mt-1 text-[12px] font-semibold leading-none">{isRevealed ? bit : ''}</span>
          </motion.div>
        );
      })}
    </div>
  );

  const renderStoryCard = (children: ReactNode) => (
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
    const moveLabel = `Circular Left Shift (${schedule.shift} bit)`;
    const toneText = tone === 'purple' ? 'text-[#6D28D9]' : 'text-[#15803D]';
    const toneBg = tone === 'purple' ? 'bg-[#F5F3FF] border-[#DDD6FE]' : 'bg-[#F0FDF4] border-[#BBF7D0]';
    const toneDot = tone === 'purple' ? 'bg-[#6D28D9]' : 'bg-[#16A34A]';

    const ShiftBitGrid = ({
      bits,
      stage,
      animated = false,
    }: {
      bits: string;
      stage: 'before' | 'after';
      animated?: boolean;
    }) => (
      <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
        {bits.split('').map((bit, index) => {
          const isMovedBefore = stage === 'before' && index < schedule.shift;
          const isMovedAtBack = stage === 'after' && index >= bits.length - schedule.shift;
          const isMoved = isMovedBefore || isMovedAtBack;
          const delay = animated ? Math.min(index * 0.012, 0.28) : 0;

          return (
            <motion.div
              key={`${label}-${stage}-${index}-${bit}`}
              initial={animated ? { y: 8, opacity: 0 } : false}
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

        <div className="grid gap-3 xl:grid-cols-[1fr_auto_1fr] xl:items-start">
          <div className="rounded-[14px] border border-[#E2E8F0] bg-white p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-[12px] font-semibold text-[#0F172A]">Sebelum Shift</div>
              <div className="text-[10px] text-[#64748B]">28 bit</div>
            </div>
            <ShiftBitGrid bits={before} stage="before" />
          </div>

          <div className="flex items-center justify-center xl:pt-20">
            <div className="flex flex-col items-center gap-2 rounded-[12px] bg-white px-3 py-2 text-center text-[#2563EB] ring-1 ring-[#BFDBFE]">
              <ArrowRight className="h-4 w-4 rotate-90 md:rotate-0" />
              <span className="text-[11px] font-semibold">rotate left</span>
            </div>
          </div>

          <div className="rounded-[14px] border border-[#E2E8F0] bg-white p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-[12px] font-semibold text-[#0F172A]">Sesudah Shift</div>
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
      return renderStoryCard(<>
          <div className="mb-4">
            <div className="text-[18px] font-semibold text-[#0F172A]">Key utama masuk sebagai 64 bit</div>
            <p className="mt-1 text-[13px] text-[#64748B]">Jangan fokus menghafal bitnya. Anggap ini sebagai deretan kartu yang akan dipilih dan diputar.</p>
          </div>
          <div className="mb-4 rounded-[12px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3">
            <p className="text-[12px] text-[#1D4ED8]" style={{ lineHeight: 1.65 }}>
              Key input berisi 8 karakter ASCII. Setiap karakter ASCII dibaca sebagai 8 bit, jadi 8 karakter menghasilkan 8 x 8 = 64 bit key.
            </p>
          </div>
          <BitGrid bits={details.keyBits} columns="grid-cols-8" tone="blue" animated />
        </>);
    }

    if (stageIndex === 1) {
      return renderStoryCard(<>
          <div className="mb-4 flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="text-[18px] font-semibold text-[#0F172A]">PC-1 membuang parity bit</div>
              <p className="mt-1 text-[13px] text-[#64748B]">Bit kuning tidak dibawa ke tahap berikutnya. Yang menyala menjadi 56-bit key.</p>
            </div>
            <div className="rounded-full bg-[#EFF6FF] px-3 py-1 text-[12px] font-medium text-[#1D4ED8]">64 bit {'->'} 56 bit</div>
          </div>
          <div className="mb-4 rounded-[12px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3">
            <div className="text-[12px] font-semibold text-[#78350F]">Parity bit yang dibuang</div>
            <p className="mt-1 text-[12px] text-[#92400E]" style={{ lineHeight: 1.65 }}>
              Bit ke-8, 16, 24, 32, 40, 48, 56, 64 adalah bit parity. Bit ini dipakai untuk error checking, bukan enkripsi, jadi DES membuangnya saat PC-1.
            </p>
            <div className="mt-2 flex flex-wrap gap-1">
              {parityPositions.map((position) => (
                <span key={position} className="rounded-[7px] border border-[#FDE68A] bg-white px-2 py-1 text-[10px] font-semibold text-[#92400E]">
                  bit {position}
                </span>
              ))}
            </div>
          </div>
          <BitGrid
            bits={details.keyBits}
            columns="grid-cols-8"
            tone="blue"
            selectedPositions={pc1Selected}
            parityPositions={new Set(parityPositions)}
            selectedMessage="Bit ini dipilih oleh PC-1."
            mutedMessage="Bit parity ini dibuang agar key menjadi 56 bit."
            animated
          />
        </>);
    }

    if (stageIndex === 2) {
      return renderStoryCard(<>
          <div className="mb-4">
            <div className="text-[18px] font-semibold text-[#0F172A]">Hasil PC-1: key 56 bit</div>
            <p className="mt-1 text-[13px] text-[#64748B]">Ini adalah bahan baru yang akan dibelah menjadi dua setengah bagian.</p>
          </div>
          <BitGrid bits={details.keyAfterPc1} columns="grid-cols-7" tone="blue" animated />
        </>);
    }

    if (stageIndex === 3) {
      const splitHasStarted = splitActiveIndex >= 0;
      const splitActiveTarget = splitActiveIndex < 28 ? 'C0' : 'D0';
      const splitActiveLocalPosition = splitActiveIndex < 28 ? splitActiveIndex + 1 : splitActiveIndex - 27;

      return renderStoryCard(<>
          <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-[18px] font-semibold text-[#0F172A]">56 bit dibelah tepat di tengah</div>
              <p className="mt-1 text-[13px] text-[#64748B]">Bagian kiri menjadi C0. Bagian kanan menjadi D0. Dari sinilah shift akan bekerja.</p>
            </div>
            <button
              type="button"
              onClick={isSplitPlaying ? () => setIsSplitPlaying(false) : startSplit}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#2563EB] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#1D4ED8]"
            >
              {isSplitPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isSplitPlaying ? 'Pause' : 'Mulai'}
            </button>
          </div>
          <div className="relative mb-4 rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <div className="absolute bottom-4 left-1/2 top-4 w-px bg-[#CBD5E1]" />
            <AnimatedBitGrid bits={details.keyAfterPc1} columns="grid-cols-7" tone="blue" activeIndex={splitActiveIndex} />
          </div>
          {splitHasStarted && (
            <div className="mb-4 rounded-[12px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-[12px] text-[#1D4ED8]">
              Bit input ke-{splitActiveIndex + 1} bergerak ke {splitActiveTarget} posisi {splitActiveLocalPosition}.
            </div>
          )}
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
            <motion.div
              key={`split-c0-${splitRunId}`}
              initial={splitHasStarted ? { x: 80, opacity: 0.72 } : false}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="rounded-[16px] border border-[#DDD6FE] bg-[#F5F3FF] p-4"
            >
              <div className="mb-2 text-[22px] font-semibold text-[#6D28D9]">C0</div>
              <div className="mb-3 text-[12px] text-[#7C3AED]">LEFT 28 BITS {'->'} C0</div>
              <AnimatedBitGrid bits={c0} columns="grid-cols-7" tone="purple" activeIndex={splitActiveIndex} />
            </motion.div>
            <motion.div
              key={`split-d0-${splitRunId}`}
              initial={splitHasStarted ? { x: -80, opacity: 0.72 } : false}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.45, ease: 'easeOut' }}
              className="rounded-[16px] border border-[#BBF7D0] bg-[#F0FDF4] p-4"
            >
              <div className="mb-2 text-[22px] font-semibold text-[#15803D]">D0</div>
              <div className="mb-3 text-[12px] text-[#15803D]">RIGHT 28 BITS {'->'} D0</div>
              <AnimatedBitGrid bits={d0} columns="grid-cols-7" tone="green" activeIndex={splitActiveIndex} offset={28} />
            </motion.div>
          </div>
        </>);
    }

    if (stageIndex === 4) {
      return renderStoryCard(<>
          <div className="mb-4">
            <div className="text-[18px] font-semibold text-[#0F172A]">C dan D diputar ke kiri</div>
            <p className="mt-1 text-[13px] text-[#64748B]">
              Round {currentRound} memakai left circular shift sebanyak {schedule.shift} bit. Bit paling kiri pindah ke belakang, bukan dibuang.
            </p>
          </div>
          <div className="mb-4 rounded-[14px] border border-[#E2E8F0] bg-white p-4">
            <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-[13px] font-semibold text-[#0F172A]">Shift schedule DES</div>
              <div className="flex flex-wrap gap-2 text-[10px] font-medium">
                <span className="rounded-full border border-[#FDE68A] bg-[#FFFBEB] px-2.5 py-1 text-[#92400E]">1 bit</span>
                <span className="rounded-full border border-[#E2E8F0] bg-[#F8FAFC] px-2.5 py-1 text-[#64748B]">2 bit</span>
                <span className="rounded-full border border-[#BFDBFE] bg-[#EFF6FF] px-2.5 py-1 text-[#1D4ED8]">ronde aktif</span>
              </div>
            </div>
            <p className="mb-4 text-[12px] text-[#64748B]" style={{ lineHeight: 1.6 }}>
              Ronde 1, 2, 9, dan 16 hanya shift 1 bit agar rotasi key tidak terlalu cepat berulang. Ronde lain shift 2 bit agar posisi bit key lebih cepat menyebar.
            </p>
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(76px, 1fr))' }}>
              {details.keySchedule.map((item) => (
                <div
                  key={`shift-note-${item.round}`}
                  className={`flex min-h-[52px] flex-col items-center justify-center rounded-[10px] border px-2 py-2 text-center font-semibold transition-colors ${
                    item.round === currentRound
                      ? 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8] shadow-sm ring-1 ring-[#BFDBFE]'
                      : item.shift === 1
                        ? 'border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B]'
                  }`}
                >
                  <span className="text-[11px] leading-none">Ronde {item.round}</span>
                  <span className="mt-1 text-[13px] leading-none">{item.shift} bit</span>
                </div>
              ))}
            </div>
          </div>
          <div className="space-y-3">
            <ShiftRow label={`C${currentRound - 1} -> C${currentRound}`} before={beforeC} after={schedule.c} tone="purple" />
            <ShiftRow label={`D${currentRound - 1} -> D${currentRound}`} before={beforeD} after={schedule.d} tone="green" />
          </div>
        </>);
    }

    if (stageIndex === 5) {
      const mergeHasStarted = mergeActiveIndex >= 0;
      const mergeActiveSource = mergeActiveIndex < 28 ? `C${currentRound}` : `D${currentRound}`;
      const mergeActiveLocalPosition = mergeActiveIndex < 28 ? mergeActiveIndex + 1 : mergeActiveIndex - 27;

      return renderStoryCard(<>
          <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="text-[18px] font-semibold text-[#0F172A]">C dan D disatukan kembali</div>
              <p className="mt-1 text-[13px] text-[#64748B]">Setelah diputar, dua bagian ini digabung menjadi satu deretan 56 bit.</p>
            </div>
            <button
              type="button"
              onClick={isMergePlaying ? () => setIsMergePlaying(false) : startMerge}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#2563EB] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#1D4ED8]"
            >
              {isMergePlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isMergePlaying ? 'Pause' : 'Mulai'}
            </button>
          </div>
          <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto_1fr] md:items-center">
            <div className="rounded-[16px] border border-[#DDD6FE] bg-[#F5F3FF] p-4">
              <div className="mb-2 text-[13px] font-semibold text-[#6D28D9]">C{currentRound}</div>
              <AnimatedBitGrid bits={schedule.c} columns="grid-cols-7" tone="purple" activeIndex={mergeActiveIndex} />
            </div>
            <div className="mx-auto flex h-9 w-9 items-center justify-center rounded-full border border-[#CBD5E1] bg-white text-[22px] font-semibold leading-none text-[#64748B] shadow-sm">
              +
            </div>
            <div className="rounded-[16px] border border-[#BBF7D0] bg-[#F0FDF4] p-4">
              <div className="mb-2 text-[13px] font-semibold text-[#15803D]">D{currentRound}</div>
              <AnimatedBitGrid bits={schedule.d} columns="grid-cols-7" tone="green" activeIndex={mergeActiveIndex} offset={28} />
            </div>
          </div>
          {mergeHasStarted && (
            <div className="mt-4 rounded-[12px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-[12px] text-[#1D4ED8]">
              Bit dari {mergeActiveSource} posisi {mergeActiveLocalPosition} masuk ke merged key posisi {mergeActiveIndex + 1}.
            </div>
          )}
          <motion.div initial={{ y: 14, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-4 rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <div className="mb-2 text-[13px] font-semibold text-[#0F172A]">Merged 56-bit key</div>
            <AnimatedBitGrid bits={schedule.combined} columns="grid-cols-7" tone="slate" activeIndex={mergeActiveIndex} />
          </motion.div>
        </>);
    }

    if (stageIndex === 6) {
      const activePc2InputPosition = pc2ActiveOutputIndex >= 0 ? pc2Table[pc2ActiveOutputIndex] : null;
      const activePc2Bit = pc2ActiveOutputIndex >= 0 ? pc2PickedBits[pc2ActiveOutputIndex] : null;

      return renderStoryCard(<>
          <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="text-[18px] font-semibold text-[#0F172A]">PC-2 memilih bit untuk round key</div>
              <p className="mt-1 text-[13px] text-[#64748B]">
                PC-2 tidak hanya membuang 8 bit yang tidak dipakai. Bit-bit yang terpilih juga disusun ulang posisinya sesuai tabel, jadi subkey tiap ronde punya pola yang unik.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:justify-end">
              <button
                type="button"
                onClick={isPc2Playing ? () => setIsPc2Playing(false) : startPc2}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#2563EB] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#1D4ED8]"
              >
                {isPc2Playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPc2Playing ? 'Pause' : 'Mulai'}
              </button>
            </div>
          </div>
          {renderPc2InputGrid()}
          {activePc2InputPosition !== null && (
            <div className="mt-4 rounded-[12px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-[12px] text-[#1D4ED8]">
              Output bit ke-{pc2ActiveOutputIndex + 1} K{currentRound} mengambil input bit ke-{activePc2InputPosition} dengan nilai <span className="font-mono font-semibold">{activePc2Bit}</span>.
            </div>
          )}
          <div className="mt-4 grid gap-3 lg:grid-cols-[1fr_1fr]">
            <div className="rounded-[14px] border border-[#E2E8F0] bg-[#F8FAFC] p-3">
              <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">Tabel referensi</div>
              <div className="mb-2 text-[12px] font-semibold text-[#0F172A]">Tabel PC-2 DES</div>
              <div className="grid grid-cols-6 gap-1">
                {pc2Table.map((position, index) => {
                  const isActive = index === pc2ActiveOutputIndex;

                  return (
                    <motion.button
                      key={`story-pc2-${position}-${index}`}
                      type="button"
                      onClick={() => {
                        setIsPc2Playing(false);
                        setPc2ActiveOutputIndex(index);
                      }}
                      animate={{ scale: isActive ? 1.08 : 1 }}
                      transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                      className={`rounded-[7px] border px-1 py-2 text-center font-mono text-[11px] font-semibold transition-colors ${
                        isActive
                          ? 'border-[#2563EB] bg-[#2563EB] text-white shadow-[0_10px_24px_rgba(37,99,235,0.24)]'
                          : 'border-[#BFDBFE] bg-white text-[#1D4ED8] hover:bg-[#EFF6FF]'
                      }`}
                      title={`Output bit ke-${index + 1} mengambil input bit ke-${position}`}
                    >
                      {position}
                    </motion.button>
                  );
                })}
              </div>
            </div>
            <div className="rounded-[14px] border border-[#BFDBFE] bg-[#EFF6FF] p-3">
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <div className="mb-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-[#94A3B8]">Hasil bit</div>
                  <div className="text-[12px] font-semibold text-[#1D4ED8]">Hasil PC-2 sesuai urutan tabel</div>
                </div>
                <div className="rounded-full bg-white px-2 py-1 font-mono text-[10px] font-semibold text-[#1D4ED8] ring-1 ring-[#BFDBFE]">
                  {schedule.subkey}
                </div>
              </div>
              {renderPc2OutputGrid()}
              <div className="mt-2 flex flex-wrap gap-1.5">
                {subkeyBinaryGroups.map((bits, index) => (
                  <span
                    key={`story-pc2-byte-${index}-${bits}`}
                    className="rounded-full bg-white px-2.5 py-1 font-mono text-[11px] font-semibold text-[#0F172A] ring-1 ring-[#BFDBFE]"
                  >
                    {bits}
                  </span>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-3 rounded-[14px] border border-[#BFDBFE] bg-[#EFF6FF] p-3">
            <div className="mb-2 text-[12px] font-semibold text-[#1D4ED8]">Cara membaca mapping</div>
            <div className="space-y-2 text-[12px] text-[#1D4ED8]">
              <div className="rounded-[10px] bg-white px-3 py-2 ring-1 ring-[#BFDBFE]">
                Output bit ke-1 K{currentRound} berasal dari input bit ke-{pc2Table[0]}.
              </div>
              <div className="rounded-[10px] bg-white px-3 py-2 ring-1 ring-[#BFDBFE]">
                Output bit ke-2 berasal dari input bit ke-{pc2Table[1]}.
              </div>
              <div className="rounded-[10px] bg-white px-3 py-2 ring-1 ring-[#BFDBFE]">
                Sel yang disorot menunjukkan output K{currentRound} yang sedang diisi.
              </div>
            </div>
          </div>
        </>);
    }

    return renderStoryCard(<>
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
        <div className="mt-4 rounded-[14px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-3">
          <p className="text-[13px] text-[#92400E]" style={{ lineHeight: 1.65 }}>
            Sekarang kamu punya K{currentRound}. Di ronde Feistel ke-{currentRound}, subkey ini akan di-XOR dengan R yang sudah diperluas. Tanpa subkey yang berbeda tiap ronde, DES jauh lebih mudah dipecah.
          </p>
        </div>
        </>);
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
        <TutorialPanel
          enabled={tutorialMode}
          content={{
            happening: 'Key Schedule mengubah satu key utama menjadi 16 subkey. Setiap ronde Feistel memakai subkey yang berbeda.',
            why: 'Kalau semua ronde memakai kunci yang sama, pola enkripsi lebih mudah ditebak. Subkey yang berubah membuat hubungan antara plaintext, key, dan ciphertext jauh lebih bercampur.',
            effect: `Pada ronde yang dipilih, DES menghasilkan K${currentRound}. Subkey ini nanti dipakai untuk mewarnai data kanan lewat operasi XOR di ronde Feistel.`,
            connector: `Setelah ini, K${currentRound} akan dipakai di Step 4 pada ronde Feistel ke-${currentRound} sebagai subkey XOR.`,
          }}
        />

        <div className="mb-4 rounded-[14px] border border-[#E2E8F0] bg-white p-3 shadow-sm">
          <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[12px] font-semibold text-[#0F172A]">Pilih subkey ronde</div>
            <div className="text-[11px] text-[#64748B]">
              K{currentRound} memakai left circular shift {schedule.shift} bit
            </div>
          </div>
          <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8 lg:grid-cols-16">
            {details.keySchedule.map((item) => (
              <button
                key={item.round}
                type="button"
                title={`K${item.round} memakai shift ${item.shift} bit`}
                onClick={() => {
                  setCurrentRound(item.round);
                  setStageIndex(0);
                }}
                className={`rounded-[8px] border px-2 py-2 text-[12px] font-semibold transition-colors ${
                  item.round === currentRound
                    ? 'border-[#2563EB] bg-[#2563EB] text-white'
                    : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:bg-[#EFF6FF]'
                }`}
              >
                K{item.round}
              </button>
            ))}
          </div>
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

      </div>
    </div>
  );
}

function Step4Visual({ details, tutorialMode }: { details: DESDetails; tutorialMode: boolean }) {
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

  return (
    <>
      <TutorialPanel
        enabled={tutorialMode}
        content={{
          happening: 'DES menjalankan 16 ronde Feistel. Di setiap ronde, sisi kanan masuk ke Function F, dicampur dengan subkey, lalu hasilnya di-XOR dengan sisi kiri.',
          why: 'Pengulangan membuat perubahan kecil menyebar makin jauh. Subkey memberi konfusi, sedangkan Expansion, S-Box, dan Permutasi P memberi difusi.',
          effect: 'Setelah 16 ronde, L dan R sudah saling memengaruhi berkali-kali. Hasil ronde terakhir akan masuk ke final swap dan Final Permutation.',
          connector: 'Setelah ini, hasil R16 dan L16 akan dipakai di Step 5 sebagai preoutput R16 || L16.',
        }}
      />
      <FeistelRoundsVisualization data={roundsData} tutorialMode={tutorialMode} />
    </>
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

function Step5Visual({ details, avalanche, tutorialMode }: { details: DESDetails; avalanche: DESAvalancheResult; tutorialMode: boolean }) {
  const [activeStage, setActiveStage] = useState(0);
  const [showAvalanche, setShowAvalanche] = useState(false);
  const [replayKey, setReplayKey] = useState(0);
  const [activeFpIndex, setActiveFpIndex] = useState(0);
  const [isFpPlaying, setIsFpPlaying] = useState(false);

  const stages = [
    { title: 'Final Swap', caption: 'R16 || L16' },
    { title: 'Final Permutation', caption: 'FP 64 posisi' },
    { title: 'Ciphertext', caption: 'Binary -> Hex' },
  ];

  const finalRound = details.rounds[details.rounds.length - 1];

  const preOutputBits = parseBitString(details.preOutputBits);
  const r16Bits = parseBitString(details.preOutputBits.slice(0, 32));
  const l16Bits = parseBitString(details.preOutputBits.slice(32, 64));
  const finalBits = parseBitString(details.finalOutputBits);
  const finalBytes = details.finalOutputBits.match(/.{1,8}/g) ?? [];
  const finalHexBytes = details.finalOutput.match(/.{1,2}/g) ?? [];

  const fpSourcePosition = DES_FINAL_PERMUTATION_TABLE[activeFpIndex];
  const fpSourceBit = preOutputBits[fpSourcePosition - 1];

  useEffect(() => {
    if (!isFpPlaying) return undefined;
    const timer = window.setInterval(() => {
      setActiveFpIndex((current) => {
        if (current >= DES_FINAL_PERMUTATION_TABLE.length - 1) {
          setIsFpPlaying(false);
          return current;
        }
        return current + 1;
      });
    }, 700);
    return () => window.clearInterval(timer);
  }, [isFpPlaying]);

  const renderStage0 = () => (
    <div className="space-y-5">
      <div className="rounded-[14px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3">
        <p className="text-[13px] text-[#1D4ED8]" style={{ lineHeight: 1.65 }}>
          Setelah 16 ronde Feistel selesai, blok hasil dibaca sebagai <span className="font-semibold">L16 || R16</span>. DES kemudian menukar dua bagian ini sehingga menjadi <span className="font-semibold">R16 || L16</span>. Tahap ini tidak menggunakan Function F, XOR, maupun subkey baru.
        </p>
      </div>

      <div className="rounded-[20px] border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <div className="mb-4">
          <div>
            <div className="text-[15px] font-semibold text-[#0F172A]">Sebelum dan sesudah final swap</div>
            <p className="mt-1 text-[12px] text-[#64748B]">Nilai bit tidak berubah, hanya posisi blok kiri dan kanan yang bertukar.</p>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-start">
          <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
            <div className="mb-3 text-[12px] font-semibold text-[#64748B]">Sebelum swap - L16 || R16</div>
            <div className="space-y-3">
              <div className="rounded-[12px] border border-[#BFDBFE] bg-[#EFF6FF] p-3">
                <div className="mb-2 text-[11px] font-semibold text-[#1D4ED8]">L16 - 32 bit kiri</div>
                <div className="grid grid-cols-8 gap-1">
                  {l16Bits.map((bit, i) => (
                    <div key={`pre-l-${i}`} className="flex h-7 items-center justify-center rounded-[6px] border border-[#BFDBFE] bg-white font-mono text-[11px] font-semibold text-[#1D4ED8]">
                      {bit}
                    </div>
                  ))}
                </div>
                <div className="mt-2 font-mono text-[10px] text-[#64748B]">{finalRound?.newL}</div>
              </div>
              <div className="rounded-[12px] border border-[#BBF7D0] bg-[#F0FDF4] p-3">
                <div className="mb-2 text-[11px] font-semibold text-[#15803D]">R16 - 32 bit kanan</div>
                <div className="grid grid-cols-8 gap-1">
                  {r16Bits.map((bit, i) => (
                    <div key={`pre-r-${i}`} className="flex h-7 items-center justify-center rounded-[6px] border border-[#BBF7D0] bg-white font-mono text-[11px] font-semibold text-[#15803D]">
                      {bit}
                    </div>
                  ))}
                </div>
                <div className="mt-2 font-mono text-[10px] text-[#64748B]">{finalRound?.newR}</div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center py-2 lg:py-0 lg:pt-24">
            <div className="flex h-12 w-12 items-center justify-center rounded-full border border-[#FDE68A] bg-[#FFFBEB] text-[#92400E] shadow-sm">
              <ArrowRight className="h-5 w-5 rotate-90 lg:rotate-0" />
            </div>
          </div>

          <div className="rounded-[16px] border border-[#FDE68A] bg-[#FFFBEB] p-4">
            <div className="mb-3 text-[12px] font-semibold text-[#92400E]">Sesudah swap - R16 || L16 (preoutput)</div>
            <div className="space-y-3">
              <div className="rounded-[12px] border border-[#BBF7D0] bg-white p-3">
                <div className="mb-2 text-[11px] font-semibold text-[#15803D]">R16 - 32 bit pertama</div>
                <div className="grid grid-cols-8 gap-1">
                  {r16Bits.map((bit, i) => (
                    <div key={`post-r-${i}`} className="flex h-7 items-center justify-center rounded-[6px] border border-[#BBF7D0] bg-[#F0FDF4] font-mono text-[11px] font-semibold text-[#15803D]">
                      {bit}
                    </div>
                  ))}
                </div>
                <div className="mt-2 font-mono text-[10px] text-[#64748B]">{finalRound?.newR}</div>
              </div>
              <div className="rounded-[12px] border border-[#BFDBFE] bg-white p-3">
                <div className="mb-2 text-[11px] font-semibold text-[#1D4ED8]">L16 - 32 bit terakhir</div>
                <div className="grid grid-cols-8 gap-1">
                  {l16Bits.map((bit, i) => (
                    <div key={`post-l-${i}`} className="flex h-7 items-center justify-center rounded-[6px] border border-[#BFDBFE] bg-[#EFF6FF] font-mono text-[11px] font-semibold text-[#1D4ED8]">
                      {bit}
                    </div>
                  ))}
                </div>
                <div className="mt-2 font-mono text-[10px] text-[#64748B]">{finalRound?.newL}</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-4">
        <div className="text-[13px] font-semibold text-[#0F172A] mb-3">Apa yang terjadi di final swap?</div>
        <div className="space-y-2">
          {['Tidak ada ronde ke-17', 'Tidak ada Function F', 'Tidak ada XOR', 'Tidak ada subkey baru'].map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[12px] text-[#475569]">
              <Check className="h-4 w-4 text-[#16A34A]" /> {item}
            </div>
          ))}
        </div>
      </div>
    </div>
  );

  const renderStage1 = () => (
    <div className="space-y-4">
      <div className="rounded-[14px] border border-[#A5F3FC] bg-[#ECFEFF] px-4 py-3">
        <p className="text-[12px] text-[#0E7490]" style={{ lineHeight: 1.65 }}>
          Final Permutation (FP) tidak mengubah nilai bit, hanya memindahkan posisi bit sesuai tabel FP standar DES. FP adalah kebalikan dari Initial Permutation (IP).
        </p>
      </div>

      <div className="grid min-w-0 gap-4 md:grid-cols-2">
        <div className="space-y-3">
          <div className="rounded-[14px] border border-[#FDE68A] bg-white p-3">
            <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#92400E]">Input FP - R16 || L16 (64 bit)</div>
              <div className="break-all font-mono text-[11px] font-semibold text-[#78350F]">{details.preOutput}</div>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {preOutputBits.map((bit, index) => {
                const isActive = index === fpSourcePosition - 1;
                return (
                  <motion.div
                    key={`fp-in-${index}`}
                    animate={{ scale: isActive ? 1.1 : 1 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                    title={`Bit ${index + 1}`}
                    className={`flex h-7 items-center justify-center rounded-[7px] border font-mono text-[11px] font-semibold ${
                      isActive
                        ? 'border-[#2563EB] bg-[#2563EB] text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]'
                        : bit === '1'
                          ? 'border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]'
                          : 'border-[#E2E8F0] bg-white text-[#94A3B8]'
                    }`}
                  >
                    {bit}
                  </motion.div>
                );
              })}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={isFpPlaying ? () => setIsFpPlaying(false) : () => { setActiveFpIndex((c) => c >= DES_FINAL_PERMUTATION_TABLE.length - 1 ? 0 : c); setIsFpPlaying(true); }}
              className="inline-flex items-center gap-2 rounded-[10px] bg-[#2563EB] px-4 py-2.5 text-[12px] font-medium text-white hover:bg-[#1D4ED8]"
            >
              {isFpPlaying ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
              {isFpPlaying ? 'Pause' : 'Mulai'}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          <div className="rounded-[14px] border border-[#E2E8F0] bg-white p-3">
            <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
              <div className="inline-flex items-center gap-2 text-[12px] font-semibold text-[#0F172A]">
                <Table2 className="h-4 w-4 text-[#2563EB]" /> Tabel Final Permutation (FP)
              </div>
              <div className="text-[11px] text-[#64748B]">Output mengambil posisi input</div>
            </div>
            <div className="grid grid-cols-8 gap-1">
              {DES_FINAL_PERMUTATION_TABLE.map((sourcePosition, index) => {
                const isActive = index === activeFpIndex;
                return (
                  <motion.button
                    key={`fp-table-${index}`}
                    type="button"
                    onClick={() => { setIsFpPlaying(false); setActiveFpIndex(index); }}
                    animate={{ scale: isActive ? 1.08 : 1 }}
                    transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                    title={`Output bit ke-${index + 1} mengambil input bit ke-${sourcePosition}`}
                    className={`h-8 rounded-[7px] border px-1 text-center font-mono text-[11px] font-semibold transition-colors ${
                      isActive
                        ? 'border-[#2563EB] bg-[#2563EB] text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)]'
                        : 'border-[#BFDBFE] bg-white text-[#1D4ED8] hover:bg-[#EFF6FF]'
                    }`}
                  >
                    {sourcePosition}
                  </motion.button>
                );
              })}
            </div>
            <div className="mt-2 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[11px] text-[#64748B]">
              Output bit ke-{activeFpIndex + 1} mengambil input posisi {DES_FINAL_PERMUTATION_TABLE[activeFpIndex]}.
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[14px] border border-[#BBF7D0] bg-white p-3">
        <div className="mb-2 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#15803D]">Output FP - ciphertext bits (64 bit)</div>
          <div className="break-all font-mono text-[11px] font-semibold text-[#14532D]">{details.finalOutput}</div>
        </div>
        <div className="grid grid-cols-8 gap-1 sm:grid-cols-16">
          {finalBits.map((bit, index) => {
            const isActive = index === activeFpIndex;
            return (
              <motion.div
                key={`fp-out-${index}`}
                animate={{ scale: isActive ? 1.1 : 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                title={`Bit ${index + 1}`}
                className={`flex h-7 items-center justify-center rounded-[7px] border font-mono text-[11px] font-semibold ${
                  isActive
                    ? 'border-[#2563EB] bg-[#2563EB] text-white shadow-[0_4px_12px_rgba(37,99,235,0.25)]'
                    : bit === '1'
                      ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]'
                      : 'border-[#E2E8F0] bg-white text-[#94A3B8]'
                }`}
              >
                {bit}
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );

  const renderStage2 = () => (
    <div className="space-y-5">
      <div className="rounded-[20px] border border-[#86EFAC] bg-gradient-to-br from-white via-[#F0FDF4] to-[#DCFCE7] p-5 text-center shadow-[0_18px_48px_rgba(22,163,74,0.14)]">
        <div className="mx-auto mb-3 flex h-11 w-11 items-center justify-center rounded-[14px] bg-white text-[#15803D] ring-1 ring-[#86EFAC]">
          <LockKeyhole className="h-5 w-5" />
        </div>
        <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#15803D]">Ciphertext final</div>
        <motion.div
          key={`ciphertext-${replayKey}`}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="mt-2 break-all font-mono text-[28px] font-semibold text-[#14532D] md:text-[38px]"
        >
          {details.finalOutput}
        </motion.div>
      </div>

      <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EFF6FF] font-mono text-[11px] font-semibold text-[#1D4ED8] ring-1 ring-[#BFDBFE]">1</span>
          <div className="text-[13px] font-semibold text-[#0F172A]">Hasil FP - 64 bit binary</div>
        </div>
        <div className="grid grid-cols-8 gap-1">
          {finalBits.map((bit, i) => (
            <div
              key={`ct-bit-${i}`}
              title={`Bit ${i + 1}`}
              className={`flex h-7 items-center justify-center rounded-[7px] border font-mono text-[11px] font-semibold ${
                bit === '1'
                  ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]'
                  : 'border-[#E2E8F0] bg-white text-[#94A3B8]'
              }`}
            >
              {bit}
            </div>
          ))}
        </div>
        <div className="mt-3 break-all rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 font-mono text-[11px] text-[#475569]">
          {details.finalOutputBits}
        </div>
      </div>

      <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EFF6FF] font-mono text-[11px] font-semibold text-[#1D4ED8] ring-1 ring-[#BFDBFE]">2</span>
          <div className="text-[13px] font-semibold text-[#0F172A]">Dikelompokkan menjadi 8 byte (masing-masing 8 bit)</div>
        </div>
        <div className="grid gap-2 md:grid-cols-4">
          {finalBytes.map((byte, index) => (
            <div key={`byte-${index}`} className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-3">
              <div className="mb-2 flex items-center justify-between gap-1">
                <span className="text-[11px] font-semibold text-[#64748B]">Byte {index + 1}</span>
              </div>
              <div className="grid grid-cols-8 gap-0.5 mb-2">
                {byte.split('').map((bit, bi) => (
                  <div
                    key={`byte-${index}-bit-${bi}`}
                    className={`flex h-6 items-center justify-center rounded-[5px] border font-mono text-[10px] font-semibold ${
                      bit === '1'
                        ? 'border-[#BBF7D0] bg-[#F0FDF4] text-[#15803D]'
                        : 'border-[#E2E8F0] bg-white text-[#94A3B8]'
                    }`}
                  >
                    {bit}
                  </div>
                ))}
              </div>
              <div className="flex items-center justify-between gap-1">
                <span className="font-mono text-[10px] text-[#64748B]">{byte}</span>
                <ArrowRight className="h-3 w-3 text-[#94A3B8]" />
                <span className="rounded-[7px] border border-[#86EFAC] bg-[#F0FDF4] px-2 py-0.5 font-mono text-[12px] font-semibold text-[#15803D]">
                  {finalHexBytes[index]}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[16px] border border-[#E2E8F0] bg-white p-4">
        <div className="mb-3 flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#EFF6FF] font-mono text-[11px] font-semibold text-[#1D4ED8] ring-1 ring-[#BFDBFE]">3</span>
          <div className="text-[13px] font-semibold text-[#0F172A]">Setiap byte ditulis sebagai 2 digit hex - digabung</div>
        </div>
        <div className="flex flex-wrap gap-2 mb-3">
          {finalHexBytes.map((hex, i) => (
            <div key={`hex-${i}`} className="flex flex-col items-center gap-1">
              <div className="text-[9px] text-[#64748B]">Byte {i + 1}</div>
              <div className="rounded-[8px] border border-[#86EFAC] bg-[#F0FDF4] px-3 py-2 font-mono text-[14px] font-semibold text-[#15803D]">{hex}</div>
            </div>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <ArrowRight className="h-4 w-4 text-[#64748B] rotate-90" />
        </div>
        <div className="mt-2 rounded-[12px] border border-[#86EFAC] bg-[#F0FDF4] px-4 py-3">
          <div className="text-[10px] font-semibold uppercase tracking-widest text-[#15803D] mb-1">Ciphertext (16 karakter hex)</div>
          <div className="break-all font-mono text-[22px] font-semibold text-[#14532D]">{details.finalOutput}</div>
        </div>
      </div>
    </div>
  );

  const goPrevious = () => setActiveStage((c) => Math.max(c - 1, 0));
  const goNext = () => setActiveStage((c) => Math.min(c + 1, stages.length - 1));

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="px-4 py-4 border-b-[0.5px] border-[#E2E8F0]">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className="text-[12px] font-medium text-[#64748B]">Langkah 5: Final Swap, Final Permutation, dan Ciphertext</div>
            <div className="mt-1 text-[16px] font-semibold text-[#0F172A]">{stages[activeStage].title}</div>
          </div>
          <div className="grid grid-cols-3 gap-1 rounded-[12px] bg-[#F1F5F9] p-1">
            {stages.map((stage, index) => (
              <button
                key={stage.title}
                type="button"
                onClick={() => setActiveStage(index)}
                className={`rounded-[9px] px-3 py-2 text-[11px] font-medium transition-colors ${
                  activeStage === index ? 'bg-white text-[#0F172A] shadow-sm' : 'text-[#64748B] hover:text-[#0F172A]'
                }`}
              >
                {index + 1}. {stage.title}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="p-4">
        <TutorialPanel
          enabled={tutorialMode}
          content={{
            happening: 'DES menutup proses dengan final swap, Final Permutation, lalu membaca 64 bit akhir sebagai ciphertext hex.',
            why: 'Final swap menjaga struktur Feistel tetap cocok untuk enkripsi dan dekripsi. FP membatalkan susunan IP sehingga format keluaran sesuai standar DES.',
            effect: 'Hasilnya adalah ciphertext 64 bit yang ditampilkan sebagai 16 karakter hex.',
            connector: 'Setelah ini, ciphertext final bisa diuji secara opsional dengan Avalanche Effect untuk melihat seberapa kuat difusinya.',
          }}
        />

        <motion.div
          key={activeStage}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
        >
          {activeStage === 0 && renderStage0()}
          {activeStage === 1 && renderStage1()}
          {activeStage === 2 && renderStage2()}
        </motion.div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={goPrevious}
            disabled={activeStage === 0}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-white px-4 py-2.5 text-[12px] font-medium text-[#0F172A] hover:bg-[#F8FAFC] disabled:opacity-40"
          >
            <ChevronLeft className="h-4 w-4" /> Sub-langkah sebelumnya
          </button>
          <button
            type="button"
            onClick={goNext}
            disabled={activeStage === stages.length - 1}
            className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#2563EB] px-4 py-2.5 text-[12px] font-medium text-white hover:bg-[#1D4ED8] disabled:opacity-40"
          >
            Sub-langkah berikutnya <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-5 rounded-[16px] border border-[#86EFAC] bg-[#F0FDF4] p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-white text-[#15803D] ring-1 ring-[#86EFAC]">
                <FlaskConical className="h-5 w-5" />
              </div>
              <div>
                <div className="text-[14px] font-semibold text-[#14532D]">Mau lihat Avalanche Effect?</div>
                <p className="mt-1 text-[12px] text-[#15803D]" style={{ lineHeight: 1.6 }}>
                  Lihat bagaimana 1 bit yang berubah di plaintext bisa mengacak sekitar 50% ciphertext.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowAvalanche((c) => !c)}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#16A34A] px-4 py-2.5 text-[13px] font-medium text-white hover:bg-[#15803D]"
            >
              {showAvalanche ? 'Sembunyikan' : 'Lihat Avalanche Effect'}
              <ChevronRight className={`h-4 w-4 transition-transform ${showAvalanche ? 'rotate-90' : ''}`} />
            </button>
          </div>
        </div>

        <motion.div
          initial={false}
          animate={showAvalanche ? { height: 'auto', opacity: 1 } : { height: 0, opacity: 0 }}
          transition={{ duration: 0.28, ease: 'easeInOut' }}
          className="overflow-hidden"
        >
          <div className="pt-4">
            <Step6Visual avalanche={avalanche} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function Step6Visual({ avalanche }: { avalanche: DESAvalancheResult }) {
  const AvalancheLegend = () => (
    <div className="mb-2 flex flex-wrap items-center gap-3 text-[11px] text-[#64748B]">
      <span className="font-medium text-[#0F172A]">
        {avalanche.differentBits} bit berubah dari {avalanche.totalBits} bit total ({avalanche.percentage.toFixed(1)}%)
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-[3px] border-[0.5px] border-[#FCA5A5] bg-[#FEE2E2]" />
        Bit berubah
      </span>
      <span className="inline-flex items-center gap-1.5">
        <span className="h-3 w-3 rounded-[3px] border-[0.5px] border-[#86EFAC] bg-[#DCFCE7]" />
        Bit sama
      </span>
    </div>
  );

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Analisis opsional: Avalanche Effect</span>
      </div>
      <div className="p-4">
        <div className="mb-4 rounded-[10px] border-[0.5px] border-[#86EFAC] bg-[#F0FDF4] px-3.5 py-3">
          <p className="text-[12px] text-[#15803D]" style={{ lineHeight: 1.65 }}>
            Properti kriptografi yang baik harus memiliki avalanche effect: perubahan 1 bit input harus mengubah sekitar 50% bit output secara acak. Jika perubahan terlalu sedikit, attacker bisa menebak plaintext dari perbedaan ciphertext.
          </p>
        </div>
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
            <AvalancheLegend />
            <AvalancheBitGrid sourceBits={avalanche.originalCipherBits} comparisonBits={avalanche.modifiedCipherBits} />
          </div>
          <div>
            <div className="text-[11px] font-medium text-[#64748B] mb-2">Plaintext dengan 1 bit dibalik</div>
            <div className="text-[12px] font-mono text-[#0F172A] mb-2">"{avalanche.modifiedPlaintext}"</div>
            <div className="text-[12px] text-[#64748B] mb-2">Ciphertext: <span className="font-mono text-[#0F172A]">{avalanche.modifiedCiphertext}</span></div>
            <AvalancheLegend />
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
  const { plaintext, key } = useAlgorithm();
  const [currentStep, setCurrentStep] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const [tutorialMode, setTutorialMode] = useState(() => {
    if (typeof window === 'undefined') return true;
    return window.localStorage.getItem('cryptoDES:tutorialMode') !== 'off';
  });
  const navigate = useNavigate();

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

  useEffect(() => {
    window.localStorage.setItem('cryptoDES:tutorialMode', tutorialMode ? 'on' : 'off');
  }, [tutorialMode]);

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((previous) => previous + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep((previous) => previous - 1);
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-56px)] bg-[#F8FAFC] pt-4 sm:pt-6 md:pt-8 pb-8 md:pb-12 px-3 sm:px-4 md:px-6 lg:px-8 xl:px-10">
      <div className="w-full max-w-[1180px] mx-auto">
        <div className="mb-3.5">
          <div className="mb-2 text-[11px] text-[#94A3B8]">
            DES / {step.badgeLabel} / {step.breadcrumbLabel}
          </div>
          <div className="mb-3 flex flex-col gap-2 rounded-[12px] border border-[#E2E8F0] bg-white px-3 py-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="text-[12px] font-semibold text-[#0F172A]">Tutorial Mode</div>
              <div className="text-[11px] text-[#64748B]">Tampilkan penjelasan pemula di setiap langkah DES.</div>
            </div>
            <button
              type="button"
              onClick={() => setTutorialMode((current) => !current)}
              className={`relative h-8 w-16 rounded-full border transition-colors ${
                tutorialMode ? 'border-[#2563EB] bg-[#2563EB]' : 'border-[#CBD5E1] bg-[#E2E8F0]'
              }`}
              aria-pressed={tutorialMode}
              aria-label="Toggle Tutorial Mode"
            >
              <span
                className={`absolute left-1 top-1 h-6 w-6 rounded-full bg-white shadow-sm transition-transform ${
                  tutorialMode ? 'translate-x-8' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-1.5 mb-2 sm:grid-cols-3 lg:grid-cols-5">
            {stepRoadmapLabels.map((label, index) => {
              const isPast = index < currentStep;
              const isActive = index === currentStep;

              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => setCurrentStep(index)}
                  className={`rounded-[8px] border px-2 py-2 text-[10px] font-medium transition-colors ${
                    isPast
                      ? 'border-[#2563EB] bg-[#2563EB] text-white'
                      : isActive
                        ? 'border-[#BFDBFE] bg-[#DBEAFE] text-[#1D4ED8]'
                        : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#64748B] hover:bg-[#EFF6FF]'
                  }`}
                >
                  <span className="block text-[9px] opacity-80">Langkah {index + 1}</span>
                  <span className="block">{label}</span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-[#64748B]">
            Langkah {currentStep + 1} dari 5 — {step.title}
          </p>
        </div>

        <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] px-4 py-4 sm:px-5 mb-3">
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
            {currentStep === 0 && <Step1Visual details={details} tutorialMode={tutorialMode} />}
            {currentStep === 1 && <Step2Visual details={details} tutorialMode={tutorialMode} />}
            {currentStep === 2 && <Step3StoryVisual currentRound={currentRound} setCurrentRound={setCurrentRound} details={details} tutorialMode={tutorialMode} />}
            {currentStep === 3 && <Step4Visual details={details} tutorialMode={tutorialMode} />}
            {currentStep === 4 && <Step5Visual details={details} avalanche={avalanche} tutorialMode={tutorialMode} />}
          </>
        )}

        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 mt-4">
          <button
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-[8px] border-[0.5px] border-[#E2E8F0] bg-transparent text-[13px] text-[#0F172A] hover:bg-[#F8FAFC] transition-colors disabled:opacity-35 order-2 md:order-1"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
            Sebelumnya
          </button>

          <div className="flex flex-col gap-2 order-1 sm:flex-row md:order-2">
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
              className="flex items-center justify-center gap-2 px-4 py-2 rounded-[8px] border-[0.5px] border-[#E2E8F0] bg-transparent text-[13px] text-[#0F172A] hover:bg-[#F8FAFC] transition-colors"
            >
              <Edit className="w-3.5 h-3.5" />
              Ubah input
            </button>
            {currentStep === 4 ? (
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
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-[8px] bg-[#16A34A] text-white text-[13px] font-medium hover:bg-[#15803D] transition-colors"
              >
                <Check className="w-3.5 h-3.5" />
                Selesai
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center justify-center gap-2 px-4 py-2 rounded-[8px] bg-[#2563EB] text-white text-[13px] font-medium hover:bg-[#1D4ED8] transition-colors"
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

