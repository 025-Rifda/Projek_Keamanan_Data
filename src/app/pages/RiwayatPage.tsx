import { useState } from 'react';
import { Clock, Copy, Eye, Trash2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface HistoryItem {
  id: number;
  plaintext: string;
  ciphertext: string;
  key: string;
  timestamp: string;
  mode: 'encrypt' | 'decrypt';
}

const mockHistory: HistoryItem[] = [
  {
    id: 1,
    plaintext: 'HELLO123',
    ciphertext: 'A3F48C2DB1E79A40',
    key: 'MYKEY123',
    timestamp: '2026-05-12 14:30:15',
    mode: 'encrypt',
  },
  {
    id: 2,
    plaintext: 'SECRET99',
    ciphertext: '7E921DB4F5C3A068',
    key: 'PASS1234',
    timestamp: '2026-05-12 13:15:42',
    mode: 'encrypt',
  },
  {
    id: 3,
    plaintext: 'TEST5678',
    ciphertext: '9B4D2E8F1A6C3B7D',
    key: 'KEY98765',
    timestamp: '2026-05-12 11:05:22',
    mode: 'encrypt',
  },
];

export function RiwayatPage() {
  const [history, setHistory] = useState<HistoryItem[]>(mockHistory);
  const navigate = useNavigate();

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const handleDelete = (id: number) => {
    setHistory(history.filter((item) => item.id !== id));
  };

  const handleViewVisualization = () => {
    navigate('/visualisasi');
  };

  return (
    <div className="w-full min-h-[calc(100vh-56px)] bg-[#F8FAFC] p-4 md:p-6">
      <div className="max-w-[1000px] mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[20px] font-medium text-[#0F172A] mb-2">Riwayat Enkripsi</h1>
          <p className="text-[13px] text-[#64748B]">
            Lihat semua aktivitas enkripsi dan dekripsi yang telah dilakukan
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5">
            <div className="text-[11px] text-[#64748B] mb-1">Total Enkripsi</div>
            <div className="text-[24px] font-medium text-[#0F172A]">{history.length}</div>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5">
            <div className="text-[11px] text-[#64748B] mb-1">Hari ini</div>
            <div className="text-[24px] font-medium text-[#0F172A]">3</div>
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-5">
            <div className="text-[11px] text-[#64748B] mb-1">Minggu ini</div>
            <div className="text-[24px] font-medium text-[#0F172A]">12</div>
          </div>
        </div>

        {/* History List */}
        <div className="space-y-3">
          {history.length === 0 ? (
            <div className="bg-white border border-[#E2E8F0] rounded-[12px] p-12 text-center">
              <Clock className="w-12 h-12 text-[#CBD5E1] mx-auto mb-3" />
              <p className="text-[14px] text-[#64748B] mb-1">Belum ada riwayat</p>
              <p className="text-[12px] text-[#94A3B8]">
                Mulai enkripsi untuk melihat riwayat di sini
              </p>
            </div>
          ) : (
            history.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-[#E2E8F0] rounded-[12px] p-5 hover:border-[#2563EB] transition-colors"
              >
                <div className="flex flex-col md:flex-row items-start justify-between gap-3 md:gap-0 mb-4">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="px-2.5 py-1 rounded-[6px] bg-[#EFF6FF] border border-[#BFDBFE]">
                      <span className="text-[11px] font-medium text-[#1D4ED8]">
                        {item.mode === 'encrypt' ? 'Enkripsi' : 'Dekripsi'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-[#64748B]">
                      <Clock className="w-3.5 h-3.5" />
                      {item.timestamp}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleViewVisualization}
                      className="p-2 rounded-[6px] border border-[#E2E8F0] hover:bg-[#F8FAFC] transition-colors"
                      title="Lihat visualisasi"
                    >
                      <Eye className="w-4 h-4 text-[#64748B]" />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-2 rounded-[6px] border border-[#E2E8F0] hover:bg-[#FEE2E2] hover:border-[#FCA5A5] transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4 text-[#DC2626]" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Plaintext */}
                  <div>
                    <div className="text-[11px] text-[#64748B] mb-1.5">Plaintext</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] px-3 py-2">
                        <p className="text-[12px] font-mono text-[#0F172A] truncate">
                          {item.plaintext}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopy(item.plaintext)}
                        className="p-2 hover:bg-[#F8FAFC] rounded-[6px] transition-colors"
                        title="Salin"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#64748B]" />
                      </button>
                    </div>
                  </div>

                  {/* Ciphertext */}
                  <div>
                    <div className="text-[11px] text-[#64748B] mb-1.5">Ciphertext</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[#F8FAFF] border border-[#BFDBFE] rounded-[6px] px-3 py-2">
                        <p className="text-[12px] font-mono text-[#1D4ED8] truncate">
                          {item.ciphertext}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopy(item.ciphertext)}
                        className="p-2 hover:bg-[#F8FAFC] rounded-[6px] transition-colors"
                        title="Salin"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#64748B]" />
                      </button>
                    </div>
                  </div>

                  {/* Key */}
                  <div>
                    <div className="text-[11px] text-[#64748B] mb-1.5">Key</div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-[6px] px-3 py-2">
                        <p className="text-[12px] font-mono text-[#0F172A] truncate">
                          {item.key}
                        </p>
                      </div>
                      <button
                        onClick={() => handleCopy(item.key)}
                        className="p-2 hover:bg-[#F8FAFC] rounded-[6px] transition-colors"
                        title="Salin"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#64748B]" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
