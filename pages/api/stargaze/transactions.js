// Файл: pages/api/stargaze/transactions.js

export default async function handler(req, res) {
  const address = "stars1psaaa8z5twqgs4ahgqdxwl86eydmlwhevugcdx";
  const url = `https://rest.stargaze-apis.com/cosmos/tx/v1beta1/txs?events=transfer.recipient='${address}'&order_by=ORDER_BY_DESC&limit=5`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error("Ошибка при получении транзакций Stargaze");
    const data = await response.json();
console.log("Stargaze transactions response:", JSON.stringify(data, null, 2));

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
