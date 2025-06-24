export default async function handler(req, res) {
  const address = "osmo1psaaa8z5twqgs4ahgqdxwl86eydmlwhesmv4s9";
  const query = encodeURIComponent(`events=transfer.recipient='${address}'`);
  const url = `https://osmosis-api.polkachu.com/cosmos/tx/v1beta1/txs?query=${query}&pagination.limit=50&pagination.reverse=true`;

  try {
    const resp = await fetch(url);
    const data = await resp.json();

    if (!resp.ok || !data.tx_responses) {
      throw new Error("Invalid Osmosis API response");
    }

    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ error: "Osmosis transactions fetch error", details: err.message });
  }
}
