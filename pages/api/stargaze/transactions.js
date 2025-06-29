// 📁 pages/api/stargaze/transactions.js
import axios from 'axios';

const address = 'stars1psaaa8z5twqgs4ahgqdxwl86eydmlwhevugcdx';

export default async function handler(req, res) {
  try {
    const { data } = await axios.get(`https://rest.stargaze-apis.com/cosmos/tx/v1beta1/txs?events=message.sender='${address}'&limit=50`);
    const txs = data.tx_responses.map((tx) => {
      const msg = tx.tx.body.messages[0];
      const from = msg.from_address || msg.sender || 'unknown';
      const to = msg.to_address || msg.recipient || 'unknown';
      return {
        hash: tx.txhash,
        from,
        to,
        amount: 'n/a',
        denom: 'STARS',
        timestamp: tx.timestamp,
        status: tx.code === 0 ? 'success' : 'failed',
        direction: from === address ? 'outgoing' : 'incoming',
      };
    });
    res.status(200).json(txs);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch Stargaze transactions' });
  }
}

