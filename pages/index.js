import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);
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
  }, []);

  const osmoBalanceRaw = data?.balances?.balances?.find(
    (b) => b.denom === "uosmo"
  )?.amount;

  const osmoBalance = osmoBalanceRaw
    ? (parseFloat(osmoBalanceRaw) / 1_000_000).toFixed(6)
    : null;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>💰 Баланс OSMO</h1>
      {loading ? (
        <p>Загрузка баланса...</p>
      ) : error ? (
        <p>Ошибка: {error.message}</p>
      ) : osmoBalance ? (
        <h2 style={{ fontSize: "24px", color: "#1a73e8" }}>
          {osmoBalance} OSMO
        </h2>
      ) : (
        <p>Баланс не найден</p>
      )}

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
              padding: "12px",
              marginBottom: "10px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)",
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

      <h3 style={{ marginTop: "40px" }}>🛠 Отладка (баланс)</h3>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
