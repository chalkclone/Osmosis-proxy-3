export default async function handler(req, res) {
  const lcdUrl = "https://lcd-osmosis.blockapsis.com"; // Рабочий LCD endpoint
  const wallet = "osmo1psaaa8z5twqgs4ahgqdxwl86eydmlwhesmv4s9";

  try {
    const balanceResp = await fetch(`${lcdUrl}/cosmos/bank/v1beta1/balances/${wallet}`);
    if (!balanceResp.ok) throw new Error("Ошибка при получении баланса");

    const balances = await balanceResp.json();
    res.status(200).json({ balances });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
