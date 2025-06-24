export default async function handler(req, res) {
  const address = "stars1psaaa8z5twqgs4ahgqdxwl86eydmlwhevugcdx";
  const url = `https://rest.stargaze-apis.com/cosmos/tx/v1beta1/txs?events=transfer.recipient=${address}&order_by=ORDER_BY_DESC&limit=50`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (!response.ok || !data.tx_responses) {
      throw new Error("Invalid response from Stargaze API");
    }

    res.status(200).json(data);
  } catch (error) {
    res.status(500).json({
      error: "Ошибка при получении транзакций Stargaze",
      details: error.message,
    });
  }
}
