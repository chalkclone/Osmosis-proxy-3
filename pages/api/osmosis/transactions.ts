// 📁 pages/api/osmosis/transactions.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const address = 'osmo1psaaa8z5twqgs4ahgqdxwl86eydmlwhesmv4s9';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const result = await axios.get(
      `https://api-osmosis.imperator.co/txs/v1/account/${address}`
    );

    const txs = result.data.txs.slice(0, 20).map((tx: any) => {
      const isIncoming = tx.to_address === address;

      return {
        hash: tx.txhash,
        from: tx.from_address,
        to: tx.to_address,
        amount: (parseFloat(tx.amount.amount) / 1_000_000).toFixed(2),
        denom: tx.amount.denom,
        success: tx.code === 0,
        timestamp: tx.timestamp,
        direction: isIncoming ? 'incoming' : 'outgoing',
      };
    });

    res.status(200).json({ transactions: txs });
  } catch (error) {
    console.error('Ошибка получения транзакций Osmosis:', error);
    res.status(500).json({ error: 'Ошибка получения транзакций Osmosis' });
  }
}
