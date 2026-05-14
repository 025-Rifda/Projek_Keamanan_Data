import { useState } from 'react';
import { Lock, Pencil, FileText, Copy, Eye, Zap, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAlgorithm } from '../context/AlgorithmContext';
import { encryptDES, decryptDES } from '../utils/des';
import { encryptChaCha20, decryptChaCha20 } from '../utils/chacha20';

export function EnkripsiPage() {
  const { algorithm, setAlgorithm, plaintext: contextPlaintext, setPlaintext: setContextPlaintext, key: contextKey, setKey: setContextKey, nonce: contextNonce, setNonce: setContextNonce } = useAlgorithm();
  const [mode, setMode] = useState<'encrypt' | 'decrypt'>('encrypt');
  const [plaintext, setPlaintext] = useState(contextPlaintext);
  const [key, setKey] = useState(contextKey);
  const [nonce, setNonce] = useState(contextNonce);
  const [result, setResult] = useState('');
  const [inputLength, setInputLength] = useState(0);
  const [outputLength, setOutputLength] = useState(0);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const keyLength = algorithm === 'DES' ? 8 : 32;
  const keyPlaceholder = algorithm === 'DES' ? 'MYKEY123' : 'MYKEY123MYKEY123MYKEY123MYKEY123';
  const processedInput = mode === 'decrypt' ? plaintext.replace(/\s+/g, '').trim() : plaintext;
  const visualizationAvailable = mode === 'encrypt' || algorithm === 'DES';
  const canOpenVisualization = result.length > 0 && visualizationAvailable;

  const isHex = (value: string) => /^[0-9A-Fa-f]+$/.test(value);
  const resetProcessState = () => {
    setResult('');
    setInputLength(0);
    setOutputLength(0);
    setError('');
  };

  const handleProcess = () => {
    setError('');

    if (!processedInput) {
      setError('Input tidak boleh kosong');
      return;
    }

    if (key.length !== keyLength) {
      setError(`Kunci harus ${keyLength} karakter`);
      return;
    }

    if (algorithm === 'DES' && mode === 'encrypt' && processedInput.length > 8) {
      setError('DES pada aplikasi ini memproses 1 blok saja, maksimal 8 karakter plaintext');
      return;
    }

    if (algorithm === 'ChaCha20' && nonce.length < 1) {
      setError('Nonce tidak boleh kosong untuk ChaCha20');
      return;
    }

    if (mode === 'decrypt') {
      if (!isHex(processedInput)) {
        setError('Ciphertext dekripsi harus dalam format hex');
        return;
      }

      if (algorithm === 'DES' && processedInput.length !== 16) {
        setError('Ciphertext DES harus tepat 16 karakter hex');
        return;
      }

      if (algorithm === 'ChaCha20' && processedInput.length % 2 !== 0) {
        setError('Ciphertext ChaCha20 harus berjumlah genap dalam format hex');
        return;
      }
    }

    // Sync to context for visualization
    if (mode === 'encrypt') {
      setContextPlaintext(processedInput);
      setContextKey(key);
      if (algorithm === 'ChaCha20') {
        setContextNonce(nonce);
      }
    }

    try {
      let resultText = '';

      if (algorithm === 'DES') {
        if (mode === 'encrypt') {
          resultText = encryptDES(processedInput, key);
          setInputLength(processedInput.length);
          setOutputLength(resultText.length / 2); // hex is 2 chars per byte
        } else {
          resultText = decryptDES(processedInput.toUpperCase(), key);
          setInputLength(processedInput.length / 2);
          setOutputLength(resultText.length);
        }
      } else {
        // ChaCha20
        if (mode === 'encrypt') {
          resultText = encryptChaCha20(processedInput, key, nonce);
          setInputLength(processedInput.length);
          setOutputLength(resultText.length / 2);
        } else {
          resultText = decryptChaCha20(processedInput.toUpperCase(), key, nonce);
          setInputLength(processedInput.length / 2);
          setOutputLength(resultText.length);
        }
      }

      setResult(resultText);
    } catch (err) {
      setError('Terjadi kesalahan saat memproses data');
      console.error(err);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(result);
  };

  const handleVisualize = () => {
    if (!canOpenVisualization) return;

    if (mode === 'encrypt') {
      setContextPlaintext(processedInput);
      setContextKey(key);
      if (algorithm === 'ChaCha20') {
        setContextNonce(nonce);
      }
      navigate('/visualisasi');
      return;
    }

    navigate('/visualisasi-dekripsi/des', {
      state: { ciphertext: processedInput.toUpperCase(), key, mode: 'decrypt' },
    });
  };

  return (
    <div className="w-full min-h-[calc(100vh-56px)] bg-[#F8FAFC] p-4 md:p-6">
      <div className="max-w-[1200px] mx-auto">
        {/* Algorithm Selector */}
        <div className="mb-4 flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3">
          <span className="text-[13px] text-[#64748B]">Pilih Algoritma:</span>
          <div className="flex rounded-[10px] border border-[#E2E8F0] overflow-hidden bg-white">
            <button
              onClick={() => {
                setAlgorithm('DES');
                resetProcessState();
              }}
              className={`px-5 py-2.5 text-[13px] font-medium transition-all flex items-center gap-2 ${
                algorithm === 'DES'
                  ? 'bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white'
                  : 'bg-white text-[#64748B] hover:bg-[#F8FAFC]'
              }`}
            >
              <Lock className="w-4 h-4" />
              DES (64-bit)
            </button>
            <button
              onClick={() => {
                setAlgorithm('ChaCha20');
                resetProcessState();
              }}
              className={`px-5 py-2.5 text-[13px] font-medium transition-all flex items-center gap-2 border-l border-[#E2E8F0] ${
                algorithm === 'ChaCha20'
                  ? 'bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white'
                  : 'bg-white text-[#64748B] hover:bg-[#F8FAFC]'
              }`}
            >
              <Zap className="w-4 h-4" />
              ChaCha20 (256-bit)
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left Card - Input */}
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5">
            <div className="flex items-center gap-2 mb-5">
              <Pencil className="w-4 h-4 text-[#64748B]" />
              <h2 className="text-[14px] font-medium text-[#0F172A]">Input</h2>
            </div>

          {/* Mode Toggle */}
          <div className="flex rounded-[8px] border border-[#E2E8F0] mb-5 overflow-hidden">
            <button
              onClick={() => {
                setMode('encrypt');
                resetProcessState();
              }}
              className={`flex-1 py-2 text-[13px] font-medium transition-colors ${
                mode === 'encrypt'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-transparent text-[#64748B]'
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
                mode === 'decrypt'
                  ? 'bg-[#2563EB] text-white'
                  : 'bg-transparent text-[#64748B]'
              }`}
            >
              Dekripsi
            </button>
          </div>

          {/* Plaintext Input */}
          <div className="mb-4">
            <label className="block text-[11px] text-[#64748B] mb-2">
              {mode === 'encrypt' ? 'Plaintext' : 'Ciphertext'}
            </label>
            <textarea
              value={plaintext}
              onChange={(e) => {
                setPlaintext(e.target.value);
                resetProcessState();
              }}
              placeholder={
                mode === 'encrypt'
                  ? 'Masukkan plaintext...'
                  : algorithm === 'DES'
                  ? 'Masukkan ciphertext hex 16 karakter...'
                  : 'Masukkan ciphertext hex...'
              }
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-[7px] text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB] resize-none"
              rows={3}
            />
          </div>

          {/* Key Input */}
          <div className="mb-4">
            <label className="block text-[11px] text-[#64748B] mb-2">
              Key ({keyLength} karakter)
            </label>
            <input
              type="text"
              value={key}
              onChange={(e) => {
                setKey(e.target.value.slice(0, keyLength));
                resetProcessState();
              }}
              maxLength={keyLength}
              placeholder={keyPlaceholder}
              className="w-full px-3 py-2 border border-[#E2E8F0] rounded-[7px] text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
            <div className="text-[10px] text-[#64748B] mt-1">
              {key.length}/{keyLength} karakter
            </div>
          </div>

          {/* Nonce Input (ChaCha20 only) */}
          {algorithm === 'ChaCha20' && (
            <div className="mb-4">
              <label className="block text-[11px] text-[#64748B] mb-2">
                Nonce (12 karakter max)
              </label>
              <input
                type="text"
                value={nonce}
                onChange={(e) => {
                  setNonce(e.target.value.slice(0, 12));
                  resetProcessState();
                }}
                maxLength={12}
                placeholder="NONCE123"
                className="w-full px-3 py-2 border border-[#E2E8F0] rounded-[7px] text-[13px] font-mono focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              />
              <div className="text-[10px] text-[#64748B] mt-1">
                {nonce.length}/12 karakter
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-[8px] flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <p className="text-[12px] text-red-700">{error}</p>
            </div>
          )}

          {/* Process Button */}
          <button
            onClick={handleProcess}
            disabled={!processedInput || key.length !== keyLength || (algorithm === 'ChaCha20' && nonce.length < 1)}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[8px] bg-gradient-to-r from-[#2563EB] to-[#3B82F6] text-white text-[13px] font-medium hover:shadow-lg hover:shadow-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {algorithm === 'DES' ? <Lock className="w-4 h-4" /> : <Zap className="w-4 h-4" />}
            {mode === 'encrypt' ? 'Enkripsi sekarang' : 'Dekripsi sekarang'}
          </button>
        </div>

          {/* Right Card - Result */}
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5">
          <div className="flex items-center gap-2 mb-5">
            <FileText className="w-4 h-4 text-[#64748B]" />
            <h2 className="text-[14px] font-medium text-[#0F172A]">
              Hasil {mode === 'encrypt' ? 'Enkripsi' : 'Dekripsi'}
            </h2>
          </div>

          {/* Result Display */}
          <div className="bg-[#F8FAFF] border border-[#BFDBFE] rounded-[8px] p-3 mb-4 min-h-[80px] relative">
            <pre className="text-[12px] font-mono text-[#1D4ED8] whitespace-pre-wrap break-all">
              {result || `Hasil ${mode === 'encrypt' ? 'enkripsi' : 'dekripsi'} akan muncul di sini...`}
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

          {/* Stats Grid */}
          <div className="grid grid-cols-1 xs:grid-cols-2 gap-3 mb-5">
            <div className="bg-[#F8FAFC] rounded-[8px] p-3">
              <div className="text-[11px] text-[#64748B] mb-1">Panjang input</div>
              <div className="text-[18px] font-medium text-[#0F172A]">{inputLength}</div>
            </div>
            <div className="bg-[#F8FAFC] rounded-[8px] p-3">
              <div className="text-[11px] text-[#64748B] mb-1">Panjang output</div>
              <div className="text-[18px] font-medium text-[#0F172A]">{outputLength}</div>
            </div>
          </div>

            {/* Visualization Button */}
            <button
              onClick={handleVisualize}
              disabled={!canOpenVisualization}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-[8px] border border-[#E2E8F0] bg-transparent text-[#0F172A] text-[13px] font-medium hover:bg-[#F8FAFC] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Eye className="w-4 h-4" />
              {mode === 'decrypt' && algorithm === 'DES'
                ? 'Lihat visualisasi dekripsi'
                : mode === 'decrypt'
                ? 'Visualisasi tersedia untuk mode enkripsi'
                : 'Lihat visualisasi proses'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
