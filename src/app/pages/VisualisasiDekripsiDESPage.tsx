import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Edit, Lightbulb, CircleDot, Copy, AlertCircle, Info } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'motion/react';
import { formatBinaryGroups, getDESDecryptionDetails, type DESDetails } from '../utils/des';
import { validateDESDecryptInput } from '../utils/validation';

const stepData = [
  {
    num: 1,
    title: 'Membaca ciphertext sebagai 64 bit',
    subtitle: 'Ciphertext hex diubah ke 64 bit sebagai titik masuk proses dekripsi DES.',
    analogy: 'Pesan rahasia dibaca dulu sebagai tumpukan kartu 0 dan 1 sebelum bisa dibuka.',
    why: 'DES dekripsi tetap bekerja pada bit. Karena itu ciphertext harus dibaca sebagai blok 64-bit lebih dulu.',
    tagColor: { bg: '#FFFBEB', border: '#FDE68A', text: '#92400E' },
  },
  {
    num: 2,
    title: 'Membuka lapisan permutasi akhir',
    subtitle: 'Ciphertext menjalani IP untuk kembali ke susunan internal sebelum final permutation.',
    analogy: 'Susunan kursi terakhir yang dipakai saat enkripsi dikembalikan dulu ke posisi awal ronde.',
    why: 'Pada enkripsi, blok keluar lewat final permutation. Saat dekripsi, efek itu harus dibalik lebih dulu.',
    tagColor: { bg: '#FEF3C7', border: '#FCD34D', text: '#92400E' },
  },
  {
    num: 3,
    title: 'Subkey tetap sama, urutannya dibalik',
    subtitle: 'K16 dipakai lebih dulu, lalu K15, sampai K1 di ronde terakhir.',
    analogy: 'Kalau enkripsi mengunci pintu dari lapisan pertama sampai keenam belas, dekripsi membukanya dari lapisan terakhir ke awal.',
    why: 'Struktur Feistel DES memungkinkan dekripsi memakai subkey yang sama selama urutannya dibalik.',
    tagColor: { bg: '#F3E8FF', border: '#C4B5FD', text: '#7C3AED' },
  },
  {
    num: 4,
    title: '16 Ronde Feistel Dekripsi',
    subtitle: 'Ronde berjalan dengan data nyata dan subkey terbalik untuk memulihkan blok asli.',
    analogy: 'Setiap ronde membalik pencampuran yang sebelumnya dilakukan saat enkripsi.',
    why: 'Di tahap ini struktur internal ciphertext dikembalikan sedikit demi sedikit hingga mendekati plaintext.',
    tagColor: { bg: '#FFF7ED', border: '#FED7AA', text: '#C2410C' },
  },
  {
    num: 5,
    title: 'Final Permutation menuju plaintext',
    subtitle: 'Setelah 16 ronde selesai, blok dipermutasi akhir untuk kembali ke urutan plaintext.',
    analogy: 'Setelah isi kotak dibuka seluruhnya, benda-benda di dalamnya disusun kembali ke posisi aslinya.',
    why: 'Ronde Feistel mengembalikan struktur internal blok, lalu final permutation menyusunnya menjadi output teks yang benar.',
    tagColor: { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D' },
  },
  {
    num: 6,
    title: 'Plaintext berhasil dikembalikan',
    subtitle: 'Bit hasil dekripsi diterjemahkan lagi ke karakter user-readable.',
    analogy: 'Kartu bit akhirnya berubah lagi menjadi huruf-huruf yang bisa dibaca manusia.',
    why: 'Representasi akhir mesin harus diterjemahkan kembali menjadi teks agar pengguna mendapatkan pesan aslinya.',
    tagColor: { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D' },
  },
];

function formatChar(char: string): string {
  if (char === '\0') return '∅';
  if (char === ' ') return '␠';
  return char;
}

function Notice({ title, text, error = false }: { title: string; text: string; error?: boolean }) {
  return (
    <div className={`border rounded-[12px] p-5 ${error ? 'bg-red-50 border-red-200' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}>
      <div className="flex items-start gap-3">
        {error ? (
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        ) : (
          <Info className="w-5 h-5 text-[#D97706] flex-shrink-0 mt-0.5" />
        )}
        <div>
          <div className="text-[13px] font-medium text-[#0F172A] mb-1">{title}</div>
          <p className={`text-[12px] ${error ? 'text-red-700' : 'text-[#64748B]'}`} style={{ lineHeight: 1.6 }}>
            {text}
          </p>
        </div>
      </div>
    </div>
  );
}

function Step1Visual({ details }: { details: DESDetails }) {
  const bits = details.inputBits.split('');

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Ciphertext hex ke biner</span>
      </div>
      <div className="p-4">
        <div className="bg-[#FFFBEB] border-[0.5px] border-[#FDE68A] rounded-[8px] px-3 py-2.5 mb-4">
          <div className="text-[11px] text-[#92400E]">Ciphertext input: <span className="font-mono">{details.inputText}</span></div>
        </div>
        <div className="text-[11px] font-medium text-[#64748B] mb-2">Binary ciphertext (64 bit)</div>
        <div className="flex flex-wrap gap-[3px]">
          {bits.map((bit, index) => (
            <div
              key={index}
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
    </div>
  );
}

function Step2Visual({ details }: { details: DESDetails }) {
  const bits = details.initialPermutationBits.split('');

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">IP pada ciphertext</span>
      </div>
      <div className="p-4">
        <div className="text-[11px] font-medium text-[#64748B] mb-2">Hasil IP (membuka efek final permutation)</div>
        <div className="flex flex-wrap gap-[3px] mb-4">
          {bits.map((bit, index) => (
            <div
              key={index}
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
  const schedule = details.keySchedule[16 - currentRound];

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Subkey untuk ronde dekripsi {currentRound}</span>
      </div>
      <div className="p-4">
        <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5 mb-3">
          <div className="text-[11px] text-[#64748B] mb-1">Binary key (64 bit)</div>
          <div className="text-[12px] font-mono text-[#0F172A] break-all">{formatBinaryGroups(details.keyBits, 8)}</div>
        </div>

        <div className="bg-[#F3E8FF] border-[0.5px] border-[#C4B5FD] rounded-[8px] px-3 py-2.5 mb-3">
          <div className="text-[11px] text-[#7C3AED] mb-1">Ronde dekripsi {currentRound} memakai K{schedule.round}</div>
          <div className="text-[12px] font-mono text-[#7C3AED] mb-1">{schedule.subkey}</div>
          <div className="text-[11px] font-mono text-[#4C1D95] break-all">{formatBinaryGroups(schedule.subkey, 6)}</div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5">
            <div className="text-[11px] text-[#64748B] mb-1">C{schedule.round}</div>
            <div className="text-[11px] font-mono text-[#0F172A] break-all">{formatBinaryGroups(schedule.c, 7)}</div>
          </div>
          <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5">
            <div className="text-[11px] text-[#64748B] mb-1">D{schedule.round}</div>
            <div className="text-[11px] font-mono text-[#0F172A] break-all">{formatBinaryGroups(schedule.d, 7)}</div>
          </div>
        </div>
      </div>

      <div className="border-t-[0.5px] border-[#E2E8F0] px-4 py-3.5">
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 16 }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentRound(index + 1)}
              className={`px-2.5 py-1.5 rounded-[6px] text-[10px] font-medium border-[0.5px] transition-colors ${
                currentRound === index + 1
                  ? 'bg-[#D97706] text-white border-[#D97706]'
                  : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-[#FFF7ED]'
              }`}
            >
              R{index + 1} → K{16 - index}
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
        <span className="text-[12px] font-medium text-[#64748B]">Ronde Feistel dekripsi {currentRound}</span>
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
            <div className="text-[11px] text-[#64748B] mb-1">XOR dengan K{round.subkeyIndex}</div>
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
                currentRound === item.round
                  ? 'bg-[#D97706] text-white border-[#D97706]'
                  : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-[#FFF7ED]'
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

function Step5Visual({ details }: { details: DESDetails }) {
  const beforeBits = details.preOutputBits.split('');
  const afterBits = details.finalOutputBits.split('');

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Final permutation ke plaintext</span>
      </div>
      <div className="p-4">
        <div className="text-[11px] font-medium text-[#64748B] mb-2">Sebelum FP (R16 || L16)</div>
        <div className="flex flex-wrap gap-[3px] mb-4">
          {beforeBits.map((bit, index) => (
            <div
              key={index}
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

        <div className="text-[11px] font-medium text-[#15803D] mb-2">Setelah FP (plaintext bits)</div>
        <div className="flex flex-wrap gap-[3px] mb-4">
          {afterBits.map((bit, index) => (
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
            Hasil final permutation adalah <span className="font-mono text-[#0F172A]">{formatBinaryGroups(details.finalOutputBits, 8)}</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

function Step6Visual({ details }: { details: DESDetails }) {
  const navigate = useNavigate();
  const chars = details.outputText.split('');
  const bytes = details.finalOutputBits.match(/.{1,8}/g) ?? [];

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Plaintext hasil dekripsi</span>
      </div>
      <div className="p-4 md:p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="bg-gradient-to-br from-[#F0FDF4] to-[#FFFBEB] border-[0.5px] border-[#86EFAC] rounded-[16px] p-6 text-center mb-6"
        >
          <div className="text-[14px] text-[#15803D] font-medium mb-4">Plaintext berhasil didekripsi</div>
          <div className="flex justify-center gap-1.5 mb-4 flex-wrap">
            {chars.map((char, index) => (
              <div
                key={index}
                className="bg-[#DCFCE7] border-[0.5px] border-[#86EFAC] rounded-[8px] px-3 py-2 text-[24px] font-semibold text-[#0F172A]"
              >
                {formatChar(char)}
              </div>
            ))}
          </div>
          <div className="text-[12px] text-[#64748B]">
            Plaintext: <span className="font-mono text-[#0F172A]">{details.outputText}</span>
          </div>
        </motion.div>

        <div className="space-y-2 mb-6">
          {chars.map((char, index) => (
            <div key={index} className="flex items-center gap-2 text-[11px]">
              <div className="font-mono text-[#1D4ED8]">{bytes[index]}</div>
              <span className="text-[#64748B]">→</span>
              <div className="text-[#64748B]">{char.charCodeAt(0)}</div>
              <span className="text-[#64748B]">→</span>
              <div className="font-semibold text-[#0F172A]">{formatChar(char)}</div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-6">
          <div className="bg-[#EFF6FF] border-[0.5px] border-[#BFDBFE] rounded-[8px] p-3 text-center">
            <div className="text-[11px] text-[#1D4ED8] mb-0.5">Ciphertext</div>
            <div className="text-[18px] font-medium text-[#1D4ED8]">{details.inputText.length / 2} byte</div>
          </div>
          <div className="bg-[#F0FDF4] border-[0.5px] border-[#86EFAC] rounded-[8px] p-3 text-center">
            <div className="text-[11px] text-[#15803D] mb-0.5">Plaintext</div>
            <div className="text-[18px] font-medium text-[#15803D]">{details.outputText.length} karakter</div>
          </div>
          <div className="bg-[#F0FDF4] border-[0.5px] border-[#86EFAC] rounded-[8px] p-3 text-center">
            <div className="text-[11px] text-[#15803D] mb-0.5">Status</div>
            <div className="text-[18px] font-medium text-[#15803D]">Valid</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(details.outputText)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] bg-gradient-to-r from-[#D97706] to-[#B45309] text-white text-[13px] font-medium hover:shadow-lg hover:shadow-amber-500/30 transition-all"
          >
            <Copy className="w-3.5 h-3.5" />
            Salin Plaintext
          </button>
          <button
            onClick={() => navigate('/dekripsi/des')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] border-[0.5px] border-[#E2E8F0] bg-transparent text-[#0F172A] text-[13px] font-medium hover:bg-[#F8FAFC] transition-colors"
          >
            Dekripsi Lagi
          </button>
          <button
            onClick={() => navigate('/beranda')}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] border-[0.5px] border-[#E2E8F0] bg-transparent text-[#0F172A] text-[13px] font-medium hover:bg-[#F8FAFC] transition-colors"
          >
            Ke Beranda
          </button>
        </div>
      </div>
    </div>
  );
}

export function VisualisasiDekripsiDESPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [currentRound, setCurrentRound] = useState(1);
  const navigate = useNavigate();
  const location = useLocation();

  const routeState = (location.state as { ciphertext?: string; key?: string } | null) ?? null;
  const ciphertext = routeState?.ciphertext ?? '';
  const key = routeState?.key ?? '';
  const validation = useMemo(() => validateDESDecryptInput(ciphertext, key), [ciphertext, key]);
  const details = useMemo(() => {
    if (!validation.isValid) {
      return null;
    }

    try {
      return getDESDecryptionDetails(ciphertext, key);
    } catch {
      return null;
    }
  }, [validation.isValid, ciphertext, key]);

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
                  index < currentStep ? 'bg-[#D97706]' : index === currentStep ? 'bg-[#FCD34D]' : 'bg-[#E2E8F0]'
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
            <span className="text-[11px] font-medium">Dekripsi Langkah {step.num}</span>
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

        {!ciphertext && !key ? (
          <Notice title="Belum ada input dekripsi" text="Masukkan ciphertext dan key DES yang valid untuk melihat proses dekripsi." />
        ) : !validation.isValid ? (
          <Notice title="Input belum valid" text={validation.error ?? 'Input dekripsi DES belum valid.'} error />
        ) : !details ? (
          <Notice title="Perhitungan gagal dibuat" text="Terjadi masalah saat membangun visualisasi dekripsi DES." error />
        ) : (
          <>
            {currentStep === 0 && <Step1Visual details={details} />}
            {currentStep === 1 && <Step2Visual details={details} />}
            {currentStep === 2 && <Step3Visual currentRound={currentRound} setCurrentRound={setCurrentRound} details={details} />}
            {currentStep === 3 && <Step4Visual currentRound={currentRound} setCurrentRound={setCurrentRound} details={details} />}
            {currentStep === 4 && <Step5Visual details={details} />}
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
