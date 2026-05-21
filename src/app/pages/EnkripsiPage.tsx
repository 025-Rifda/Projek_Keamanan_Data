import { useEffect, useMemo, useState } from 'react';
import { Lock, Pencil, FileText, Copy, Eye, AlertCircle, LoaderCircle, ShieldCheck } from 'lucide-react';
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
  const [copied, setCopied] = useState(false);
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
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleVisualize = () => {
    if (!canOpenVisualization) {
      return;
    }
    navigate('/visualisasi');
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&family=Sora:wght@400;500;600;700&display=swap');

        .enkripsi-page * {
          font-family: 'Sora', sans-serif;
        }
        .enkripsi-page .font-mono {
          font-family: 'IBM Plex Mono', monospace !important;
        }

        .enkripsi-page {
          background: #F0F4FF;
          background-image:
            radial-gradient(ellipse at 20% 0%, rgba(37, 99, 235, 0.07) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 100%, rgba(99, 102, 241, 0.06) 0%, transparent 60%);
          min-height: calc(100vh - 56px);
        }

        .card {
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 16px;
          box-shadow: 0 2px 12px rgba(37,99,235,0.06), 0 1px 2px rgba(0,0,0,0.04);
          transition: box-shadow 0.2s;
        }
        .card:hover {
          box-shadow: 0 6px 24px rgba(37,99,235,0.10), 0 2px 4px rgba(0,0,0,0.05);
        }

        .algo-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border-radius: 999px;
          background: linear-gradient(135deg, #2563EB 0%, #4F46E5 100%);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.01em;
          box-shadow: 0 4px 14px rgba(37,99,235,0.30);
        }

        .mode-toggle {
          display: flex;
          border-radius: 10px;
          border: 1.5px solid #E2E8F0;
          overflow: hidden;
          background: #F8FAFC;
        }
        .mode-btn {
          flex: 1;
          padding: 9px 0;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: transparent;
          color: #64748B;
          transition: all 0.18s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-family: 'Sora', sans-serif;
        }
        .mode-btn.active {
          background: linear-gradient(135deg, #2563EB 0%, #4F46E5 100%);
          color: #fff;
          box-shadow: 0 2px 8px rgba(37,99,235,0.18);
        }
        .mode-btn:not(.active):hover {
          background: #EEF2FF;
          color: #2563EB;
        }

        .field-label {
          font-size: 11px;
          font-weight: 600;
          color: #64748B;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 6px;
          display: block;
        }

        .text-input, .key-input {
          width: 100%;
          padding: 10px 12px;
          border: 1.5px solid #E2E8F0;
          border-radius: 9px;
          font-size: 13px;
          font-family: 'IBM Plex Mono', monospace !important;
          background: #FAFBFF;
          color: #0F172A;
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.18s;
          box-sizing: border-box;
        }
        .text-input:focus, .key-input:focus {
          border-color: #2563EB;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
          background: #fff;
        }
        .text-input {
          resize: none;
        }

        .byte-hint {
          font-size: 10px;
          color: #94A3B8;
          margin-top: 5px;
          font-family: 'IBM Plex Mono', monospace;
        }
        .byte-hint span {
          color: #2563EB;
          font-weight: 600;
        }

        .process-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 10px;
          background: linear-gradient(135deg, #2563EB 0%, #4F46E5 100%);
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          letter-spacing: 0.01em;
          box-shadow: 0 4px 16px rgba(37,99,235,0.28);
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          font-family: 'Sora', sans-serif;
        }
        .process-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 20px rgba(37,99,235,0.35);
        }
        .process-btn:active:not(:disabled) {
          transform: translateY(0);
        }
        .process-btn:disabled {
          opacity: 0.55;
          cursor: not-allowed;
        }

        .result-box {
          background: linear-gradient(135deg, #F0F7FF 0%, #EEF2FF 100%);
          border: 1.5px solid #BFDBFE;
          border-radius: 10px;
          padding: 14px;
          min-height: 96px;
          position: relative;
        }
        .result-box pre {
          font-size: 13px;
          font-family: 'IBM Plex Mono', monospace;
          color: #1D4ED8;
          white-space: pre-wrap;
          word-break: break-all;
          margin: 0;
          line-height: 1.6;
        }
        .result-box .empty-text {
          color: #93C5FD;
          font-size: 13px;
          font-family: 'IBM Plex Mono', monospace;
          font-style: italic;
        }

        .copy-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 5px 8px;
          border-radius: 6px;
          border: 1px solid #BFDBFE;
          background: #fff;
          color: #2563EB;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 500;
          transition: all 0.15s;
          font-family: 'Sora', sans-serif;
        }
        .copy-btn:hover {
          background: #EFF6FF;
          border-color: #93C5FD;
        }

        .stat-card {
          background: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 14px 16px;
          flex: 1;
        }
        .stat-card .stat-label {
          font-size: 10px;
          font-weight: 600;
          color: #94A3B8;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }
        .stat-card .stat-value {
          font-size: 26px;
          font-weight: 700;
          color: #0F172A;
          line-height: 1;
          font-family: 'IBM Plex Mono', monospace;
        }
        .stat-card .stat-unit {
          font-size: 10px;
          color: #94A3B8;
          margin-top: 3px;
          font-family: 'IBM Plex Mono', monospace;
        }

        .visualize-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px;
          border-radius: 10px;
          border: 1.5px solid #E2E8F0;
          background: transparent;
          color: #334155;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'Sora', sans-serif;
        }
        .visualize-btn:hover:not(:disabled) {
          background: #EEF2FF;
          border-color: #C7D2FE;
          color: #2563EB;
        }
        .visualize-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .error-box {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 12px;
          background: #FEF2F2;
          border: 1px solid #FECACA;
          border-radius: 8px;
          margin-bottom: 14px;
        }
        .error-box p {
          font-size: 12px;
          color: #B91C1C;
          margin: 0;
          line-height: 1.5;
        }

        .section-header {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }
        .section-header .icon-wrap {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          background: #EEF2FF;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #2563EB;
          flex-shrink: 0;
        }
        .section-header h2 {
          font-size: 15px;
          font-weight: 600;
          color: #0F172A;
          margin: 0;
        }

        .format-hint {
          font-size: 11px;
          color: #94A3B8;
          margin-top: -10px;
          margin-bottom: 16px;
          padding-left: 2px;
        }

        .no-viz-note {
          border-radius: 10px;
          border: 1px dashed #CBD5E1;
          background: #F8FAFC;
          padding: 12px 14px;
          font-size: 12px;
          color: #94A3B8;
          line-height: 1.6;
          text-align: center;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-in {
          animation: fadeIn 0.3s ease forwards;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }
        .spin {
          animation: spin 0.8s linear infinite;
        }
      `}</style>

      <div className="enkripsi-page" style={{ padding: '28px 16px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>

          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: 28 }}>
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <span style={{ fontSize: 12, color: '#94A3B8', fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase' }}>Algoritma</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button
                onClick={() => { setAlgorithm('DES'); resetProcessState(); }}
                className="algo-badge"
              >
                <Lock size={14} />
                DES (64-bit)
              </button>
            </div>
          </div>

          {/* Main grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>

            {/* Input card */}
            <div className="card animate-in" style={{ padding: '24px' }}>
              <div className="section-header">
                <div className="icon-wrap">
                  <Pencil size={15} />
                </div>
                <h2>Input</h2>
              </div>

              {/* Mode toggle */}
              <div className="mode-toggle" style={{ marginBottom: 22 }}>
                <button
                  className={`mode-btn ${mode === 'encrypt' ? 'active' : ''}`}
                  onClick={() => { setMode('encrypt'); resetProcessState(); }}
                >
                  <Lock size={13} />
                  Enkripsi
                </button>
                <button
                  className={`mode-btn ${mode === 'decrypt' ? 'active' : ''}`}
                  onClick={() => { setMode('decrypt'); resetProcessState(); }}
                >
                  <ShieldCheck size={13} />
                  Dekripsi
                </button>
              </div>

              {/* Plaintext / Ciphertext input */}
              <div style={{ marginBottom: 18 }}>
                <label className="field-label">
                  {mode === 'encrypt' ? 'Plaintext' : 'Ciphertext'}
                </label>
                <textarea
                  value={plaintext}
                  onChange={(e) => { setPlaintext(e.target.value); resetProcessState(); }}
                  placeholder={
                    mode === 'encrypt'
                      ? 'Masukkan plaintext tepat 8 byte...'
                      : 'Masukkan ciphertext hex 16 karakter...'
                  }
                  className="text-input font-mono"
                  rows={3}
                />
                <div className="byte-hint">
                  {mode === 'encrypt'
                    ? <><span>{getByteLength(plaintext)}</span> / 8 byte</>
                    : <><span>{normalizedInput.length}</span> karakter</>
                  }
                </div>
              </div>

              {/* Key input */}
              <div style={{ marginBottom: 18 }}>
                <label className="field-label">
                  Kunci ({keyLength} byte / 64-bit)
                </label>
                <input
                  type="text"
                  value={key}
                  onChange={(e) => { setKey(e.target.value); resetProcessState(); }}
                  placeholder={keyPlaceholder}
                  className="key-input font-mono"
                />
                <div className="byte-hint">
                  <span>{getByteLength(key)}</span> / {keyLength} byte
                </div>
              </div>

              {/* Error */}
              {(error || (!validation.isValid && (plaintext || key))) && (
                <div className="error-box">
                  <AlertCircle size={15} color="#EF4444" style={{ flexShrink: 0, marginTop: 1 }} />
                  <p>{error || validation.error}</p>
                </div>
              )}

              {/* Process button */}
              <button
                className="process-btn"
                onClick={() => { void handleProcess(); }}
                disabled={isProcessing}
              >
                {isProcessing ? (
                  <LoaderCircle size={15} className="spin" />
                ) : (
                  <Lock size={15} />
                )}
                {isProcessing
                  ? 'Memproses...'
                  : mode === 'encrypt' ? 'Enkripsi Sekarang' : 'Dekripsi Sekarang'
                }
              </button>
            </div>

            {/* Output card */}
            <div className="card animate-in" style={{ padding: '24px', animationDelay: '0.06s' }}>
              <div className="section-header">
                <div className="icon-wrap">
                  <FileText size={15} />
                </div>
                <h2>Hasil {mode === 'encrypt' ? 'Enkripsi' : 'Dekripsi'}</h2>
              </div>

              {/* Result display */}
              <div className="result-box" style={{ marginBottom: 8 }}>
                {result ? (
                  <>
                    <pre>{result}</pre>
                    <button className="copy-btn" onClick={handleCopy}>
                      <Copy size={12} />
                      {copied ? 'Disalin!' : 'Salin'}
                    </button>
                  </>
                ) : (
                  <span className="empty-text">{emptyStateText}</span>
                )}
              </div>

              {mode === 'encrypt' && (
                <div className="format-hint">
                  Format: Hexadecimal — setiap 2 karakter = 1 byte
                </div>
              )}

              {/* Stats */}
              <div style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                <div className="stat-card">
                  <div className="stat-label">Panjang Input</div>
                  <div className="stat-value">{inputLength}</div>
                  <div className="stat-unit">byte</div>
                </div>
                <div className="stat-card">
                  <div className="stat-label">Panjang Output</div>
                  <div className="stat-value">{outputLength}</div>
                  <div className="stat-unit">byte</div>
                </div>
              </div>

              {/* Visualize / note */}
              {mode === 'encrypt' ? (
                <button
                  className="visualize-btn"
                  onClick={handleVisualize}
                  disabled={!canOpenVisualization}
                >
                  <Eye size={15} />
                  Lihat Visualisasi Proses
                </button>
              ) : (
                <div className="no-viz-note">
                  Dekripsi ditampilkan sebagai input dan output normal —<br />
                  visualisasi langkah internal tidak tersedia.
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </>
  );
}