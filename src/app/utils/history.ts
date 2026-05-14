export interface CryptoHistoryItem {
  id: number;
  algorithm: 'DES' | 'ChaCha20';
  mode: 'encrypt' | 'decrypt';
  plaintext: string;
  ciphertext: string;
  key: string;
  nonce?: string;
  counter?: string;
  timestamp: string;
}

const STORAGE_KEY = 'crypto-visualization-history';

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined';
}

export function loadCryptoHistory(): CryptoHistoryItem[] {
  if (!canUseStorage()) {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCryptoHistory(history: CryptoHistoryItem[]): void {
  if (!canUseStorage()) {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
}

export function appendCryptoHistory(item: Omit<CryptoHistoryItem, 'id' | 'timestamp'>): void {
  const currentHistory = loadCryptoHistory();
  const nextHistory: CryptoHistoryItem[] = [
    {
      ...item,
      id: Date.now(),
      timestamp: new Date().toISOString(),
    },
    ...currentHistory,
  ].slice(0, 50);

  saveCryptoHistory(nextHistory);
}
