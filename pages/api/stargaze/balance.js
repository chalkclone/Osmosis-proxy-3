import axios from 'axios';

const STARGAZE_LCD = 'https://lcd.stargaze-apis.com';
const address = 'stars1psaaa8z5twqgs4ahgqdxwl86eydmlwhevugcdx'; // Замени на свой адрес, если нужно

export default async function handler(req, res) {
  try {
    const balancesRes = await axios.get(`${STARGAZE_LCD}/cosmos/bank/v1beta1/balances/${address}`);
    const balances = balancesRes.data.balances.filter(b => parseFloat(b.amount) > 0);

    const prettyBalances = balances.map(b => ({
      denom: b.denom,
      amount: parseFloat(b.amount) / 1e6,
    }));

    res.status(200).json({ balances: prettyBalances });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Ошибка при получении баланса Stargaze' });
  }
}
