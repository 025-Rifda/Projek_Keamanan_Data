import { useMemo, useState } from 'react';
import { Zap, ChevronRight, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { validateChaCha20DecryptInput } from '../utils/validation';

export function DekripsiChaCha20Page() {
  const [ciphertext, setCiphertext] = useState('');
  const [key, setKey] = useState('');
  const [nonce, setNonce] = useState('');
  const [counter, setCounter] = useState('0');
  const navigate = useNavigate();

  const validation = useMemo(
    () => validateChaCha20DecryptInput(ciphertext, key, nonce, counter),
    [ciphertext, key, nonce, counter],
  );

  const handleStartDecryption = () => {
    if (!validation.isValid) {
      return;
    }

    navigate('/visualisasi-dekripsi/chacha20', {
      state: {
        ciphertext: ciphertext.replace(/\s+/g, '').toUpperCase(),
        key,
        nonce,
        counter,
      },
    });
  };

  return (
    <div className="w-full min-h-[calc(100vh-56px)] bg-[#F8FAFC] p-4 md:p-6">
      <div className="max-w-[720px] mx-auto">
        <div className="flex items-center gap-2 mb-2">
          <button onClick={() => navigate('/beranda')} className="text-[11px] text-[#94A3B8] hover:text-[#64748B]">
            Beranda
          </button>
          <ChevronRight className="w-3 h-3 text-[#94A3B8]" />
          <button onClick={() => navigate('/dekripsi')} className="text-[11px] text-[#94A3B8] hover:text-[#64748B]">
            Dekripsi
          </button>
          <ChevronRight className="w-3 h-3 text-[#94A3B8]" />
          <span className="text-[11px] text-[#0F172A] font-medium">ChaCha20</span>
          <div className="ml-2 px-2.5 py-0.5 rounded-[20px] bg-[#F3E8FF] border-[0.5px] border-[#C4B5FD]">
            <div className="flex items-center gap-1.5">
              <Zap className="w-3 h-3 text-[#7C3AED]" />
              <span className="text-[11px] font-medium text-[#7C3AED]">Mode Dekripsi</span>
            </div>
          </div>
        </div>

        <div className="bg-white border-[0.5px] border-[#C4B5FD] rounded-[12px] p-6 md:p-8 shadow-sm bg-gradient-to-br from-[#F3E8FF]/30 to-white">
          <div className="flex items-center gap-3 mb-6">
            <Zap className="w-5 h-5 text-[#7C3AED]" />
            <h2 className="text-[15px] font-semibold text-[#0F172A]">Dekripsi Ciphertext ChaCha20</h2>
          </div>

          <div className="mb-5">
            <label className="block text-[12px] font-medium text-[#0F172A] mb-2">
              Ciphertext (Hex)
            </label>
            <textarea
              value={ciphertext}
              onChange={(event) => setCiphertext(event.target.value)}
              placeholder="Masukkan ciphertext hex..."
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-[8px] text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#7C3AED] bg-[#F8FAFC] resize-none"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
            <div>
              <label className="block text-[12px] font-medium text-[#0F172A] mb-2">
                Key (32 byte)
              </label>
              <input
                type="text"
                value={key}
                onChange={(event) => setKey(event.target.value)}
                placeholder="1234567890ABCDEF1234567890ABCDEF"
                className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-[8px] text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>
            <div>
              <label className="block text-[12px] font-medium text-[#0F172A] mb-2">
                Nonce (12 byte)
              </label>
              <input
                type="text"
                value={nonce}
                onChange={(event) => setNonce(event.target.value)}
                placeholder="NONCE-123456"
                className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-[8px] text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
              />
            </div>
          </div>

          <div className="mb-5">
            <label className="block text-[12px] font-medium text-[#0F172A] mb-2">
              Counter
            </label>
            <input
              type="text"
              inputMode="numeric"
              value={counter}
              onChange={(event) => setCounter(event.target.value)}
              placeholder="0"
              className="w-full px-3 py-2.5 border border-[#E2E8F0] rounded-[8px] text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#7C3AED]"
            />
          </div>

          {!validation.isValid && (ciphertext || key || nonce || counter !== '0') && (
            <div className="mb-5 p-3 bg-red-50 border border-red-200 rounded-[8px] flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
              <p className="text-[12px] text-red-700">{validation.error}</p>
            </div>
          )}

          <button
            onClick={handleStartDecryption}
            disabled={!validation.isValid}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-[10px] bg-gradient-to-r from-[#7C3AED] to-[#8B5CF6] text-white text-[13px] font-medium shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
          >
            <Zap className="w-4 h-4" />
            Mulai Dekripsi ChaCha20
          </button>
        </div>

        <div className="mt-6 text-center text-[12px] text-[#64748B]">
          Gunakan key, nonce, dan counter yang sama persis seperti saat enkripsi.
        </div>
      </div>
    </div>
  );
}
