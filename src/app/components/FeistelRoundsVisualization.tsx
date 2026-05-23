import { Fragment, useEffect, useMemo, useState } from 'react';
import { ArrowRight, ChevronLeft, ChevronRight, CircleDot, Info, KeyRound, Pause, Play, Table2 } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { DES_EXPANSION_TABLE, DES_PERMUTATION_P_TABLE, DES_S_BOXES } from '../utils/des';

export interface FeistelRoundData {
  round: number;
  leftInput: string;
  rightInput: string;
  expansion: string;
  xorWithKey: string;
  sboxOutput: string;
  permutationOutput: string;
  leftOutput: string;
  rightOutput: string;
  subkey: string;
}

interface FeistelRoundsVisualizationProps {
  data: FeistelRoundData[];
  tutorialMode?: boolean;
}

type RoundStepId = 'input' | 'expansion' | 'xor-key' | 'sbox' | 'permutation' | 'output';

interface RoundStep {
  id: RoundStepId;
  tab: string;
  title: string;
  size: string;
  tone: 'blue' | 'green' | 'amber' | 'purple' | 'cyan' | 'rose';
  info: string;
}

const roundSteps: RoundStep[] = [
  {
    id: 'input',
    tab: 'Input',
    title: 'Input ronde Feistel',
    size: 'L dan R awal',
    tone: 'blue',
    info: 'R masuk ke Function F sebagai bahan utama. L menunggu, lalu nanti di-XOR dengan output Function F untuk membentuk R baru.',
  },
  {
    id: 'expansion',
    tab: 'Expansion E',
    title: 'Expansion E (32 -> 48 bit)',
    size: '32 -> 48 bit',
    tone: 'green',
    info: 'Expansion E menggandakan beberapa bit tepi agar R 32-bit menjadi 48-bit. Ukuran ini harus sama dengan subkey ronde.',
  },
  {
    id: 'xor-key',
    tab: 'XOR Subkey K',
    title: 'XOR dengan subkey ronde',
    size: '48 -> 48 bit',
    tone: 'blue',
    info: 'XOR memasukkan pengaruh kunci ke data. Bit output menjadi 1 jika bit ekspansi dan bit subkey berbeda.',
  },
  {
    id: 'sbox',
    tab: 'S-Box',
    title: 'S-Box DES (48 -> 32 bit)',
    size: '8 blok x 6 bit',
    tone: 'purple',
    info: 'Setiap 6 bit masuk ke satu S-Box. Bit pertama dan terakhir memilih baris, empat bit tengah memilih kolom, lalu hasilnya menjadi 4 bit.',
  },
  {
    id: 'permutation',
    tab: 'Permutasi P',
    title: 'Permutasi P',
    size: '32 -> 32 bit',
    tone: 'cyan',
    info: 'Permutation P menyebarkan output S-Box ke posisi baru agar perubahan kecil dapat memengaruhi ronde berikutnya.',
  },
  {
    id: 'output',
    tab: 'Output & Swap',
    title: 'Output ronde dan swap',
    size: 'L baru, R baru',
    tone: 'rose',
    info: 'L baru adalah R lama. R baru adalah L lama XOR output Function F. Swap ini membuat dua sisi saling memengaruhi di ronde berikutnya.',
  },
];

// All toneClass values use Tailwind dark: variants — no hardcoded hex
const toneClass = {
  blue: {
    active: 'border-blue-500 bg-blue-50 text-blue-700 dark:border-blue-400 dark:bg-blue-950 dark:text-blue-300',
    soft:   'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300',
    solid:  'bg-blue-600 text-white dark:bg-blue-500',
  },
  green: {
    active: 'border-green-500 bg-green-50 text-green-700 dark:border-green-400 dark:bg-green-950 dark:text-green-300',
    soft:   'border-green-200 bg-green-50 text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300',
    solid:  'bg-green-600 text-white dark:bg-green-500',
  },
  amber: {
    active: 'border-amber-500 bg-amber-50 text-amber-700 dark:border-amber-400 dark:bg-amber-950 dark:text-amber-300',
    soft:   'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300',
    solid:  'bg-amber-500 text-white dark:bg-amber-400',
  },
  purple: {
    active: 'border-violet-500 bg-violet-50 text-violet-700 dark:border-violet-400 dark:bg-violet-950 dark:text-violet-300',
    soft:   'border-violet-200 bg-violet-50 text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300',
    solid:  'bg-violet-600 text-white dark:bg-violet-500',
  },
  cyan: {
    active: 'border-cyan-500 bg-cyan-50 text-cyan-700 dark:border-cyan-400 dark:bg-cyan-950 dark:text-cyan-300',
    soft:   'border-cyan-200 bg-cyan-50 text-cyan-700 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-300',
    solid:  'bg-cyan-600 text-white dark:bg-cyan-500',
  },
  rose: {
    active: 'border-blue-300 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-300',
    soft:   'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300',
    solid:  'bg-blue-600 text-white dark:bg-blue-500',
  },
} satisfies Record<RoundStep['tone'], { active: string; soft: string; solid: string }>;

function hexToBits(hex: string, expectedLength: number) {
  const clean = hex.replace(/[^0-9a-f]/gi, '');
  const bits = clean
    .split('')
    .map((char) => parseInt(char, 16).toString(2).padStart(4, '0'))
    .join('');
  return bits.padStart(expectedLength, '0').slice(-expectedLength);
}

function binaryToHex(bits: string) {
  return bits.match(/.{1,4}/g)?.map((chunk) => parseInt(chunk.padEnd(4, '0'), 2).toString(16).toUpperCase()).join('') ?? '';
}

function pseudoSubkeyBits(round: number) {
  let seed = (round * 0x9e3779b1) >>> 0;
  let bits = '';
  while (bits.length < 48) {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    bits += seed.toString(2).padStart(32, '0');
  }
  return bits.slice(0, 48);
}

function getLabels(round: FeistelRoundData) {
  return {
    leftIn:   `L${round.round - 1}`,
    rightIn:  `R${round.round - 1}`,
    leftOut:  `L${round.round}`,
    rightOut: `R${round.round}`,
    subkey:   `K${round.round}`,
  };
}

function useRoundBits(round: FeistelRoundData) {
  return useMemo(() => {
    const leftInput        = hexToBits(round.leftInput, 32);
    const rightInput       = hexToBits(round.rightInput, 32);
    const expansion        = hexToBits(round.expansion, 48);
    const subkey           = round.subkey ? hexToBits(round.subkey, 48) : pseudoSubkeyBits(round.round);
    const xorWithKey       = hexToBits(round.xorWithKey, 48);
    const sboxOutput       = hexToBits(round.sboxOutput, 32);
    const permutationOutput = hexToBits(round.permutationOutput, 32);
    const leftOutput       = hexToBits(round.leftOutput, 32);
    const rightOutput      = hexToBits(round.rightOutput, 32);
    return {
      leftInput, rightInput, expansion, subkey,
      xorWithKey, sboxOutput, permutationOutput, leftOutput, rightOutput,
      xorChanged:    expansion.split('').map((bit, i) => bit !== subkey[i]),
      outputChanged: leftInput.split('').map((bit, i) => bit !== permutationOutput[i]),
    };
  }, [round]);
}

