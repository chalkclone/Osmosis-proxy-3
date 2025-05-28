export default async function handler(req, res) {
const address = 'osmo1psaaa8z5twqgs4ahgqdxwl86eydmlwhesmv4s9';

try {
// Получаем баланс с Polkachu
const balanceRes = await fetch(https://osmosis-api.polkachu.com/cosmos/bank/v1beta1/balances/${address});
const balanceData = await balanceRes.json();
// Получаем транзакции с Imperator API (если нужно, можно заменить или удалить)
const txRes = await fetch(`https://api-osmosis.imperator.co/accounts/v1/txs/${address}`);
const txData = await txRes.json();

res.setHeader('Access-Control-Allow-Origin', '*');
res.status(200).json({
  address,
  balance: balanceData?.balances || [],
  transactions: txData?.txs || [],
});
} catch (error) {
res.status(500).json({ error: 'Failed to fetch data', details: error.message });
}
}
