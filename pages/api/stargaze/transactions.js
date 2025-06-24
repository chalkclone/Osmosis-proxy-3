export default async function handler(req, res) {
  const address = "stars1psaaa8z5twqgs4ahgqdxwl86eydmlwhevugcdx";
  const query = encodeURIComponent(`events=transfer.recipient='${address}'`);
const url = `https://rest.stargaze-apis.com/cosmos/tx/v1beta1/txs?events=transfer.recipient=${address}&order_by=ORDER_BY_DESC&limit=50`;
  try {
    const resp = await fetch(url);
    const data = await resp.json();

    if (!resp.ok || !data.tx_responses) {
      throw new Error("Invalid Stargaze API response");
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Stargaze transactions fetch error", details: err.message });
  }
}
