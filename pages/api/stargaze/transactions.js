// 📁 pages/api/stargaze/transactions.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const address = 'stars1psaaa8z5twqgs4ahgqdxwl86eydmlwhevugcdx';
const LCD = 'https://lcd.stargaze-apis.com';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const response = await axios.get(`${LCD}/cosmos/tx/v1beta1/txs?events=message.sender='${address}'&order_by=2&limit=50`);
    const txs = response.data.tx_responses.slice(0, 50);

    const filtered = txs.map((tx: any) => {
      const logs = tx.logs[0]?.events.find((e: any) => e.type === 'transfer')?.attributes || [];

      const from = logs.find((a: any) => a.key === 'sender')?.value || '';
      const to = logs.find((a: any) => a.key === 'recipient')?.value || '';
      const rawAmount = logs.find((a: any) => a.key === 'amount')?.value || '';

      const match = rawAmount.match(/(\d+)([a-zA-Z]+)/);
      const amount = match ? (parseFloat(match[1]) / 1_000_000).toFixed(2) : '0.00';
      const denom = match ? match[2] : '';

      const isIncoming = to === address;

      return {
        hash: tx.txhash,
        from,
        to,
        amount,
        denom,
        success: tx.code === 0,
        timestamp: tx.timestamp,
        direction: isIncoming ? 'incoming' : 'outgoing',
      };
    });

    res.status(200).json({ transactions: filtered });
  } catch (error) {
    console.error('Ошибка получения транзакций Stargaze:', error);
    res.status(500).json({ error: 'Ошибка получения транзакций Stargaze' });
  }
}

