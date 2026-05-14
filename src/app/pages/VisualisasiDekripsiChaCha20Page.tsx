import { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Edit, Lightbulb, CircleDot, RotateCw, AlertCircle, Info, Copy } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import {
  getChaCha20DetailsFromBytes,
  hexToUint8Array,
  quarterRound,
  type ChaCha20Details,
} from '../utils/chacha20';
import { normalizeHexInput, parseCounter, validateChaCha20DecryptInput } from '../utils/validation';

const stepData = [
  {
    num: 1,
    title: 'Setup Matrix 4×4',
    subtitle: 'State awal dibangun dari constants, key, counter, dan nonce yang sama dengan proses enkripsi.',
    analogy: 'Untuk membuka pesan, mesin harus menyusun ulang papan kerja yang sama persis seperti saat membuat keystream sebelumnya.',
    why: 'ChaCha20 tidak membalik ronde. Dekripsi dimulai dengan membangkitkan state yang identik agar keystream yang sama bisa dibuat lagi.',
    tagColor: { bg: '#F3E8FF', border: '#C4B5FD', text: '#7C3AED' },
  },
  {
    num: 2,
    title: 'Quarter Round (ARX)',
    subtitle: 'Empat word contoh diproses dengan operasi add, rotate, dan XOR seperti saat enkripsi.',
    analogy: 'Empat roda gigi diputar dengan pola yang sama untuk menghasilkan campuran bit yang identik.',
    why: 'Quarter round tetap menjadi inti dekripsi karena ChaCha20 membuka pesan dengan membuat ulang keystream, bukan membalik rumusnya.',
    tagColor: { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D' },
  },
  {
    num: 3,
    title: '20 Rounds Mixing',
    subtitle: 'State diacak selama 20 round untuk membentuk working state yang sama dengan proses enkripsi.',
    analogy: 'Adonan dikocok lagi dengan resep yang sama sampai mencapai campuran yang sama persis.',
    why: 'Keystream hanya benar jika seluruh ronde dijalankan ulang dengan key, nonce, dan counter yang sama.',
    tagColor: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' },
  },
  {
    num: 4,
    title: 'Final State Addition',
    subtitle: 'Working state ditambah ke initial state untuk menghasilkan final state ChaCha20.',
    analogy: 'Campuran akhir tetap harus digabung dengan bahan awal sebelum siap dipakai.',
    why: 'Final state addition adalah langkah wajib sebelum serialisasi keystream, baik pada enkripsi maupun dekripsi.',
    tagColor: { bg: '#FFF7ED', border: '#FED7AA', text: '#C2410C' },
  },
  {
    num: 5,
    title: 'Serialize to Keystream',
    subtitle: 'Final state diubah menjadi 64 byte keystream little-endian.',
    analogy: 'Setelah state selesai, angkanya dibaca menjadi deretan byte yang siap dipakai sebagai kunci aliran.',
    why: 'Dekripsi ChaCha20 membutuhkan byte keystream yang persis sama agar XOR dengan ciphertext memulihkan plaintext.',
    tagColor: { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D' },
  },
  {
    num: 6,
    title: 'XOR Ciphertext dengan Keystream',
    subtitle: 'Ciphertext di-XOR dengan keystream yang sama untuk mendapatkan plaintext kembali.',
    analogy: 'Lapisan kunci yang sama ditempelkan balik ke pesan rahasia hingga tulisan aslinya muncul lagi.',
    why: 'Karena XOR bersifat reversible, ciphertext ⊕ keystream akan selalu menghasilkan plaintext asli.',
    tagColor: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' },
  },
];

function formatWordHex(value: number): string {
  return value.toString(16).toUpperCase().padStart(8, '0');
}

function getCellType(index: number) {
  if (index < 4) return 'constant';
  if (index < 12) return 'key';
  if (index === 12) return 'counter';
  return 'nonce';
}

function getCellLabel(index: number) {
  if (index < 4) return `const[${index}]`;
  if (index < 12) return `key[${index - 4}]`;
  if (index === 12) return 'counter';
  return `nonce[${index - 13}]`;
}

function getCellClass(type: string) {
  const classes = {
    constant: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]',
    key: 'bg-[#F3E8FF] border-[#C4B5FD] text-[#7C3AED]',
    counter: 'bg-[#FFF7ED] border-[#FED7AA] text-[#C2410C]',
    nonce: 'bg-[#F0FDF4] border-[#86EFAC] text-[#15803D]',
  };

  return classes[type as keyof typeof classes];
}

function StateNotice({ title, text, error = false }: { title: string; text: string; error?: boolean }) {
  return (
    <div className={`border rounded-[12px] p-5 ${error ? 'bg-red-50 border-red-200' : 'bg-[#F8FAFC] border-[#E2E8F0]'}`}>
      <div className="flex items-start gap-3">
        {error ? (
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
        ) : (
          <Info className="w-5 h-5 text-[#7C3AED] flex-shrink-0 mt-0.5" />
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

function MatrixGrid({
  words,
  activeIndex,
  onSelect,
}: {
  words: number[];
  activeIndex: number;
  onSelect?: (index: number) => void;
}) {
  return (
    <div className="grid grid-cols-4 gap-[5px] mt-2">
      {words.map((word, index) => {
        const type = getCellType(index);
        const isActive = index === activeIndex;
        return (
          <button
            key={index}
            type="button"
            onClick={() => onSelect?.(index)}
            className={`rounded-[6px] px-1 py-1.5 text-center font-mono transition-colors ${
              isActive
                ? 'border-[1.5px] border-[#7C3AED] bg-[#EDE9FE] text-[#4C1D95]'
                : `border-[0.5px] ${getCellClass(type)}`
            }`}
          >
            <div className="text-[10px] font-medium leading-none mb-1">{getCellLabel(index)}</div>
            <div className="text-[10px] font-bold leading-none">{formatWordHex(word)}</div>
          </button>
        );
      })}
    </div>
  );
}

function LegendRow() {
  return (
    <div className="flex flex-wrap gap-[8px] mt-[10px]">
      <div className="px-[10px] py-[3px] rounded-[20px] text-[10px] font-medium border-[0.5px] bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]">
        Constant (4)
      </div>
      <div className="px-[10px] py-[3px] rounded-[20px] text-[10px] font-medium border-[0.5px] bg-[#F3E8FF] border-[#C4B5FD] text-[#7C3AED]">
        Key words (8)
      </div>
      <div className="px-[10px] py-[3px] rounded-[20px] text-[10px] font-medium border-[0.5px] bg-[#FFF7ED] border-[#FED7AA] text-[#C2410C]">
        Counter (1)
      </div>
      <div className="px-[10px] py-[3px] rounded-[20px] text-[10px] font-medium border-[0.5px] bg-[#F0FDF4] border-[#86EFAC] text-[#15803D]">
        Nonce (3)
      </div>
    </div>
  );
}

function StateMatrixPreview({ words, changedIndices = [] }: { words: number[]; changedIndices?: number[] }) {
  return (
    <div className="grid grid-cols-4 gap-1 min-w-[280px]">
      {words.map((word, index) => {
        const changed = changedIndices.includes(index);
        return (
          <div
            key={index}
            className={`rounded p-1.5 md:p-2 text-center border-[0.5px] ${
              changed ? 'bg-[#FEF3C7] border-[#FDE047]' : 'bg-[#F8FAFC] border-[#E2E8F0]'
            }`}
          >
            <div className={`text-[8px] md:text-[9px] font-mono break-all ${changed ? 'text-[#92400E] font-medium' : 'text-[#64748B]'}`}>
              {formatWordHex(word)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Step1Visual({ details }: { details: ChaCha20Details }) {
  const [activeIndex, setActiveIndex] = useState(0);

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Initial state matrix</span>
      </div>
      <div className="p-4 md:p-5">
        <MatrixGrid words={details.initialState} activeIndex={activeIndex} onSelect={setActiveIndex} />
        <LegendRow />
        <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5 mt-4">
          <p className="text-[12px] text-[#64748B]" style={{ lineHeight: 1.6 }}>
            State dekripsi dibentuk dari key, nonce, dan counter yang sama. Word aktif {getCellLabel(activeIndex)} bernilai
            <span className="font-mono text-[#0F172A]"> {formatWordHex(details.initialState[activeIndex])}</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

function Step2Visual({ details }: { details: ChaCha20Details }) {
  const quarterRoundResult = useMemo(() => {
    const state = new Uint32Array(details.initialState);
    quarterRound(state, 0, 4, 8, 12);
    return [state[0], state[4], state[8], state[12]];
  }, [details.initialState]);

  const sourceWords = [details.initialState[0], details.initialState[4], details.initialState[8], details.initialState[12]];
  const operations = [
    'a += b; d ^= a; d <<< 16',
    'c += d; b ^= c; b <<< 12',
    'a += b; d ^= a; d <<< 8',
    'c += d; b ^= c; b <<< 7',
  ];

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Quarter round untuk regenerasi keystream</span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
          {sourceWords.map((word, index) => (
            <div key={index} className={`rounded-[8px] border-[0.5px] p-3 ${getCellClass(['constant', 'key', 'key', 'counter'][index])}`}>
              <div className="text-[10px] mb-1">{['a = state[0]', 'b = state[4]', 'c = state[8]', 'd = state[12]'][index]}</div>
              <div className="text-[11px] font-mono font-medium">{formatWordHex(word)}</div>
            </div>
          ))}
        </div>

        <div className="space-y-2 mb-4">
          {operations.map((operation) => (
            <div key={operation} className="flex items-center gap-2 bg-[#F8FAFC] rounded-[8px] px-3 py-2">
              <div className="text-[11px] font-mono text-[#64748B] flex-1">{operation}</div>
              <RotateCw className="w-3 h-3 text-[#C2410C]" />
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
          {quarterRoundResult.map((word, index) => (
            <div key={index} className="rounded-[8px] border-[0.5px] border-[#C4B5FD] bg-[#EDE9FE] p-3 text-[#4C1D95]">
              <div className="text-[10px] mb-1">{["a'", "b'", "c'", "d'"][index]}</div>
              <div className="text-[11px] font-mono font-medium">{formatWordHex(word)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step3Visual({ details }: { details: ChaCha20Details }) {
  const [currentRound, setCurrentRound] = useState(1);
  const isColumnRound = currentRound % 2 === 1;
  const doubleRoundIndex = Math.floor((currentRound - 1) / 2);
  const round = details.rounds[doubleRoundIndex];
  const before = isColumnRound ? round.beforeColumn : round.afterColumn;
  const after = isColumnRound ? round.afterColumn : round.afterDiagonal;
  const changedIndices = after
    .map((value, index) => (value !== before[index] ? index : -1))
    .filter((index) => index >= 0);

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">
          Round {currentRound}/20 {isColumnRound ? '(Column)' : '(Diagonal)'}
        </span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-[11px] font-medium text-[#64748B] mb-2">Sebelum round</div>
            <StateMatrixPreview words={before} />
          </div>
          <div>
            <div className="text-[11px] font-medium text-[#64748B] mb-2">Setelah round</div>
            <StateMatrixPreview words={after} changedIndices={changedIndices} />
          </div>
        </div>

        <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5">
          <p className="text-[12px] text-[#64748B]" style={{ lineHeight: 1.6 }}>
            {isColumnRound
              ? 'Column round dijalankan lagi agar pola pengacakan kolom identik dengan saat enkripsi.'
              : 'Diagonal round melanjutkan pengacakan agar keystream yang dihasilkan tetap sama persis.'}
          </p>
        </div>
      </div>

      <div className="border-t-[0.5px] border-[#E2E8F0] px-4 py-3.5">
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 20 }, (_, index) => (
            <button
              key={index}
              onClick={() => setCurrentRound(index + 1)}
              className={`w-8 h-8 rounded-[6px] text-[10px] font-medium border-[0.5px] transition-colors ${
                currentRound === index + 1
                  ? 'bg-[#7C3AED] text-white border-[#7C3AED]'
                  : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:bg-[#F3E8FF]'
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function Step4Visual({ details }: { details: ChaCha20Details }) {
  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Penjumlahan final state</span>
      </div>
      <div className="p-4">
        <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-[10px] p-4 mb-4">
          <div className="text-[11px] font-medium text-[#15803D] mb-3">Contoh word[0]</div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div className="bg-white border border-[#86EFAC] rounded px-3 py-2 text-[12px] font-mono text-[#15803D]">
              Initial: {formatWordHex(details.initialState[0])}
            </div>
            <div className="bg-white border border-[#86EFAC] rounded px-3 py-2 text-[12px] font-mono text-[#15803D]">
              Working: {formatWordHex(details.finalWorkingState[0])}
            </div>
            <div className="bg-[#DCFCE7] border border-[#16A34A] rounded px-3 py-2 text-[12px] font-mono font-medium text-[#15803D]">
              Final: {formatWordHex(details.finalState[0])}
            </div>
          </div>
        </div>

        <MatrixGrid words={details.finalState} activeIndex={0} />
      </div>
    </div>
  );
}

function Step5Visual({ details }: { details: ChaCha20Details }) {
  const [selectedWord, setSelectedWord] = useState(0);
  const selectedBytes = details.keystreamBytes.slice(selectedWord * 4, selectedWord * 4 + 4);

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Serialize keystream untuk dekripsi</span>
      </div>
      <div className="p-4">
        <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-[10px] p-4 mb-4">
          <div className="text-[11px] font-medium text-[#15803D] mb-2">
            Word[{selectedWord}] → 4 byte little-endian
          </div>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <div className="bg-white border border-[#86EFAC] rounded px-3 py-2 text-[12px] font-mono text-[#15803D]">
              {formatWordHex(details.finalState[selectedWord])}
            </div>
            <div className="text-[#15803D] font-bold">→</div>
            {selectedBytes.map((byte, index) => (
              <div key={index} className="bg-[#DCFCE7] border border-[#16A34A] rounded px-2 py-1.5 text-[11px] font-mono font-medium text-[#15803D]">
                {byte.toString(16).toUpperCase().padStart(2, '0')}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap gap-1">
            {details.finalState.map((_, index) => (
              <button
                key={index}
                onClick={() => setSelectedWord(index)}
                className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
                  index === selectedWord ? 'bg-[#16A34A] text-white' : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F0FDF4]'
                }`}
              >
                [{index}]
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-16 gap-[2px] min-w-[640px] overflow-x-auto">
          {details.keystreamBytes.map((byte, index) => {
            const isSelected = index >= selectedWord * 4 && index < selectedWord * 4 + 4;
            return (
              <div
                key={index}
                className={`rounded-[3px] p-1 text-center border-[0.5px] ${
                  isSelected
                    ? 'bg-[#DCFCE7] border-[#16A34A] text-[#15803D] font-medium'
                    : 'bg-[#F8FAFC] border-[#E2E8F0] text-[#64748B]'
                }`}
              >
                <div className="text-[8px] md:text-[9px] font-mono">
                  {byte.toString(16).toUpperCase().padStart(2, '0')}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function Step6Visual({
  details,
  ciphertextBytes,
  plaintextText,
}: {
  details: ChaCha20Details;
  ciphertextBytes: number[];
  plaintextText: string;
}) {
  const navigate = useNavigate();
  const plaintextBytes = details.ciphertextBytes;
  const chars = Array.from(plaintextText);

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">XOR ciphertext dengan keystream</span>
      </div>
      <div className="p-4 md:p-6">
        <div className="space-y-2 mb-4">
          {ciphertextBytes.slice(0, Math.min(8, ciphertextBytes.length)).map((byte, index) => (
            <div key={index} className="bg-[#F8FAFC] rounded-[8px] p-3 flex items-center gap-3">
              <div className="w-8 text-[10px] text-[#64748B] font-medium">#{index}</div>
              <div className="flex-1 grid grid-cols-3 gap-2">
                <div className="bg-white border border-[#BFDBFE] rounded px-3 py-1.5 text-center">
                  <div className="text-[9px] text-[#64748B] mb-1">Ciphertext</div>
                  <div className="text-[11px] font-mono text-[#1D4ED8]">{byte.toString(16).toUpperCase().padStart(2, '0')}</div>
                </div>
                <div className="bg-white border border-[#C4B5FD] rounded px-3 py-1.5 text-center">
                  <div className="text-[9px] text-[#64748B] mb-1">Keystream</div>
                  <div className="text-[11px] font-mono text-[#7C3AED]">{details.keystreamBytes[index].toString(16).toUpperCase().padStart(2, '0')}</div>
                </div>
                <div className="bg-[#DCFCE7] border border-[#16A34A] rounded px-3 py-1.5 text-center">
                  <div className="text-[9px] text-[#64748B] mb-1">Plaintext</div>
                  <div className="text-[11px] font-mono text-[#15803D]">{plaintextBytes[index].toString(16).toUpperCase().padStart(2, '0')}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          className="bg-gradient-to-br from-[#F0FDF4] to-[#F3E8FF] border-[0.5px] border-[#86EFAC] rounded-[16px] p-6 text-center mb-6"
        >
          <div className="text-[14px] text-[#15803D] font-medium mb-4">Plaintext berhasil dikembalikan</div>
          <div className="flex justify-center gap-1.5 mb-4 flex-wrap">
            {chars.map((char, index) => (
              <div
                key={index}
                className="bg-[#DCFCE7] border-[0.5px] border-[#86EFAC] rounded-[8px] px-3 py-2 text-[24px] font-semibold text-[#0F172A]"
              >
                {char}
              </div>
            ))}
          </div>
          <div className="text-[12px] text-[#64748B]">
            Plaintext: <span className="font-mono text-[#0F172A]">{plaintextText}</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-6">
          <div className="bg-[#EFF6FF] border-[0.5px] border-[#BFDBFE] rounded-[8px] p-3 text-center">
            <div className="text-[11px] text-[#1D4ED8] mb-0.5">Ciphertext</div>
            <div className="text-[18px] font-medium text-[#1D4ED8]">{ciphertextBytes.length} byte</div>
          </div>
          <div className="bg-[#F0FDF4] border-[0.5px] border-[#86EFAC] rounded-[8px] p-3 text-center">
            <div className="text-[11px] text-[#15803D] mb-0.5">Plaintext</div>
            <div className="text-[18px] font-medium text-[#15803D]">{plaintextText.length} karakter</div>
          </div>
          <div className="bg-[#F3E8FF] border-[0.5px] border-[#C4B5FD] rounded-[8px] p-3 text-center">
            <div className="text-[11px] text-[#7C3AED] mb-0.5">Counter</div>
            <div className="text-[18px] font-medium text-[#7C3AED]">{details.counter}</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <button
            onClick={() => navigator.clipboard.writeText(plaintextText)}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-[8px] bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white text-[13px] font-medium hover:shadow-lg hover:shadow-purple-500/30 transition-all"
          >
            <Copy className="w-3.5 h-3.5" />
            Salin Plaintext
          </button>
          <button
            onClick={() => navigate('/dekripsi/chacha20')}
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

export function VisualisasiDekripsiChaCha20Page() {
  const [currentStep, setCurrentStep] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const routeState = (location.state as { ciphertext?: string; key?: string; nonce?: string; counter?: string } | null) ?? null;

  const ciphertext = normalizeHexInput(routeState?.ciphertext ?? '');
  const key = routeState?.key ?? '';
  const nonce = routeState?.nonce ?? '';
  const counter = routeState?.counter ?? '0';
  const validation = useMemo(() => validateChaCha20DecryptInput(ciphertext, key, nonce, counter), [ciphertext, key, nonce, counter]);
  const parsedCounter = useMemo(() => parseCounter(counter), [counter]);

  const derived = useMemo(() => {
    if (!validation.isValid || parsedCounter === null) {
      return null;
    }

    try {
      const keyBytes = new Uint8Array(32);
      keyBytes.set(new TextEncoder().encode(key).slice(0, 32));
      const nonceBytes = new Uint8Array(12);
      nonceBytes.set(new TextEncoder().encode(nonce).slice(0, 12));
      const ciphertextInputBytes = Array.from(hexToUint8Array(ciphertext));
      const details = getChaCha20DetailsFromBytes(hexToUint8Array(ciphertext), keyBytes, nonceBytes, parsedCounter);
      const plaintextBytes = details.ciphertextBytes;
      const plaintextText = new TextDecoder().decode(new Uint8Array(plaintextBytes));

      return {
        details,
        ciphertextBytes: ciphertextInputBytes,
        plaintextText,
      };
    } catch {
      return null;
    }
  }, [validation.isValid, parsedCounter, ciphertext, key, nonce]);

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
    <div className="w-full min-h-[calc(100vh-56px)] bg-[#F8FAFC] pt-4 md:pt-8 pb-8 md:pb-12 px-4 md:px-8 lg:px-16 xl:px-[290px]">
      <div className="max-w-[860px] mx-auto">
        <div className="mb-3.5">
          <div className="flex gap-1 mb-2">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className={`flex-1 h-1 rounded-[2px] ${
                  index < currentStep ? 'bg-[#7C3AED]' : index === currentStep ? 'bg-[#C4B5FD]' : 'bg-[#E2E8F0]'
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

        {!ciphertext && !key && !nonce ? (
          <StateNotice title="Belum ada input dekripsi" text="Masukkan ciphertext, key, nonce, dan counter untuk melihat proses dekripsi ChaCha20." />
        ) : !validation.isValid ? (
          <StateNotice title="Input belum valid" text={validation.error ?? 'Input dekripsi ChaCha20 belum valid.'} error />
        ) : !derived ? (
          <StateNotice title="Perhitungan gagal dibuat" text="Terjadi masalah saat membangun visualisasi dekripsi ChaCha20." error />
        ) : (
          <>
            {currentStep === 0 && <Step1Visual details={derived.details} />}
            {currentStep === 1 && <Step2Visual details={derived.details} />}
            {currentStep === 2 && <Step3Visual details={derived.details} />}
            {currentStep === 3 && <Step4Visual details={derived.details} />}
            {currentStep === 4 && <Step5Visual details={derived.details} />}
            {currentStep === 5 && (
              <Step6Visual
                details={derived.details}
                ciphertextBytes={derived.ciphertextBytes}
                plaintextText={derived.plaintextText}
              />
            )}
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
              onClick={() => navigate('/dekripsi/chacha20')}
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
                className="flex items-center gap-2 px-4 py-2 rounded-[8px] bg-[#7C3AED] text-white text-[13px] font-medium hover:bg-[#6D28D9] transition-colors"
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
