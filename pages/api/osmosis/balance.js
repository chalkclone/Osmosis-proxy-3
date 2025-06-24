export default async function handler(req, res) {
  const address = "osmo1psaaa8z5twqgs4ahgqdxwl86eydmlwhesmv4s9";
 const url = `https://osmosis-api.polkachu.com/cosmos/bank/v1beta1/balances/${address}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Ошибка при получении баланса Osmosis");
    const data = await response.json();
    res.status(200).json({ balances: data.balances });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
