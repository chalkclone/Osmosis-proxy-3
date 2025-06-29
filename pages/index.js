// 📁 pages/index.tsx

import { useEffect, useState } from 'react';
import axios from 'axios';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

const NETWORKS = [
  {
    name: 'Osmosis',
    address: 'osmo1psaaa8z5twqgs4ahgqdxwl86eydmlwhesmv4s9',
    color: 'purple',
    logo: '/osmosis.png',
  },
  {
    name: 'Stargaze',
    address: 'stars1psaaa8z5twqgs4ahgqdxwl86eydmlwhevugcdx',
    color: 'red',
    logo: '/stargaze.png',
  },
];

interface Transaction {
  hash: string;
  from: string;
  to: string;
  amount: string;
  denom: string;
  success: boolean;
  timestamp: string;
  direction: 'incoming' | 'outgoing';
}

export default function Home() {
  const [transactions, setTransactions] = useState<Record<string, Transaction[]>>({});
  const [activeTab, setActiveTab] = useState<'incoming' | 'outgoing'>('incoming');

  useEffect(() => {
    const fetchTransactions = async () => {
      const data: Record<string, Transaction[]> = {};

      for (const network of NETWORKS) {
        try {
          const res = await axios.get(`/api/${network.name.toLowerCase()}/transactions`);
          data[network.name] = res.data.transactions.slice(0, 20); // последние 20
        } catch (err) {
          console.error(`Error fetching ${network.name} transactions`, err);
        }
      }

      setTransactions(data);
    };

    fetchTransactions();
  }, []);

  return (
    <main className="min-h-screen flex items-center justify-center bg-gray-900 text-white px-4 py-10">
      <div className="w-full max-w-4xl space-y-8">
        <h1 className="text-4xl font-bold text-center">Транзакции</h1>

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'incoming' | 'outgoing')} className="w-full">
          <TabsList className="flex justify-center gap-4">
            <TabsTrigger value="incoming">Входящие</TabsTrigger>
            <TabsTrigger value="outgoing">Исходящие</TabsTrigger>
          </TabsList>

          {NETWORKS.map((network) => (
            <TabsContent key={network.name} value={activeTab} className="space-y-4">
              <h2 className={`text-2xl font-semibold border-b pb-2 border-${network.color}-500`}>
                <span style={{ color: network.color }}>{network.name}</span>
              </h2>
              <ScrollArea className="h-[600px] w-full pr-4">
                {transactions[network.name]?.filter(tx => tx.direction === activeTab).map((tx) => (
                  <Card
                    key={tx.hash}
                    className={`mb-4 border-l-8 ${tx.success ? 'bg-green-800/30 border-green-400' : 'bg-red-800/30 border-red-400'}`}
                  >
                    <CardContent className="p-4 relative">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <img src={network.logo} alt={network.name} className="w-6 h-6" />
                          <span className="text-lg font-medium tracking-wide">{tx.amount} {tx.denom.toUpperCase()}</span>
                        </div>
                        <span className="text-sm text-white/70">{new Date(tx.timestamp).toLocaleString()}</span>
                      </div>
                      <div className="text-base tracking-wide">
                        {tx.direction === 'incoming' ? 'От: ' : 'Кому: '} {tx.direction === 'incoming' ? tx.from : tx.to}
                      </div>
                      <div className="absolute bottom-2 right-2 text-2xl">
                        {tx.success ? '✅' : '❌'}
                      </div>
                    </CardContent>
                  </Card>
                )) || <div>Нет данных</div>}
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </main>
  );
}


