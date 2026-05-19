import { useEffect, useMemo, useState } from 'react';
import { Lock, Pencil, FileText, Copy, Eye, AlertCircle, LoaderCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAlgorithm } from '../context/AlgorithmContext';
import { decryptDES, encryptDES } from '../utils/des';
import { appendCryptoHistory } from '../utils/history';
import {
  getByteLength,
  normalizeHexInput,
  validateDESDecryptInput,
  validateDESEncryptInput,
} from '../utils/validation';

type UjiCobaRouteState = {
  mode?: 'encrypt' | 'decrypt';
  algorithm?: 'DES';
  input?: string;
  key?: string;
};

export function EnkripsiPage() {
  const location = useLocation();
  const routeState = (location.state as UjiCobaRouteState | null) ?? null;
  const {
    algorithm,
    setAlgorithm,
    plaintext,
    setPlaintext,
    key,
    setKey,
  } = useAlgorithm();
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>(routeState?.mode ?? 'encrypt');
  const [result, setResult] = useState('');
  const [inputLength, setInputLength] = useState(0);
  const [outputLength, setOutputLength] = useState(0);
  const [error, setError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!routeState) {
      return;
    }

    if (routeState.mode) {
      setMode(routeState.mode);
    }
    if (routeState.algorithm) {
      setAlgorithm(routeState.algorithm);
    }
    if (routeState.input !== undefined) {
      setPlaintext(routeState.input);
    }
    if (routeState.key !== undefined) {
      setKey(routeState.key);
    }

    setResult('');
    setInputLength(0);
    setOutputLength(0);
    setError('');
  }, [routeState, setAlgorithm, setPlaintext, setKey]);

  const normalizedInput = mode === 'decrypt' ? normalizeHexInput(plaintext) : plaintext;
  const keyLength = 8;
  const keyPlaceholder = 'MYKEY123';

  const validation = useMemo(() => {
    return mode === 'encrypt'
      ? validateDESEncryptInput(plaintext, key)
      : validateDESDecryptInput(plaintext, key);
  }, [mode, plaintext, key]);

  const canOpenVisualization = mode === 'encrypt' && result.length > 0 && !error;

  const resetProcessState = () => {
    setResult('');
    setInputLength(0);
    setOutputLength(0);
    setError('');
  };

  const emptyStateText = mode === 'decrypt'
    ? 'Masukkan ciphertext dan key untuk melakukan dekripsi.'
    : 'Masukkan plaintext dan key untuk melihat proses.';

  const handleProcess = async () => {
    if (!validation.isValid) {
      setError(validation.error ?? 'Input belum valid.');
      return;
    }

    setIsProcessing(true);
    setError('');

    try {
      let nextResult = '';

      if (mode === 'encrypt') {
        nextResult = encryptDES(plaintext, key);
        setInputLength(getByteLength(plaintext));
        setOutputLength(nextResult.length / 2);
      } else {
        nextResult = decryptDES(normalizedInput, key);
        setInputLength(normalizedInput.length / 2);
        setOutputLength(getByteLength(nextResult));
      }

      setResult(nextResult);
      appendCryptoHistory({
        algorithm,
        mode,
        plaintext: mode === 'encrypt' ? plaintext : nextResult,
        ciphertext: mode === 'encrypt' ? nextResult : normalizedInput,
        key,
      });
    } catch (processError) {
      console.error(processError);
      setError('Terjadi kesalahan saat memproses data. Periksa kembali input yang digunakan.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
  };

  const handleVisualize = () => {
    if (!canOpenVisualization) {
      return;
    }

    navigate('/visualisasi');
  };

  return (
    <div className="w-full min-h-[calc(100vh-56px)] bg-[#F8FAFC] p-4 md:p-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="mb-4 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3">
          <span className="text-[13px] text-[#64748B]">Algoritma aktif:</span>
          <div className="flex rounded-[10px] border border-[#E2E8F0] overflow-hidden bg-white">
            <button
              onClick={() => {
                setAlgorithm('DES');
                resetProcessState();
              }}
              className="px-5 py-2.5 text-[13px] font-medium transition-all flex items-center gap-2 bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white"
            >
              <Lock className="w-4 h-4" />
              DES (64-bit)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5">
            <div className="flex items-center gap-2 mb-5">
              <Pencil className="w-4 h-4 text-[#64748B]" />
              <h2 className="text-[14px] font-medium text-[#0F172A]">Input</h2>
            </div>

            <div className="flex rounded-[8px] border border-[#E2E8F0] mb-5 overflow-hidden">
              <button
                onClick={() => {
                  setMode('encrypt');
                  resetProcessState();
                }}
                className={`flex-1 py-2 text-[13px] font-medium transition-colors ${
                  mode === 'encrypt' ? 'bg-[#2563EB] text-white' : 'bg-transparent text-[#64748B]'
                }`}
              >
                Enkripsi
              </button>
              <button
                onClick={() => {
                  setMode('decrypt');
                  resetProcessState();
                }}
                className={`flex-1 py-2 text-[13px] font-medium transition-colors ${
                  mode === 'decrypt' ? 'bg-[#2563EB] text-white' : 'bg-transparent text-[#64748B]'
                }`}
              >
                Dekripsi
              </button>
            </div>

            <div className="mb-4">
              <label className="block text-[11px] text-[#64748B] mb-2">
                {mode === 'encrypt' ? 'Plaintext' : 'Ciphertext'}
              </label>
              <textarea
                value={plaintext}
                onChange={(event) => {
                  setPlaintext(event.target.value);
                  resetProcessState();
                }}
                placeholder={
                  mode === 'encrypt'
                    ? 'Masukkan plaintext tepat 8 byte...'
                    : 'Masukkan ciphertext hex 16 karakter...'
                }
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-[7px] text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none"
                rows={3}
              />
              <div className="text-[10px] text-[#64748B] mt-1">
                {mode === 'encrypt' ? `${getByteLength(plaintext)} byte` : `${normalizedInput.length} karakter`}
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-[11px] text-[#64748B] mb-2">
                Key ({keyLength} byte)
              </label>
              <input
                type="text"
                value={key}
                onChange={(event) => {
                  setKey(event.target.value);
                  resetProcessState();
                }}
                placeholder={keyPlaceholder}
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-[7px] text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
              <div className="text-[10px] text-[#64748B] mt-1">
                {getByteLength(key)}/{keyLength} byte
              </div>
            </div>

            {(error || (!validation.isValid && (plaintext || key))) && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[8px] flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-[12px] text-red-700">{error || validation.error}</p>
              </div>
            )}

            <button
              onClick={() => {
                void handleProcess();
              }}
              disabled={isProcessing}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[8px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white text-[13px] font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isProcessing ? (
                <LoaderCircle className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {isProcessing ? 'Memproses...' : mode === 'encrypt' ? 'Enkripsi sekarang' : 'Dekripsi sekarang'}
            </button>
          </div>

          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5">
            <div className="flex items-center gap-2 mb-5">
              <FileText className="w-4 h-4 text-[#64748B]" />
              <h2 className="text-[14px] font-medium text-[#0F172A]">
                Hasil {mode === 'encrypt' ? 'Enkripsi' : 'Dekripsi'}
              </h2>
            </div>

            <div className="bg-[#F8FAFF] border border-[#BFDBFE] rounded-[8px] p-3 mb-4 min-h-[112px] relative">
              <pre className="text-[12px] font-mono text-[#1D4ED8] whitespace-pre-wrap break-all">
                {result || emptyStateText}
              </pre>
              {result && (
                <button
                  onClick={handleCopy}
                  className="absolute top-2 right-2 px-2 py-1 text-[11px] text-[#64748B] hover:text-[#0F172A] transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 mb-5">
              <div className="bg-[#F8FAFC] rounded-[8px] p-3">
                <div className="text-[11px] text-[#64748B] mb-1">Panjang input</div>
                <div className="text-[18px] font-medium text-[#0F172A]">{inputLength}</div>
                <div className="text-[10px] text-[#94A3B8]">byte</div>
              </div>
              <div className="bg-[#F8FAFC] rounded-[8px] p-3">
                <div className="text-[11px] text-[#64748B] mb-1">Panjang output</div>
                <div className="text-[18px] font-medium text-[#0F172A]">{outputLength}</div>
                <div className="text-[10px] text-[#94A3B8]">byte</div>
              </div>
            </div>

            {mode === 'encrypt' ? (
              <button
                onClick={handleVisualize}
                disabled={!canOpenVisualization}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[8px] border border-[#E2E8F0] bg-transparent text-[#0F172A] text-[13px] font-medium hover:bg-[#F8FAFC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Eye className="w-4 h-4" />
                Lihat visualisasi proses
              </button>
            ) : (
              <div className="rounded-[8px] border border-[#E2E8F0] bg-[#F8FAFC] px-3 py-2.5 text-[12px] text-[#64748B]" style={{ lineHeight: 1.6 }}>
                Dekripsi ditampilkan sebagai input dan output normal tanpa visualisasi langkah internal.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
