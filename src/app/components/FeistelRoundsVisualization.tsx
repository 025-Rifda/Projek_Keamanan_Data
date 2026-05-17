import { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  Binary,
  ChevronLeft,
  ChevronRight,
  CircleHelp,
  Lightbulb,
  Pause,
  Play,
  RotateCcw,
  Shuffle,
  WandSparkles,
} from 'lucide-react';
import { motion } from 'motion/react';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from './ui/accordion';
import { Progress } from './ui/progress';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';

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
}

interface StepDefinition {
  id: string;
  title: string;
  shortTitle: string;
  description: string;
  valueLabel: string;
  getValue: (round: FeistelRoundData) => string;
  tone: 'left' | 'right' | 'function' | 'xor' | 'output';
}

const palette = {
  left: {
    soft: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]',
    strong: 'bg-[#2563EB] border-[#2563EB] text-white',
    ring: 'shadow-[0_0_0_3px_rgba(191,219,254,0.85)]',
  },
  right: {
    soft: 'bg-[#F0FDF4] border-[#BBF7D0] text-[#15803D]',
    strong: 'bg-[#16A34A] border-[#16A34A] text-white',
    ring: 'shadow-[0_0_0_3px_rgba(187,247,208,0.9)]',
  },
  function: {
    soft: 'bg-[#F5F3FF] border-[#DDD6FE] text-[#7C3AED]',
    strong: 'bg-[#7C3AED] border-[#7C3AED] text-white',
    ring: 'shadow-[0_0_0_3px_rgba(221,214,254,0.95)]',
  },
  xor: {
    soft: 'bg-[#FFF7ED] border-[#FED7AA] text-[#C2410C]',
    strong: 'bg-[#EA580C] border-[#EA580C] text-white',
    ring: 'shadow-[0_0_0_3px_rgba(254,215,170,0.95)]',
  },
  output: {
    soft: 'bg-[#ECFEFF] border-[#A5F3FC] text-[#0F766E]',
    strong: 'bg-[#0891B2] border-[#0891B2] text-white',
    ring: 'shadow-[0_0_0_3px_rgba(165,243,252,0.95)]',
  },
} as const;

const steps: StepDefinition[] = [
  {
    id: 'input',
    title: '1. Input L[i-1] dan R[i-1]',
    shortTitle: 'Input',
    description: 'Mulai dari dua bagian lama. Sisi kiri belum diubah, sisi kanan akan masuk ke fungsi F.',
    valueLabel: 'Lama',
    getValue: (round) => `L = ${round.leftInput} | R = ${round.rightInput}`,
    tone: 'left',
  },
  {
    id: 'expansion',
    title: '2. Expansion E(R[i-1])',
    shortTitle: 'Expansion',
    description: 'Bagian kanan diperluas supaya bisa dicampur dengan subkey ronde ini.',
    valueLabel: 'E(R)',
    getValue: (round) => round.expansion,
    tone: 'function',
  },
  {
    id: 'xor-key',
    title: '3. XOR dengan K[i]',
    shortTitle: 'XOR K',
    description: 'Hasil expansion dicampur dengan subkey menggunakan XOR.',
    valueLabel: 'E(R) XOR K',
    getValue: (round) => round.xorWithKey,
    tone: 'xor',
  },
  {
    id: 'sbox',
    title: '4. S-Box',
    shortTitle: 'S-Box',
    description: 'S-Box mengubah hasil tadi menjadi bentuk baru yang lebih teracak.',
    valueLabel: 'S-Box',
    getValue: (round) => round.sboxOutput,
    tone: 'function',
  },
  {
    id: 'permutation',
    title: '5. Permutation P',
    shortTitle: 'Permutasi P',
    description: 'Bit dari hasil S-Box disusun ulang. Inilah output fungsi F.',
    valueLabel: 'F(R, K)',
    getValue: (round) => round.permutationOutput,
    tone: 'function',
  },
  {
    id: 'xor-left',
    title: '6. XOR dengan L[i-1]',
    shortTitle: 'XOR L',
    description: 'Output fungsi F dicampur dengan sisi kiri lama untuk membentuk sisi kanan baru.',
    valueLabel: 'R baru',
    getValue: (round) => round.rightOutput,
    tone: 'xor',
  },
  {
    id: 'swap',
    title: '7. Swap menjadi L[i] dan R[i]',
    shortTitle: 'Swap',
    description: 'Bagian kanan lama menjadi kiri baru. Hasil XOR menjadi kanan baru.',
    valueLabel: 'Output ronde',
    getValue: (round) => `L = ${round.leftOutput} | R = ${round.rightOutput}`,
    tone: 'output',
  },
];

