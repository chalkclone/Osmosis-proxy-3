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
      .then((data) => {
        setOsmosisData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });

    fetch("/api/stargaze/balance")
      .then((res) => res.json())
      .then((data) => {
        setStargazeData(data);
      })
      .catch((err) => {
        console.error("Ошибка Stargaze:", err);
      });

    fetch("/api/transactions")
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data.tx_responses || []);
        setTxLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка при загрузке транзакций:", err);
        setTxLoading(false);
      });
  }, []);

  const denomToSymbol = {
    uosmo: "OSMO",
    ustars: "STARS",
    uatom: "ATOM",
    uakt: "AKT",
    uusdc: "USDC",
    ubtc: "BTC",
    // добавь при необходимости другие
  };

  const formatBalance = (balance) => {
    const denom = balance.denom;
    const amount = parseFloat(balance.amount) / 1_00;
    const symbol = denomToSymbol[denom] || denom;
    return `${amount.toFixed(6)} ${symbol}`;
  };

  const osmoBalanceRaw = osmosisData?.balances?.find((b) => b.denom === "uosmo")?.amount;
  const osmoBalance = osmoBalanceRaw ? (parseFloat(osmoBalanceRaw) / 1_000_000).toFixed(6) : null;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px" }}>💰 Баланс Osmosis</h1>
        {loading ? (
          <p>Загрузка баланса...</p>
        ) : error ? (
          <p>Ошибка: {error.message}</p>
        ) : osmoBalance ? (
          <div style={{ fontSize: "36px", fontWeight: "bold", color: "#4CAF50" }}>
            {osmoBalance} OSMO
          </div>
        ) : (
          <p>Баланс не найден</p>
        )}
      </div>

      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px" }}>💰 Баланс Stargaze</h1>
        {stargazeData?.balances?.length > 0 ? (
          stargazeData.balances.map((balance, idx) => (
            <div
              key={idx}
              style={{ fontSize: "24px", fontWeight: "bold", color: "#4CAF50", marginTop: "10px" }}
            >
              {formatBalance(balance)}
            </div>
          ))
        ) : (
          <p>Балансов не найдено</p>
        )}
      </div>

      <h2 style={{ marginTop: "40px" }}>📥 Входящие транзакции</h2>
      {txLoading ? (
        <p>Загрузка транзакций...</p>
      ) : (
        transactions.map((tx) => (
          <div
            key={tx.txhash}
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "15px",
              backgroundColor: "#f9f9f9",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
              fontFamily: "Arial, sans-serif"
            }}
          >
            <p><strong>Hash:</strong> {tx.txhash}</p>
            <p><strong>Height:</strong> {tx.height}</p>
            <p><strong>Time:</strong> {tx.timestamp}</p>
            <p><strong>From:</strong> {tx.tx.body.messages[0]?.from_address}</p>
            <p>
              <strong>Amount:</strong>{" "}
              {tx.tx.body.messages[0]?.amount?.map((a) =>
                `${(parseFloat(a.amount) / 1_000_000).toFixed(6)} ${denomToSymbol[a.denom] || a.denom.replace("u", "")}`
              ).join(", ")}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

