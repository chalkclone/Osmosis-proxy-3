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
    uregen: "REGEN",
    uion: "ION",
    ujuno: "JUNO",
    ucomdex: "CMDX",
    ustrd: "STRD",
    uboot: "BOOT",
    uluna: "LUNA",
    ucre: "CRE",
    umntl: "MNTL",
    ungm: "NGM",
    uphoton: "PHOTON",
    untrn: "NTRN",
    "ibc/9DF365E2C0EF4EA02FA771F638BB9C0C830EFCD354629BDC017F79B348B4E989": "OSMO",
    "ibc/ED07A3391A112B175915CD8FAF43A2DA8E4790EDE12566649D0C2F97716B8518": "STARS",
    "ibc/9DF365E2C0EF4EA02FA771F638BB9C0C830EFCD354629BDC017F79B348B4E989": "TIA",
  "ibc/ED07A3391A112B175915CD8FAF43A2DA8E4790EDE12566649D0C2F97716B8518": "ATOM",
  "ibc/3F4B7ED321FD27DC631B8A8B5540BB89A06A938D2873143082260A17B98A6936": "USDC",
    // Добавляй другие IBC токены при необходимости
  };

  const formatBalance = (balance) => {
    const denom = balance.denom;
    const symbol = denomToSymbol[denom] || denom;
    const amount = parseFloat(balance.amount) / 1_000_000;
    return amount > 0 ? `${amount.toFixed(6)} ${symbol}` : null;
  };

  const osmoBalanceRaw = osmosisData?.balances?.find((b) => b.denom === "uosmo")?.amount;
  const osmoBalance = osmoBalanceRaw ? (parseFloat(osmoBalanceRaw) / 1_000_000).toFixed(6) : null;

  const stargazeBalances = stargazeData?.balances
    ?.map(formatBalance)
    .filter((b) => b !== null);

  const stargazeTotal = stargazeData?.balances?.reduce((total, balance) => {
    if (balance.denom === "ustars") {
      return total + parseFloat(balance.amount) / 1_000_000;
    }
    return total;
  }, 0);

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

      <div style={{ marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px", textAlign: "center" }}>🌟 Баланс Stargaze</h1>
        {stargazeTotal ? (
          <div style={{ textAlign: "center", fontSize: "24px", marginBottom: "10px", fontWeight: "bold" }}>
            Общий баланс: {stargazeTotal.toFixed(6)} STARS
          </div>
        ) : null}
        {stargazeBalances?.length > 0 ? (
          <ul style={{ listStyle: "none", padding: 0 }}>
            {stargazeBalances.map((b, idx) => (
              <li key={idx} style={{ fontSize: "20px", marginBottom: "8px", color: "#4CAF50", fontFamily: "Arial, sans-serif" }}>{b}</li>
            ))}
          </ul>
        ) : (
          <p style={{ textAlign: "center" }}>Балансов не найдено</p>
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
            }}
          >
            <p><strong>Hash:</strong> {tx.txhash}</p>
            <p><strong>Height:</strong> {tx.height}</p>
            <p><strong>Time:</strong> {tx.timestamp}</p>
            <p><strong>From:</strong> {tx.tx.body.messages[0]?.from_address}</p>
            <p>
              <strong>Amount:</strong>{" "}
              {tx.tx.body.messages[0]?.amount?.map((a) =>
                `${(parseFloat(a.amount) / 1_000_000).toFixed(6)} ${denomToSymbol[a.denom] || a.denom}`
              ).join(", ")}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

