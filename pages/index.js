import { useEffect, useState } from "react";

export default function Home() {
  const [osmosisData, setOsmosisData] = useState(null);
  const [stargazeData, setStargazeData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api")
      .then((res) => res.json())
      .then((data) => setOsmosisData(data))
      .catch((err) => setError(err))
      .finally(() => setLoading(false));

    fetch("/api/stargaze/balance")
      .then((res) => res.json())
      .then((data) => setStargazeData(data))
      .catch((err) => console.error("Ошибка Stargaze:", err));

    fetch("/api/transactions")
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data.tx_responses || []);
      })
      .catch((err) => console.error("Ошибка при загрузке транзакций:", err))
      .finally(() => setTxLoading(false));
  }, []);

  const denomToSymbol = {
    ustars: "STARS",
    "ibc/655BCEF3CDEBE32863FF281DBBE3B06160339E9897DC9C9C9821932A5F8BA6F8": "OSMO",
    "ibc/FED316EA6AA1F52581F61D5D4B38F2A09042D5EA1DABA07B8A23C1EE3C0C4651": "TIA",
    "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2": "ATOM",
    "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858": "USDC",
    "ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4": "AKT"
  };

  const tokenPrices = {
    OSMO: 0.68,
    STARS: 0.02,
    ATOM: 7.23,
    TIA: 1.08,
    USDC: 1,
    AKT: 1.46
  };

  const formatBalance = (balance) => {
    const denom = balance.denom;
    const symbol = denomToSymbol[denom] || denom;
    const amount = parseFloat(balance.amount) / 1_000_000;
    return amount > 0 ? { symbol, amount } : null;
  };

  const calculateTotalUSD = (balances) => {
    let total = 0;
    const lines = balances.map((b) => {
      const price = tokenPrices[b.symbol] || 0;
      const value = b.amount * price;
      total += value;
      return (
        <li key={b.symbol} style={{ fontSize: "22px", fontWeight: 500, color: "#4CAF50" }}>
          {b.amount.toFixed(2)} {b.symbol} ≈ {value.toFixed(2)} USDC
        </li>
      );
    });
    return { total: total.toFixed(2), lines };
  };

  const osmosisFormatted = (osmosisData?.balances || []).map(formatBalance).filter(Boolean);
  const stargazeFormatted = (stargazeData?.balances || []).map(formatBalance).filter(Boolean);

  const osmoUSD = calculateTotalUSD(osmosisFormatted);
  const stargazeUSD = calculateTotalUSD(stargazeFormatted);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px" }}>💰 Баланс Osmosis</h1>
        <h3 style={{ fontSize: "20px", color: "#333" }}>Общий баланс: {osmoUSD.total} USDC</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>{osmoUSD.lines}</ul>
      </div>

      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px" }}>🌟 Баланс Stargaze</h1>
        <h3 style={{ fontSize: "20px", color: "#333" }}>Общий баланс: {stargazeUSD.total} USDC</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>{stargazeUSD.lines}</ul>
      </div>

      <h2 style={{ marginTop: "40px" }}>📥 Входящие транзакции</h2>
      {txLoading ? (
        <p>Загрузка транзакций...</p>
      ) : (
        transactions.map((tx) => {
          const msg = tx?.tx?.body?.messages?.[0];
          const from = msg?.from_address || "—";
          const amounts = msg?.amount?.map((a, idx) => {
            const symbol = denomToSymbol[a.denom] || a.denom;
            const amt = (parseFloat(a.amount) / 1_000_000).toFixed(2);
            return `${amt} ${symbol}`;
          }).join(", ");

          return (
            <div
              key={tx.txhash}
              style={{
                border: "1px solid #ddd",
                borderRadius: "12px",
                padding: "16px",
                marginBottom: "15px",
                backgroundColor: "#f9f9f9",
                boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              }}
            >
              <p><strong>Hash:</strong> {tx.txhash}</p>
              <p><strong>Height:</strong> {tx.height}</p>
              <p><strong>Time:</strong> {tx.timestamp}</p>
              <p><strong>From:</strong> {from}</p>
              <p><strong>Amount:</strong> {amounts || "—"}</p>
            </div>
          );
        })
      )}
    </div>
  );
}

