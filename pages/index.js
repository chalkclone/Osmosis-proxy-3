import { useEffect, useState } from "react";

export default function Home() {
  const [balances, setBalances] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loadingBalances, setLoadingBalances] = useState(true);
  const [loadingTxs, setLoadingTxs] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch("/api")
      .then((res) => res.json())
      .then((data) => {
        setBalances(data);
        setLoadingBalances(false);
      })
      .catch((err) => {
        setError(err);
        setLoadingBalances(false);
      });

    fetch("/api/transactions")
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data.tx_responses || []);
        setLoadingTxs(false);
      })
      .catch((err) => {
        setError(err);
        setLoadingTxs(false);
      });
  }, []);

  if (loadingBalances || loadingTxs) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error.message}</p>;

  // Получим баланс токена uosmo
  const osmoBalanceRaw = balances?.balances?.balances?.find(
    (b) => b.denom === "uosmo"
  )?.amount;

  const osmoBalance = osmoBalanceRaw
    ? (parseFloat(osmoBalanceRaw) / 1_000_000).toFixed(6)
    : "Нет данных";

  return (
    <div style={{ padding: "2rem", fontFamily: "Arial" }}>
      <h1>💰 Баланс OSMO</h1>
      <p>{osmoBalance} OSMO</p>

      <h2>📥 Входящие транзакции</h2>
      {transactions.length === 0 ? (
        <p>Нет транзакций</p>
      ) : (
        <ul style={{ listStyle: "none", padding: 0 }}>
          {transactions.map((tx) => (
            <li
              key={tx.txhash}
              style={{
                border: "1px solid #ccc",
                marginBottom: "1rem",
                padding: "1rem",
                borderRadius: "8px",
              }}
            >
              <strong>Hash:</strong> {tx.txhash}
              <br />
              <strong>Height:</strong> {tx.height}
              <br />
              <strong>Time:</strong> {tx.timestamp}
              <br />
              <strong>From:</strong>{" "}
              {tx.tx.body.messages[0]?.from_address}
              <br />
              <strong>Amount:</strong>{" "}
              {tx.tx.body.messages[0]?.amount?.map((a) => `${
                parseFloat(a.amount) / 1_000_000
              } ${a.denom}`).join(", ") || "-"}
            </li>
          ))}
        </ul>
      )}

      <h2>🛠 Отладка (баланс)</h2>
      <pre style={{ background: "#f4f4f4", padding: "1rem" }}>
        {JSON.stringify(balances, null, 2)}
      </pre>
    </div>
  );
}