// ─── BitCell ────────────────────────────────────────────────────────────────

function BitCell({
  bit, index, active, changed, muted, title, size = 'normal',
}: {
  bit: string; index: number; active?: boolean; changed?: boolean;
  muted?: boolean; title?: string; size?: 'normal' | 'large' | 'xl';
}) {
  const sizeClass = { normal: 'h-6 w-6 text-[11px]', large: 'h-7 w-7 text-[12px]', xl: 'h-9 w-9 text-[14px]' }[size];
  const stateClass = active
    ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-500 shadow-sm'
    : changed
    ? 'border-amber-400 bg-amber-50 text-amber-800 dark:border-amber-500 dark:bg-amber-950 dark:text-amber-200'
    : bit === '1'
    ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300'
    : 'border-slate-200 bg-white text-slate-400 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-500';

  return (
    <div
      title={title ?? `Bit ${index + 1}`}
      className={`flex ${sizeClass} items-center justify-center rounded-[7px] border font-mono font-semibold transition-colors
        ${muted ? 'opacity-45' : ''}
        ${active ? 'ring-2 ring-blue-300 ring-offset-1 dark:ring-blue-700' : ''}
        ${stateClass}`}
    >
      {bit}
    </div>
  );
}

// ─── BitGrid ─────────────────────────────────────────────────────────────────

function BitGrid({
  bits, label, columns = 8, changedIndexes = [], activeIndexes = [],
  note, large = false, size,
}: {
  bits: string; label: string; columns?: 6 | 8; changedIndexes?: number[];
  activeIndexes?: number[]; note?: string; large?: boolean; size?: 'normal' | 'large' | 'xl';
}) {
  const changedSet = new Set(changedIndexes);
  const activeSet  = new Set(activeIndexes);
  const cellSize   = size ?? (large ? 'large' : 'normal');
  const isRoomy    = cellSize !== 'normal';

  return (
    <div className={`rounded-[14px] border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 ${isRoomy ? 'p-4' : 'p-3'}`}>
      <div className={`${isRoomy ? 'mb-3' : 'mb-2'} flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2`}>
        <div className={`${cellSize === 'xl' ? 'text-[12px]' : 'text-[11px]'} font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400`}>{label}</div>
        <div className={`${cellSize === 'xl' ? 'text-[12px]' : 'text-[11px]'} break-all font-mono font-semibold text-slate-900 dark:text-slate-100`}>{binaryToHex(bits)}</div>
      </div>
      <div className={`grid min-w-0 ${cellSize === 'xl' ? 'gap-2' : isRoomy ? 'gap-1.5' : 'gap-1'} ${columns === 6 ? 'grid-cols-6' : 'grid-cols-8'}`}>
        {bits.split('').map((bit, index) => (
          <BitCell
            key={`${label}-${index}`}
            bit={bit} index={index}
            changed={changedSet.has(index)}
            active={activeSet.has(index)}
            size={cellSize}
          />
        ))}
      </div>
      {note && (
        <div className="mt-3 rounded-[10px] border border-slate-200 bg-slate-50 px-3 py-2 text-[11px] text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400" style={{ lineHeight: 1.55 }}>
          {note}
        </div>
      )}
    </div>
  );
}

// ─── FeistelDiagram ──────────────────────────────────────────────────────────

