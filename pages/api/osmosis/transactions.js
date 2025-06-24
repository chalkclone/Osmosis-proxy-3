export default async function handler(req, res) {
  const address = "osmo1psaaa8z5twqgs4ahgqdxwl86eydmlwhesmv4s9";
  const url = `https://osmosis-api.polkachu.com/cosmos/tx/v1beta1/txs?events=transfer.recipient=${address}&order_by=ORDER_BY_DESC&limit=50`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.tx_responses) {
      throw new Error("Invalid response from Osmosis API");
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: "Ошибка при получении транзакций Osmosis",
      details: error.message,
    });
  }
}
