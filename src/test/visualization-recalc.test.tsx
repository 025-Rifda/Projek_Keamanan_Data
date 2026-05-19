import type { ContextType } from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AlgorithmContext } from '../app/context/AlgorithmContext';
import { VisualisasiPage } from '../app/pages/VisualisasiPage';

function createContextValue(overrides: Partial<NonNullable<ContextType<typeof AlgorithmContext>>> = {}) {
  return {
    algorithm: 'DES' as const,
    setAlgorithm: vi.fn(),
    plaintext: 'ABCDEFGH',
    setPlaintext: vi.fn(),
    key: '12345678',
    setKey: vi.fn(),
    ...overrides,
  };
}

describe('dynamic visualization recalculation', () => {
  it('updates DES visualization when plaintext changes', () => {
    const { rerender } = render(
      <MemoryRouter>
        <AlgorithmContext.Provider value={createContextValue()}>
          <VisualisasiPage />
        </AlgorithmContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByText(/01000001 01000010 01000011 01000100 01000101 01000110 01000111 01001000/i)).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <AlgorithmContext.Provider value={createContextValue({ plaintext: 'IJKLMNOP' })}>
          <VisualisasiPage />
        </AlgorithmContext.Provider>
      </MemoryRouter>,
    );

    expect(screen.getByText(/01001001 01001010 01001011 01001100 01001101 01001110 01001111 01010000/i)).toBeInTheDocument();
  });
});
