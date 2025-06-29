import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const address = 'stars1psaaa8z5twqgs4ahgqdxwl86eydmlwhevugcdx';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { data } = await axios.get(
      `https://rest.stargaze-apis.com/cosmos/tx/v1beta1/txs?events=transfer.recipient='${address}'&order_by=ORDER_BY_DESC&limit=20`
    );

    const transactions = data.tx_responses.map((tx: any) => ({
      hash: tx.txhash,
      from: tx.tx.body?.messages?.[0]?.from_address || 'unknown',
      to: tx.tx.body?.messages?.[0]?.to_address || 'unknown',
      amount: tx.tx.body?.messages?.[0]?.amount?.[0]?.amount || '0',
      denom: tx.tx.body?.messages?.[0]?.amount?.[0]?.denom || '',
      success: tx.code === 0,
      timestamp: tx.timestamp,
    }));

    res.status(200).json({ transactions });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch Stargaze transactions' });
  }
}
