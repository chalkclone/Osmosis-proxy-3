// 📁 pages/index.tsx
import { useEffect, useState } from 'react';
import axios from 'axios';
import Image from 'next/image';

interface Transaction {
  hash: string;
  from: string;
  to: string;
  amount: string;
  denom: string;
  success: boolean;
  timestamp: string;
}

export default function Home() {
  const [osmosisTxs, setOsmosisTxs] = useState<Transaction[]>([]);
  const [stargazeTxs, setStargazeTxs] = useState<Transaction[]>([]);
  const [view, setView] = useState<'incoming' | 'outgoing'>('incoming');

  useEffect(() => {
    fetch('/api/osmosis/transactions')
      .then(res => res.json())
      .then(data => setOsmosisTxs(data.transactions));

    fetch('/api/stargaze/transactions')
      .then(res => res.json())
      .then(data => setStargazeTxs(data.transactions));
  }, []);

  const allTxs = [...osmosisTxs, ...stargazeTxs].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const filteredTxs = allTxs.filter(tx =>
    view === 'incoming' ? tx.to.includes('psaaa8z') : tx.from.includes('psaaa8z')
  );

  const getNetworkLogo = (tx: Transaction) => {
    return tx.to.startsWith('osmo') || tx.from.startsWith('osmo') ? '/osmosis.png' : '/stargaze.png';
  };

  const formatAmount = (amount: string, denom: string) => {
    const amt = Number(amount) / 1_000_000;
    return `${amt.toFixed(2)} ${denom.toUpperCase()}`;
  };

  return (
    <main className="min-h-screen bg-black text-white p-6">
      <h1 className="text-3xl font-bold mb-4">Транзакции</h1>
      <div className="flex space-x-4 mb-4">
        <button
          onClick={() => setView('incoming')}
          className={`px-4 py-2 rounded-xl ${view === 'incoming' ? 'bg-green-600' : 'bg-gray-700'}`}
        >
          Входящие
        </button>
        <button
          onClick={() => setView('outgoing')}
          className={`px-4 py-2 rounded-xl ${view === 'outgoing' ? 'bg-red-600' : 'bg-gray-700'}`}
        >
          Исходящие
        </button>
      </div>

      <div className="grid gap-4">
        {filteredTxs.map(tx => (
          <div
            key={tx.hash}
            className={`relative border p-4 rounded-2xl shadow-lg ${
              tx.success ? 'bg-green-900/40 border-green-500' : 'bg-red-900/40 border-red-500'
            }`}
          >
            <div className="absolute top-2 left-2">
              <Image src={getNetworkLogo(tx)} alt="logo" width={24} height={24} />
            </div>
            <div className="absolute bottom-2 right-2 text-2xl">
              {tx.success ? '✅' : '❌'}
            </div>
            <div className="text-sm break-all">
              <p><strong>Hash:</strong> {tx.hash}</p>
              <p><strong>От:</strong> {tx.from}</p>
              <p><strong>Кому:</strong> {tx.to}</p>
              <p><strong>Сумма:</strong> {formatAmount(tx.amount, tx.denom)}</p>
              <p><strong>Время:</strong> {new Date(tx.timestamp).toLocaleString()}</p>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}



