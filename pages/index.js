import { useEffect, useState } from "react";

export default function Home() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
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
  }, []);

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error.message}</p>;
// Найдём баланс именно токена uosmo (1 OSMO = 1_000_000 uosmo)
  const osmoBalanceRaw = data?.balances?.balances?.find(
    (b) => b.denom === "uosmo"
  )?.amount;

  const osmoBalance = osmoBalanceRaw
    ? (parseFloat(osmoBalanceRaw) / 1_000_000).toFixed(6)
    : "Нет данных";

  return (
    <div>
      <h1>💰 Баланс OSMO</h1>
      <p>{osmoBalance} OSMO</p>

      <h2>🛠 Отладка</h2>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  );
}
import { useEffect, useState } from "react";

export default function Home() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/transactions")
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data.tx_responses || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Ошибка при загрузке транзакций:", err);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Загрузка транзакций...</p>;

  return (
    <div>
      <h1>📥 Входящие транзакции</h1>
      <ul>
        {transactions.map((tx) => (
          <li key={tx.txhash}>
            <strong>Hash:</strong> {tx.txhash}<br />
            <strong>Height:</strong> {tx.height}<br />
            <strong>Time:</strong> {tx.timestamp}<br />
            <strong>From:</strong>{" "}
            {tx.tx.body.messages[0]?.from_address}<br />
            <strong>Amount:</strong>{" "}
            {tx.tx.body.messages[0]?.amount?.map(a => `${a.amount} ${a.denom}`).join(", ")}
          </li>
        ))}
      </ul>
    </div>
  );
}
