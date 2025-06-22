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
    utia: "TIA",
    // Add more denoms if needed
"ibc/9DF365E2C0EF4EA02FA771F638BB9C0C830EFCD354629BDC017F79B348B4E989": "OSMO",
"ibc/ED07A3391A112B175915CD8FAF43A2DA8E4790EDE12566649D0C2F97716B8518": "STARS",
"ibc/B23B3F20B03D9F97D8B06842F072CB4D97B9D05FB481C86DFF5F2990A1E0A956": "TIA",
"ibc/46B44899322C6C8F9C922DF2D0816C5F0928D5D98D7313D8D6F3B3CA734442CB": "ATOM",
"ibc/3F4B7ED321FD27DC631B8A8B5540BB89A06A938D2873143082260A17B98A6936": "USDC",
"ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4": "AKT"
  };

  const tokenPrices = {
    OSMO: 0.68,
    STARS: 0.02,
    ATOM: 7.23,
    TIA: 1.08,
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

  const osmosisBalancesRaw = osmosisData?.balances || [];
  const stargazeBalancesRaw = stargazeData?.balances || [];

  const osmosisFormatted = osmosisBalancesRaw.map(formatBalance).filter(Boolean);
  const stargazeFormatted = stargazeBalancesRaw.map(formatBalance).filter(Boolean);

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

