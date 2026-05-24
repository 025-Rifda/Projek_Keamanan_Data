import { useEffect, useMemo, useState } from 'react';
import { Lock, Pencil, FileText, Copy, Eye, AlertCircle, LoaderCircle, ShieldCheck } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAlgorithm } from '../context/AlgorithmContext';
import { useTheme } from '../context/ThemeContext';
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
  const { isDark } = useTheme();
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

        :root {
          --bg-gradient-start-light: #F0F4FF;
          --bg-gradient-end-light: transparent;
          --bg-solid-light: var(--bg-primary);
          --card-bg-light: var(--bg-card);
          --card-border-light: var(--border-color);
          --text-primary-light: var(--text-primary);
          --text-secondary-light: var(--text-secondary);
          --text-muted-light: var(--text-muted);
          --input-bg-light: var(--bg-input);
          --input-border-light: var(--border-color);
          --accent-light: #2563EB;
          --accent-gradient-start-light: #2563EB;
          --accent-gradient-end-light: #4F46E5;
          --result-bg-light: #F0F7FF;
          --result-border-light: #BFDBFE;
          --result-text-light: #1D4ED8;
          --error-bg-light: #FEF2F2;
          --error-border-light: #FECACA;
          --error-text-light: #B91C1C;
          --stat-bg-light: #F8FAFC;
          --stat-border-light: #E2E8F0;
          --mode-toggle-bg-light: #F8FAFC;
          --mode-toggle-border-light: #E2E8F0;
          --icon-bg-light: #EEF2FF;
          --shadow-sm-light: 0 2px 12px rgba(37,99,235,0.06), 0 1px 2px rgba(0,0,0,0.04);
          --shadow-md-light: 0 6px 24px rgba(37,99,235,0.10), 0 2px 4px rgba(0,0,0,0.05);
          --shadow-button-light: 0 4px 16px rgba(37,99,235,0.28);
        }

        .dark {
          --bg-gradient-start-dark: var(--bg-primary);
          --bg-gradient-end-dark: #020617;
          --bg-solid-dark: var(--bg-primary);
          --card-bg-dark: var(--bg-card);
          --card-border-dark: var(--border-color);
          --text-primary-dark: var(--text-primary);
          --text-secondary-dark: var(--text-secondary);
          --text-muted-dark: var(--text-muted);
          --input-bg-dark: var(--bg-input);
          --input-border-dark: var(--border-color);
          --accent-dark: #3B82F6;
          --accent-gradient-start-dark: #3B82F6;
          --accent-gradient-end-dark: #6366F1;
          --result-bg-dark: #1E293B;
          --result-border-dark: #3B82F6;
          --result-text-dark: #60A5FA;
          --error-bg-dark: #2D1A1A;
          --error-border-dark: #7F2D2D;
          --error-text-dark: #F87171;
          --stat-bg-dark: #0F172A;
          --stat-border-dark: #334155;
          --mode-toggle-bg-dark: #0F172A;
          --mode-toggle-border-dark: #334155;
          --icon-bg-dark: #1E293B;
          --shadow-sm-dark: 0 2px 12px rgba(0,0,0,0.3), 0 1px 2px rgba(0,0,0,0.2);
          --shadow-md-dark: 0 6px 24px rgba(0,0,0,0.4), 0 2px 4px rgba(0,0,0,0.3);
          --shadow-button-dark: 0 4px 16px rgba(59,130,246,0.4);
        }

        .enkripsi-page {
          font-family: 'Sora', sans-serif;
          background: var(--bg-solid-light);
          background-image: radial-gradient(ellipse at 20% 0%, rgba(37, 99, 235, 0.07) 0%, transparent 60%),
                            radial-gradient(ellipse at 80% 100%, rgba(99, 102, 241, 0.06) 0%, transparent 60%);
          min-height: calc(100vh - 56px);
          transition: background 0.3s ease;
        }

        .dark .enkripsi-page {
          background: var(--bg-solid-dark);
          background-image: radial-gradient(ellipse at 20% 0%, rgba(59, 130, 246, 0.15) 0%, transparent 60%),
                            radial-gradient(ellipse at 80% 100%, rgba(99, 102, 241, 0.12) 0%, transparent 60%);
        }

        .font-mono {
          font-family: 'IBM Plex Mono', monospace !important;
        }

        .card {
          background: var(--card-bg-light);
          border: 1px solid var(--card-border-light);
          border-radius: 16px;
          box-shadow: var(--shadow-sm-light);
          transition: box-shadow 0.2s, background 0.3s, border-color 0.3s;
        }

        .dark .card {
          background: var(--card-bg-dark);
          border-color: var(--card-border-dark);
          box-shadow: var(--shadow-sm-dark);
        }

        .card:hover {
          box-shadow: var(--shadow-md-light);
        }

        .dark .card:hover {
          box-shadow: var(--shadow-md-dark);
        }

        .algo-badge {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 8px 18px;
          border-radius: 999px;
          background: linear-gradient(135deg, var(--accent-gradient-start-light), var(--accent-gradient-end-light));
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.01em;
          box-shadow: 0 4px 14px rgba(37,99,235,0.30);
          border: none;
          cursor: pointer;
          transition: opacity 0.2s;
        }

        .dark .algo-badge {
          background: linear-gradient(135deg, var(--accent-gradient-start-dark), var(--accent-gradient-end-dark));
          box-shadow: 0 4px 14px rgba(59,130,246,0.4);
        }

        .algo-badge:hover {
          opacity: 0.9;
        }

        .mode-toggle {
          display: flex;
          border-radius: 10px;
          border: 1.5px solid var(--mode-toggle-border-light);
          overflow: hidden;
          background: var(--mode-toggle-bg-light);
        }

        .dark .mode-toggle {
          border-color: var(--mode-toggle-border-dark);
          background: var(--mode-toggle-bg-dark);
        }

        .mode-btn {
          flex: 1;
          padding: 9px 0;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          border: none;
          background: transparent;
          color: var(--text-secondary-light);
          transition: all 0.18s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 6px;
          font-family: 'Sora', sans-serif;
        }

        .dark .mode-btn {
          color: var(--text-secondary-dark);
        }

        .mode-btn.active {
          background: linear-gradient(135deg, var(--accent-gradient-start-light), var(--accent-gradient-end-light));
          color: #fff;
          box-shadow: 0 2px 8px rgba(37,99,235,0.18);
        }

        .dark .mode-btn.active {
          background: linear-gradient(135deg, var(--accent-gradient-start-dark), var(--accent-gradient-end-dark));
        }

        .mode-btn:not(.active):hover {
          background: #EEF2FF;
          color: var(--accent-light);
        }

        .dark .mode-btn:not(.active):hover {
          background: #1E293B;
          color: var(--accent-dark);
        }

        .field-label {
          font-size: 11px;
          font-weight: 600;
          color: var(--text-secondary-light);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 6px;
          display: block;
        }

        .dark .field-label {
          color: var(--text-secondary-dark);
        }

        .text-input, .key-input {
          width: 100%;
          padding: 10px 12px;
          border: 1.5px solid var(--input-border-light);
          border-radius: 9px;
          font-size: 13px;
          font-family: 'IBM Plex Mono', monospace !important;
          background: var(--input-bg-light);
          color: var(--text-primary-light);
          outline: none;
          transition: border-color 0.18s, box-shadow 0.18s, background 0.3s, color 0.3s;
          box-sizing: border-box;
        }

        .dark .text-input, 
        .dark .key-input {
          background: var(--input-bg-dark);
          border-color: var(--input-border-dark);
          color: var(--text-primary-dark);
        }

        .text-input:focus, .key-input:focus {
          border-color: var(--accent-light);
          box-shadow: 0 0 0 3px rgba(37,99,235,0.12);
          background: #fff;
        }

        .dark .text-input:focus, 
        .dark .key-input:focus {
          border-color: var(--accent-dark);
          box-shadow: 0 0 0 3px rgba(59,130,246,0.2);
          background: var(--input-bg-dark);
        }

        .text-input {
          resize: none;
        }

        .byte-hint {
          font-size: 10px;
          color: var(--text-muted-light);
          margin-top: 5px;
          font-family: 'IBM Plex Mono', monospace;
        }

        .dark .byte-hint {
          color: var(--text-muted-dark);
        }

        .byte-hint span {
          color: var(--accent-light);
          font-weight: 600;
        }

        .dark .byte-hint span {
          color: var(--accent-dark);
        }

        .process-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px;
          border-radius: 10px;
          background: linear-gradient(135deg, var(--accent-gradient-start-light), var(--accent-gradient-end-light));
          color: #fff;
          font-size: 13px;
          font-weight: 600;
          border: none;
          cursor: pointer;
          letter-spacing: 0.01em;
          box-shadow: var(--shadow-button-light);
          transition: transform 0.15s, box-shadow 0.15s, opacity 0.15s;
          font-family: 'Sora', sans-serif;
        }

        .dark .process-btn {
          background: linear-gradient(135deg, var(--accent-gradient-start-dark), var(--accent-gradient-end-dark));
          box-shadow: var(--shadow-button-dark);
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
          background: var(--result-bg-light);
          border: 1.5px solid var(--result-border-light);
          border-radius: 10px;
          padding: 14px;
          min-height: 96px;
          position: relative;
          transition: background 0.3s, border-color 0.3s;
        }

        .dark .result-box {
          background: var(--result-bg-dark);
          border-color: var(--result-border-dark);
        }

        .result-box pre {
          font-size: 13px;
          font-family: 'IBM Plex Mono', monospace;
          color: var(--result-text-light);
          white-space: pre-wrap;
          word-break: break-all;
          margin: 0;
          line-height: 1.6;
        }

        .dark .result-box pre {
          color: var(--result-text-dark);
        }

        .result-box .empty-text {
          color: var(--text-muted-light);
          font-size: 13px;
          font-family: 'IBM Plex Mono', monospace;
          font-style: italic;
        }

        .dark .result-box .empty-text {
          color: var(--text-muted-dark);
        }

        .copy-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          padding: 5px 8px;
          border-radius: 6px;
          border: 1px solid var(--result-border-light);
          background: var(--card-bg-light);
          color: var(--accent-light);
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          font-weight: 500;
          transition: all 0.15s;
          font-family: 'Sora', sans-serif;
        }

        .dark .copy-btn {
          border-color: var(--result-border-dark);
          background: var(--card-bg-dark);
          color: var(--accent-dark);
        }

        .copy-btn:hover {
          background: #EFF6FF;
          border-color: #93C5FD;
        }

        .dark .copy-btn:hover {
          background: #1E293B;
          border-color: #60A5FA;
        }

        .stat-card {
          background: var(--stat-bg-light);
          border: 1px solid var(--stat-border-light);
          border-radius: 10px;
          padding: 14px 16px;
          flex: 1;
          transition: background 0.3s, border-color 0.3s;
        }

        .dark .stat-card {
          background: var(--stat-bg-dark);
          border-color: var(--stat-border-dark);
        }

        .stat-card .stat-label {
          font-size: 10px;
          font-weight: 600;
          color: var(--text-secondary-light);
          letter-spacing: 0.08em;
          text-transform: uppercase;
          margin-bottom: 4px;
        }

        .dark .stat-card .stat-label {
          color: var(--text-secondary-dark);
        }

        .stat-card .stat-value {
          font-size: 26px;
          font-weight: 700;
          color: var(--text-primary-light);
          line-height: 1;
          font-family: 'IBM Plex Mono', monospace;
        }

        .dark .stat-card .stat-value {
          color: var(--text-primary-dark);
        }

        .stat-card .stat-unit {
          font-size: 10px;
          color: var(--text-muted-light);
          margin-top: 3px;
          font-family: 'IBM Plex Mono', monospace;
        }

        .dark .stat-card .stat-unit {
          color: var(--text-muted-dark);
        }

        .visualize-btn {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 11px;
          border-radius: 10px;
          border: 1.5px solid var(--card-border-light);
          background: transparent;
          color: var(--text-secondary-light);
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.15s;
          font-family: 'Sora', sans-serif;
        }

        .dark .visualize-btn {
          border-color: var(--card-border-dark);
          color: var(--text-secondary-dark);
        }

        .visualize-btn:hover:not(:disabled) {
          background: #EEF2FF;
          border-color: #C7D2FE;
          color: var(--accent-light);
        }

        .dark .visualize-btn:hover:not(:disabled) {
          background: #1E293B;
          border-color: #818CF8;
          color: var(--accent-dark);
        }

        .visualize-btn:disabled {
          opacity: 0.45;
          cursor: not-allowed;
        }

        .visualize-btn-ready:not(:disabled) {
          border-color: #60A5FA;
          background: #EFF6FF;
          color: var(--accent-light);
          animation: visualizeBlink 1.15s ease-in-out infinite;
        }

        .dark .visualize-btn-ready:not(:disabled) {
          border-color: #3B82F6;
          background: #0F172A;
          color: var(--accent-dark);
        }

        .visualize-btn-ready:not(:disabled) svg {
          animation: visualizeIconBlink 1.15s ease-in-out infinite;
        }

        .error-box {
          display: flex;
          align-items: flex-start;
          gap: 8px;
          padding: 10px 12px;
          background: var(--error-bg-light);
          border: 1px solid var(--error-border-light);
          border-radius: 8px;
          margin-bottom: 14px;
        }

        .dark .error-box {
          background: var(--error-bg-dark);
          border-color: var(--error-border-dark);
        }

        .error-box p {
          font-size: 12px;
          color: var(--error-text-light);
          margin: 0;
          line-height: 1.5;
        }

        .dark .error-box p {
          color: var(--error-text-dark);
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
          background: var(--icon-bg-light);
          display: flex;
          align-items: center;
          justify-content: center;
          color: var(--accent-light);
          flex-shrink: 0;
          transition: background 0.3s;
        }

        .dark .section-header .icon-wrap {
          background: var(--icon-bg-dark);
          color: var(--accent-dark);
        }

        .section-header h2 {
          font-size: 15px;
          font-weight: 600;
          color: var(--text-primary-light);
          margin: 0;
        }

        .dark .section-header h2 {
          color: var(--text-primary-dark);
        }

        .format-hint {
          font-size: 11px;
          color: var(--text-muted-light);
          margin-top: -10px;
          margin-bottom: 16px;
          padding-left: 2px;
        }

        .dark .format-hint {
          color: var(--text-muted-dark);
        }

        .no-viz-note {
          border-radius: 10px;
          border: 1px dashed var(--card-border-light);
          background: var(--stat-bg-light);
          padding: 12px 14px;
          font-size: 12px;
          color: var(--text-muted-light);
          line-height: 1.6;
          text-align: center;
          transition: background 0.3s, border-color 0.3s, color 0.3s;
        }

        .dark .no-viz-note {
          border-color: var(--card-border-dark);
          background: var(--stat-bg-dark);
          color: var(--text-muted-dark);
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

        @keyframes visualizeBlink {
          0%, 100% {
            box-shadow: 0 0 0 0 rgba(37,99,235,0.35), 0 0 0 rgba(37,99,235,0);
            transform: translateY(0);
          }
          50% {
            box-shadow: 0 0 0 4px rgba(37,99,235,0.16), 0 8px 22px rgba(37,99,235,0.28);
            transform: translateY(-1px);
          }
        }

        @keyframes visualizeIconBlink {
          0%, 100% { opacity: 0.65; }
          50% { opacity: 1; }
        }

        @media (prefers-reduced-motion: reduce) {
          .visualize-btn-ready:not(:disabled),
          .visualize-btn-ready:not(:disabled) svg {
            animation: none;
          }
        }

        .spin {
          animation: spin 0.8s linear infinite;
        }
      `}</style>

      <div className="enkripsi-page" style={{ padding: '28px 16px' }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>

          {/* Header with Algorithm Badge */}
          <div style={{ textAlign: 'center', marginBottom: 28, display: 'flex', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
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
                  <AlertCircle size={15} color={isDark ? '#F87171' : '#EF4444'} style={{ flexShrink: 0, marginTop: 1 }} />
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
                  type="button"
                  className={`visualize-btn ${canOpenVisualization ? 'visualize-btn-ready' : ''}`}
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
