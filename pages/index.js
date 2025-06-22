import { useEffect, useState } from "react";

// Карта известных токенов Stargaze
const TOKEN_MAP = {
  ustars: "STARS",
  "ibc/FED316EA6AA1F52581F61D5D4B38F2A09042D5EA1DABA07B8A23C1EE3C0C4651": "TIA",
  "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2": "ATOM",
  "ibc/3F4B7ED321FD27DC631B8A8B5540BB89A06A938D2873143082260A17B98A6936": "USDC",
"ibc/655BCEF3CDEBE32863FF281DBBE3B06160339E9897DC9C9C9821932A5F8BA6F8": "OSMO",
};

export default function Home() {
  const [data, setData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [stargazeData, setStargazeData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);
  const [stargazeLoading, setStargazeLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api")
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
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

    fetch("/api/stargaze/balance")
      .then((res) => res.json())
      .then((data) => {
        setStargazeData(data.balances || []);
        setStargazeLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка Stargaze:", err);
        setStargazeLoading(false);
      });
  }, []);

  const osmoBalanceRaw = data?.balances?.find((b) => b.denom === "uosmo")?.amount;
  const osmoBalance = osmoBalanceRaw ? (parseFloat(osmoBalanceRaw) / 1_000_000).toFixed(6) : null;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px", fontWeight: "bold" }}>💰 Баланс Osmosis</h1>
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
        <h1 style={{ fontSize: "28px", fontWeight: "bold" }}>🌟 Баланс Stargaze</h1>
        {stargazeLoading ? (
          <p>Загрузка...</p>
        ) : stargazeData.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0, fontSize: "18px" }}>
            {stargazeData.map((token, idx) => {
              const denom = token.denom;
              const ticker = TOKEN_MAP[denom] || denom.slice(0, 6).toUpperCase();
              const amount = (parseFloat(token.amount) / 1_000_000).toFixed(6);
              return (
                <li key={idx} style={{ marginBottom: "6px" }}>
                  {amount} {ticker}
                </li>
              );
            })}
          </ul>
        ) : (
          <p>Баланс пуст</p>
        )}
      </div>

      <h2 style={{ marginTop: "40px", fontSize: "24px", fontWeight: "bold" }}>📥 Входящие транзакции</h2>
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
              fontSize: "14px",
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
        ))
      )}
    </div>
  );
}

