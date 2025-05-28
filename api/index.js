export default async function handler(req, res) {
  const lcdBalanceUrl = "https://osmosis-api.polkachu.com/cosmos/bank/v1beta1/balances/osmo1psaaa8z5twqgs4ahgqdxwl86eydmlwhesmv4s9";

  try {
    const response = await fetch(lcdBalanceUrl);

    if (!response.ok) {
      throw new Error("Ошибка при запросе баланса");
    }

    const data = await response.json();

    res.status(200).json({ balances: data.balances });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

