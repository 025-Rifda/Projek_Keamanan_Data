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

const toneClass = {
  blue: {
    active: 'border-[#2563EB] bg-[#EFF6FF] text-[#1D4ED8]',
    soft: 'border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]',
    solid: 'bg-[#2563EB] text-white',
  },
  green: {
    active: 'border-[#16A34A] bg-[#F0FDF4] text-[#15803D]',
    soft: 'border-[#86EFAC] bg-[#F0FDF4] text-[#15803D]',
    solid: 'bg-[#16A34A] text-white',
  },
  amber: {
    active: 'border-[#F59E0B] bg-[#FFFBEB] text-[#B45309]',
    soft: 'border-[#FDE68A] bg-[#FFFBEB] text-[#92400E]',
    solid: 'bg-[#F59E0B] text-white',
  },
  purple: {
    active: 'border-[#7C3AED] bg-[#F5F3FF] text-[#6D28D9]',
    soft: 'border-[#DDD6FE] bg-[#F5F3FF] text-[#6D28D9]',
    solid: 'bg-[#7C3AED] text-white',
  },
  cyan: {
    active: 'border-[#0891B2] bg-[#ECFEFF] text-[#0E7490]',
    soft: 'border-[#A5F3FC] bg-[#ECFEFF] text-[#0E7490]',
    solid: 'bg-[#0891B2] text-white',
  },
  rose: {
    active: 'border-[#93C5FD] bg-[#EFF6FF] text-[#1D4ED8]',
    soft: 'border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]',
    solid: 'bg-[#2563EB] text-white',
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
    leftIn: `L${round.round - 1}`,
    rightIn: `R${round.round - 1}`,
    leftOut: `L${round.round}`,
    rightOut: `R${round.round}`,
    subkey: `K${round.round}`,
  };
}

function useRoundBits(round: FeistelRoundData) {
  return useMemo(() => {
    const leftInput = hexToBits(round.leftInput, 32);
    const rightInput = hexToBits(round.rightInput, 32);
    const expansion = hexToBits(round.expansion, 48);
    const subkey = round.subkey ? hexToBits(round.subkey, 48) : pseudoSubkeyBits(round.round);
    const xorWithKey = hexToBits(round.xorWithKey, 48);
    const sboxOutput = hexToBits(round.sboxOutput, 32);
    const permutationOutput = hexToBits(round.permutationOutput, 32);
    const leftOutput = hexToBits(round.leftOutput, 32);
    const rightOutput = hexToBits(round.rightOutput, 32);

    return {
      leftInput,
      rightInput,
      expansion,
      subkey,
      xorWithKey,
      sboxOutput,
      permutationOutput,
      leftOutput,
      rightOutput,
      xorChanged: expansion.split('').map((bit, index) => bit !== subkey[index]),
      outputChanged: leftInput.split('').map((bit, index) => bit !== permutationOutput[index]),
    };
  }, [round]);
}

function BitCell({
  bit,
  index,
  active,
  changed,
  muted,
  title,
  size = 'normal',
}: {
  bit: string;
  index: number;
  active?: boolean;
  changed?: boolean;
  muted?: boolean;
  title?: string;
  size?: 'normal' | 'large' | 'xl';
}) {
  const sizeClass = {
    normal: 'h-6 w-6 text-[11px]',
    large: 'h-7 w-7 text-[12px]',
    xl: 'h-9 w-9 text-[14px]',
  }[size];
  const stateClass = active
      ? 'border-[#2563EB] bg-[#2563EB] text-white shadow-[0_4px_12px_rgba(37,99,235,0.2)]'
      : changed
        ? 'border-[#F59E0B] bg-[#FEF3C7] text-[#92400E] shadow-[0_4px_12px_rgba(245,158,11,0.22)]'
        : bit === '1'
          ? 'border-[#BFDBFE] bg-[#EFF6FF] text-[#1D4ED8]'
          : 'border-[#E2E8F0] bg-white text-[#94A3B8]';

  return (
    <div
      title={title ?? `Bit ${index + 1}`}
      className={`flex ${sizeClass} items-center justify-center rounded-[7px] border font-mono font-semibold transition-colors ${
        muted ? 'opacity-45' : ''
      } ${active ? 'ring-4 ring-[#93C5FD] ring-offset-2 ring-offset-white' : ''} ${stateClass}`}
    >
      {bit}
    </div>
  );
}

