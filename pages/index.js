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
