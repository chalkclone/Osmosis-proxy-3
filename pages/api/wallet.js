export default async function handler(req, res) {
const address = 'osmo1psaaa8z5twqgs4ahgqdxwl86eydmlwhesmv4s9';

try {
const txRes = await fetch(https://api-osmosis.imperator.co/accounts/v1/txs/${address});
const txData = await txRes.json();
const balanceRes = await fetch(`https://api-osmosis.imperator.co/accounts/v1/balance/${address}`);
const balanceData = await balanceRes.json();

res.setHeader('Access-Control-Allow-Origin', '*');
res.status(200).json({
  address,
  balance: balanceData?.available || null,
  transactions: txData || [],
});
} catch (error) {
res.status(500).json({ error: 'Failed to fetch data', details: error.message });
}
}