function FeistelDiagram({ round }: { round: FeistelRoundData }) {
  const labels = getLabels(round);
  const readingSteps = [
    `Mulai dari ${labels.leftIn} (kiri atas) dan ${labels.rightIn} (kanan atas).`,
    `${labels.rightIn} masuk ke Function F bersama subkey ${labels.subkey}.`,
    `Hasil Function F di-XOR dengan ${labels.leftIn}.`,
    `Hasil XOR menjadi ${labels.rightOut} (output kanan).`,
    `${labels.leftOut} langsung mengambil nilai ${labels.rightIn} tanpa perubahan.`,
  ];

  return (
    <div className="feistel-diagram rounded-[14px] border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
      <div className="mb-3 text-[12px] font-semibold text-blue-700 dark:text-blue-300">Diagram Feistel ronde {round.round}</div>
      {/* SVG uses currentColor so it respects parent text color — specific fills via inline style referencing CSS vars */}
      <svg viewBox="0 0 520 260" className="h-auto w-full" role="img" aria-label="Diagram alur Feistel">
        <style>{`
          .svg-card  { fill: var(--svg-card-bg, #fff); }
          .svg-blue  { stroke: var(--svg-blue-border, #BFDBFE); }
          .svg-green { stroke: var(--svg-green-border, #BBF7D0); }
          .svg-amber { stroke: var(--svg-amber-border, #FDE68A); }
          .svg-rose  { stroke: var(--svg-rose-border, #FECDD3); }
          .svg-t-blue   { fill: var(--svg-t-blue, #1D4ED8); }
          .svg-t-green  { fill: var(--svg-t-green, #15803D); }
          .svg-t-amber  { fill: var(--svg-t-amber, #92400E); }
          .svg-t-rose   { fill: var(--svg-t-rose, #BE123C); }
          .svg-arrow    { fill: var(--svg-arrow, #2563EB); }
          .svg-line     { stroke: var(--svg-line, #2563EB); }
          .svg-line-g   { stroke: var(--svg-line-g, #16A34A); }
          .svg-xor-stroke { stroke: var(--svg-xor-border, #F59E0B); }

          @media (prefers-color-scheme: dark) {
            .svg-card  { fill: var(--svg-card-bg-dk, #0f172a); }
            .svg-blue  { stroke: var(--svg-blue-border-dk, #1e3a5f); }
            .svg-green { stroke: var(--svg-green-border-dk, #14532d); }
            .svg-amber { stroke: var(--svg-amber-border-dk, #78350f); }
            .svg-rose  { stroke: var(--svg-rose-border-dk, #4c0519); }
            .svg-t-blue   { fill: var(--svg-t-blue-dk, #93c5fd); }
            .svg-t-green  { fill: var(--svg-t-green-dk, #86efac); }
            .svg-t-amber  { fill: var(--svg-t-amber-dk, #fcd34d); }
            .svg-t-rose   { fill: var(--svg-t-rose-dk, #fda4af); }
            .svg-arrow    { fill: var(--svg-arrow-dk, #60a5fa); }
            .svg-line     { stroke: var(--svg-line-dk, #60a5fa); }
            .svg-line-g   { stroke: var(--svg-line-g-dk, #4ade80); }
            .svg-xor-stroke { stroke: var(--svg-xor-border-dk, #f59e0b); }
          }
        `}</style>
        <defs>
          <marker id={`arrow-${round.round}`} markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" className="svg-arrow" />
          </marker>
          <marker id={`arrow-g-${round.round}`} markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" className="svg-arrow" style={{ fill: 'var(--svg-line-g, #16A34A)' }} />
          </marker>
        </defs>
        <rect x="35"  y="28"  width="110" height="44" rx="10" className="svg-card svg-blue"  strokeWidth="1.5" />
        <text x="90"  y="55"  textAnchor="middle" fontSize="14" fontWeight="700" className="svg-t-blue">{labels.leftIn}</text>
        <rect x="375" y="28"  width="110" height="44" rx="10" className="svg-card svg-green" strokeWidth="1.5" />
        <text x="430" y="55"  textAnchor="middle" fontSize="14" fontWeight="700" className="svg-t-green">{labels.rightIn}</text>
        <rect x="344" y="106" width="172" height="50" rx="12" className="svg-card svg-amber" strokeWidth="1.5" />
        <text x="430" y="136" textAnchor="middle" fontSize="13" fontWeight="700" className="svg-t-amber">Function F({labels.rightIn}, {labels.subkey})</text>
        <circle cx="230" cy="131" r="18" className="svg-card svg-xor-stroke" strokeWidth="2" />
        <text x="230" y="137" textAnchor="middle" fontSize="13" fontWeight="700" className="svg-t-amber">XOR</text>
        <rect x="35"  y="190" width="110" height="44" rx="10" className="svg-card svg-green" strokeWidth="1.5" />
        <text x="90"  y="217" textAnchor="middle" fontSize="13" fontWeight="700" className="svg-t-green">{labels.leftOut} = {labels.rightIn}</text>
        <rect x="375" y="190" width="110" height="44" rx="10" className="svg-card svg-rose"  strokeWidth="1.5" />
        <text x="430" y="217" textAnchor="middle" fontSize="14" fontWeight="700" className="svg-t-rose">{labels.rightOut}</text>
        <path d="M430 72 V106" className="svg-line" strokeWidth="2.5" fill="none" markerEnd={`url(#arrow-${round.round})`} />
        <path d="M344 131 H248" className="svg-line" strokeWidth="2.5" fill="none" markerEnd={`url(#arrow-${round.round})`} />
        <path d="M145 50 C210 50 190 131 212 131" className="svg-line" strokeWidth="2.5" fill="none" markerEnd={`url(#arrow-${round.round})`} />
        <path d="M248 131 C305 131 315 212 375 212" className="svg-line" strokeWidth="2.5" fill="none" markerEnd={`url(#arrow-${round.round})`} />
        <path d="M430 72 C430 118 90 130 90 190" className="svg-line-g" strokeWidth="2.5" fill="none" markerEnd={`url(#arrow-g-${round.round})`} />
      </svg>
      <div className="mt-3 rounded-[12px] border border-blue-200 bg-white px-3 py-3 dark:border-blue-800 dark:bg-slate-900">
        <div className="mb-2 text-[12px] font-semibold text-blue-700 dark:text-blue-300">Cara membaca diagram</div>
        <div className="space-y-1.5">
          {readingSteps.map((step, index) => (
            <div key={step} className="flex gap-2 text-[12px] text-blue-700 dark:text-blue-300" style={{ lineHeight: 1.55 }}>
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-50 font-mono text-[10px] font-semibold ring-1 ring-blue-200 dark:bg-blue-950 dark:ring-blue-800">
                {index + 1}
              </span>
              <span>{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── MappingTable ─────────────────────────────────────────────────────────────

function MappingTable({
  table, inputBits, outputBits, label, columns, mappingOnly = false,
  activeIndex, onSelectIndex, large = false,
}: {
  table: number[]; inputBits: string; outputBits: string; label: string;
  columns: 6 | 8; mappingOnly?: boolean; activeIndex?: number;
  onSelectIndex?: (index: number) => void; large?: boolean;
}) {
  return (
    <div className={`min-w-0 rounded-[14px] border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-900 ${large ? 'p-4' : 'p-3'}`}>
      <div className={`${large ? 'mb-4' : 'mb-3'} flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2`}>
        <div className={`inline-flex items-center gap-2 ${large ? 'text-[14px]' : 'text-[12px]'} font-semibold text-slate-900 dark:text-slate-100`}>
          <Table2 className={`${large ? 'h-5 w-5' : 'h-4 w-4'} text-blue-600 dark:text-blue-400`} />
          {label}
        </div>
        <div className={`${large ? 'text-[12px]' : 'text-[11px]'} text-slate-500 dark:text-slate-400`}>Output mengambil posisi input</div>
      </div>
      <div className={`grid min-w-0 ${large ? 'gap-2' : 'gap-1'} ${columns === 6 ? 'grid-cols-6' : 'grid-cols-8'}`}>
        {table.map((sourcePosition, index) => {
          const bit = outputBits[index] ?? inputBits[sourcePosition - 1] ?? '0';
          const active = activeIndex === index;
          const interactive = onSelectIndex !== undefined;

          if (interactive) {
            return (
              <motion.button
                key={`${label}-${index}`}
                type="button"
                onClick={() => onSelectIndex(index)}
                animate={{ scale: active ? 1.08 : 1 }}
                transition={{ type: 'spring', stiffness: 320, damping: 22 }}
                title={`Output bit ke-${index + 1} mengambil input bit ke-${sourcePosition}`}
                className={`${large ? 'aspect-square min-h-[46px] rounded-[10px] text-[14px]' : 'h-8 rounded-[7px] text-[11px]'} border px-1 text-center font-mono font-semibold transition-colors ${
                  active
                    ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-400 dark:bg-blue-500'
                    : 'border-blue-200 bg-white text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:bg-slate-900 dark:text-blue-300 dark:hover:bg-blue-950'
                }`}
              >
                {sourcePosition}
              </motion.button>
            );
          }

          return (
            <div key={`${label}-${index}`} className={`${large ? 'rounded-[10px] px-2 py-2' : 'rounded-[7px] px-1.5 py-1'} border border-slate-200 bg-slate-50 text-center dark:border-slate-700 dark:bg-slate-800`}>
              {!mappingOnly && <div className={`font-mono ${large ? 'text-[13px]' : 'text-[11px]'} font-semibold text-slate-900 dark:text-slate-100`}>{bit}</div>}
              <div className={`${mappingOnly ? `font-mono ${large ? 'text-[12px]' : 'text-[10px]'} font-semibold text-slate-600 dark:text-slate-300` : `${large ? 'mt-1 text-[10px]' : 'mt-0.5 text-[8px]'} leading-none text-slate-400 dark:text-slate-500`}`}>
                {`${index + 1}<-${sourcePosition}`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ─── InfoBox ─────────────────────────────────────────────────────────────────

function InfoBox({ step }: { step: RoundStep }) {
  return (
    <div className={`rounded-[14px] border px-4 py-3 ${toneClass[step.tone].soft}`}>
      <div className="mb-1 flex items-center gap-2 text-[12px] font-semibold">
        <Info className="h-4 w-4" />
        Kenapa operasi ini dilakukan?
      </div>
      <p className="text-[12px]" style={{ lineHeight: 1.65 }}>
        {step.info}
      </p>
    </div>
  );
}

// ─── RoundSelector ───────────────────────────────────────────────────────────

function RoundSelector({ totalRounds, currentRound, onSelectRound }: {
  totalRounds: number; currentRound: number; onSelectRound: (round: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <span className="shrink-0 text-[12px] font-medium text-slate-500 dark:text-slate-400">Pilih ronde:</span>
      {Array.from({ length: totalRounds }, (_, index) => {
        const round  = index + 1;
        const active = round === currentRound;
        return (
          <button
            key={round}
            type="button"
            onClick={() => onSelectRound(round)}
            className={`h-8 min-w-[82px] shrink-0 rounded-[9px] border px-3 text-[12px] font-semibold transition-colors ${
              active
                ? 'border-slate-900 bg-slate-900 text-white dark:border-slate-100 dark:bg-slate-100 dark:text-slate-900'
                : 'border-slate-300 bg-white text-slate-500 hover:border-blue-500 hover:text-blue-600 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-blue-400 dark:hover:text-blue-300'
            }`}
          >
            Ronde {round}
          </button>
        );
      })}
    </div>
  );
}

// ─── MetaBar ─────────────────────────────────────────────────────────────────

function MetaBar({ round, totalRounds }: { round: FeistelRoundData; totalRounds: number }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="rounded-[9px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
        Ronde {round.round}/{totalRounds}
      </div>
      <div className="rounded-[9px] border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-400">
        Dipakai:
      </div>
      <div className="rounded-[9px] border border-blue-200 bg-blue-50 px-3 py-2 font-mono text-[12px] font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
        L{round.round - 1}
      </div>
      <div className="rounded-[9px] border border-green-200 bg-green-50 px-3 py-2 font-mono text-[12px] font-semibold text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
        R{round.round - 1}
      </div>
      <div className="rounded-[9px] border border-amber-200 bg-amber-50 px-3 py-2 font-mono text-[12px] font-semibold text-amber-700 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
        K{round.round}
      </div>
    </div>
  );
}

// ─── StepTabs ────────────────────────────────────────────────────────────────

function StepTabs({ activeIndex, onSelect }: { activeIndex: number; onSelect: (index: number) => void }) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-slate-300 bg-white dark:border-slate-600 dark:bg-slate-900">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
        {roundSteps.map((step, index) => {
          const active = index === activeIndex;
          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onSelect(index)}
              className={`border-b border-r border-slate-200 px-3 py-3 text-left text-[12px] transition-colors last:border-r-0 xl:border-b-0 dark:border-slate-700 ${
                active
                  ? `${toneClass[step.tone].solid} font-semibold`
                  : 'bg-slate-50 text-slate-500 hover:bg-white hover:text-slate-900 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100'
              }`}
            >
              <span className="mr-1 opacity-75">{index + 1}</span>
              {step.tab}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── SBoxTable ───────────────────────────────────────────────────────────────

function SBoxTable({ boxIndex, chunk, outputBits }: { boxIndex: number; chunk: string; outputBits: string }) {
  const row    = parseInt(`${chunk[0]}${chunk[5]}`, 2);
  const column = parseInt(chunk.slice(1, 5), 2);
  const value  = DES_S_BOXES[boxIndex][row][column];

  return (
    <div className="min-w-0 rounded-[14px] border border-violet-200 bg-white p-3 dark:border-violet-800 dark:bg-slate-900">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[13px] font-semibold text-violet-700 dark:text-violet-300">S{boxIndex + 1} lookup</div>
          <div className="mt-1 font-mono text-[11px] text-slate-500 dark:text-slate-400">
            {`input ${chunk} -> row ${row}, column ${column}`}
          </div>
        </div>
        <div className="rounded-[9px] bg-violet-50 px-3 py-2 font-mono text-[12px] font-semibold text-violet-700 ring-1 ring-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:ring-violet-800">
          {`${value} -> ${outputBits}`}
        </div>
      </div>
      <div className="overflow-x-auto overscroll-x-contain pb-1">
        <div className="grid min-w-[560px] grid-cols-[34px_repeat(16,minmax(30px,1fr))] gap-1 text-center text-[10px]">
          <div className="rounded-[5px] bg-slate-100 py-1 text-slate-400 dark:bg-slate-800 dark:text-slate-500">r/c</div>
          {Array.from({ length: 16 }, (_, col) => (
            <div key={`col-${col}`} className={`rounded-[5px] py-1 font-semibold ${col === column ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
              {col}
            </div>
          ))}
          {DES_S_BOXES[boxIndex].map((rowValues, rowIndex) => (
            <Fragment key={`sbox-row-${rowIndex}`}>
              <div className={`rounded-[5px] py-1 font-semibold ${rowIndex === row ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200' : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400'}`}>
                {rowIndex}
              </div>
              {rowValues.map((cell, colIndex) => {
                const selected = rowIndex === row && colIndex === column;
                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`rounded-[5px] py-1 font-mono font-semibold ${
                      selected
                        ? 'bg-violet-600 text-white dark:bg-violet-500'
                        : 'bg-white text-slate-500 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:ring-slate-700'
                    }`}
                  >
                    {cell}
                  </div>
                );
              })}
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── FlowCard ────────────────────────────────────────────────────────────────

function FlowCard({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="rounded-[14px] border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-900">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500 dark:text-slate-400">{title}</div>
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={row} className="flex items-center gap-3 rounded-[11px] border border-slate-200 bg-slate-50 px-3 py-2 text-[12px] text-slate-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white font-mono text-[11px] font-semibold text-slate-900 ring-1 ring-slate-200 dark:bg-slate-700 dark:text-slate-100 dark:ring-slate-600">
              {index + 1}
            </span>
            <span>{row}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── InputStep ───────────────────────────────────────────────────────────────

function InputStep({ round, bits }: { round: FeistelRoundData; bits: ReturnType<typeof useRoundBits> }) {
  const labels     = getLabels(round);
  const inputIndex = round.round - 1;
  const originNotes = inputIndex === 0
    ? {
        left:  `${labels.leftIn} ini berasal dari 32 bit kiri hasil Initial Permutation (Langkah 2).`,
        right: `${labels.rightIn} ini berasal dari 32 bit kanan hasil Initial Permutation (Langkah 2).`,
      }
    : {
        left:  `${labels.leftIn} ini berasal dari output kiri ronde ${inputIndex}, yaitu nilai R${inputIndex - 1} yang disalin tanpa perubahan.`,
        right: `${labels.rightIn} ini berasal dari output kanan ronde ${inputIndex}, yaitu hasil L${inputIndex - 1} di-XOR dengan output Function F(R${inputIndex - 1}, K${inputIndex}).`,
      };
  const flowRows = [
    `${labels.rightIn} masuk ke Function F - ${labels.rightIn} adalah 32 bit kanan input ronde ${round.round}. Nilainya diproses bersama ${labels.subkey}, subkey ronde ${round.round} dari Key Schedule.`,
    `Function F memakai ${labels.subkey} - ${labels.subkey} adalah satu dari 16 subkey yang dihasilkan. Function F melakukan Expansion, XOR dengan subkey, S-Box substitution, dan Permutation.`,
    `${labels.leftIn} di-XOR dengan output Function F - hasil XOR ini menjadi ${labels.rightOut} (sisi kanan ronde berikutnya). Sementara ${labels.leftOut} langsung diisi dengan nilai ${labels.rightIn}.`,
  ];

  return (
    <>
      <div className="w-full max-w-full min-w-0 space-y-3">
        <FeistelDiagram round={round} />
      </div>
      <div className="w-full max-w-full min-w-0 space-y-3">
        <FlowCard title={`Alur ronde ${round.round}`} rows={flowRows} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:col-span-2">
        <div className="space-y-1.5">
          <BitGrid bits={bits.leftInput} label={`${labels.leftIn} - sisi kiri (32 bit)`} />
          <div className="rounded-[9px] border border-blue-200 bg-blue-50 px-3 py-2 text-[11px] text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
            {originNotes.left}
          </div>
        </div>
        <div className="space-y-1.5">
          <BitGrid bits={bits.rightInput} label={`${labels.rightIn} - sisi kanan (32 bit)`} />
          <div className="rounded-[9px] border border-green-200 bg-green-50 px-3 py-2 text-[11px] text-green-700 dark:border-green-800 dark:bg-green-950 dark:text-green-300">
            {originNotes.right}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── ExpansionStep ────────────────────────────────────────────────────────────

function ExpansionStep({ bits }: { bits: ReturnType<typeof useRoundBits> }) {
  const [activeOutputIndex, setActiveOutputIndex] = useState(0);
  const [isPlaying, setIsPlaying]                 = useState(false);

  const duplicateInputIndexes = DES_EXPANSION_TABLE
    .filter((position, _, table) => table.indexOf(position) !== table.lastIndexOf(position))
    .map((position) => position - 1);
  const activeInputIndex = DES_EXPANSION_TABLE[activeOutputIndex] - 1;

  useEffect(() => { setActiveOutputIndex(0); setIsPlaying(false); }, [bits.rightInput, bits.expansion]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setActiveOutputIndex((current) => {
        if (current >= DES_EXPANSION_TABLE.length - 1) { setIsPlaying(false); return current; }
        return current + 1;
      });
    }, 700);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const start = () => {
    setActiveOutputIndex((current) => (current >= DES_EXPANSION_TABLE.length - 1 ? 0 : current));
    setIsPlaying(true);
  };

  return (
    <>
      <div className="w-full max-w-full min-w-0 space-y-4 overflow-hidden xl:col-span-2">
        <div className="rounded-[14px] border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-950">
          <p className="text-[12px] text-green-700 dark:text-green-300" style={{ lineHeight: 1.65 }}>
            Subkey K berukuran 48 bit. Agar bisa di-XOR, R juga harus 48 bit. Expansion menyalin beberapa bit tepi sehingga bit-bit tersebut memengaruhi dua S-Box sekaligus dan memperkuat difusi.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <BitGrid bits={bits.rightInput} label="Input R (32 bit), bit kuning disalin dua kali" changedIndexes={duplicateInputIndexes} activeIndexes={[activeInputIndex]} size="xl" />
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:flex-col">
            <button
              type="button"
              onClick={isPlaying ? () => setIsPlaying(false) : start}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] bg-blue-600 px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Pause' : 'Mulai'}
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-3 xl:col-span-2">
        <MappingTable
          table={DES_EXPANSION_TABLE} inputBits={bits.rightInput} outputBits={bits.expansion}
          label="Tabel Expansion E" columns={6} mappingOnly
          activeIndex={activeOutputIndex}
          onSelectIndex={(index) => { setIsPlaying(false); setActiveOutputIndex(index); }}
        />
        <div className="rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
          Output bit ke-{activeOutputIndex + 1} mengambil input R posisi {DES_EXPANSION_TABLE[activeOutputIndex]}.
        </div>
      </div>
      <div className="xl:col-span-2">
        <BitGrid bits={bits.expansion} label="Output E(R) (48 bit)" columns={6} activeIndexes={[activeOutputIndex]} size="xl" />
      </div>
    </>
  );
}

// ─── XorStep ─────────────────────────────────────────────────────────────────

function XorStep({ round, bits }: { round: FeistelRoundData; bits: ReturnType<typeof useRoundBits> }) {
  const [activeBitIndex, setActiveBitIndex] = useState(0);
  const [isPlaying, setIsPlaying]           = useState(false);

  const activeExpansionBit = bits.expansion[activeBitIndex] ?? '0';
  const activeSubkeyBit    = bits.subkey[activeBitIndex] ?? '0';
  const activeResultBit    = bits.xorWithKey[activeBitIndex] ?? (activeExpansionBit === activeSubkeyBit ? '0' : '1');

  useEffect(() => { setActiveBitIndex(0); setIsPlaying(false); }, [bits.expansion, bits.subkey, bits.xorWithKey]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => { setActiveBitIndex((current) => (current + 1) % 48); }, 1200);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  // shared card class for XOR animation cells
  const xorCard = (delay = 0) => ({
    initial: { scale: 0.98, opacity: 0.9 },
    animate: { scale: 1.02, opacity: 1 },
    transition: { type: 'spring' as const, stiffness: 320, damping: 18, delay },
  });

  return (
    <>
      <div className="xl:col-span-2 rounded-[14px] border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950">
        <p className="text-[12px] text-blue-700 dark:text-blue-300" style={{ lineHeight: 1.65 }}>
          XOR (Exclusive OR) membandingkan bit E(R) dengan bit subkey K pada posisi yang sama. Jika kedua bit berbeda, hasilnya 1; jika sama, hasilnya 0. Contoh: 1 XOR 0 = 1, 0 XOR 0 = 0, 1 XOR 1 = 0. Di tahap ini, subkey mulai mencampur pengaruh kunci ke data sebelum masuk ke S-Box.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:col-span-2">
        <BitGrid bits={bits.expansion} label="E(R) (48 bit)" columns={6} activeIndexes={[activeBitIndex]} />
        <BitGrid bits={bits.subkey} label={`Subkey K${round.round} (48 bit)`} columns={6} activeIndexes={[activeBitIndex]} />
      </div>
      <div className="xl:col-span-2">
        <div className="rounded-[16px] border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[13px] font-semibold text-blue-700 dark:text-blue-300">Animasi XOR bit ke-{activeBitIndex + 1}</div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="text-[11px] text-blue-600 dark:text-blue-400">E(R) bertemu Subkey K{round.round}</div>
              <button
                type="button"
                onClick={isPlaying ? () => setIsPlaying(false) : () => setIsPlaying(true)}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-blue-600 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Mulai'}
              </button>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-[minmax(120px,0.8fr)_auto_minmax(120px,0.8fr)_auto_minmax(120px,0.8fr)] md:items-center">
            <motion.div key={`xor-er-${activeBitIndex}`} {...xorCard(0)} className="rounded-[10px] bg-blue-600 px-3 py-2.5 text-center text-white ring-2 ring-blue-300 dark:bg-blue-700 dark:ring-blue-600">
              <div className="text-[10px] font-semibold text-white/80">E(R)</div>
              <div className="mt-1 font-mono text-[26px] font-semibold">{activeExpansionBit}</div>
            </motion.div>
            <div className="text-center text-[12px] font-semibold text-blue-700 dark:text-blue-300">ketemu</div>
            <motion.div key={`xor-key-${activeBitIndex}`} {...xorCard(0.08)} className="rounded-[10px] bg-blue-700 px-3 py-2.5 text-center text-white ring-2 ring-blue-300 dark:bg-blue-800 dark:ring-blue-600">
              <div className="text-[10px] font-semibold text-white/80">K{round.round}</div>
              <div className="mt-1 font-mono text-[26px] font-semibold">{activeSubkeyBit}</div>
            </motion.div>
            <div className="text-center text-[12px] font-semibold text-blue-700 dark:text-blue-300">sama dengan</div>
            <motion.div key={`xor-result-${activeBitIndex}`} {...xorCard(0.16)} className="rounded-[10px] bg-blue-800 px-3 py-2.5 text-center text-white ring-2 ring-blue-300 dark:bg-blue-900 dark:ring-blue-700">
              <div className="text-[10px] font-semibold text-white/80">Hasil</div>
              <div className="mt-1 font-mono text-[26px] font-semibold">{activeResultBit}</div>
            </motion.div>
          </div>
        </div>
      </div>
      <div className="xl:col-span-2">
        <BitGrid bits={bits.xorWithKey} label="Hasil E(R) XOR K (48 bit)" columns={6} activeIndexes={[activeBitIndex]} large />
      </div>
    </>
  );
}

// ─── SBoxOutputGrid ───────────────────────────────────────────────────────────

function SBoxOutputGrid({ outputs }: { outputs: string[] }) {
  const outputBits = Array.from({ length: 8 }, (_, index) => outputs[index] ?? '0000').join('');
  const outputHex  = binaryToHex(outputBits);

  return (
    <div className="min-w-0 rounded-[16px] border border-violet-200 bg-white p-3 dark:border-violet-800 dark:bg-slate-900 sm:p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-violet-600 dark:text-violet-300">Output gabungan S-Box (32 bit)</div>
          <div className="mt-1 text-[12px] text-violet-500 dark:text-violet-400">Delapan output 4-bit dari S1 sampai S8 digabung berurutan menjadi 32 bit.</div>
        </div>
        <div className="w-fit max-w-full break-all rounded-[9px] border border-violet-200 bg-violet-50 px-3 py-2 font-mono text-[12px] font-semibold text-violet-700 dark:border-violet-800 dark:bg-violet-950 dark:text-violet-300">
          HEX {outputHex}
        </div>
      </div>
      <div className="grid grid-cols-4 gap-1.5 sm:grid-cols-8 lg:grid-cols-16">
        {outputBits.split('').map((bit, index) => (
          <div
            key={`sbox-output-bit-${index}`}
            title={`Bit ${index + 1}`}
            className="flex h-8 min-w-0 items-center justify-center rounded-[7px] border border-violet-300 bg-violet-100 font-mono text-[13px] font-semibold text-violet-700 dark:border-violet-700 dark:bg-violet-950 dark:text-violet-300 sm:h-9 sm:text-[14px]"
          >
            {bit}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── SBoxStep ─────────────────────────────────────────────────────────────────

function SBoxStep({ bits }: { bits: ReturnType<typeof useRoundBits> }) {
  const [activeBox, setActiveBox] = useState(0);
  const chunks     = bits.xorWithKey.match(/.{1,6}/g) ?? [];
  const outputs    = bits.sboxOutput.match(/.{1,4}/g) ?? [];
  const sboxIndexes = Array.from({ length: 8 }, (_, index) => index);

  useEffect(() => { setActiveBox(0); }, [bits.xorWithKey]);

  return (
    <div className="w-full max-w-full min-w-0 space-y-4 overflow-hidden xl:col-span-2">
      <div className="rounded-[14px] border border-violet-200 bg-violet-50 px-4 py-3 dark:border-violet-800 dark:bg-violet-950">
        <div className="mb-2 text-[12px] font-semibold text-violet-700 dark:text-violet-300">Cara membaca S-Box</div>
        <p className="text-[12px] text-violet-600 dark:text-violet-400" style={{ lineHeight: 1.65 }}>
          S-Box adalah jantung non-linearitas DES. Input 6 bit menjadi output 4 bit: bit pertama dan terakhir memilih baris (0-3), empat bit tengah memilih kolom (0-15), lalu hasil diambil dari perpotongan baris dan kolom.
        </p>
        <p className="mt-2 text-[12px] text-violet-600 dark:text-violet-400" style={{ lineHeight: 1.65 }}>
          S-Box sengaja dibuat non-linear, tidak ada rumus sederhana untuk menebak outputnya. Inilah yang membuat DES lebih sulit dipecah secara analitik.
        </p>
      </div>

      <div className="flex w-full max-w-full min-w-0 gap-3 overflow-x-auto overscroll-x-contain pb-2 sm:grid sm:grid-cols-2 sm:overflow-visible sm:pb-0 xl:grid-cols-4">
        {sboxIndexes.map((index) => {
          const chunk  = chunks[index] ?? '000000';
          const output = outputs[index] ?? '0000';
          const active = index === activeBox;
          const row    = parseInt(`${chunk[0]}${chunk[5]}`, 2);
          const column = parseInt(chunk.slice(1, 5), 2);
          const chars  = chunk.split('');

          return (
            <button
              key={`sbox-card-${index}`}
              type="button"
              onClick={() => setActiveBox(index)}
              className={`flex min-h-[148px] min-w-[220px] flex-[0_0_220px] flex-col gap-3 rounded-[12px] border p-3 text-left transition-colors sm:min-h-[164px] sm:min-w-0 sm:flex-auto sm:p-4 ${
                active
                  ? 'border-violet-500 bg-violet-50 dark:border-violet-400 dark:bg-violet-950 shadow-sm'
                  : 'border-slate-200 bg-white hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:hover:bg-slate-800'
              }`}
            >
              <div className="text-[13px] font-semibold text-violet-700 dark:text-violet-300">S{index + 1}</div>
              <div className="grid grid-cols-6 gap-1 font-mono text-[12px] font-semibold sm:text-[13px]">
                {chars.map((bit, bitIndex) => {
                  const isRowBit = bitIndex === 0 || bitIndex === 5;
                  return (
                    <div key={`sbox-card-${index}-${bitIndex}`} className="flex flex-col items-center gap-1">
                      <motion.span
                        animate={active && isRowBit ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                        transition={{ duration: 0.8, repeat: active ? Infinity : 0 }}
                        className={`flex h-7 w-full min-w-0 items-center justify-center rounded-[6px] sm:h-8 ${
                          isRowBit
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200'
                            : 'bg-violet-100 text-violet-700 ring-1 ring-violet-200 dark:bg-violet-950 dark:text-violet-300 dark:ring-violet-800'
                        }`}
                      >
                        {bit}
                      </motion.span>
                      <span className={`text-[8px] font-semibold leading-none ${isRowBit ? 'text-amber-600 dark:text-amber-400' : 'text-violet-500 dark:text-violet-400'}`}>
                        {isRowBit ? 'baris' : 'kolom'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400">baris {row}, kolom {column}</div>
              <div className="mt-auto rounded-[9px] bg-white px-3 py-2 ring-1 ring-violet-200 dark:bg-slate-800 dark:ring-violet-800">
                <div className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">Output 4 bit</div>
                <div className="mt-1 grid grid-cols-4 gap-1 font-mono text-[12px] font-semibold text-violet-700 dark:text-violet-300">
                  {output.split('').map((bit, bitIndex) => (
                    <span key={`sbox-card-output-${index}-${bitIndex}`} className="rounded-[5px] bg-violet-50 px-2 py-1 text-center dark:bg-violet-950">
                      {bit}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="w-full max-w-full min-w-0 space-y-3">
        <div className="grid grid-cols-4 gap-2 sm:grid-cols-8">
          {sboxIndexes.map((index) => {
            const active = index === activeBox;
            return (
              <button
                key={`sbox-table-tab-${index}`}
                type="button"
                onClick={() => setActiveBox(index)}
                className={`rounded-[9px] border px-2 py-2 text-[12px] font-semibold transition-colors sm:px-3 ${
                  active
                    ? 'border-violet-600 bg-violet-600 text-white dark:border-violet-400 dark:bg-violet-500'
                    : 'border-violet-200 bg-white text-violet-600 hover:bg-violet-50 dark:border-violet-800 dark:bg-slate-900 dark:text-violet-400 dark:hover:bg-violet-950'
                }`}
              >
                S{index + 1}
              </button>
            );
          })}
        </div>
        <SBoxTable boxIndex={activeBox} chunk={chunks[activeBox] ?? '000000'} outputBits={outputs[activeBox] ?? '0000'} />
      </div>

      <SBoxOutputGrid outputs={outputs} />
    </div>
  );
}

// ─── PermutationStep ─────────────────────────────────────────────────────────

function PermutationStep({ bits }: { bits: ReturnType<typeof useRoundBits> }) {
  const [activeOutputIndex, setActiveOutputIndex] = useState(0);
  const [isPlaying, setIsPlaying]                 = useState(false);
  const activeInputIndex = DES_PERMUTATION_P_TABLE[activeOutputIndex] - 1;

  useEffect(() => { setActiveOutputIndex(0); setIsPlaying(false); }, [bits.sboxOutput, bits.permutationOutput]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setActiveOutputIndex((current) => {
        if (current >= DES_PERMUTATION_P_TABLE.length - 1) { setIsPlaying(false); return current; }
        return current + 1;
      });
    }, 700);
    return () => window.clearInterval(timer);
  }, [isPlaying]);

  const start = () => {
    setActiveOutputIndex((current) => (current >= DES_PERMUTATION_P_TABLE.length - 1 ? 0 : current));
    setIsPlaying(true);
  };

  return (
    <>
      <div className="space-y-3 xl:col-span-2">
        <div className="rounded-[14px] border border-cyan-200 bg-cyan-50 px-4 py-3 dark:border-cyan-800 dark:bg-cyan-950">
          <p className="text-[12px] text-cyan-700 dark:text-cyan-300" style={{ lineHeight: 1.65 }}>
            Setelah S-Box, bit-bit yang berubah masih berkelompok. Permutasi P menyebarkannya ke posisi berbeda sehingga di ronde berikutnya, setiap S-Box mendapat input dari S-Box yang berbeda. Ini disebut difusi lintas blok.
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:col-span-2">
        <div className="w-full max-w-full min-w-0 space-y-3">
          <BitGrid bits={bits.sboxOutput} label="Input dari S-Box (32 bit)" activeIndexes={[activeInputIndex]} />
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={isPlaying ? () => setIsPlaying(false) : start}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-cyan-600 px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-cyan-700 dark:bg-cyan-500 dark:hover:bg-cyan-400"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Pause' : 'Mulai'}
            </button>
          </div>
        </div>
        <div className="w-full max-w-full min-w-0 space-y-3">
          <MappingTable
            table={DES_PERMUTATION_P_TABLE} inputBits={bits.sboxOutput} outputBits={bits.permutationOutput}
            label="Tabel Permutasi P" columns={8} mappingOnly
            activeIndex={activeOutputIndex}
            onSelectIndex={(index) => { setIsPlaying(false); setActiveOutputIndex(index); }}
          />
          <div className="rounded-[10px] border border-slate-200 bg-white px-3 py-2 text-[12px] text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
            Output bit ke-{activeOutputIndex + 1} mengambil input S-Box posisi {DES_PERMUTATION_P_TABLE[activeOutputIndex]}.
          </div>
        </div>
      </div>
      <div className="xl:col-span-2">
        <div className="mx-auto w-full max-w-[620px]">
          <BitGrid bits={bits.permutationOutput} label="Output P / F(R,K) (32 bit)" activeIndexes={[activeOutputIndex]} />
        </div>
      </div>
    </>
  );
}

// ─── OutputStep ───────────────────────────────────────────────────────────────

function OutputStep({ round, bits }: { round: FeistelRoundData; bits: ReturnType<typeof useRoundBits> }) {
  const labels = getLabels(round);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying]     = useState(false);

  const activeLeftBit     = bits.leftInput[activeIndex] ?? '0';
  const activeFunctionBit = bits.permutationOutput[activeIndex] ?? '0';
  const activeResultBit   = bits.rightOutput[activeIndex] ?? (activeLeftBit === activeFunctionBit ? '0' : '1');

  useEffect(() => { setActiveIndex(0); setIsPlaying(false); }, [bits.leftInput, bits.permutationOutput, bits.rightOutput]);

  useEffect(() => {
    if (!isPlaying) return undefined;
    const timer = window.setInterval(() => {
      setActiveIndex((current) => {
        if (current >= bits.rightOutput.length - 1) { setIsPlaying(false); return current; }
        return current + 1;
      });
    }, 900);
    return () => window.clearInterval(timer);
  }, [bits.rightOutput.length, isPlaying]);

  const start = () => {
    setActiveIndex((current) => (current >= bits.rightOutput.length - 1 ? 0 : current));
    setIsPlaying(true);
  };

  const xorCard = (delay = 0) => ({
    initial: { scale: 0.98, opacity: 0.9 },
    animate: { scale: 1.02, opacity: 1 },
    transition: { type: 'spring' as const, stiffness: 320, damping: 18, delay },
  });

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:col-span-2">
        <BitGrid bits={bits.leftInput} label={`${labels.leftIn} lama`} activeIndexes={[activeIndex]} />
        <BitGrid bits={bits.permutationOutput} label={`F(${labels.rightIn}, ${labels.subkey})`} activeIndexes={[activeIndex]} />
      </div>

      <div className="xl:col-span-2">
        <div className="rounded-[16px] border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[13px] font-semibold text-blue-700 dark:text-blue-300">Animasi XOR bit ke-{activeIndex + 1}</div>
            <button
              type="button"
              onClick={isPlaying ? () => setIsPlaying(false) : start}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-blue-600 px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Pause' : 'Mulai'}
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-[minmax(120px,0.8fr)_auto_minmax(120px,0.8fr)_auto_minmax(120px,0.8fr)] md:items-center">
            <motion.div key={`output-left-${activeIndex}`} {...xorCard(0)} className="rounded-[10px] bg-blue-600 px-3 py-2.5 text-center text-white ring-2 ring-blue-300 dark:bg-blue-700 dark:ring-blue-600">
              <div className="text-[10px] font-semibold text-white/80">{labels.leftIn}</div>
              <div className="mt-1 font-mono text-[26px] font-semibold">{activeLeftBit}</div>
            </motion.div>
            <div className="text-center text-[12px] font-semibold text-blue-700 dark:text-blue-300">XOR</div>
            <motion.div key={`output-f-${activeIndex}`} {...xorCard(0.08)} className="rounded-[10px] bg-blue-700 px-3 py-2.5 text-center text-white ring-2 ring-blue-300 dark:bg-blue-800 dark:ring-blue-600">
              <div className="text-[10px] font-semibold text-white/80">F</div>
              <div className="mt-1 font-mono text-[26px] font-semibold">{activeFunctionBit}</div>
            </motion.div>
            <div className="text-center text-[12px] font-semibold text-blue-700 dark:text-blue-300">=</div>
            <motion.div key={`output-result-${activeIndex}`} {...xorCard(0.16)} className="rounded-[10px] bg-blue-800 px-3 py-2.5 text-center text-white ring-2 ring-blue-300 dark:bg-blue-900 dark:ring-blue-700">
              <div className="text-[10px] font-semibold text-white/80">Hasil</div>
              <div className="mt-1 font-mono text-[26px] font-semibold">{activeResultBit}</div>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="xl:col-span-2">
        <BitGrid
          bits={bits.rightOutput}
          label={`${labels.rightOut} = ${labels.leftIn} XOR F`}
          activeIndexes={[activeIndex]}
          note={`${labels.rightOut} digunakan sebagai sisi kanan pada ronde berikutnya.`}
          large
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:col-span-2">
        <BitGrid bits={bits.leftOutput} label={`${labels.leftOut} = ${labels.rightIn}`} note={`${labels.rightIn} lama disalin menjadi ${labels.leftOut}.`} />
        <div className="grid gap-2">
          <div className="rounded-[10px] border border-blue-200 bg-blue-50 px-3 py-2 font-mono text-[13px] font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
            {labels.leftOut} = {labels.rightIn}
          </div>
          <div className="rounded-[10px] border border-blue-200 bg-blue-50 px-3 py-2 font-mono text-[13px] font-semibold text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
            {labels.rightOut} = {labels.leftIn} XOR F
          </div>
        </div>
      </div>
    </>
  );
}

// ─── StepContent ─────────────────────────────────────────────────────────────

function StepContent({ round, activeStep, bits }: {
  round: FeistelRoundData; activeStep: number; bits: ReturnType<typeof useRoundBits>;
}) {
  const step = roundSteps[activeStep];

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={`${round.round}-${step.id}`}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22 }}
        className="w-full max-w-full min-w-0 overflow-hidden rounded-[18px] border border-slate-200 bg-slate-50 p-3 dark:border-slate-700 dark:bg-slate-900 sm:p-4 md:p-5"
      >
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${toneClass[step.tone].soft}`}>
              <CircleDot className="h-3.5 w-3.5" />
              Langkah {activeStep + 1}/6
            </div>
            <h3 className="mt-2 text-[18px] font-semibold text-slate-900 dark:text-slate-100">{step.title}</h3>
            {step.id === 'output' && (
              <p className="mt-1.5 max-w-[680px] text-[13px] text-slate-500 dark:text-slate-400" style={{ lineHeight: 1.65 }}>
                Di akhir ronde, {getLabels(round).leftIn} lama di-XOR dengan hasil Function F untuk membentuk {getLabels(round).rightOut}. Sementara itu, {getLabels(round).rightIn} lama langsung disalin menjadi {getLabels(round).leftOut}; inilah swap Feistel yang membuat sisi kiri dan kanan saling bertukar peran.
              </p>
            )}
          </div>
          <div className={`w-fit rounded-[10px] border px-3 py-2 text-[12px] font-semibold ${toneClass[step.tone].active}`}>{step.size}</div>
        </div>

        <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,0.96fr)_minmax(0,1.04fr)]">
          {step.id === 'input'       && <InputStep       round={round} bits={bits} />}
          {step.id === 'expansion'   && <ExpansionStep   bits={bits} />}
          {step.id === 'xor-key'     && <XorStep         round={round} bits={bits} />}
          {step.id === 'sbox'        && <SBoxStep        bits={bits} />}
          {step.id === 'permutation' && <PermutationStep bits={bits} />}
          {step.id === 'output'      && <OutputStep      round={round} bits={bits} />}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── FeistelRoundsVisualization (root export) ─────────────────────────────────

export function FeistelRoundsVisualization({ data, tutorialMode = false }: FeistelRoundsVisualizationProps) {
  const [currentRound, setCurrentRound] = useState(1);
  const [activeStep, setActiveStep]     = useState(0);

  const totalRounds  = data.length;
  const clampedRound = Math.min(Math.max(currentRound, 1), Math.max(totalRounds, 1));
  const currentData  = useMemo(() => data.find((item) => item.round === clampedRound) ?? data[0], [clampedRound, data]);
  const bits         = useRoundBits(currentData ?? {
    round: 1, leftInput: '', rightInput: '', expansion: '',
    xorWithKey: '', sboxOutput: '', permutationOutput: '',
    leftOutput: '', rightOutput: '', subkey: '',
  });

  useEffect(() => {
    setCurrentRound((previous) => {
      if (data.length === 0) return 1;
      return Math.min(Math.max(previous, 1), data.length);
    });
  }, [data.length]);

  if (!currentData) return null;

  const selectRound = (round: number) => { setCurrentRound(round); setActiveStep(0); };

  const goNext = () => {
    if (activeStep < roundSteps.length - 1) { setActiveStep((step) => step + 1); return; }
    if (currentData.round < totalRounds)    { setCurrentRound((round) => round + 1); setActiveStep(0); }
  };

  const goPrevious = () => {
    if (activeStep > 0)              { setActiveStep((step) => step - 1); return; }
    if (currentData.round > 1)       { setCurrentRound((round) => round - 1); setActiveStep(roundSteps.length - 1); }
  };

  return (
    <div className="feistel-rounds space-y-4">
      <div className="min-w-0 rounded-[18px] border border-slate-200 bg-white p-3 shadow-sm dark:border-slate-700 dark:bg-slate-900 sm:p-4">
        <RoundSelector totalRounds={totalRounds} currentRound={currentData.round} onSelectRound={selectRound} />
        <div className="mt-4">
          <MetaBar round={currentData} totalRounds={totalRounds} />
        </div>
      </div>

      <StepTabs activeIndex={activeStep} onSelect={setActiveStep} />

      {tutorialMode && (
        <div className="rounded-[14px] border border-blue-200 bg-blue-50 px-4 py-3 text-[12px] text-blue-700 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
          Ikuti tab dari kiri ke kanan. Setiap tab menunjukkan satu bagian Function F atau swap pada ronde Feistel yang sedang dipilih.
        </div>
      )}

      <StepContent round={currentData} activeStep={activeStep} bits={bits} />

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={goPrevious}
          disabled={currentData.round === 1 && activeStep === 0}
          className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 py-2.5 text-[13px] font-semibold text-slate-900 transition-colors hover:bg-slate-50 disabled:opacity-40 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:hover:bg-slate-700"
        >
          <ChevronLeft className="h-4 w-4" />
          Tahap Sebelumnya
        </button>
        <div className="inline-flex min-w-0 items-center justify-center gap-2 rounded-[10px] border border-slate-200 bg-white px-4 py-2.5 text-center text-[12px] text-slate-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300">
          <KeyRound className="h-4 w-4 text-amber-500 dark:text-amber-400" />
          {roundSteps[activeStep].tab} pada Ronde {currentData.round}
        </div>
        <button
          type="button"
          onClick={goNext}
          disabled={currentData.round === totalRounds && activeStep === roundSteps.length - 1}
          className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-blue-600 px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-blue-700 disabled:opacity-40 dark:bg-blue-500 dark:hover:bg-blue-400"
        >
          {activeStep === roundSteps.length - 1 && currentData.round < totalRounds ? `Ronde ${currentData.round + 1}` : 'Tahap Berikutnya'}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}