function formatHex(value: string): string {
  return value.match(/.{1,4}/g)?.join(' ') ?? value;
}

function getToneClasses(tone: StepDefinition['tone'], active = false): string {
  const entry = palette[tone];
  return active ? `${entry.strong} ${entry.ring}` : entry.soft;
}

function getRoundLabels(round: FeistelRoundData) {
  return {
    previousLeft: `L${round.round - 1}`,
    previousRight: `R${round.round - 1}`,
    nextLeft: `L${round.round}`,
    nextRight: `R${round.round}`,
    subkey: `K${round.round}`,
  };
}

function StepHeader() {
  return (
    <div className="bg-white border border-[#E2E8F0] rounded-[18px] p-5 md:p-6 shadow-sm">
      <div className="inline-flex items-center gap-2 rounded-full border border-[#FED7AA] bg-[#FFF7ED] px-3 py-1 text-[11px] font-semibold text-[#C2410C]">
        <WandSparkles className="h-3.5 w-3.5" />
        Langkah 4
      </div>
      <h2 className="mt-3 text-[22px] font-semibold text-[#0F172A] md:text-[28px]">16 Ronde Feistel</h2>
      <p className="mt-2 max-w-[760px] text-[13px] text-[#64748B] md:text-[14px]" style={{ lineHeight: 1.7 }}>
        Pada setiap ronde, sisi kanan diproses, hasilnya di-XOR dengan sisi kiri, lalu keduanya bertukar posisi.
      </p>
    </div>
  );
}

function AnalogyAlert() {
  return (
    <div className="flex gap-3 rounded-[16px] border border-[#FDE68A] bg-[#FFFBEB] px-4 py-4 shadow-sm">
      <Lightbulb className="h-5 w-5 flex-shrink-0 text-[#F59E0B]" />
      <div>
        <div className="text-[12px] font-semibold text-[#78350F]">Analogi sederhana</div>
        <p className="mt-1 text-[12px] text-[#92400E]" style={{ lineHeight: 1.65 }}>
          Bayangkan sisi kanan masuk ke mesin pengacak. Hasilnya dicampur dengan sisi kiri, lalu posisi kiri dan kanan ditukar.
        </p>
      </div>
    </div>
  );
}

