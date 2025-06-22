import { useEffect, useState } from "react";

const COINGECKO_IDS = {
  OSMO: "osmosis",
  STARS: "stargaze",
  ATOM: "cosmos",
  TIA: "celestia",
  AKT: "akash-network",
  USDC: "usd-coin"
};

const denomToSymbol = {
  ustars: "STARS",
  uosmo: "OSMO",
  uatom: "ATOM",
  utia: "TIA",
  uakt: "AKT",
  uusdc: "USDC",

  // Stargaze IBC
  "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2": "ATOM", // cosmos
  "ibc/655BCEF3CDEBE32863FF281DBBE3B06160339E9897DC9C9C9821932A5F8BA6F8": "OSMO", // osmosis
  "ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4": "AKT",  // akash
  "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858": "USDC"  // noble USDC
};

export default function Home() {
  const [osmosisData, setOsmosisData] = useState([]);
  const [stargazeData, setStargazeData] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [txLoading, setTxLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api").then((r) => r.json()),
      fetch("/api/stargaze/balance").then((r) => r.json()),
      fetch("/api/transactions").then((r) => r.json()),
      fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${Object.values(COINGECKO_IDS).join(
          ","
        )}&vs_currencies=usd`
      ).then((r) => r.json())
    ])
      .then(([osmo, starg, txs, pricesRaw]) => {
        setOsmosisData(osmo.balances || []);
        setStargazeData(starg.balances || []);
        setTransactions(txs.tx_responses || []);
        const mapped = {};
        for (let sym in COINGECKO_IDS) {
          const id = COINGECKO_IDS[sym];
          mapped[sym] = pricesRaw[id]?.usd || 0;
        }
        setPrices(mapped);
      })
      .catch((err) => console.error("Ошибка:", err))
      .finally(() => {
        setLoading(false);
        setTxLoading(false);
      });
  }, []);

  const formatBalances = (raw) => {
    return raw
      .map((b) => {
        const sym = denomToSymbol[b.denom];
        if (!sym) return null;
        const amt = parseFloat(b.amount) / 1_000_000;
        return amt > 0 ? { sym, amt } : null;
      })
      .filter(Boolean);
  };

  const renderSection = (title, raw) => {
    const bal = formatBalances(raw);
    let totalUsd = 0;
    const lines = bal.map(({ sym, amt }) => {
      const usd = (prices[sym] || 0) * amt;
      totalUsd += usd;
      return (
        <li key={sym} style={{ fontSize: "22px", marginBottom: "6px", color: "#4CAF50" }}>
          {amt.toFixed(2)} {sym} ≈ {usd.toFixed(2)} USDC
        </li>
      );
    });

    return (
      <div style={{ textAlign: "center", marginBottom: "30px" }}>
        <h1 style={{ fontSize: "32px" }}>{title}</h1>
        <h3 style={{ fontSize: "20px", color: "#333" }}>Общий баланс: {totalUsd.toFixed(2)} USDC</h3>
        <ul style={{ listStyle: "none", padding: 0 }}>{lines}</ul>
      </div>
    );
  };

  const renderTransactions = () => {
    if (txLoading) return <p>Загрузка транзакций...</p>;
    if (!transactions.length) return <p>Нет входящих транзакций</p>;

    return (
      <div style={{ marginTop: "40px" }}>
        <h2 style={{ fontSize: "28px", marginBottom: "16px" }}>📥 Входящие транзакции</h2>
        {transactions.map((tx) => (
          <div
            key={tx.txhash}
            style={{
              border: "1px solid #ddd",
              borderRadius: "12px",
              padding: "16px",
              marginBottom: "15px",
              backgroundColor: "#f9f9f9",
              boxShadow: "0 2px 6px rgba(0,0,0,0.05)"
            }}
          >
            <p><strong>Hash:</strong> {tx.txhash}</p>
            <p><strong>Height:</strong> {tx.height}</p>
            <p><strong>Time:</strong> {tx.timestamp}</p>
            <p><strong>From:</strong> {tx.tx.body.messages[0]?.from_address}</p>
            <p><strong>Amount:</strong>{" "}
              {tx.tx.body.messages[0]?.amount?.map((a) => {
                const denom = a.denom;
                const sym = denomToSymbol[denom] || denom;
                const val = parseFloat(a.amount) / 1_000_000;
                return `${val.toFixed(2)} ${sym}`;
              }).join(", ")}
            </p>
          </div>
        ))}
      </div>
    );
  };

  if (loading) return <p>Загрузка...</p>;

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px", maxWidth: "800px", margin: "0 auto" }}>
      {renderSection("💰 Баланс Osmosis", osmosisData)}
      {renderSection("🌟 Баланс Stargaze", stargazeData)}
      {renderTransactions()}
    </div>
  );
}


