// 📁 pages/api/osmosis/transactions.js
import axios from 'axios';

const address = 'osmo1psaaa8z5twqgs4ahgqdxwl86eydmlwhesmv4s9';

export default async function handler(req, res) {
  try {
    const result = await axios.get(`https://api-osmosis.imperator.co/txs/v1/account/${address}`);
    const txs = result.data.txs.map((tx) => ({
      hash: tx.txhash,
      from: tx.sender,
      to: tx.recipient,
      amount: tx.amount,
      denom: tx.denom,
      timestamp: tx.timestamp,
      status: tx.code === 0 ? 'success' : 'failed',
      direction: tx.recipient === address ? 'incoming' : 'outgoing',
    }));
    res.status(200).json(txs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch Osmosis transactions' });
  }
}

