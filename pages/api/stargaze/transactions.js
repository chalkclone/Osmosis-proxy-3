import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  const address = 'stars1psaaa8z5twqgs4ahgqdxwl86eydmlwhevugcdx';
  const query = encodeURIComponent(`events=transfer.recipient='${address}'`);
  const url = `https://rest.stargaze-apis.com/cosmos/tx/v1beta1/txs?query=${query}&pagination.limit=50&pagination.reverse=true`;

  try {
    const resp = await fetch(url);
    const data = await resp.json();

    if (!resp.ok || !data.tx_responses) {
      throw new Error('Invalid Stargaze API response');
    }

    res.status(200).json(data);
  } catch (err: any) {
    console.error('Stargaze fetch error:', err);
    res.status(500).json({

