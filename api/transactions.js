export default async function handler(req, res) {
  const wallet = "osmo1psaaa8z5twqgs4ahgqdxwl86eydmlwhesmv4s9";
  const apiUrl = `https://osmosis-api.polkachu.com/cosmos/tx/v1beta1/txs?query=transfer.recipient='${wallet}'&order_by=ORDER_BY_DESC&limit=5`;

  try {
    const response = await fetch(apiUrl);
    if (!response.ok) {
      throw new Error(`Ошибка при получении данных: ${response.statusText}`);
    }
    const data = await response.json();
    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
