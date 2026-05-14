import { useState } from 'react';
import { UnlockKeyhole, ChevronRight, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function DekripsiDESPage() {
  const [ciphertext, setCiphertext] = useState('');
  const [key, setKey] = useState('');
  const [isValid, setIsValid] = useState(false);
  const navigate = useNavigate();

  const handleInputChange = (ct: string, k: string) => {
    const normalizedCiphertext = ct.replace(/\s+/g, '').toUpperCase();
    setCiphertext(normalizedCiphertext);
    setKey(k);
    // Simple validation: hex ciphertext + 8 char key
    const isHex = /^[0-9A-F]*$/.test(normalizedCiphertext);
    setIsValid(normalizedCiphertext.length === 16 && isHex && k.length === 8);
  };

  const handleStartDecryption = () => {
    if (isValid) {
      navigate('/visualisasi-dekripsi/des', {
        state: { ciphertext, key, mode: 'decrypt' }
      });
    }
  };

  return (
    <div className="w-full min-h-[calc(100vh-56px)] bg-[#F8FAFC] p-4 md:p-6">
      <div className="max-w-[640px] mx-auto">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => navigate('/beranda')} className="text-[11px] text-[#94A3B8] hover:text-[#64748B]">
            Beranda
          </button>
          <ChevronRight className="w-3 h-3 text-[#94A3B8]" />
          <button onClick={() => navigate('/dekripsi')} className="text-[11px] text-[#94A3B8] hover:text-[#64748B]">
            Dekripsi
          </button>
          <ChevronRight className="w-3 h-3 text-[#94A3B8]" />
          <span className="text-[11px] text-[#0F172A] font-medium">DES</span>
          <div className="ml-2 px-2.5 py-0.5 rounded-[20px] bg-[#FFFBEB] border-[0.5px] border-[#FDE68A]">
            <div className="flex items-center gap-1.5">
              <UnlockKeyhole className="w-3 h-3 text-[#D97706]" />
              <span className="text-[11px] font-medium text-[#92400E]">Mode Dekripsi</span>
            </div>
          </div>
        </div>

        {/* Input Card */}
        <div className="bg-white border-[0.5px] border-[#FDE68A] rounded-[12px] p-6 md:p-8 shadow-sm bg-gradient-to-br from-[#FFFBEB]/30 to-white">
          <div className="flex items-center gap-3 mb-6">
            <UnlockKeyhole className="w-5 h-5 text-[#D97706]" />
            <h2 className="text-[15px] font-semibold text-[#0F172A]">Dekripsi Ciphertext</h2>
          </div>

          {/* Ciphertext Input */}
          <div className="mb-5">
            <label className="block text-[12px] font-medium text-[#0F172A] mb-2">
              Ciphertext (Hex)
            </label>
            <textarea
              value={ciphertext}
              onChange={(e) => handleInputChange(e.target.value, key)}
              placeholder="Masukkan ciphertext 16 karakter hex, contoh: A3F48C2DB1E79A40"
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-[8px] text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#D97706] bg-[#F8FAFC] resize-none"
              rows={3}
            />
            <div className="mt-2 text-[11px] text-[#94A3B8] flex items-center gap-1.5">
              <span>💡</span>
              <span>Ciphertext harus 16 karakter hex, contoh: A3F48C2DB1E79A40</span>
            </div>
          </div>

          {/* Key Input */}
          <div className="mb-6">
            <label className="block text-[12px] font-medium text-[#0F172A] mb-2">
              Kunci (Key)
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => handleInputChange(ciphertext, e.target.value.slice(0, 8))}
              maxLength={8}
              placeholder="MYKEY123"
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-[8px] text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#D97706]"
            />
            <div className="mt-2 flex items-center justify-between">
              <div className="text-[10px] text-[#64748B]">
                {key.length}/8 karakter
              </div>
              <div className="text-[11px] text-[#D97706]">
                Harus sama persis dengan kunci yang dipakai saat enkripsi
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            onClick={handleStartDecryption}
            disabled={!isValid}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-[10px] bg-gradient-to-r from-[#D97706] to-[#B45309] text-white text-[13px] font-medium shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <UnlockKeyhole className="w-4 h-4" />
            Mulai Dekripsi
          </button>
        </div>

        {/* Info */}
        <div className="mt-6 text-center text-[12px] text-[#64748B]">
          Pastikan key dan ciphertext valid untuk hasil dekripsi yang benar
        </div>
      </div>
    </div>
  );
}
