import { useEffect, useState } from "react";

export default function Home() {
  const [osmosisData, setOsmosisData] = useState(null);
  const [stargazeData, setStargazeData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);
  const [error, setError] = useState(null);
  const [prices, setPrices] = useState({});

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

    fetch("/api/prices")
      .then((res) => res.json())
      .then((data) => setPrices(data))
      .catch((err) => console.error("Ошибка загрузки цен:", err));
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
    utia: "TIA",
 "ibc/9DF365E2C0EF4EA02FA771F638BB9C0C830EFCD354629BDC017F79B348B4E989": "OSMO",
    "ibc/ED07A3391A112B175915CD8FAF43A2DA8E4790EDE12566649D0C2F97716B8518": "STARS",
    "ibc/9DF365E2C0EF4EA02FA771F638BB9C0C830EFCD354629BDC017F79B348B4E989": "TIA",
  "ibc/ED07A3391A112B175915CD8FAF43A2DA8E4790EDE12566649D0C2F97716B8518": "ATOM",
  "ibc/3F4B7ED321FD27DC631B8A8B5540BB89A06A938D2873143082260A17B98A6936": "USDC",
  };

  const getAmountInUSDC = (amount, denom) => {
    const symbol = denomToSymbol[denom] || denom;
    const price = prices[symbol] || 0;
    return (parseFloat(amount) / 1_000_000) * price;
  };

  const formatBalance = (balance) => {
    const denom = balance.denom;
    const symbol = denomToSymbol[denom] || denom;
    const amount = parseFloat(balance.amount) / 1_000_000;
    return amount > 0 ? { symbol, amount } : null;
  };

  const osmoBalances = osmosisData?.balances?.map(formatBalance).filter(Boolean) || [];
  const stargazeBalances = stargazeData?.balances?.map(formatBalance).filter(Boolean) || [];

  const totalOsmoUSDC = osmoBalances.reduce((sum, b) => sum + getAmountInUSDC(b.amount * 1_000_000, b.symbol), 0);
  const totalStargazeUSDC = stargazeBalances.reduce((sum, b) => sum + getAmountInUSDC(b.amount * 1_000_000, b.symbol), 0);

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px" }}>💰 Баланс Osmosis</h1>
        <h3 style={{ fontSize: "20px", color: "#333" }}>Общий баланс: {totalOsmoUSDC.toFixed(2)} USDC</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {osmoBalances.map((b, idx) => (
            <li key={idx} style={{ fontSize: "22px", fontWeight: 500, color: "#4CAF50", marginBottom: "6px" }}>
              {b.amount.toFixed(2)} {b.symbol}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ marginBottom: "30px", textAlign: "center" }}>
        <h1 style={{ fontSize: "32px" }}>🌟 Баланс Stargaze</h1>
        <h3 style={{ fontSize: "20px", color: "#333" }}>Общий баланс: {totalStargazeUSDC.toFixed(2)} USDC</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {stargazeBalances.map((b, idx) => (
            <li key={idx} style={{ fontSize: "22px", fontWeight: 500, color: "#4CAF50", marginBottom: "6px" }}>
              {b.amount.toFixed(2)} {b.symbol}
            </li>
          ))}
        </ul>
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
                `${(parseFloat(a.amount) / 1_000_000).toFixed(2)} ${denomToSymbol[a.denom] || a.denom}`
              ).join(", ")}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

