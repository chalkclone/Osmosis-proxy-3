import { useEffect, useState } from "react";
import TOKEN_MAP from "../utils/tokenMap";

export default function Home() {
  const [osmosisData, setOsmosisData] = useState([]);
  const [stargazeData, setStargazeData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [prices, setPrices] = useState({});
  const [showTxs, setShowTxs] = useState(false);

  useEffect(() => {
    fetch("/api")
      .then((res) => res.json())
      .then((data) => setOsmosisData(data.balances || []));

    fetch("/api/stargaze/balance")
      .then((res) => res.json())
      .then((data) => setStargazeData(data.balances || []));

    fetch("/api/transactions")
      .then((res) => res.json())
      .then((data) => setTransactions(data.tx_responses || []));

    fetch("https://api.coingecko.com/api/v3/simple/price?ids=osmosis,stargaze,cosmos,celestia,tether&vs_currencies=usd")
      .then((res) => res.json())
      .then((data) =>
        setPrices({
          OSMO: data.osmosis.usd,
          STARS: data.stargaze.usd,
          ATOM: data.cosmos.usd,
          TIA: data.celestia.usd,
          USDC: data.tether.usd,
        })
      );
  }, []);

  const renderBalances = (balances, title) => {
    let totalUSDC = 0;

    const items = balances.map((token, idx) => {
      const denom = token.denom;
      const ticker = TOKEN_MAP[denom] || denom.slice(-6).toUpperCase();
      const amount = parseFloat(token.amount) / 1_000_000;
      const price = prices[ticker] || 0;
      const value = amount * price;
      totalUSDC += value;

      return (
        <div key={idx} style={{ display: "flex", justifyContent: "space-between", padding: "2px 0" }}>
          <div>{amount.toFixed(6)} {ticker}</div>
          <div>{value.toFixed(2)} USDC</div>
        </div>
      );
    });

    return (
      <div style={{ marginBottom: "30px" }}>
        <h2 style={{ fontSize: "24px", fontWeight: "bold" }}>
          {title} — {totalUSDC.toFixed(2)} USDC
        </h2>
        {items}
      </div>
    );
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", maxWidth: "800px", margin: "0 auto", backgroundColor: "#f0f2f5", borderRadius: "12px" }}>
      {renderBalances(osmosisData, "🌊 Osmosis")}
      {renderBalances(stargazeData, "🌟 Stargaze")}

      <h2
        onClick={() => setShowTxs(!showTxs)}
        style={{ cursor: "pointer", fontSize: "20px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "10px", marginTop: "40px" }}
      >
        📥 Входящие транзакции {showTxs ? "▲" : "▼"}
      </h2>

      {showTxs &&
        transactions.map((tx) => (
          <div
            key={tx.txhash}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "10px",
              marginBottom: "10px",
              background: "#fff",
              fontSize: "14px",
              boxShadow: "0 2px 4px rgba(0,0,0,0.05)",
            }}
          >
            <p><strong>Hash:</strong> {tx.txhash}</p>
            <p><strong>Height:</strong> {tx.height}</p>
            <p><strong>Time:</strong> {tx.timestamp}</p>
            <p><strong>From:</strong> {tx.tx.body.messages[0]?.from_address}</p>
            <p>
              <strong>Amount:</strong>{" "}
              {tx.tx.body.messages[0]?.amount?.map((a) =>
                `${(parseFloat(a.amount) / 1_000_000).toFixed(6)} ${a.denom.replace("u", "")}`
              ).join(", ")}
            </p>
          </div>
        ))}
    </div>
  );
}


