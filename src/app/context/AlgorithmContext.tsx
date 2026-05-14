import { createContext, useContext, useState, ReactNode } from 'react';

type Algorithm = 'DES' | 'ChaCha20';

interface AlgorithmContextType {
  algorithm: Algorithm;
  setAlgorithm: (algo: Algorithm) => void;
  plaintext: string;
  setPlaintext: (text: string) => void;
  key: string;
  setKey: (key: string) => void;
  nonce: string;
  setNonce: (nonce: string) => void;
  counter: string;
  setCounter: (counter: string) => void;
}

export const AlgorithmContext = createContext<AlgorithmContextType | undefined>(undefined);

export function AlgorithmProvider({ children }: { children: ReactNode }) {
  const [algorithm, setAlgorithm] = useState<Algorithm>('DES');
  const [plaintext, setPlaintext] = useState('');
  const [key, setKey] = useState('');
  const [nonce, setNonce] = useState('');
  const [counter, setCounter] = useState('0');

  return (
    <AlgorithmContext.Provider
      value={{
        algorithm,
        setAlgorithm,
        plaintext,
        setPlaintext,
        key,
        setKey,
        nonce,
        setNonce,
        counter,
        setCounter,
      }}
    >
      {children}
    </AlgorithmContext.Provider>
  );
}

export function useAlgorithm() {
  const context = useContext(AlgorithmContext);
  if (!context) {
    throw new Error('useAlgorithm must be used within AlgorithmProvider');
  }
  return context;
}