function BitGrid({
  bits,
  label,
  columns = 8,
  changedIndexes = [],
  activeIndexes = [],
  note,
  large = false,
  size,
}: {
  bits: string;
  label: string;
  columns?: 6 | 8;
  changedIndexes?: number[];
  activeIndexes?: number[];
  note?: string;
  large?: boolean;
  size?: 'normal' | 'large' | 'xl';
}) {
  const changedSet = new Set(changedIndexes);
  const activeSet = new Set(activeIndexes);
  const cellSize = size ?? (large ? 'large' : 'normal');
  const isRoomy = cellSize !== 'normal';

  return (
    <div className={`rounded-[14px] border border-[#E2E8F0] bg-white ${isRoomy ? 'p-4' : 'p-3'}`}>
      <div className={`${isRoomy ? 'mb-3' : 'mb-2'} flex items-center justify-between gap-2`}>
        <div className={`${cellSize === 'xl' ? 'text-[12px]' : 'text-[11px]'} font-semibold uppercase tracking-[0.08em] text-[#64748B]`}>{label}</div>
        <div className={`${cellSize === 'xl' ? 'text-[12px]' : 'text-[11px]'} font-mono font-semibold text-[#0F172A]`}>{binaryToHex(bits)}</div>
      </div>
      <div className={`grid ${cellSize === 'xl' ? 'gap-2' : isRoomy ? 'gap-1.5' : 'gap-1'} ${columns === 6 ? 'grid-cols-6' : 'grid-cols-8'}`}>
        {bits.split('').map((bit, index) => (
          <BitCell
            key={`${label}-${index}`}
            bit={bit}
            index={index}
            changed={changedSet.has(index)}
            active={activeSet.has(index)}
            size={cellSize}
          />
        ))}
      </div>
      {note && (
        <div className="mt-3 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[11px] text-[#64748B]" style={{ lineHeight: 1.55 }}>
          {note}
        </div>
      )}
    </div>
  );
}

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
    <div className="rounded-[14px] border border-[#BFDBFE] bg-[#EFF6FF] p-4">
      <div className="mb-3 text-[12px] font-semibold text-[#1D4ED8]">Diagram Feistel ronde {round.round}</div>
      <svg viewBox="0 0 520 260" className="h-auto w-full" role="img" aria-label="Diagram alur Feistel">
        <defs>
          <marker id={`arrow-${round.round}`} markerWidth="10" markerHeight="10" refX="8" refY="3" orient="auto" markerUnits="strokeWidth">
            <path d="M0,0 L0,6 L9,3 z" fill="#2563EB" />
          </marker>
        </defs>
        <rect x="35" y="28" width="110" height="44" rx="10" fill="#FFFFFF" stroke="#BFDBFE" />
        <text x="90" y="55" textAnchor="middle" fontSize="14" fontWeight="700" fill="#1D4ED8">{labels.leftIn}</text>
        <rect x="375" y="28" width="110" height="44" rx="10" fill="#FFFFFF" stroke="#BBF7D0" />
        <text x="430" y="55" textAnchor="middle" fontSize="14" fontWeight="700" fill="#15803D">{labels.rightIn}</text>
        <rect x="344" y="106" width="172" height="50" rx="12" fill="#FFFFFF" stroke="#FDE68A" />
        <text x="430" y="136" textAnchor="middle" fontSize="13" fontWeight="700" fill="#92400E">Function F({labels.rightIn}, {labels.subkey})</text>
        <circle cx="230" cy="131" r="18" fill="#FFFFFF" stroke="#F59E0B" strokeWidth="2" />
        <text x="230" y="137" textAnchor="middle" fontSize="16" fontWeight="700" fill="#92400E">XOR</text>
        <rect x="35" y="190" width="110" height="44" rx="10" fill="#FFFFFF" stroke="#BBF7D0" />
        <text x="90" y="217" textAnchor="middle" fontSize="14" fontWeight="700" fill="#15803D">{labels.leftOut} = {labels.rightIn}</text>
        <rect x="375" y="190" width="110" height="44" rx="10" fill="#FFFFFF" stroke="#FECDD3" />
        <text x="430" y="217" textAnchor="middle" fontSize="14" fontWeight="700" fill="#BE123C">{labels.rightOut}</text>
        <path d="M430 72 V106" stroke="#2563EB" strokeWidth="3" fill="none" markerEnd={`url(#arrow-${round.round})`} />
        <path d="M344 131 H248" stroke="#2563EB" strokeWidth="3" fill="none" markerEnd={`url(#arrow-${round.round})`} />
        <path d="M145 50 C210 50 190 131 212 131" stroke="#2563EB" strokeWidth="3" fill="none" markerEnd={`url(#arrow-${round.round})`} />
        <path d="M248 131 C305 131 315 212 375 212" stroke="#2563EB" strokeWidth="3" fill="none" markerEnd={`url(#arrow-${round.round})`} />
        <path d="M430 72 C430 118 90 130 90 190" stroke="#16A34A" strokeWidth="3" fill="none" markerEnd={`url(#arrow-${round.round})`} />
      </svg>
      <div className="mt-3 rounded-[12px] border border-[#BFDBFE] bg-white px-3 py-3">
        <div className="mb-2 text-[12px] font-semibold text-[#1D4ED8]">Cara membaca diagram</div>
        <div className="space-y-1.5">
          {readingSteps.map((step, index) => (
            <div key={step} className="flex gap-2 text-[12px] text-[#1D4ED8]" style={{ lineHeight: 1.55 }}>
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#EFF6FF] font-mono text-[10px] font-semibold ring-1 ring-[#BFDBFE]">
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

function MappingTable({
  table,
  inputBits,
  outputBits,
  label,
  columns,
  mappingOnly = false,
  activeIndex,
  onSelectIndex,
  large = false,
}: {
  table: number[];
  inputBits: string;
  outputBits: string;
  label: string;
  columns: 6 | 8;
  mappingOnly?: boolean;
  activeIndex?: number;
  onSelectIndex?: (index: number) => void;
  large?: boolean;
}) {
  return (
    <div className={`rounded-[14px] border border-[#E2E8F0] bg-white ${large ? 'p-4' : 'p-3'}`}>
      <div className={`${large ? 'mb-4' : 'mb-3'} flex items-center justify-between gap-2`}>
        <div className={`inline-flex items-center gap-2 ${large ? 'text-[14px]' : 'text-[12px]'} font-semibold text-[#0F172A]`}>
          <Table2 className={`${large ? 'h-5 w-5' : 'h-4 w-4'} text-[#2563EB]`} />
          {label}
        </div>
        <div className={`${large ? 'text-[12px]' : 'text-[11px]'} text-[#64748B]`}>Output mengambil posisi input</div>
      </div>
      <div className={`grid ${large ? 'gap-2' : 'gap-1'} ${columns === 6 ? 'grid-cols-6' : 'grid-cols-8'}`}>
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
                    ? 'border-[#2563EB] bg-[#2563EB] text-white shadow-[0_10px_24px_rgba(37,99,235,0.22)]'
                    : 'border-[#BFDBFE] bg-white text-[#1D4ED8] hover:bg-[#EFF6FF]'
                }`}
              >
                {sourcePosition}
              </motion.button>
            );
          }

          return (
            <div key={`${label}-${index}`} className={`${large ? 'rounded-[10px] px-2 py-2' : 'rounded-[7px] px-1.5 py-1'} border border-[#E2E8F0] bg-[#F8FAFC] text-center`}>
              {!mappingOnly && <div className={`font-mono ${large ? 'text-[13px]' : 'text-[11px]'} font-semibold text-[#0F172A]`}>{bit}</div>}
              <div className={`${mappingOnly ? `font-mono ${large ? 'text-[12px]' : 'text-[10px]'} font-semibold text-[#334155]` : `${large ? 'mt-1 text-[10px]' : 'mt-0.5 text-[8px]'} leading-none text-[#64748B]`}`}>
                {`${index + 1}<-${sourcePosition}`}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

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

function RoundSelector({
  totalRounds,
  currentRound,
  onSelectRound,
}: {
  totalRounds: number;
  currentRound: number;
  onSelectRound: (round: number) => void;
}) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-1">
      <span className="shrink-0 text-[12px] font-medium text-[#64748B]">Pilih ronde:</span>
      {Array.from({ length: totalRounds }, (_, index) => {
        const round = index + 1;
        const active = round === currentRound;

        return (
          <button
            key={round}
            type="button"
            onClick={() => onSelectRound(round)}
            className={`h-8 min-w-[82px] shrink-0 rounded-[9px] border px-3 text-[12px] font-semibold transition-colors ${
              active
                ? 'border-[#0F172A] bg-[#0F172A] text-white shadow-sm'
                : 'border-[#CBD5E1] bg-white text-[#475569] hover:border-[#2563EB] hover:text-[#1D4ED8]'
            }`}
          >
            Ronde {round}
          </button>
        );
      })}
    </div>
  );
}

function MetaBar({
  round,
  totalRounds,
}: {
  round: FeistelRoundData;
  totalRounds: number;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="rounded-[9px] border border-[#E2E8F0] bg-white px-3 py-2 text-[12px] text-[#475569]">Ronde {round.round}/{totalRounds}</div>
      <div className="rounded-[9px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[12px] text-[#64748B]">
        Dipakai:
      </div>
      <div className="rounded-[9px] border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2 font-mono text-[12px] font-semibold text-[#1D4ED8]">
        L{round.round - 1}
      </div>
      <div className="rounded-[9px] border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 font-mono text-[12px] font-semibold text-[#15803D]">
        R{round.round - 1}
      </div>
      <div className="rounded-[9px] border border-[#FDE68A] bg-[#FFFBEB] px-3 py-2 font-mono text-[12px] font-semibold text-[#92400E]">
        K{round.round}
      </div>
    </div>
  );
}

function StepTabs({
  activeIndex,
  onSelect,
}: {
  activeIndex: number;
  onSelect: (index: number) => void;
}) {
  return (
    <div className="overflow-hidden rounded-[12px] border border-[#CBD5E1] bg-white">
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6">
        {roundSteps.map((step, index) => {
          const active = index === activeIndex;

          return (
            <button
              key={step.id}
              type="button"
              onClick={() => onSelect(index)}
              className={`border-b border-r border-[#E2E8F0] px-3 py-3 text-left text-[12px] transition-colors last:border-r-0 xl:border-b-0 ${
                active ? `${toneClass[step.tone].solid} font-semibold` : 'bg-[#F8FAFC] text-[#64748B] hover:bg-white hover:text-[#0F172A]'
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

function SBoxTable({
  boxIndex,
  chunk,
  outputBits,
}: {
  boxIndex: number;
  chunk: string;
  outputBits: string;
}) {
  const row = parseInt(`${chunk[0]}${chunk[5]}`, 2);
  const column = parseInt(chunk.slice(1, 5), 2);
  const value = DES_S_BOXES[boxIndex][row][column];

  return (
    <div className="rounded-[14px] border border-[#DDD6FE] bg-white p-3">
      <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="text-[13px] font-semibold text-[#5B21B6]">S{boxIndex + 1} lookup</div>
          <div className="mt-1 font-mono text-[11px] text-[#64748B]">
            {`input ${chunk} -> row ${row}, column ${column}`}
          </div>
        </div>
        <div className="rounded-[9px] bg-[#F5F3FF] px-3 py-2 font-mono text-[12px] font-semibold text-[#6D28D9] ring-1 ring-[#DDD6FE]">
          {`${value} -> ${outputBits}`}
        </div>
      </div>
      <div className="grid grid-cols-[34px_repeat(16,minmax(28px,1fr))] gap-1 overflow-x-auto text-center text-[10px]">
        <div className="rounded-[5px] bg-[#F8FAFC] py-1 text-[#94A3B8]">r/c</div>
        {Array.from({ length: 16 }, (_, col) => (
          <div key={`col-${col}`} className={`rounded-[5px] py-1 font-semibold ${col === column ? 'bg-[#FDE68A] text-[#92400E]' : 'bg-[#F8FAFC] text-[#64748B]'}`}>
            {col}
          </div>
        ))}
        {DES_S_BOXES[boxIndex].map((rowValues, rowIndex) => (
          <Fragment key={`sbox-row-${rowIndex}`}>
            <div key={`row-label-${rowIndex}`} className={`rounded-[5px] py-1 font-semibold ${rowIndex === row ? 'bg-[#FDE68A] text-[#92400E]' : 'bg-[#F8FAFC] text-[#64748B]'}`}>
              {rowIndex}
            </div>
            {rowValues.map((cell, colIndex) => {
              const selected = rowIndex === row && colIndex === column;
              return (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`rounded-[5px] py-1 font-mono font-semibold ${
                    selected ? 'bg-[#7C3AED] text-white shadow-[0_4px_12px_rgba(124,58,237,0.25)]' : 'bg-white text-[#475569] ring-1 ring-[#E2E8F0]'
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
  );
}

function InputStep({ round, bits }: { round: FeistelRoundData; bits: ReturnType<typeof useRoundBits> }) {
  const labels = getLabels(round);
  const inputIndex = round.round - 1;
  const originNotes = inputIndex === 0
    ? {
        left: `${labels.leftIn} ini berasal dari 32 bit kiri hasil Initial Permutation (Langkah 2).`,
        right: `${labels.rightIn} ini berasal dari 32 bit kanan hasil Initial Permutation (Langkah 2).`,
      }
    : {
        left: `${labels.leftIn} ini berasal dari output kiri ronde ${inputIndex}, yaitu nilai R${inputIndex - 1} yang disalin tanpa perubahan.`,
        right: `${labels.rightIn} ini berasal dari output kanan ronde ${inputIndex}, yaitu hasil L${inputIndex - 1} di-XOR dengan output Function F(R${inputIndex - 1}, K${inputIndex}).`,
      };
  const flowRows = [
    `${labels.rightIn} masuk ke Function F - ${labels.rightIn} adalah 32 bit kanan input ronde ${round.round}. Nilainya diproses bersama ${labels.subkey}, subkey ronde ${round.round} dari Key Schedule.`,
    `Function F memakai ${labels.subkey} - ${labels.subkey} adalah satu dari 16 subkey yang dihasilkan. Function F melakukan Expansion, XOR dengan subkey, S-Box substitution, dan Permutation.`,
    `${labels.leftIn} di-XOR dengan output Function F - hasil XOR ini menjadi ${labels.rightOut} (sisi kanan ronde berikutnya). Sementara ${labels.leftOut} langsung diisi dengan nilai ${labels.rightIn}.`,
  ];

  return (
    <>
      <div className="space-y-3">
        <FeistelDiagram round={round} />
      </div>
      <div className="space-y-3">
        <FlowCard title={`Alur ronde ${round.round}`} rows={flowRows} />
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:col-span-2">
        <div className="space-y-1.5">
          <BitGrid bits={bits.leftInput} label={`${labels.leftIn} - sisi kiri (32 bit)`} />
          <div className="rounded-[9px] border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2 text-[11px] text-[#1D4ED8]">
            {originNotes.left}
          </div>
        </div>
        <div className="space-y-1.5">
          <BitGrid bits={bits.rightInput} label={`${labels.rightIn} - sisi kanan (32 bit)`} />
          <div className="rounded-[9px] border border-[#BBF7D0] bg-[#F0FDF4] px-3 py-2 text-[11px] text-[#15803D]">
            {originNotes.right}
          </div>
        </div>
      </div>
    </>
  );
}

function ExpansionStep({ bits }: { bits: ReturnType<typeof useRoundBits> }) {
  const [activeOutputIndex, setActiveOutputIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const duplicateInputIndexes = DES_EXPANSION_TABLE
    .filter((position, _, table) => table.indexOf(position) !== table.lastIndexOf(position))
    .map((position) => position - 1);
  const activeInputIndex = DES_EXPANSION_TABLE[activeOutputIndex] - 1;

  useEffect(() => {
    setActiveOutputIndex(0);
    setIsPlaying(false);
  }, [bits.rightInput, bits.expansion]);

  useEffect(() => {
    if (!isPlaying) return undefined;

    const timer = window.setInterval(() => {
      setActiveOutputIndex((current) => {
        if (current >= DES_EXPANSION_TABLE.length - 1) {
          setIsPlaying(false);
          return current;
        }

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
      <div className="space-y-4 xl:col-span-2">
        <div className="rounded-[14px] border border-[#BBF7D0] bg-[#F0FDF4] px-4 py-3">
          <p className="text-[12px] text-[#15803D]" style={{ lineHeight: 1.65 }}>
            Subkey K berukuran 48 bit. Agar bisa di-XOR, R juga harus 48 bit. Expansion menyalin beberapa bit tepi sehingga bit-bit tersebut memengaruhi dua S-Box sekaligus dan memperkuat difusi.
          </p>
        </div>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <BitGrid
            bits={bits.rightInput}
            label="Input R (32 bit), bit kuning disalin dua kali"
            changedIndexes={duplicateInputIndexes}
            activeIndexes={[activeInputIndex]}
            size="xl"
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap lg:flex-col">
            <button
              type="button"
              onClick={isPlaying ? () => setIsPlaying(false) : start}
              className="inline-flex min-h-[44px] items-center justify-center gap-2 rounded-[10px] bg-[#2563EB] px-5 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#1D4ED8]"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Pause' : 'Mulai'}
            </button>
          </div>
        </div>
      </div>
      <div className="space-y-3 xl:col-span-2">
        <MappingTable
          table={DES_EXPANSION_TABLE}
          inputBits={bits.rightInput}
          outputBits={bits.expansion}
          label="Tabel Expansion E"
          columns={6}
          mappingOnly
          activeIndex={activeOutputIndex}
          onSelectIndex={(index) => {
            setIsPlaying(false);
            setActiveOutputIndex(index);
          }}
        />
        <div className="rounded-[10px] border border-[#E2E8F0] bg-white px-3 py-2 text-[12px] text-[#64748B]">
          Output bit ke-{activeOutputIndex + 1} mengambil input R posisi {DES_EXPANSION_TABLE[activeOutputIndex]}.
        </div>
      </div>
      <div className="xl:col-span-2">
        <BitGrid bits={bits.expansion} label="Output E(R) (48 bit)" columns={6} activeIndexes={[activeOutputIndex]} size="xl" />
      </div>
    </>
  );
}

function XorStep({ round, bits }: { round: FeistelRoundData; bits: ReturnType<typeof useRoundBits> }) {
  const [activeBitIndex, setActiveBitIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const activeExpansionBit = bits.expansion[activeBitIndex] ?? '0';
  const activeSubkeyBit = bits.subkey[activeBitIndex] ?? '0';
  const activeResultBit = bits.xorWithKey[activeBitIndex] ?? (activeExpansionBit === activeSubkeyBit ? '0' : '1');

  useEffect(() => {
    setActiveBitIndex(0);
    setIsPlaying(false);
  }, [bits.expansion, bits.subkey, bits.xorWithKey]);

  useEffect(() => {
    if (!isPlaying) return undefined;

    const timer = window.setInterval(() => {
      setActiveBitIndex((current) => (current + 1) % 48);
    }, 1200);

    return () => window.clearInterval(timer);
  }, [isPlaying]);

  return (
    <>
      <div className="xl:col-span-2 rounded-[14px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3">
        <p className="text-[12px] text-[#1D4ED8]" style={{ lineHeight: 1.65 }}>
          XOR (Exclusive OR) membandingkan bit E(R) dengan bit subkey K pada posisi yang sama. Jika kedua bit berbeda, hasilnya 1; jika sama, hasilnya 0. Contoh: 1 XOR 0 = 1, 0 XOR 0 = 0, 1 XOR 1 = 0. Di tahap ini, subkey mulai mencampur pengaruh kunci ke data sebelum masuk ke S-Box.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:col-span-2">
        <BitGrid bits={bits.expansion} label="E(R) (48 bit)" columns={6} activeIndexes={[activeBitIndex]} />
        <BitGrid bits={bits.subkey} label={`Subkey K${round.round} (48 bit)`} columns={6} activeIndexes={[activeBitIndex]} />
      </div>
      <div className="xl:col-span-2">
        <div className="rounded-[16px] border border-[#BFDBFE] bg-[#EFF6FF] p-4">
          <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[13px] font-semibold text-[#1D4ED8]">Animasi XOR bit ke-{activeBitIndex + 1}</div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <div className="text-[11px] text-[#1D4ED8]">E(R) bertemu Subkey K{round.round}</div>
              <button
                type="button"
                onClick={isPlaying ? () => setIsPlaying(false) : () => setIsPlaying(true)}
                className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#2563EB] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#1D4ED8]"
              >
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                {isPlaying ? 'Pause' : 'Mulai'}
              </button>
            </div>
          </div>
          <div className="grid gap-3 md:grid-cols-[minmax(120px,0.8fr)_auto_minmax(120px,0.8fr)_auto_minmax(120px,0.8fr)] md:items-center">
            <motion.div
              key={`xor-er-${activeBitIndex}`}
              initial={{ scale: 0.98, opacity: 0.9 }}
              animate={{ scale: 1.02, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              className="rounded-[10px] bg-[#2563EB] px-3 py-2.5 text-center text-white shadow-[0_8px_18px_rgba(37,99,235,0.22)] ring-2 ring-[#93C5FD]"
            >
              <div className="text-[10px] font-semibold text-white/85">E(R)</div>
              <div className="mt-1 font-mono text-[26px] font-semibold text-white">{activeExpansionBit}</div>
            </motion.div>
            <div className="text-center text-[12px] font-semibold text-[#1D4ED8]">ketemu</div>
            <motion.div
              key={`xor-key-${activeBitIndex}`}
              initial={{ scale: 0.98, opacity: 0.9 }}
              animate={{ scale: 1.02, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.08 }}
              className="rounded-[10px] bg-[#1D4ED8] px-3 py-2.5 text-center text-white shadow-[0_8px_18px_rgba(29,78,216,0.22)] ring-2 ring-[#93C5FD]"
            >
              <div className="text-[10px] font-semibold text-white/85">K{round.round}</div>
              <div className="mt-1 font-mono text-[26px] font-semibold text-white">{activeSubkeyBit}</div>
            </motion.div>
            <div className="text-center text-[12px] font-semibold text-[#1D4ED8]">sama dengan</div>
            <motion.div
              key={`xor-result-${activeBitIndex}`}
              initial={{ scale: 0.98, opacity: 0.9 }}
              animate={{ scale: 1.03, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.16 }}
              className="rounded-[10px] bg-[#1E40AF] px-3 py-2.5 text-center text-white shadow-[0_9px_20px_rgba(30,64,175,0.24)] ring-2 ring-[#93C5FD]"
            >
              <div className="text-[10px] font-semibold text-white/85">Hasil</div>
              <div className="mt-1 font-mono text-[26px] font-semibold text-white">{activeResultBit}</div>
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

function SBoxOutputGrid({ outputs }: { outputs: string[] }) {
  const outputBits = Array.from({ length: 8 }, (_, index) => outputs[index] ?? '0000').join('');
  const outputHex = binaryToHex(outputBits);

  return (
    <div className="rounded-[16px] border border-[#DDD6FE] bg-white p-4">
      <div className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#5B21B6]">Output gabungan S-Box (32 bit)</div>
          <div className="mt-1 text-[12px] text-[#6D28D9]">Delapan output 4-bit dari S1 sampai S8 digabung berurutan menjadi 32 bit.</div>
        </div>
        <div className="w-fit rounded-[9px] border border-[#DDD6FE] bg-[#F5F3FF] px-3 py-2 font-mono text-[12px] font-semibold text-[#5B21B6]">
          HEX {outputHex}
        </div>
      </div>
      <div className="grid grid-cols-8 gap-1.5">
        {outputBits.split('').map((bit, index) => (
          <div
            key={`sbox-output-bit-${index}`}
            title={`Bit ${index + 1}`}
            className="flex h-9 items-center justify-center rounded-[7px] border border-[#C4B5FD] bg-[#EDE9FE] font-mono text-[14px] font-semibold text-[#5B21B6]"
          >
            {bit}
          </div>
        ))}
      </div>
    </div>
  );
}

function SBoxStep({ bits }: { bits: ReturnType<typeof useRoundBits> }) {
  const [activeBox, setActiveBox] = useState(0);
  const chunks = bits.xorWithKey.match(/.{1,6}/g) ?? [];
  const outputs = bits.sboxOutput.match(/.{1,4}/g) ?? [];
  const sboxIndexes = Array.from({ length: 8 }, (_, index) => index);

  useEffect(() => {
    setActiveBox(0);
  }, [bits.xorWithKey]);

  return (
    <div className="space-y-4 xl:col-span-2">
      <div className="rounded-[14px] border border-[#DDD6FE] bg-[#F5F3FF] px-4 py-3">
        <div className="mb-2 text-[12px] font-semibold text-[#5B21B6]">Cara membaca S-Box</div>
        <p className="text-[12px] text-[#6D28D9]" style={{ lineHeight: 1.65 }}>
          S-Box adalah jantung non-linearitas DES. Input 6 bit menjadi output 4 bit: bit pertama dan terakhir memilih baris (0-3), empat bit tengah memilih kolom (0-15), lalu hasil diambil dari perpotongan baris dan kolom.
        </p>
        <p className="mt-2 text-[12px] text-[#6D28D9]" style={{ lineHeight: 1.65 }}>
          S-Box sengaja dibuat non-linear, tidak ada rumus sederhana untuk menebak outputnya. Inilah yang membuat DES lebih sulit dipecah secara analitik.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {sboxIndexes.map((index) => {
          const chunk = chunks[index] ?? '000000';
          const output = outputs[index] ?? '0000';
          const active = index === activeBox;
          const row = parseInt(`${chunk[0]}${chunk[5]}`, 2);
          const column = parseInt(chunk.slice(1, 5), 2);
          const chars = chunk.split('');

          return (
            <button
              key={`sbox-card-${index}`}
              type="button"
              onClick={() => setActiveBox(index)}
              className={`flex min-h-[164px] flex-col gap-3 rounded-[12px] border p-4 text-left transition-colors ${
                active ? 'border-[#7C3AED] bg-[#F5F3FF] shadow-[0_0_0_3px_rgba(221,214,254,0.9)]' : 'border-[#E2E8F0] bg-white hover:bg-[#F8FAFC]'
              }`}
            >
              <div className="text-[13px] font-semibold text-[#5B21B6]">S{index + 1}</div>
              <div className="grid grid-cols-6 gap-1 font-mono text-[13px] font-semibold">
                {chars.map((bit, bitIndex) => {
                  const isRowBit = bitIndex === 0 || bitIndex === 5;

                  return (
                    <div key={`sbox-card-${index}-${bitIndex}`} className="flex flex-col items-center gap-1">
                      <motion.span
                        animate={active && isRowBit ? { scale: [1, 1.18, 1] } : { scale: 1 }}
                        transition={{ duration: 0.8, repeat: active ? Infinity : 0 }}
                        className={`flex h-8 w-full items-center justify-center rounded-[6px] ${
                          isRowBit
                            ? 'bg-[#FEF3C7] text-[#92400E]'
                            : 'bg-[#EDE9FE] text-[#5B21B6] ring-1 ring-[#DDD6FE]'
                        }`}
                      >
                        {bit}
                      </motion.span>
                      <span className={`text-[8px] font-semibold leading-none ${isRowBit ? 'text-[#92400E]' : 'text-[#6D28D9]'}`}>
                        {isRowBit ? 'baris' : 'kolom'}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="text-[11px] text-[#64748B]">baris {row}, kolom {column}</div>
              <div className="mt-auto rounded-[9px] bg-white px-3 py-2 ring-1 ring-[#DDD6FE]">
                <div className="text-[10px] font-semibold text-[#64748B]">Output 4 bit</div>
                <div className="mt-1 grid grid-cols-4 gap-1 font-mono text-[12px] font-semibold text-[#6D28D9]">
                  {output.split('').map((bit, bitIndex) => (
                    <span key={`sbox-card-output-${index}-${bitIndex}`} className="rounded-[5px] bg-[#F5F3FF] px-2 py-1 text-center">
                      {bit}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <div className="space-y-3">
        <div className="flex flex-wrap gap-2">
          {sboxIndexes.map((index) => {
            const active = index === activeBox;

            return (
              <button
                key={`sbox-table-tab-${index}`}
                type="button"
                onClick={() => setActiveBox(index)}
                className={`rounded-[9px] border px-3 py-2 text-[12px] font-semibold transition-colors ${
                  active
                    ? 'border-[#7C3AED] bg-[#7C3AED] text-white shadow-sm'
                    : 'border-[#DDD6FE] bg-white text-[#6D28D9] hover:bg-[#F5F3FF]'
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

function PermutationStep({ bits }: { bits: ReturnType<typeof useRoundBits> }) {
  const [activeOutputIndex, setActiveOutputIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const activeInputIndex = DES_PERMUTATION_P_TABLE[activeOutputIndex] - 1;

  useEffect(() => {
    setActiveOutputIndex(0);
    setIsPlaying(false);
  }, [bits.sboxOutput, bits.permutationOutput]);

  useEffect(() => {
    if (!isPlaying) return undefined;

    const timer = window.setInterval(() => {
      setActiveOutputIndex((current) => {
        if (current >= DES_PERMUTATION_P_TABLE.length - 1) {
          setIsPlaying(false);
          return current;
        }

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
        <div className="rounded-[14px] border border-[#A5F3FC] bg-[#ECFEFF] px-4 py-3">
          <p className="text-[12px] text-[#0E7490]" style={{ lineHeight: 1.65 }}>
            Setelah S-Box, bit-bit yang berubah masih berkelompok. Permutasi P menyebarkannya ke posisi berbeda sehingga di ronde berikutnya, setiap S-Box mendapat input dari S-Box yang berbeda. Ini disebut difusi lintas blok.
          </p>
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:col-span-2">
        <div className="space-y-3">
          <BitGrid bits={bits.sboxOutput} label="Input dari S-Box (32 bit)" activeIndexes={[activeInputIndex]} />
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            <button
              type="button"
              onClick={isPlaying ? () => setIsPlaying(false) : start}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#0891B2] px-4 py-2.5 text-[13px] font-medium text-white transition-colors hover:bg-[#0E7490]"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Pause' : 'Mulai'}
            </button>
          </div>
        </div>
        <div className="space-y-3">
          <MappingTable
            table={DES_PERMUTATION_P_TABLE}
            inputBits={bits.sboxOutput}
            outputBits={bits.permutationOutput}
            label="Tabel Permutasi P"
            columns={8}
            mappingOnly
            activeIndex={activeOutputIndex}
            onSelectIndex={(index) => {
              setIsPlaying(false);
              setActiveOutputIndex(index);
            }}
          />
          <div className="rounded-[10px] border border-[#E2E8F0] bg-white px-3 py-2 text-[12px] text-[#64748B]">
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

function OutputStep({ round, bits }: { round: FeistelRoundData; bits: ReturnType<typeof useRoundBits> }) {
  const labels = getLabels(round);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const activeLeftBit = bits.leftInput[activeIndex] ?? '0';
  const activeFunctionBit = bits.permutationOutput[activeIndex] ?? '0';
  const activeResultBit = bits.rightOutput[activeIndex] ?? (activeLeftBit === activeFunctionBit ? '0' : '1');

  useEffect(() => {
    setActiveIndex(0);
    setIsPlaying(false);
  }, [bits.leftInput, bits.permutationOutput, bits.rightOutput]);

  useEffect(() => {
    if (!isPlaying) return undefined;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => {
        if (current >= bits.rightOutput.length - 1) {
          setIsPlaying(false);
          return current;
        }

        return current + 1;
      });
    }, 900);

    return () => window.clearInterval(timer);
  }, [bits.rightOutput.length, isPlaying]);

  const start = () => {
    setActiveIndex((current) => (current >= bits.rightOutput.length - 1 ? 0 : current));
    setIsPlaying(true);
  };

  return (
    <>
      <div className="grid gap-4 md:grid-cols-2 xl:col-span-2">
        <BitGrid bits={bits.leftInput} label={`${labels.leftIn} lama`} activeIndexes={[activeIndex]} />
        <BitGrid bits={bits.permutationOutput} label={`F(${labels.rightIn}, ${labels.subkey})`} activeIndexes={[activeIndex]} />
      </div>

      <div className="xl:col-span-2">
        <div className="rounded-[16px] border border-[#BFDBFE] bg-[#EFF6FF] p-4">
          <div className="mb-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-[13px] font-semibold text-[#1D4ED8]">Animasi XOR bit ke-{activeIndex + 1}</div>
            <button
              type="button"
              onClick={isPlaying ? () => setIsPlaying(false) : start}
              className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#2563EB] px-4 py-2 text-[13px] font-medium text-white transition-colors hover:bg-[#1D4ED8]"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              {isPlaying ? 'Pause' : 'Mulai'}
            </button>
          </div>
          <div className="grid gap-3 md:grid-cols-[minmax(120px,0.8fr)_auto_minmax(120px,0.8fr)_auto_minmax(120px,0.8fr)] md:items-center">
            <motion.div
              key={`output-left-${activeIndex}`}
              initial={{ scale: 0.98, opacity: 0.9 }}
              animate={{ scale: 1.02, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18 }}
              className="rounded-[10px] bg-[#2563EB] px-3 py-2.5 text-center text-white shadow-[0_8px_18px_rgba(37,99,235,0.20)] ring-2 ring-[#93C5FD]"
            >
              <div className="text-[10px] font-semibold text-white/85">{labels.leftIn}</div>
              <div className="mt-1 font-mono text-[26px] font-semibold text-white">{activeLeftBit}</div>
            </motion.div>
            <div className="text-center text-[12px] font-semibold text-[#1D4ED8]">XOR</div>
            <motion.div
              key={`output-f-${activeIndex}`}
              initial={{ scale: 0.98, opacity: 0.9 }}
              animate={{ scale: 1.02, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.08 }}
              className="rounded-[10px] bg-[#1D4ED8] px-3 py-2.5 text-center text-white shadow-[0_8px_18px_rgba(29,78,216,0.20)] ring-2 ring-[#93C5FD]"
            >
              <div className="text-[10px] font-semibold text-white/85">F</div>
              <div className="mt-1 font-mono text-[26px] font-semibold text-white">{activeFunctionBit}</div>
            </motion.div>
            <div className="text-center text-[12px] font-semibold text-[#1D4ED8]">=</div>
            <motion.div
              key={`output-result-${activeIndex}`}
              initial={{ scale: 0.98, opacity: 0.9 }}
              animate={{ scale: 1.03, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 320, damping: 18, delay: 0.16 }}
              className="rounded-[10px] bg-[#1E40AF] px-3 py-2.5 text-center text-white shadow-[0_9px_20px_rgba(30,64,175,0.22)] ring-2 ring-[#93C5FD]"
            >
              <div className="text-[10px] font-semibold text-white/85">Hasil</div>
              <div className="mt-1 font-mono text-[26px] font-semibold text-white">{activeResultBit}</div>
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
        <BitGrid
          bits={bits.leftOutput}
          label={`${labels.leftOut} = ${labels.rightIn}`}
          note={`${labels.rightIn} lama disalin menjadi ${labels.leftOut}.`}
        />
        <div className="grid gap-2">
          <div className="rounded-[10px] border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2 font-mono text-[13px] font-semibold text-[#1D4ED8]">
            {labels.leftOut} = {labels.rightIn}
          </div>
          <div className="rounded-[10px] border border-[#BFDBFE] bg-[#EFF6FF] px-3 py-2 font-mono text-[13px] font-semibold text-[#1D4ED8]">
            {labels.rightOut} = {labels.leftIn} XOR F
          </div>
        </div>
      </div>
    </>
  );
}

function FlowCard({ title, rows }: { title: string; rows: string[] }) {
  return (
    <div className="rounded-[14px] border border-[#E2E8F0] bg-white p-4">
      <div className="mb-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#64748B]">{title}</div>
      <div className="space-y-2">
        {rows.map((row, index) => (
          <div key={row} className="flex items-center gap-3 rounded-[11px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2 text-[12px] text-[#475569]">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white font-mono text-[11px] font-semibold text-[#0F172A] ring-1 ring-[#E2E8F0]">
              {index + 1}
            </span>
            <span>{row}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StepContent({
  round,
  activeStep,
  bits,
}: {
  round: FeistelRoundData;
  activeStep: number;
  bits: ReturnType<typeof useRoundBits>;
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
        className="rounded-[18px] border border-[#E2E8F0] bg-[#F8FAFC] p-4 md:p-5"
      >
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <div className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-[11px] font-semibold ${toneClass[step.tone].soft}`}>
              <CircleDot className="h-3.5 w-3.5" />
              Langkah {activeStep + 1}/6
            </div>
            <h3 className="mt-2 text-[18px] font-semibold text-[#0F172A]">{step.title}</h3>
            {step.id === 'output' && (
              <p className="mt-1.5 max-w-[680px] text-[13px] text-[#64748B]" style={{ lineHeight: 1.65 }}>
                Di akhir ronde, {getLabels(round).leftIn} lama di-XOR dengan hasil Function F untuk membentuk {getLabels(round).rightOut}. Sementara itu, {getLabels(round).rightIn} lama langsung disalin menjadi {getLabels(round).leftOut}; inilah swap Feistel yang membuat sisi kiri dan kanan saling bertukar peran.
              </p>
            )}
          </div>
          <div className={`w-fit rounded-[10px] border px-3 py-2 text-[12px] font-semibold ${toneClass[step.tone].active}`}>{step.size}</div>
        </div>

        <div className="grid gap-4 xl:grid-cols-[0.96fr_1.04fr]">
          {step.id === 'input' && <InputStep round={round} bits={bits} />}
          {step.id === 'expansion' && <ExpansionStep bits={bits} />}
          {step.id === 'xor-key' && <XorStep round={round} bits={bits} />}
          {step.id === 'sbox' && <SBoxStep bits={bits} />}
          {step.id === 'permutation' && <PermutationStep bits={bits} />}
          {step.id === 'output' && <OutputStep round={round} bits={bits} />}
        </div>
      </motion.div>
    </AnimatePresence>
  );
}

export function FeistelRoundsVisualization({ data, tutorialMode = false }: FeistelRoundsVisualizationProps) {
  const [currentRound, setCurrentRound] = useState(1);
  const [activeStep, setActiveStep] = useState(0);

  const totalRounds = data.length;
  const clampedRound = Math.min(Math.max(currentRound, 1), Math.max(totalRounds, 1));
  const currentData = useMemo(() => data.find((item) => item.round === clampedRound) ?? data[0], [clampedRound, data]);
  const bits = useRoundBits(currentData ?? {
    round: 1,
    leftInput: '',
    rightInput: '',
    expansion: '',
    xorWithKey: '',
    sboxOutput: '',
    permutationOutput: '',
    leftOutput: '',
    rightOutput: '',
    subkey: '',
  });

  useEffect(() => {
    setCurrentRound((previous) => {
      if (data.length === 0) return 1;
      return Math.min(Math.max(previous, 1), data.length);
    });
  }, [data.length]);

  if (!currentData) return null;

  const selectRound = (round: number) => {
    setCurrentRound(round);
    setActiveStep(0);
  };

  const goNext = () => {
    if (activeStep < roundSteps.length - 1) {
      setActiveStep((step) => step + 1);
      return;
    }

    if (currentData.round < totalRounds) {
      setCurrentRound((round) => round + 1);
      setActiveStep(0);
    }
  };

  const goPrevious = () => {
    if (activeStep > 0) {
      setActiveStep((step) => step - 1);
      return;
    }

    if (currentData.round > 1) {
      setCurrentRound((round) => round - 1);
      setActiveStep(roundSteps.length - 1);
    }
  };

  return (
    <div className="space-y-4">
      <div className="rounded-[18px] border border-[#E2E8F0] bg-white p-4 shadow-sm">
        <RoundSelector totalRounds={totalRounds} currentRound={currentData.round} onSelectRound={selectRound} />
        <div className="mt-4">
          <MetaBar round={currentData} totalRounds={totalRounds} />
        </div>
      </div>
      <StepTabs activeIndex={activeStep} onSelect={setActiveStep} />
      {tutorialMode && (
        <div className="rounded-[14px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-[12px] text-[#1D4ED8]">
          Ikuti tab dari kiri ke kanan. Setiap tab menunjukkan satu bagian Function F atau swap pada ronde Feistel yang sedang dipilih.
        </div>
      )}
      <StepContent round={currentData} activeStep={activeStep} bits={bits} />
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={goPrevious}
          disabled={currentData.round === 1 && activeStep === 0}
          className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-white px-4 py-2.5 text-[13px] font-semibold text-[#0F172A] transition-colors hover:bg-[#F8FAFC] disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Tahap Sebelumnya
        </button>
        <div className="inline-flex items-center justify-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-white px-4 py-2.5 text-[12px] text-[#64748B]">
          <KeyRound className="h-4 w-4 text-[#F59E0B]" />
          {roundSteps[activeStep].tab} pada Ronde {currentData.round}
        </div>
        <button
          type="button"
          onClick={goNext}
          disabled={currentData.round === totalRounds && activeStep === roundSteps.length - 1}
          className="inline-flex items-center justify-center gap-2 rounded-[10px] bg-[#2563EB] px-4 py-2.5 text-[13px] font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:opacity-40"
        >
          {activeStep === roundSteps.length - 1 && currentData.round < totalRounds ? `Ronde ${currentData.round + 1}` : 'Tahap Berikutnya'}
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
