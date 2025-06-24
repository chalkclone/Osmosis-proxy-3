export default async function handler(req, res) {
  const address = "osmo1psaaa8z5twqgs4ahgqdxwl86eydmlwhesmv4s9";
  const url = `https://osmosis-api.polkachu.com/cosmos/tx/v1beta1/txs?events=transfer.recipient='${address}'&order_by=ORDER_BY_DESC&limit=5`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error("Ошибка при получении транзакций Osmosis");
    }
    const data = await response.json();
console.log("Osmosis transactions response:", JSON.stringify(data, null, 2));

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