function FormulaCard({ round }: { round: FeistelRoundData }) {
  const labels = getRoundLabels(round);

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="rounded-[18px] border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <div className="text-[12px] font-semibold text-[#0F172A]">Rumus ronde Feistel</div>
        <div className="mt-4 space-y-3 font-mono text-[14px] md:text-[16px]">
          <div className="rounded-[12px] border border-[#BFDBFE] bg-[#EFF6FF] px-4 py-3 text-[#1D4ED8]">
            {labels.nextLeft} = {labels.previousRight}
          </div>
          <div className="rounded-[12px] border border-[#A5F3FC] bg-[#ECFEFF] px-4 py-3 text-[#0F766E] break-all">
            {labels.nextRight} = {labels.previousLeft} XOR F({labels.previousRight}, {labels.subkey})
          </div>
        </div>
      </div>

      <div className="rounded-[18px] border border-[#E2E8F0] bg-white p-5 shadow-sm">
        <div className="text-[12px] font-semibold text-[#0F172A]">Ronde aktif</div>
        <div className="mt-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-[28px] font-semibold text-[#0F172A]">{round.round}</div>
            <div className="text-[12px] text-[#64748B]">Subkey yang dipakai: {labels.subkey}</div>
          </div>
          <div className="rounded-[14px] border border-[#DDD6FE] bg-[#F5F3FF] px-3 py-2 text-right">
            <div className="text-[10px] text-[#7C3AED]">Subkey</div>
            <div className="max-w-[190px] break-all font-mono text-[12px] font-semibold text-[#6D28D9]">{formatHex(round.subkey)}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TechBadge({ label, help }: { label: string; help: string }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1 rounded-full border border-[#E2E8F0] bg-white px-2.5 py-1 text-[11px] font-medium text-[#475569]"
        >
          {label}
          <CircleHelp className="h-3.5 w-3.5 text-[#94A3B8]" />
        </button>
      </TooltipTrigger>
      <TooltipContent sideOffset={6} className="max-w-[220px] bg-[#0F172A] text-white">
        {help}
      </TooltipContent>
    </Tooltip>
  );
}

function DiagramNode({
  title,
  value,
  tone,
  active,
}: {
  title: string;
  value: string;
  tone: keyof typeof palette;
  active: boolean;
}) {
  return (
    <motion.div
      animate={{ scale: active ? 1.02 : 1, y: active ? -2 : 0 }}
      transition={{ type: 'spring', stiffness: 260, damping: 20 }}
      className={`rounded-[16px] border px-4 py-3 shadow-sm transition-all ${getToneClasses(tone, active)}`}
    >
      <div className="text-[11px] font-semibold opacity-85">{title}</div>
      <div className="mt-2 break-all font-mono text-[12px] font-semibold">{formatHex(value)}</div>
    </motion.div>
  );
}

function FlowArrow({ label }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-2 text-[#94A3B8]">
      <ArrowRight className="h-4 w-4" />
      {label ? <span className="text-[10px] font-medium uppercase tracking-[0.12em]">{label}</span> : null}
    </div>
  );
}

function FeistelDiagram({ round, activeStep }: { round: FeistelRoundData; activeStep: number }) {
  const labels = getRoundLabels(round);
  const highlightFunction = activeStep >= 1 && activeStep <= 4;
  const highlightXor = activeStep === 5;
  const highlightSwap = activeStep === 6;

  return (
    <div className="rounded-[18px] border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="text-[14px] font-semibold text-[#0F172A]">Alur satu ronde Feistel</div>
          <p className="mt-1 text-[12px] text-[#64748B]" style={{ lineHeight: 1.65 }}>
            Fokusnya sederhana: R kanan diproses, hasilnya di-XOR dengan L kiri, lalu kedua sisi bertukar posisi.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <TechBadge label="Expansion" help="Expansion memperluas 32 bit menjadi 48 bit agar bisa dicampur dengan subkey." />
          <TechBadge label="S-Box" help="S-Box mengubah pola bit agar hasil ronde tidak mudah ditebak." />
          <TechBadge label="Permutation P" help="Permutation P menyusun ulang bit output S-Box agar pengaruhnya tersebar." />
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-5 xl:grid-cols-[1.2fr_1fr]">
        <div className="rounded-[16px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
            <DiagramNode title={labels.previousLeft} value={round.leftInput} tone="left" active={activeStep === 0 || activeStep === 5} />
            <div className="hidden lg:flex justify-center text-[#94A3B8]">
              <Binary className="h-5 w-5" />
            </div>
            <DiagramNode title={labels.previousRight} value={round.rightInput} tone="right" active={activeStep <= 4 || activeStep === 6} />
          </div>

          <div className="my-4 h-px bg-[#E2E8F0]" />

          <div className="grid grid-cols-1 gap-3">
            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
              <DiagramNode title={`F(${labels.previousRight}, ${labels.subkey})`} value={round.permutationOutput} tone="function" active={highlightFunction} />
              <FlowArrow label="XOR" />
              <DiagramNode title={`${labels.nextRight}`} value={round.rightOutput} tone="output" active={highlightXor || highlightSwap} />
            </div>

            <div className="grid grid-cols-1 gap-3 lg:grid-cols-[1fr_auto_1fr] lg:items-center">
              <DiagramNode title={`${labels.previousRight} menjadi ${labels.nextLeft}`} value={round.leftOutput} tone="right" active={highlightSwap} />
              <FlowArrow label="Swap" />
              <DiagramNode title={`${labels.nextLeft}`} value={round.leftOutput} tone="left" active={highlightSwap} />
            </div>
          </div>
        </div>

        <div className="rounded-[16px] border border-[#DDD6FE] bg-[#FAF5FF] p-4">
          <div className="flex items-center gap-2 text-[#6D28D9]">
            <Shuffle className="h-4 w-4" />
            <div className="text-[13px] font-semibold">Isi fungsi F</div>
          </div>

          <div className="mt-4 space-y-3">
            <DiagramNode title={`Input ${labels.previousRight}`} value={round.rightInput} tone="right" active={activeStep === 0 || activeStep === 1} />
            <FlowArrow />
            <DiagramNode title="Expansion E" value={round.expansion} tone="function" active={activeStep === 1} />
            <FlowArrow />
            <DiagramNode title={`${labels.subkey} dan XOR`} value={round.xorWithKey} tone="xor" active={activeStep === 2} />
            <FlowArrow />
            <DiagramNode title="S-Box" value={round.sboxOutput} tone="function" active={activeStep === 3} />
            <FlowArrow />
            <DiagramNode title="Permutation P" value={round.permutationOutput} tone="function" active={activeStep === 4} />
          </div>
        </div>
      </div>
    </div>
  );
}

function StepByStepPanel({
  round,
  activeStep,
  setActiveStep,
  showExplanation,
}: {
  round: FeistelRoundData;
  activeStep: number;
  setActiveStep: (step: number) => void;
  showExplanation: boolean;
}) {
  const labels = getRoundLabels(round);

  return (
    <div className="rounded-[18px] border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[14px] font-semibold text-[#0F172A]">Langkah per langkah</div>
          <p className="mt-1 text-[12px] text-[#64748B]">Klik langkah mana pun untuk fokus ke bagian itu.</p>
        </div>
        <div className="rounded-full bg-[#F8FAFC] px-3 py-1 text-[11px] font-medium text-[#475569]">
          Langkah aktif: {activeStep + 1}/7
        </div>
      </div>

      <Accordion type="single" collapsible value={steps[activeStep]?.id} className="mt-4 space-y-3">
        {steps.map((step, index) => {
          const isActive = index === activeStep;
          const stepTone = getToneClasses(step.tone, isActive);
          const value = step.getValue(round);
          const titleSuffix = step.id === 'input'
            ? `(${labels.previousLeft} dan ${labels.previousRight})`
            : step.id === 'swap'
              ? `(${labels.nextLeft} dan ${labels.nextRight})`
              : '';

          return (
            <AccordionItem
              key={step.id}
              value={step.id}
              className={`overflow-hidden rounded-[14px] border ${isActive ? 'border-transparent' : 'border-[#E2E8F0]'}`}
            >
              <AccordionTrigger
                onClick={() => setActiveStep(index)}
                className={`px-4 py-4 no-underline hover:no-underline ${stepTone}`}
              >
                <div className="flex-1">
                  <div className="text-[13px] font-semibold">
                    {step.title} {titleSuffix}
                  </div>
                  <div className={`mt-1 text-[11px] ${isActive ? 'text-white/85' : 'opacity-85'}`}>
                    {step.valueLabel}: <span className="font-mono font-semibold">{formatHex(value)}</span>
                  </div>
                </div>
              </AccordionTrigger>
              <AccordionContent className="px-4 pb-4 pt-0">
                <div className="rounded-[12px] border border-[#E2E8F0] bg-[#F8FAFC] p-4">
                  {showExplanation ? (
                    <p className="text-[12px] text-[#475569]" style={{ lineHeight: 1.7 }}>
                      {step.description}
                    </p>
                  ) : (
                    <p className="text-[12px] text-[#64748B]">Penjelasan disembunyikan. Aktifkan lagi dari kontrol playback jika diperlukan.</p>
                  )}
                  <div className="mt-3 rounded-[10px] border border-[#E2E8F0] bg-white px-3 py-2.5">
                    <div className="text-[10px] font-semibold uppercase tracking-[0.12em] text-[#64748B]">{step.valueLabel}</div>
                    <div className="mt-1 break-all font-mono text-[12px] font-semibold text-[#0F172A]">{formatHex(value)}</div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          );
        })}
      </Accordion>
    </div>
  );
}

function OutputCard({ round }: { round: FeistelRoundData }) {
  const labels = getRoundLabels(round);

  return (
    <div className="rounded-[18px] border border-[#A5F3FC] bg-[#F0FDFF] p-5 shadow-sm">
      <div className="text-[14px] font-semibold text-[#0F172A]">Hasil ronde ini</div>
      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="rounded-[14px] border border-[#BFDBFE] bg-white px-4 py-3">
          <div className="text-[11px] font-semibold text-[#1D4ED8]">
            {labels.nextLeft} = {labels.previousRight}
          </div>
          <div className="mt-2 break-all font-mono text-[14px] font-semibold text-[#1D4ED8]">{formatHex(round.leftOutput)}</div>
          <div className="mt-1 text-[11px] text-[#64748B]">Bagian kanan lama menjadi kiri baru.</div>
        </div>

        <div className="rounded-[14px] border border-[#A5F3FC] bg-white px-4 py-3">
          <div className="text-[11px] font-semibold text-[#0F766E]">
            {labels.nextRight} = {labels.previousLeft} XOR F({labels.previousRight}, {labels.subkey})
          </div>
          <div className="mt-2 break-all font-mono text-[14px] font-semibold text-[#0F766E]">{formatHex(round.rightOutput)}</div>
          <div className="mt-1 text-[11px] text-[#64748B]">Output fungsi F dicampur dengan kiri lama.</div>
        </div>
      </div>
    </div>
  );
}

function RoundNavigation({
  totalRounds,
  currentRound,
  setCurrentRound,
}: {
  totalRounds: number;
  currentRound: number;
  setCurrentRound: (round: number) => void;
}) {
  return (
    <div className="rounded-[18px] border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <div className="text-[14px] font-semibold text-[#0F172A]">Pilih ronde</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {Array.from({ length: totalRounds }, (_, index) => {
          const round = index + 1;
          const active = round === currentRound;
          return (
            <button
              key={round}
              type="button"
              onClick={() => setCurrentRound(round)}
              className={`h-10 min-w-10 rounded-[10px] border px-3 text-[12px] font-semibold transition-colors ${
                active
                  ? 'border-[#2563EB] bg-[#2563EB] text-white'
                  : 'border-[#E2E8F0] bg-[#F8FAFC] text-[#475569] hover:bg-[#EFF6FF] hover:text-[#1D4ED8]'
              }`}
            >
              {round}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function PlaybackControls({
  isPlaying,
  onTogglePlay,
  onPreviousStep,
  onNextStep,
  onReset,
  showExplanation,
  onToggleExplanation,
}: {
  isPlaying: boolean;
  onTogglePlay: () => void;
  onPreviousStep: () => void;
  onNextStep: () => void;
  onReset: () => void;
  showExplanation: boolean;
  onToggleExplanation: () => void;
}) {
  return (
    <div className="rounded-[18px] border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <div className="text-[14px] font-semibold text-[#0F172A]">Kontrol pembelajaran</div>
      <div className="mt-4 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={onTogglePlay}
          className={`inline-flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-[12px] font-semibold text-white ${
            isPlaying ? 'bg-[#0F766E] hover:bg-[#0D9488]' : 'bg-[#2563EB] hover:bg-[#1D4ED8]'
          }`}
        >
          {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          {isPlaying ? 'Pause otomatis' : 'Play otomatis'}
        </button>

        <button
          type="button"
          onClick={onPreviousStep}
          className="inline-flex items-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-[12px] font-semibold text-[#0F172A] hover:bg-white"
        >
          <ChevronLeft className="h-4 w-4" />
          Step sebelumnya
        </button>

        <button
          type="button"
          onClick={onNextStep}
          className="inline-flex items-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-[12px] font-semibold text-[#0F172A] hover:bg-white"
        >
          Step berikutnya
          <ChevronRight className="h-4 w-4" />
        </button>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center gap-2 rounded-[10px] border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-2.5 text-[12px] font-semibold text-[#0F172A] hover:bg-white"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>

        <button
          type="button"
          onClick={onToggleExplanation}
          className={`inline-flex items-center gap-2 rounded-[10px] px-4 py-2.5 text-[12px] font-semibold ${
            showExplanation
              ? 'border border-[#DDD6FE] bg-[#F5F3FF] text-[#6D28D9]'
              : 'border border-[#E2E8F0] bg-[#F8FAFC] text-[#475569]'
          }`}
        >
          <CircleHelp className="h-4 w-4" />
          {showExplanation ? 'Sembunyikan penjelasan' : 'Tampilkan penjelasan'}
        </button>
      </div>
    </div>
  );
}

function RoundProgress({ currentRound, totalRounds, currentStep }: { currentRound: number; totalRounds: number; currentStep: number }) {
  const roundPercent = (currentRound / totalRounds) * 100;
  const stepPercent = ((currentStep + 1) / steps.length) * 100;

  return (
    <div className="rounded-[18px] border border-[#E2E8F0] bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <div className="text-[14px] font-semibold text-[#0F172A]">Ronde {currentRound} dari {totalRounds}</div>
          <p className="mt-1 text-[12px] text-[#64748B]">Sekarang Anda sedang melihat langkah {currentStep + 1} dari 7 pada ronde ini.</p>
        </div>
        <div className="w-full max-w-[320px] space-y-3">
          <div>
            <div className="mb-1 flex items-center justify-between text-[11px] text-[#64748B]">
              <span>Progress ronde</span>
              <span>{Math.round(roundPercent)}%</span>
            </div>
            <Progress value={roundPercent} className="h-2 bg-[#DBEAFE] [&_[data-slot=progress-indicator]]:bg-[#2563EB]" />
          </div>
          <div>
            <div className="mb-1 flex items-center justify-between text-[11px] text-[#64748B]">
              <span>Progress langkah</span>
              <span>{Math.round(stepPercent)}%</span>
            </div>
            <Progress value={stepPercent} className="h-2 bg-[#EDE9FE] [&_[data-slot=progress-indicator]]:bg-[#7C3AED]" />
          </div>
        </div>
      </div>
    </div>
  );
}

export function FeistelRoundsVisualization({ data }: FeistelRoundsVisualizationProps) {
  const [currentRound, setCurrentRound] = useState(1);
  const [activeStep, setActiveStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [showExplanation, setShowExplanation] = useState(true);

  const totalRounds = data.length;
  const clampedRound = Math.min(Math.max(currentRound, 1), Math.max(totalRounds, 1));
  const currentData = useMemo(() => data.find((item) => item.round === clampedRound) ?? data[0], [clampedRound, data]);

  useEffect(() => {
    setCurrentRound((previous) => {
      if (data.length === 0) return 1;
      return Math.min(Math.max(previous, 1), data.length);
    });
  }, [data.length]);

  useEffect(() => {
    if (!isPlaying || data.length === 0) return undefined;

    const timer = window.setInterval(() => {
      setActiveStep((previousStep) => {
        if (previousStep < steps.length - 1) {
          return previousStep + 1;
        }

        setCurrentRound((previousRound) => {
          if (previousRound < data.length) {
            return previousRound + 1;
          }

          setIsPlaying(false);
          return previousRound;
        });

        return 0;
      });
    }, 1800);

    return () => window.clearInterval(timer);
  }, [data.length, isPlaying]);

  if (!currentData) {
    return null;
  }

  const goToRound = (round: number) => {
    setIsPlaying(false);
    setCurrentRound(round);
    setActiveStep(0);
  };

  const nextStep = () => {
    setIsPlaying(false);
    setActiveStep((previousStep) => {
      if (previousStep < steps.length - 1) {
        return previousStep + 1;
      }

      setCurrentRound((previousRound) => Math.min(previousRound + 1, totalRounds));
      return 0;
    });
  };

  const previousStep = () => {
    setIsPlaying(false);
    if (activeStep > 0) {
      setActiveStep((previous) => previous - 1);
      return;
    }

    if (currentRound > 1) {
      setCurrentRound((previous) => previous - 1);
      setActiveStep(steps.length - 1);
    }
  };

  const reset = () => {
    setIsPlaying(false);
    setCurrentRound(1);
    setActiveStep(0);
    setShowExplanation(true);
  };

  return (
    <div className="space-y-4">
      <StepHeader />
      <AnalogyAlert />
      <FormulaCard round={currentData} />
      <RoundProgress currentRound={currentData.round} totalRounds={totalRounds} currentStep={activeStep} />
      <FeistelDiagram round={currentData} activeStep={activeStep} />
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[1.15fr_0.85fr]">
        <StepByStepPanel
          round={currentData}
          activeStep={activeStep}
          setActiveStep={(step) => {
            setIsPlaying(false);
            setActiveStep(step);
          }}
          showExplanation={showExplanation}
        />
        <div className="space-y-4">
          <OutputCard round={currentData} />
          <RoundNavigation totalRounds={totalRounds} currentRound={currentData.round} setCurrentRound={goToRound} />
          <PlaybackControls
            isPlaying={isPlaying}
            onTogglePlay={() => setIsPlaying((previous) => !previous)}
            onPreviousStep={previousStep}
            onNextStep={nextStep}
            onReset={reset}
            showExplanation={showExplanation}
            onToggleExplanation={() => setShowExplanation((previous) => !previous)}
          />
        </div>
      </div>
    </div>
  );
}
