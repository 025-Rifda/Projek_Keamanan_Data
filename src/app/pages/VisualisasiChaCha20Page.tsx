import { useState } from 'react';
import { ChevronLeft, ChevronRight, Check, Edit, Lightbulb, CircleDot, RotateCw, Combine } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAlgorithm } from '../context/AlgorithmContext';
import { getChaCha20Details } from '../utils/chacha20';

const stepDataChaCha = [
  {
    num: 1,
    title: 'Setup Matrix 4×4 (16 words)',
    subtitle: 'Menyusun state awal dari 4 constant, 8 key words, 1 counter, dan 3 nonce',
    analogy: 'Bayangkan menyusun 16 kotak LEGO dalam pola 4×4. 4 kotak pertama selalu sama (constant magic), 8 kotak tengah dari password kamu (key), 1 kotak untuk hitungan (counter), dan 3 kotak terakhir untuk nomor acak (nonce).',
    tagColor: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' },
  },
  {
    num: 2,
    title: 'Quarter Round: ADD-ROTATE-XOR (ARX)',
    subtitle: 'Operasi dasar ChaCha20 yang menggabungkan penjumlahan, rotasi bit, dan XOR',
    analogy: 'Seperti mengocok 4 kartu dengan aturan khusus: tambahkan nilai 2 kartu, putar hasilnya, lalu gabungkan dengan XOR. Ulangi 4 kali dengan pola berbeda.',
    tagColor: { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D' },
  },
  {
    num: 3,
    title: '20 Rounds Mixing (10 double rounds)',
    subtitle: 'Matrix diacak 20 kali dengan column rounds dan diagonal rounds bergantian',
    analogy: 'Bayangkan mengaduk adonan kue 20 kali: 10 kali aduk vertikal (column), 10 kali aduk diagonal. Setiap adukan membuat adonan makin tercampur rata.',
    tagColor: { bg: '#F3E8FF', border: '#C4B5FD', text: '#7C3AED' },
  },
  {
    num: 4,
    title: 'Final State Addition',
    subtitle: 'Menjumlahkan state akhir dengan state awal (mod 2³²)',
    analogy: 'Setelah diacak, hasilnya ditambahkan lagi dengan bahan awal. Ini mencegah pembalikan proses — seperti menambahkan garam ke dalam adonan yang sudah jadi.',
    tagColor: { bg: '#FFF7ED', border: '#FED7AA', text: '#C2410C' },
  },
  {
    num: 5,
    title: 'Serialize to Keystream (Little-Endian)',
    subtitle: 'Mengubah 16 words (64 bytes) menjadi deretan byte keystream',
    analogy: 'Seperti membaca buku dari kanan ke kiri (little-endian): byte paling kecil dulu. 16 kotak angka jadi 64 byte yang siap dipakai.',
    tagColor: { bg: '#F0FDF4', border: '#86EFAC', text: '#15803D' },
  },
  {
    num: 6,
    title: 'XOR dengan Plaintext',
    subtitle: 'Keystream di-XOR dengan plaintext untuk menghasilkan ciphertext',
    analogy: 'Seperti menempelkan stiker transparan berlubang di atas kertas: lubang stiker (keystream) digabung dengan tulisan (plaintext) jadi tulisan rahasia (ciphertext).',
    tagColor: { bg: '#EFF6FF', border: '#BFDBFE', text: '#1D4ED8' },
  },
];

type ChaChaDetails = ReturnType<typeof getChaCha20Details>;

function formatWordHex(value: number): string {
  return value.toString(16).toUpperCase().padStart(8, '0');
}

function getChaChaCellType(index: number) {
  if (index < 4) return 'constant';
  if (index < 12) return 'key';
  if (index === 12) return 'counter';
  return 'nonce';
}

function getChaChaCellLabel(index: number) {
  if (index < 4) return `const[${index}]`;
  if (index < 12) return `key[${index - 4}]`;
  if (index === 12) return 'counter';
  return `nonce[${index - 13}]`;
}

export function VisualisasiChaCha20Page() {
  const { plaintext, key, nonce } = useAlgorithm();
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedWord, setSelectedWord] = useState(0);
  const navigate = useNavigate();

  const step = stepDataChaCha[currentStep];
  const chachaDetails = getChaCha20Details(plaintext || '', key || '', nonce || '');

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
    <div className="w-full min-h-[calc(100vh-56px)] bg-[#F8FAFC] pt-4 md:pt-8 pb-8 md:pb-12 px-4 md:px-8 lg:px-16 xl:px-[290px]">
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

        {/* Visual Card - Different per step */}
        {currentStep === 0 && <ChaChaStep1Visual details={chachaDetails} />}
        {currentStep === 1 && <ChaChaStep2Visual details={chachaDetails} />}
        {currentStep === 2 && <ChaChaStep3Visual details={chachaDetails} />}
        {currentStep === 3 && <ChaChaStep4Visual details={chachaDetails} />}
        {currentStep === 4 && <ChaChaStep5Visual details={chachaDetails} selectedWord={selectedWord} setSelectedWord={setSelectedWord} />}
        {currentStep === 5 && <ChaChaStep6Visual plaintext={plaintext} keyValue={key} nonceValue={nonce} />}

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
              onClick={() => navigate('/uji-coba')}
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

// Step 1: Setup 4x4 Matrix
function ChaChaStep1VisualLegacy() {
  const matrix = [
    // Row 0: Constants
    { val: '61707865', label: 'expand', type: 'constant' },
    { val: '3320646e', label: '32-byte', type: 'constant' },
    { val: '79622d32', label: 'k', type: 'constant' },
    { val: '6b206574', label: '', type: 'constant' },
    // Row 1-2: Key (8 words)
    { val: '03020100', label: 'key[0]', type: 'key' },
    { val: '07060504', label: 'key[1]', type: 'key' },
    { val: '0b0a0908', label: 'key[2]', type: 'key' },
    { val: '0f0e0d0c', label: 'key[3]', type: 'key' },
    { val: '13121110', label: 'key[4]', type: 'key' },
    { val: '17161514', label: 'key[5]', type: 'key' },
    { val: '1b1a1918', label: 'key[6]', type: 'key' },
    { val: '1f1e1d1c', label: 'key[7]', type: 'key' },
    // Row 3: Counter + Nonce
    { val: '00000001', label: 'counter', type: 'counter' },
    { val: '09000000', label: 'nonce[0]', type: 'nonce' },
    { val: '4a000000', label: 'nonce[1]', type: 'nonce' },
    { val: '00000000', label: 'nonce[2]', type: 'nonce' },
  ];

  const getColor = (type: string) => {
    const colors = {
      constant: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]',
      key: 'bg-[#F0FDF4] border-[#86EFAC] text-[#15803D]',
      counter: 'bg-[#FFF7ED] border-[#FED7AA] text-[#C2410C]',
      nonce: 'bg-[#F3E8FF] border-[#C4B5FD] text-[#7C3AED]',
    };
    return colors[type as keyof typeof colors];
  };

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Initial State Matrix (4×4)</span>
      </div>
      <div className="p-4 md:p-5">
        <div className="overflow-x-auto -mx-4 md:mx-0 px-4 md:px-0">
          <div className="grid grid-cols-4 gap-2 mb-4 min-w-[320px]">
            {matrix.map((item, i) => (
              <div
                key={i}
                className={`border-[0.5px] rounded-[8px] p-2 md:p-3 ${getColor(item.type)}`}
              >
                <div className="text-[8px] md:text-[9px] uppercase tracking-wide opacity-70 mb-1">
                  {item.label || `[${i}]`}
                </div>
                <div className="text-[9px] md:text-[11px] font-mono font-medium break-all">
                  {item.val}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5">
          <p className="text-[12px] text-[#64748B]" style={{ lineHeight: 1.6 }}>
            Matrix 4×4 terdiri dari <span className="font-medium text-[#0F172A]">16 words (512 bit)</span>:
            4 constant magic "expand 32-byte k", 8 words key (256-bit), 1 counter (32-bit), dan 3 nonce (96-bit).
          </p>
        </div>
      </div>

      <div className="border-t-[0.5px] border-[#E2E8F0] px-4 py-2.5 flex flex-wrap gap-3">
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-[3px] bg-[#EFF6FF] border-[#BFDBFE]" />
          <span className="text-[11px] text-[#64748B]">Constant</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-[3px] bg-[#F0FDF4] border-[#86EFAC]" />
          <span className="text-[11px] text-[#64748B]">Key</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-[3px] bg-[#FFF7ED] border-[#FED7AA]" />
          <span className="text-[11px] text-[#64748B]">Counter</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3.5 h-3.5 rounded-[3px] bg-[#F3E8FF] border-[#C4B5FD]" />
          <span className="text-[11px] text-[#64748B]">Nonce</span>
        </div>
      </div>
    </div>
  );
}

// Step 1: Setup 4x4 Matrix
function ChaChaStep1VisualLegacyB() {
  const [activeCell, setActiveCell] = useState(4);
  const matrix = [
    { val: '61707865', label: 'const[0]', type: 'constant' },
    { val: '3320646e', label: 'const[1]', type: 'constant' },
    { val: '79622d32', label: 'const[2]', type: 'constant' },
    { val: '6b206574', label: 'const[3]', type: 'constant' },
    { val: '03020100', label: 'key[0]', type: 'key' },
    { val: '07060504', label: 'key[1]', type: 'key' },
    { val: '0b0a0908', label: 'key[2]', type: 'key' },
    { val: '0f0e0d0c', label: 'key[3]', type: 'key' },
    { val: '13121110', label: 'key[4]', type: 'key' },
    { val: '17161514', label: 'key[5]', type: 'key' },
    { val: '1b1a1918', label: 'key[6]', type: 'key' },
    { val: '1f1e1d1c', label: 'key[7]', type: 'key' },
    { val: '00000001', label: 'counter', type: 'counter' },
    { val: '09000000', label: 'nonce[0]', type: 'nonce' },
    { val: '4a000000', label: 'nonce[1]', type: 'nonce' },
    { val: '00000000', label: 'nonce[2]', type: 'nonce' },
  ];

  const getColor = (type: string) => {
    const colors = {
      constant: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]',
      key: 'bg-[#F3E8FF] border-[#C4B5FD] text-[#7C3AED]',
      counter: 'bg-[#FFF7ED] border-[#FED7AA] text-[#C2410C]',
      nonce: 'bg-[#F0FDF4] border-[#86EFAC] text-[#15803D]',
    };

    return colors[type as keyof typeof colors];
  };

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Initial State Matrix (4x4)</span>
      </div>
      <div className="p-4 md:p-5">
        <div className="grid grid-cols-4 gap-[5px] mt-2">
          {matrix.map((item, i) => {
            const isActive = i === activeCell;

            return (
              <button
                key={i}
                type="button"
                onClick={() => setActiveCell(i)}
                className={`rounded-[6px] px-1 py-1.5 text-center font-mono transition-colors ${
                  isActive
                    ? 'border-[1.5px] border-[#7C3AED] bg-[#EDE9FE] text-[#4C1D95]'
                    : `border-[0.5px] ${getColor(item.type)}`
                }`}
              >
                <div className="text-[10px] font-medium leading-none mb-1">{item.label}</div>
                <div className="text-[10px] font-bold leading-none">{item.val}</div>
              </button>
            );
          })}
        </div>

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

        <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5 mt-4">
          <p className="text-[12px] text-[#64748B]" style={{ lineHeight: 1.6 }}>
            Matrix 4x4 terdiri dari <span className="font-medium text-[#0F172A]">16 words (512 bit)</span>:
            4 constant magic, 8 words key (256-bit), 1 counter (32-bit), dan 3 nonce (96-bit).
          </p>
        </div>
      </div>
    </div>
  );
}

// Step 2: ARX Calculator
function ChaChaStep2VisualLegacy() {
  const [a, setA] = useState(0x11111111);
  const [b, setB] = useState(0x01020304);
  const [c, setC] = useState(0xdeadbeef);
  const [d, setD] = useState(0xcafebabe);

  const quarterRound = (a: number, b: number, c: number, d: number) => {
    // a += b; d ^= a; d <<<= 16;
    a = (a + b) >>> 0;
    d = d ^ a;
    d = ((d << 16) | (d >>> 16)) >>> 0;

    // c += d; b ^= c; b <<<= 12;
    c = (c + d) >>> 0;
    b = b ^ c;
    b = ((b << 12) | (b >>> 20)) >>> 0;

    // a += b; d ^= a; d <<<= 8;
    a = (a + b) >>> 0;
    d = d ^ a;
    d = ((d << 8) | (d >>> 24)) >>> 0;

    // c += d; b ^= c; b <<<= 7;
    c = (c + d) >>> 0;
    b = b ^ c;
    b = ((b << 7) | (b >>> 25)) >>> 0;

    return { a, b, c, d };
  };

  const result = quarterRound(a, b, c, d);

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Quarter Round Calculator (ARX)</span>
      </div>
      <div className="p-4">
        {/* Input values */}
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <div className="grid grid-cols-4 gap-2 mb-4 min-w-[320px]">
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[8px] p-2 md:p-3">
              <div className="text-[9px] md:text-[10px] text-[#1D4ED8] mb-1">a</div>
              <input
                type="text"
                value={a.toString(16).toUpperCase()}
                onChange={(e) => setA(parseInt(e.target.value || '0', 16))}
                className="w-full bg-white/50 border border-[#BFDBFE] rounded px-2 py-1 text-[10px] md:text-[11px] font-mono text-[#1D4ED8]"
              />
            </div>
            <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-[8px] p-2 md:p-3">
              <div className="text-[9px] md:text-[10px] text-[#15803D] mb-1">b</div>
              <input
                type="text"
                value={b.toString(16).toUpperCase()}
                onChange={(e) => setB(parseInt(e.target.value || '0', 16))}
                className="w-full bg-white/50 border border-[#86EFAC] rounded px-2 py-1 text-[10px] md:text-[11px] font-mono text-[#15803D]"
              />
            </div>
            <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-[8px] p-2 md:p-3">
              <div className="text-[9px] md:text-[10px] text-[#C2410C] mb-1">c</div>
              <input
                type="text"
                value={c.toString(16).toUpperCase()}
                onChange={(e) => setC(parseInt(e.target.value || '0', 16))}
                className="w-full bg-white/50 border border-[#FED7AA] rounded px-2 py-1 text-[10px] md:text-[11px] font-mono text-[#C2410C]"
              />
            </div>
            <div className="bg-[#F3E8FF] border border-[#C4B5FD] rounded-[8px] p-2 md:p-3">
              <div className="text-[9px] md:text-[10px] text-[#7C3AED] mb-1">d</div>
              <input
                type="text"
                value={d.toString(16).toUpperCase()}
                onChange={(e) => setD(parseInt(e.target.value || '0', 16))}
                className="w-full bg-white/50 border border-[#C4B5FD] rounded px-2 py-1 text-[10px] md:text-[11px] font-mono text-[#7C3AED]"
              />
            </div>
          </div>
        </div>

        {/* Operations */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 bg-[#F8FAFC] rounded-[8px] px-3 py-2">
            <div className="text-[11px] font-mono text-[#64748B] flex-1">
              a += b; d ^= a; d ⟲ 16
            </div>
            <div className="flex gap-1">
              <div className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-mono rounded">+</div>
              <div className="px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-mono rounded">⊕</div>
              <div className="px-2 py-1 bg-orange-50 text-orange-700 text-[10px] font-mono rounded flex items-center gap-1">
                <RotateCw className="w-3 h-3" />16
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#F8FAFC] rounded-[8px] px-3 py-2">
            <div className="text-[11px] font-mono text-[#64748B] flex-1">
              c += d; b ^= c; b ⟲ 12
            </div>
            <div className="flex gap-1">
              <div className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-mono rounded">+</div>
              <div className="px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-mono rounded">⊕</div>
              <div className="px-2 py-1 bg-orange-50 text-orange-700 text-[10px] font-mono rounded flex items-center gap-1">
                <RotateCw className="w-3 h-3" />12
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#F8FAFC] rounded-[8px] px-3 py-2">
            <div className="text-[11px] font-mono text-[#64748B] flex-1">
              a += b; d ^= a; d ⟲ 8
            </div>
            <div className="flex gap-1">
              <div className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-mono rounded">+</div>
              <div className="px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-mono rounded">⊕</div>
              <div className="px-2 py-1 bg-orange-50 text-orange-700 text-[10px] font-mono rounded flex items-center gap-1">
                <RotateCw className="w-3 h-3" />8
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-[#F8FAFC] rounded-[8px] px-3 py-2">
            <div className="text-[11px] font-mono text-[#64748B] flex-1">
              c += d; b ^= c; b ⟲ 7
            </div>
            <div className="flex gap-1">
              <div className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-mono rounded">+</div>
              <div className="px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-mono rounded">⊕</div>
              <div className="px-2 py-1 bg-orange-50 text-orange-700 text-[10px] font-mono rounded flex items-center gap-1">
                <RotateCw className="w-3 h-3" />7
              </div>
            </div>
          </div>
        </div>

        {/* Output values */}
        <div className="text-[11px] text-[#64748B] mb-2">Hasil setelah Quarter Round:</div>
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <div className="grid grid-cols-4 gap-2 min-w-[320px]">
            <div className="bg-[#DBEAFE] border border-[#93C5FD] rounded-[8px] p-2 md:p-3">
              <div className="text-[9px] md:text-[10px] text-[#1D4ED8] mb-1">a'</div>
              <div className="text-[9px] md:text-[11px] font-mono font-medium text-[#1D4ED8] break-all">
                {result.a.toString(16).toUpperCase().padStart(8, '0')}
              </div>
            </div>
            <div className="bg-[#DCFCE7] border border-[#86EFAC] rounded-[8px] p-2 md:p-3">
              <div className="text-[9px] md:text-[10px] text-[#15803D] mb-1">b'</div>
              <div className="text-[9px] md:text-[11px] font-mono font-medium text-[#15803D] break-all">
                {result.b.toString(16).toUpperCase().padStart(8, '0')}
              </div>
            </div>
            <div className="bg-[#FEF3C7] border border-[#FDE047] rounded-[8px] p-2 md:p-3">
              <div className="text-[9px] md:text-[10px] text-[#92400E] mb-1">c'</div>
              <div className="text-[9px] md:text-[11px] font-mono font-medium text-[#92400E] break-all">
                {result.c.toString(16).toUpperCase().padStart(8, '0')}
              </div>
            </div>
            <div className="bg-[#F3E8FF] border border-[#C4B5FD] rounded-[8px] p-2 md:p-3">
              <div className="text-[9px] md:text-[10px] text-[#7C3AED] mb-1">d'</div>
              <div className="text-[9px] md:text-[11px] font-mono font-medium text-[#7C3AED] break-all">
                {result.d.toString(16).toUpperCase().padStart(8, '0')}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t-[0.5px] border-[#E2E8F0] px-4 py-2.5">
        <p className="text-[11px] text-[#64748B]">
          <span className="font-medium text-[#0F172A]">ARX</span> = Add (penjumlahan mod 2³²), Rotate (rotasi bit), XOR (exclusive-or)
        </p>
      </div>
    </div>
  );
}

// Step 3: 20 Rounds Mixing
function ChaChaStep3VisualLegacy() {
  const [currentRound, setCurrentRound] = useState(1);

  // Mock before/after matrix
  const matrixBefore = Array.from({ length: 16 }, (_, i) =>
    (0x11111111 + i * 0x11111111).toString(16).padStart(8, '0').toUpperCase()
  );
  const matrixAfter = Array.from({ length: 16 }, (_, i) =>
    ((0x11111111 + i * 0x11111111) ^ 0xdeadbeef).toString(16).padStart(8, '0').toUpperCase()
  );

  const changedIndices = [0, 1, 4, 5, 8, 9, 12, 13]; // Column round affects these

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">
          Round {currentRound}/20 {currentRound % 2 === 1 ? '(Column)' : '(Diagonal)'}
        </span>
      </div>
      <div className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {/* Before */}
          <div>
            <div className="text-[11px] font-medium text-[#64748B] mb-2">Sebelum Round {currentRound}:</div>
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <div className="grid grid-cols-4 gap-1 min-w-[280px]">
                {matrixBefore.map((val, i) => (
                  <div
                    key={i}
                    className="bg-[#F8FAFC] border-[0.5px] border-[#E2E8F0] rounded p-1.5 md:p-2 text-center"
                  >
                    <div className="text-[8px] md:text-[9px] font-mono text-[#64748B] break-all">{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* After */}
          <div>
            <div className="text-[11px] font-medium text-[#64748B] mb-2">Setelah Round {currentRound}:</div>
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <div className="grid grid-cols-4 gap-1 min-w-[280px]">
                {matrixAfter.map((val, i) => (
                  <div
                    key={i}
                    className={`rounded p-1.5 md:p-2 text-center border-[0.5px] ${
                      changedIndices.includes(i)
                        ? 'bg-[#FEF3C7] border-[#FDE047] text-[#92400E]'
                        : 'bg-[#F8FAFC] border-[#E2E8F0]'
                    }`}
                  >
                    <div className={`text-[8px] md:text-[9px] font-mono break-all ${changedIndices.includes(i) ? 'text-[#92400E] font-medium' : 'text-[#64748B]'}`}>
                      {val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5 mb-3">
          <p className="text-[12px] text-[#64748B]" style={{ lineHeight: 1.6 }}>
            <span className="font-medium text-[#0F172A]">Round {currentRound % 2 === 1 ? 'ganjil' : 'genap'}</span>:
            {currentRound % 2 === 1
              ? ' Column round mengacak kolom (0,4,8,12), (1,5,9,13), (2,6,10,14), (3,7,11,15)'
              : ' Diagonal round mengacak diagonal (0,5,10,15), (1,6,11,12), (2,7,8,13), (3,4,9,14)'
            }
          </p>
        </div>
      </div>

      <div className="border-t-[0.5px] border-[#E2E8F0] px-4 py-3.5">
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 20 }, (_, i) => {
            const num = i + 1;
            const isDone = num < currentRound;
            const isActive = num === currentRound;

            return (
              <button
                key={i}
                onClick={() => setCurrentRound(num)}
                className={`w-8 h-8 rounded-[6px] text-[10px] font-medium border-[0.5px] transition-colors ${
                  isActive
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : isDone
                    ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]'
                    : 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0]'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Step 4: Final State Addition
function ChaChaStep4VisualLegacy() {
  const initialState = [0x61707865, 0x3320646e, 0x79622d32, 0x6b206574];
  const workingState = [0xa12bc34d, 0x5f6a7b8c, 0xc9d8e0f1, 0x23456789];
  const finalState = initialState.map((val, i) => ((val + workingState[i]) >>> 0));

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">State Addition (mod 2³²)</span>
      </div>
      <div className="p-4">
        {/* Spotlight word[0] */}
        <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-[10px] p-4 mb-4">
          <div className="text-[11px] font-medium text-[#15803D] mb-3">Contoh: Word[0] Addition</div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-[10px] text-[#64748B] mb-1">Initial State[0]</div>
              <div className="bg-white border border-[#86EFAC] rounded px-3 py-2 text-[12px] font-mono text-[#15803D]">
                {initialState[0].toString(16).toUpperCase().padStart(8, '0')}
              </div>
            </div>
            <div className="text-[#15803D] text-[18px] font-bold">+</div>
            <div className="flex-1">
              <div className="text-[10px] text-[#64748B] mb-1">Working State[0]</div>
              <div className="bg-white border border-[#86EFAC] rounded px-3 py-2 text-[12px] font-mono text-[#15803D]">
                {workingState[0].toString(16).toUpperCase().padStart(8, '0')}
              </div>
            </div>
            <div className="text-[#15803D] text-[18px] font-bold">=</div>
            <div className="flex-1">
              <div className="text-[10px] text-[#64748B] mb-1">Final State[0]</div>
              <div className="bg-[#DCFCE7] border border-[#16A34A] rounded px-3 py-2 text-[12px] font-mono font-medium text-[#15803D]">
                {finalState[0].toString(16).toUpperCase().padStart(8, '0')}
              </div>
            </div>
          </div>
        </div>

        {/* Full matrix view */}
        <div className="text-[11px] font-medium text-[#64748B] mb-2">Final State (semua 16 words):</div>
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <div className="grid grid-cols-4 gap-2 min-w-[320px]">
            {finalState.concat(Array(12).fill(0x12345678)).map((val, i) => (
              <div
                key={i}
                className={`border-[0.5px] rounded-[8px] p-1.5 md:p-2 ${
                  i === 0
                    ? 'bg-[#DCFCE7] border-[#16A34A]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0]'
                }`}
              >
                <div className={`text-[9px] md:text-[10px] font-mono break-all ${i === 0 ? 'text-[#15803D] font-medium' : 'text-[#64748B]'}`}>
                  {val.toString(16).toUpperCase().padStart(8, '0')}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5 mt-4">
          <p className="text-[12px] text-[#64748B]" style={{ lineHeight: 1.6 }}>
            Setiap word dalam final state = <span className="font-medium text-[#0F172A]">initial state + working state (mod 2³²)</span>.
            Ini mencegah reversing karena informasi awal "dicampur" ke hasil akhir.
          </p>
        </div>
      </div>
    </div>
  );
}

// Step 5: Little-Endian Serialization
function ChaChaStep5VisualLegacy({ selectedWord, setSelectedWord }: { selectedWord: number; setSelectedWord: (n: number) => void }) {
  const words = Array.from({ length: 16 }, (_, i) => 0x12345678 + i * 0x11111111);
  const selectedBytes = [
    (words[selectedWord] & 0xff),
    ((words[selectedWord] >>> 8) & 0xff),
    ((words[selectedWord] >>> 16) & 0xff),
    ((words[selectedWord] >>> 24) & 0xff),
  ];

  const allBytes = words.flatMap(w => [
    (w & 0xff),
    ((w >>> 8) & 0xff),
    ((w >>> 16) & 0xff),
    ((w >>> 24) & 0xff),
  ]);

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Serialize to Keystream (Little-Endian)</span>
      </div>
      <div className="p-4">
        {/* Word selector */}
        <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-[10px] p-4 mb-4">
          <div className="text-[11px] font-medium text-[#15803D] mb-3">
            Contoh: Word[{selectedWord}] → 4 Bytes
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1">
              <div className="text-[10px] text-[#64748B] mb-1">Word (32-bit)</div>
              <div className="bg-white border border-[#86EFAC] rounded px-3 py-2 text-[13px] font-mono font-medium text-[#15803D]">
                {words[selectedWord].toString(16).toUpperCase().padStart(8, '0')}
              </div>
            </div>
            <div className="text-[#15803D] text-[18px] font-bold">→</div>
            <div className="flex-1">
              <div className="text-[10px] text-[#64748B] mb-1">Bytes (little-endian)</div>
              <div className="flex gap-1">
                {selectedBytes.map((byte, i) => (
                  <div key={i} className="bg-[#DCFCE7] border border-[#16A34A] rounded px-2 py-1.5 text-[11px] font-mono font-medium text-[#15803D]">
                    {byte.toString(16).toUpperCase().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            {words.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedWord(i)}
                className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
                  i === selectedWord
                    ? 'bg-[#16A34A] text-white'
                    : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F0FDF4]'
                }`}
              >
                [{i}]
              </button>
            ))}
          </div>
        </div>

        {/* 64-byte keystream grid */}
        <div className="text-[11px] font-medium text-[#64748B] mb-2">
          Keystream (64 bytes total):
        </div>
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <div className="grid grid-cols-16 gap-[2px] min-w-[640px]">
            {allBytes.map((byte, i) => {
              const isInSelectedWord = i >= selectedWord * 4 && i < (selectedWord + 1) * 4;
              return (
                <div
                  key={i}
                  className={`rounded-[3px] p-1 text-center border-[0.5px] ${
                    isInSelectedWord
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

        <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5 mt-4">
          <p className="text-[12px] text-[#64748B]" style={{ lineHeight: 1.6 }}>
            <span className="font-medium text-[#0F172A]">Little-endian</span> artinya byte paling kecil (LSB) disimpan duluan.
            16 words × 4 bytes = <span className="font-medium text-[#0F172A]">64 bytes keystream</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

// Step 1: Setup 4x4 Matrix
function ChaChaStep1Visual({ details }: { details: ChaChaDetails }) {
  const [activeCell, setActiveCell] = useState(4);
  const matrix = details.initialState.map((value, index) => ({
    val: formatWordHex(value),
    label: getChaChaCellLabel(index),
    type: getChaChaCellType(index),
  }));

  const getColor = (type: string) => {
    const colors = {
      constant: 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]',
      key: 'bg-[#F3E8FF] border-[#C4B5FD] text-[#7C3AED]',
      counter: 'bg-[#FFF7ED] border-[#FED7AA] text-[#C2410C]',
      nonce: 'bg-[#F0FDF4] border-[#86EFAC] text-[#15803D]',
    };

    return colors[type as keyof typeof colors];
  };

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Initial State Matrix (4x4)</span>
      </div>
      <div className="p-4 md:p-5">
        <div className="grid grid-cols-4 gap-[5px] mt-2">
          {matrix.map((item, i) => {
            const isActive = i === activeCell;

            return (
              <button
                key={i}
                type="button"
                onClick={() => setActiveCell(i)}
                className={`rounded-[6px] px-1 py-1.5 text-center font-mono transition-colors ${
                  isActive
                    ? 'border-[1.5px] border-[#7C3AED] bg-[#EDE9FE] text-[#4C1D95]'
                    : `border-[0.5px] ${getColor(item.type)}`
                }`}
              >
                <div className="text-[10px] font-medium leading-none mb-1">{item.label}</div>
                <div className="text-[10px] font-bold leading-none">{item.val}</div>
              </button>
            );
          })}
        </div>

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

        <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5 mt-4">
          <p className="text-[12px] text-[#64748B]" style={{ lineHeight: 1.6 }}>
            Matrix 4x4 ini dibentuk langsung dari key dan nonce user. Cell aktif menunjukkan word ke-{activeCell} dengan nilai{' '}
            <span className="font-medium text-[#0F172A]">{matrix[activeCell].val}</span>.
          </p>
        </div>
      </div>
    </div>
  );
}

// Step 2: ARX Calculator
function ChaChaStep2Visual({ details }: { details: ChaChaDetails }) {
  const [a, setA] = useState(details.initialState[0]);
  const [b, setB] = useState(details.initialState[4]);
  const [c, setC] = useState(details.initialState[8]);
  const [d, setD] = useState(details.initialState[12]);

  const quarterRound = (aValue: number, bValue: number, cValue: number, dValue: number) => {
    aValue = (aValue + bValue) >>> 0;
    dValue = dValue ^ aValue;
    dValue = ((dValue << 16) | (dValue >>> 16)) >>> 0;

    cValue = (cValue + dValue) >>> 0;
    bValue = bValue ^ cValue;
    bValue = ((bValue << 12) | (bValue >>> 20)) >>> 0;

    aValue = (aValue + bValue) >>> 0;
    dValue = dValue ^ aValue;
    dValue = ((dValue << 8) | (dValue >>> 24)) >>> 0;

    cValue = (cValue + dValue) >>> 0;
    bValue = bValue ^ cValue;
    bValue = ((bValue << 7) | (bValue >>> 25)) >>> 0;

    return { a: aValue, b: bValue, c: cValue, d: dValue };
  };

  const result = quarterRound(a, b, c, d);

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Quarter Round Calculator (ARX)</span>
      </div>
      <div className="p-4">
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <div className="grid grid-cols-4 gap-2 mb-4 min-w-[320px]">
            <div className="bg-[#EFF6FF] border border-[#BFDBFE] rounded-[8px] p-2 md:p-3">
              <div className="text-[9px] md:text-[10px] text-[#1D4ED8] mb-1">a = state[0]</div>
              <input
                type="text"
                value={a.toString(16).toUpperCase()}
                onChange={(e) => setA(parseInt(e.target.value || '0', 16))}
                className="w-full bg-white/50 border border-[#BFDBFE] rounded px-2 py-1 text-[10px] md:text-[11px] font-mono text-[#1D4ED8]"
              />
            </div>
            <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-[8px] p-2 md:p-3">
              <div className="text-[9px] md:text-[10px] text-[#15803D] mb-1">b = state[4]</div>
              <input
                type="text"
                value={b.toString(16).toUpperCase()}
                onChange={(e) => setB(parseInt(e.target.value || '0', 16))}
                className="w-full bg-white/50 border border-[#86EFAC] rounded px-2 py-1 text-[10px] md:text-[11px] font-mono text-[#15803D]"
              />
            </div>
            <div className="bg-[#FFF7ED] border border-[#FED7AA] rounded-[8px] p-2 md:p-3">
              <div className="text-[9px] md:text-[10px] text-[#C2410C] mb-1">c = state[8]</div>
              <input
                type="text"
                value={c.toString(16).toUpperCase()}
                onChange={(e) => setC(parseInt(e.target.value || '0', 16))}
                className="w-full bg-white/50 border border-[#FED7AA] rounded px-2 py-1 text-[10px] md:text-[11px] font-mono text-[#C2410C]"
              />
            </div>
            <div className="bg-[#F3E8FF] border border-[#C4B5FD] rounded-[8px] p-2 md:p-3">
              <div className="text-[9px] md:text-[10px] text-[#7C3AED] mb-1">d = state[12]</div>
              <input
                type="text"
                value={d.toString(16).toUpperCase()}
                onChange={(e) => setD(parseInt(e.target.value || '0', 16))}
                className="w-full bg-white/50 border border-[#C4B5FD] rounded px-2 py-1 text-[10px] md:text-[11px] font-mono text-[#7C3AED]"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          {['a += b; d ^= a; d ⟲ 16', 'c += d; b ^= c; b ⟲ 12', 'a += b; d ^= a; d ⟲ 8', 'c += d; b ^= c; b ⟲ 7'].map((operation) => (
            <div key={operation} className="flex items-center gap-2 bg-[#F8FAFC] rounded-[8px] px-3 py-2">
              <div className="text-[11px] font-mono text-[#64748B] flex-1">{operation}</div>
              <div className="flex gap-1">
                <div className="px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-mono rounded">+</div>
                <div className="px-2 py-1 bg-purple-50 text-purple-700 text-[10px] font-mono rounded">⊕</div>
                <div className="px-2 py-1 bg-orange-50 text-orange-700 text-[10px] font-mono rounded flex items-center gap-1">
                  <RotateCw className="w-3 h-3" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="text-[11px] text-[#64748B] mb-2">Hasil setelah Quarter Round:</div>
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <div className="grid grid-cols-4 gap-2 min-w-[320px]">
            {[
              { label: "a'", color: 'bg-[#DBEAFE] border-[#93C5FD] text-[#1D4ED8]', value: result.a },
              { label: "b'", color: 'bg-[#DCFCE7] border-[#86EFAC] text-[#15803D]', value: result.b },
              { label: "c'", color: 'bg-[#FEF3C7] border-[#FDE047] text-[#92400E]', value: result.c },
              { label: "d'", color: 'bg-[#F3E8FF] border-[#C4B5FD] text-[#7C3AED]', value: result.d },
            ].map((item) => (
              <div key={item.label} className={`border rounded-[8px] p-2 md:p-3 ${item.color}`}>
                <div className="text-[9px] md:text-[10px] mb-1">{item.label}</div>
                <div className="text-[9px] md:text-[11px] font-mono font-medium break-all">
                  {item.value.toString(16).toUpperCase().padStart(8, '0')}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5 mt-4">
          <p className="text-[12px] text-[#64748B]" style={{ lineHeight: 1.6 }}>
            Nilai a, b, c, d awal diambil dari state nyata user pada posisi 0, 4, 8, dan 12.
          </p>
        </div>
      </div>
    </div>
  );
}

// Step 3: 20 Rounds Mixing
function ChaChaStep3Visual({ details }: { details: ChaChaDetails }) {
  const [currentRound, setCurrentRound] = useState(1);
  const isColumnRound = currentRound % 2 === 1;
  const doubleRoundIndex = Math.floor((currentRound - 1) / 2);
  const roundDetails = details.rounds[doubleRoundIndex];
  const beforeState = isColumnRound ? roundDetails.beforeColumn : roundDetails.afterColumn;
  const afterState = isColumnRound ? roundDetails.afterColumn : roundDetails.afterDiagonal;
  const matrixBefore = beforeState.map(formatWordHex);
  const matrixAfter = afterState.map(formatWordHex);
  const changedIndices = matrixAfter
    .map((value, index) => (value !== matrixBefore[index] ? index : -1))
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
            <div className="text-[11px] font-medium text-[#64748B] mb-2">Sebelum Round {currentRound}:</div>
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <div className="grid grid-cols-4 gap-1 min-w-[280px]">
                {matrixBefore.map((val, i) => (
                  <div key={i} className="bg-[#F8FAFC] border-[0.5px] border-[#E2E8F0] rounded p-1.5 md:p-2 text-center">
                    <div className="text-[8px] md:text-[9px] font-mono text-[#64748B] break-all">{val}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="text-[11px] font-medium text-[#64748B] mb-2">Setelah Round {currentRound}:</div>
            <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
              <div className="grid grid-cols-4 gap-1 min-w-[280px]">
                {matrixAfter.map((val, i) => (
                  <div
                    key={i}
                    className={`rounded p-1.5 md:p-2 text-center border-[0.5px] ${
                      changedIndices.includes(i)
                        ? 'bg-[#FEF3C7] border-[#FDE047] text-[#92400E]'
                        : 'bg-[#F8FAFC] border-[#E2E8F0]'
                    }`}
                  >
                    <div className={`text-[8px] md:text-[9px] font-mono break-all ${changedIndices.includes(i) ? 'text-[#92400E] font-medium' : 'text-[#64748B]'}`}>
                      {val}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5 mb-3">
          <p className="text-[12px] text-[#64748B]" style={{ lineHeight: 1.6 }}>
            <span className="font-medium text-[#0F172A]">Round {isColumnRound ? 'ganjil' : 'genap'}</span> memakai state nyata dari key dan nonce user.
            {isColumnRound
              ? ' Column round mengacak kolom (0,4,8,12), (1,5,9,13), (2,6,10,14), (3,7,11,15).'
              : ' Diagonal round mengacak diagonal (0,5,10,15), (1,6,11,12), (2,7,8,13), (3,4,9,14).'}
          </p>
        </div>
      </div>

      <div className="border-t-[0.5px] border-[#E2E8F0] px-4 py-3.5">
        <div className="flex flex-wrap gap-1">
          {Array.from({ length: 20 }, (_, i) => {
            const num = i + 1;
            const isDone = num < currentRound;
            const isActive = num === currentRound;

            return (
              <button
                key={i}
                onClick={() => setCurrentRound(num)}
                className={`w-8 h-8 rounded-[6px] text-[10px] font-medium border-[0.5px] transition-colors ${
                  isActive
                    ? 'bg-[#2563EB] text-white border-[#2563EB]'
                    : isDone
                    ? 'bg-[#DCFCE7] text-[#15803D] border-[#86EFAC]'
                    : 'bg-[#F8FAFC] text-[#94A3B8] border-[#E2E8F0]'
                }`}
              >
                {num}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Step 4: Final State Addition
function ChaChaStep4Visual({ details }: { details: ChaChaDetails }) {
  const initialState = details.initialState;
  const workingState = details.rounds[details.rounds.length - 1].afterDiagonal;
  const finalState = details.finalState;

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">State Addition (mod 2³²)</span>
      </div>
      <div className="p-4">
        <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-[10px] p-4 mb-4">
          <div className="text-[11px] font-medium text-[#15803D] mb-3">Contoh riil: Word[0] Addition</div>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <div className="text-[10px] text-[#64748B] mb-1">Initial State[0]</div>
              <div className="bg-white border border-[#86EFAC] rounded px-3 py-2 text-[12px] font-mono text-[#15803D]">
                {formatWordHex(initialState[0])}
              </div>
            </div>
            <div className="text-[#15803D] text-[18px] font-bold">+</div>
            <div className="flex-1">
              <div className="text-[10px] text-[#64748B] mb-1">Working State[0]</div>
              <div className="bg-white border border-[#86EFAC] rounded px-3 py-2 text-[12px] font-mono text-[#15803D]">
                {formatWordHex(workingState[0])}
              </div>
            </div>
            <div className="text-[#15803D] text-[18px] font-bold">=</div>
            <div className="flex-1">
              <div className="text-[10px] text-[#64748B] mb-1">Final State[0]</div>
              <div className="bg-[#DCFCE7] border border-[#16A34A] rounded px-3 py-2 text-[12px] font-mono font-medium text-[#15803D]">
                {formatWordHex(finalState[0])}
              </div>
            </div>
          </div>
        </div>

        <div className="text-[11px] font-medium text-[#64748B] mb-2">Final State (semua 16 words):</div>
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <div className="grid grid-cols-4 gap-2 min-w-[320px]">
            {finalState.map((val, i) => (
              <div
                key={i}
                className={`border-[0.5px] rounded-[8px] p-1.5 md:p-2 ${
                  i === 0
                    ? 'bg-[#DCFCE7] border-[#16A34A]'
                    : 'bg-[#F8FAFC] border-[#E2E8F0]'
                }`}
              >
                <div className={`text-[9px] md:text-[10px] font-mono break-all ${i === 0 ? 'text-[#15803D] font-medium' : 'text-[#64748B]'}`}>
                  {formatWordHex(val)}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5 mt-4">
          <p className="text-[12px] text-[#64748B]" style={{ lineHeight: 1.6 }}>
            Semua word di final state dihitung dari initial state dan working state hasil 20 rounds yang berasal dari key dan nonce user.
          </p>
        </div>
      </div>
    </div>
  );
}

// Step 5: Little-Endian Serialization
function ChaChaStep5Visual({
  details,
  selectedWord,
  setSelectedWord,
}: {
  details: ChaChaDetails;
  selectedWord: number;
  setSelectedWord: (n: number) => void;
}) {
  const words = details.finalState;
  const selectedBytes = [
    (words[selectedWord] & 0xff),
    ((words[selectedWord] >>> 8) & 0xff),
    ((words[selectedWord] >>> 16) & 0xff),
    ((words[selectedWord] >>> 24) & 0xff),
  ];

  const allBytes = words.flatMap((word) => [
    (word & 0xff),
    ((word >>> 8) & 0xff),
    ((word >>> 16) & 0xff),
    ((word >>> 24) & 0xff),
  ]);

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">Serialize to Keystream (Little-Endian)</span>
      </div>
      <div className="p-4">
        <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-[10px] p-4 mb-4">
          <div className="text-[11px] font-medium text-[#15803D] mb-3">
            Contoh: Word[{selectedWord}] riil → 4 Bytes
          </div>
          <div className="flex items-center gap-3 mb-3">
            <div className="flex-1">
              <div className="text-[10px] text-[#64748B] mb-1">Word (32-bit)</div>
              <div className="bg-white border border-[#86EFAC] rounded px-3 py-2 text-[13px] font-mono font-medium text-[#15803D]">
                {formatWordHex(words[selectedWord])}
              </div>
            </div>
            <div className="text-[#15803D] text-[18px] font-bold">→</div>
            <div className="flex-1">
              <div className="text-[10px] text-[#64748B] mb-1">Bytes (little-endian)</div>
              <div className="flex gap-1">
                {selectedBytes.map((byte, i) => (
                  <div key={i} className="bg-[#DCFCE7] border border-[#16A34A] rounded px-2 py-1.5 text-[11px] font-mono font-medium text-[#15803D]">
                    {byte.toString(16).toUpperCase().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex gap-1">
            {words.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelectedWord(i)}
                className={`px-2 py-1 rounded text-[10px] font-mono transition-colors ${
                  i === selectedWord
                    ? 'bg-[#16A34A] text-white'
                    : 'bg-[#F8FAFC] text-[#64748B] hover:bg-[#F0FDF4]'
                }`}
              >
                [{i}]
              </button>
            ))}
          </div>
        </div>

        <div className="text-[11px] font-medium text-[#64748B] mb-2">
          Keystream (64 bytes total):
        </div>
        <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <div className="grid grid-cols-16 gap-[2px] min-w-[640px]">
            {allBytes.map((byte, i) => {
              const isInSelectedWord = i >= selectedWord * 4 && i < (selectedWord + 1) * 4;
              return (
                <div
                  key={i}
                  className={`rounded-[3px] p-1 text-center border-[0.5px] ${
                    isInSelectedWord
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

        <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5 mt-4">
          <p className="text-[12px] text-[#64748B]" style={{ lineHeight: 1.6 }}>
            Word dan byte di sini berasal langsung dari final state hasil key dan nonce user.
          </p>
        </div>
      </div>
    </div>
  );
}

// Step 6: XOR with Plaintext
function ChaChaStep6Visual({ plaintext, keyValue, nonceValue }: { plaintext: string; keyValue: string; nonceValue: string }) {
  // Get real ChaCha20 encryption result
  const chachaDetails = getChaCha20Details(plaintext, keyValue, nonceValue);

  // Convert hex keystream to byte array
  const hexToBytes = (hex: string): number[] => {
    const bytes: number[] = [];
    for (let i = 0; i < hex.length; i += 2) {
      bytes.push(parseInt(hex.substr(i, 2), 16));
    }
    return bytes;
  };

  const keystreamBytes = hexToBytes(chachaDetails.keystream);
  const plaintextBytes = Array.from(plaintext).map(c => c.charCodeAt(0));

  // Calculate ciphertext by XOR
  const ciphertext = plaintextBytes.map((p, i) => p ^ (keystreamBytes[i] || 0));

  return (
    <div className="bg-white border-[0.5px] border-[#E2E8F0] rounded-[12px] overflow-hidden mb-3">
      <div className="h-10 px-4 border-b-[0.5px] border-[#E2E8F0] flex items-center gap-2">
        <span className="text-[12px] font-medium text-[#64748B]">XOR Plaintext ⊕ Keystream</span>
      </div>
      <div className="p-4">
        {/* Byte-by-byte XOR */}
        <div className="space-y-2 mb-4">
          {plaintextBytes.slice(0, Math.min(8, plaintextBytes.length)).map((p, i) => (
            <div key={i} className="bg-[#F8FAFC] rounded-[8px] p-3 flex items-center gap-3">
              <div className="w-8 text-[10px] text-[#64748B] font-medium">#{i}</div>
              <div className="flex-1 flex items-center gap-2">
                <div className="flex-1">
                  <div className="text-[9px] text-[#64748B] mb-1">Plaintext</div>
                  <div className="bg-white border border-[#BFDBFE] rounded px-3 py-1.5 text-center">
                    <div className="text-[11px] font-medium text-[#1D4ED8]">{plaintext[i] || '·'}</div>
                    <div className="text-[9px] font-mono text-[#64748B]">{p.toString(16).toUpperCase().padStart(2, '0')}</div>
                  </div>
                </div>
                <div className="text-[#7C3AED] font-bold text-[14px]">⊕</div>
                <div className="flex-1">
                  <div className="text-[9px] text-[#64748B] mb-1">Keystream</div>
                  <div className="bg-white border border-[#C4B5FD] rounded px-3 py-1.5 text-center">
                    <div className="text-[11px] font-mono font-medium text-[#7C3AED]">
                      {(keystreamBytes[i] || 0).toString(16).toUpperCase().padStart(2, '0')}
                    </div>
                  </div>
                </div>
                <div className="text-[#15803D] font-bold text-[14px]">=</div>
                <div className="flex-1">
                  <div className="text-[9px] text-[#64748B] mb-1">Ciphertext</div>
                  <div className="bg-[#DCFCE7] border border-[#16A34A] rounded px-3 py-1.5 text-center">
                    <div className="text-[11px] font-mono font-medium text-[#15803D]">
                      {ciphertext[i].toString(16).toUpperCase().padStart(2, '0')}
                    </div>
                    <div className="text-[9px] text-[#64748B]">
                      {ciphertext[i] >= 32 && ciphertext[i] <= 126 ? String.fromCharCode(ciphertext[i]) : '·'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Final result */}
        <div className="bg-[#F0FDF4] border border-[#86EFAC] rounded-[10px] p-4">
          <div className="text-[11px] font-medium text-[#15803D] mb-2">Ciphertext Final (Hex):</div>
          <div className="bg-white border border-[#16A34A] rounded-[8px] px-4 py-3 text-center">
            <div className="text-[14px] font-mono font-medium text-[#15803D] break-all">
              {chachaDetails.ciphertext}
            </div>
          </div>
          <div className="text-[10px] text-[#64748B] mt-2 text-center">
            Plaintext: "{plaintext}" | Key: "{keyValue.slice(0, 16)}..." | Nonce: "{nonceValue}"
          </div>
        </div>

        <div className="bg-[#F8FAFC] rounded-[8px] px-3 py-2.5 mt-4">
          <p className="text-[12px] text-[#64748B]" style={{ lineHeight: 1.6 }}>
            XOR bersifat <span className="font-medium text-[#0F172A]">reversible</span>:
            ciphertext ⊕ keystream = plaintext kembali. Untuk dekripsi, gunakan keystream yang sama dengan counter yang sama.
          </p>
        </div>
      </div>
    </div>
  );
}
