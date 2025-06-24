import { useEffect, useState } from "react";

// Соответствие между тикерами и CoinGecko ID
const COINGECKO_IDS = {
  OSMO: "osmosis",
  STARS: "stargaze",
  ATOM: "cosmos",
  TIA: "celestia",
  USDC: "usd-coin",
};

const TOKEN_MAP = {
  uosmo: "OSMO",
  ustars: "STARS",
  "ibc/FED316EA6AA1F52581F61D5D4B38F2A09042D5EA1DABA07B8A23C1EE3C0C4651": "TIA",
  "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2": "ATOM",
  "ibc/3F4B7ED321FD27DC631B8A8B5540BB89A06A938D2873143082260A17B98A6936": "USDC",
  "ibc/655BCEF3CDEBE32863FF281DBBE3B06160339E9897DC9C9C9821932A5F8BA6F8": "OSMO",
};

export default function Home() {
  const [data, setData] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [showTx, setShowTx] = useState(false);
  const [stargazeData, setStargazeData] = useState([]);
  const [tokenPrices, setTokenPrices] = useState({});
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

    // Загрузка цен с CoinGecko
    const ids = Object.values(COINGECKO_IDS).join(",");
    fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=usd`)
      .then((res) => res.json())
      .then((prices) => {
        const mapped = {};
        for (const [ticker, id] of Object.entries(COINGECKO_IDS)) {
          mapped[ticker] = prices[id]?.usd ?? 0;
        }
        setTokenPrices(mapped);
      })
      .catch((err) => console.error("Ошибка загрузки цен CoinGecko:", err));
  }, []);

  const parseTokenAmount = (amount) => parseFloat(amount) / 1_000_000;

  const getTokenTicker = (denom) =>
    TOKEN_MAP[denom] || denom.replace("ibc/", "").slice(0, 6).toUpperCase();

  const calculateTotalUSDC = (tokens) =>
    tokens.reduce((total, token) => {
      const ticker = getTokenTicker(token.denom);
      const price = tokenPrices[ticker] || 0;
      return total + parseTokenAmount(token.amount) * price;
    }, 0);

  const osmoTokens = data?.balances || [];
  const stargazeTokens = stargazeData || [];
  const osmoUSDC = calculateTotalUSDC(osmoTokens).toFixed(2);
  const stargazeUSDC = calculateTotalUSDC(stargazeTokens).toFixed(2);

  return (
    <div style={{ fontFamily: "Arial", padding: 20, maxWidth: 900, margin: "0 auto" }}>
      {/* Osmosis */}
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, textAlign: "center" }}>🌊 Osmosis — {osmoUSDC} USDC</h1>
        {loading ? <p>Загрузка...</p> : (
          <ul style={{ listStyle: "none", padding: 0, fontSize: 18 }}>
            {osmoTokens.map((token, i) => {
              const ticker = getTokenTicker(token.denom);
              const amount = parseTokenAmount(token.amount);
              const price = tokenPrices[ticker] || 0;
              return (
                <li key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span>{amount.toFixed(6)} {ticker}</span>
                  <span>{(amount * price).toFixed(2)} USDC</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Stargaze */}
      <div style={{ marginBottom: 30 }}>
        <h1 style={{ fontSize: 28, textAlign: "center" }}>🌟 Stargaze — {stargazeUSDC} USDC</h1>
        {stargazeLoading ? <p>Загрузка...</p> : (
          <ul style={{ listStyle: "none", padding: 0, fontSize: 18 }}>
            {stargazeTokens.map((token, i) => {
              const ticker = getTokenTicker(token.denom);
              const amount = parseTokenAmount(token.amount);
              const price = tokenPrices[ticker] || 0;
              return (
                <li key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                  <span>{amount.toFixed(6)} {ticker}</span>
                  <span>{(amount * price).toFixed(2)} USDC</span>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Транзакции */}
      <div>
        <h2
          onClick={() => setShowTx(!showTx)}
          style={{
            fontSize: 24,
            fontWeight: "bold",
            cursor: "pointer",
            userSelect: "none",
            marginBottom: 10
          }}
        >
          📥 Входящие транзакции {showTx ? "▲" : "▼"}
        </h2>

        {showTx && (txLoading ? (
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
                  `${parseTokenAmount(a.amount).toFixed(6)} ${getTokenTicker(a.denom)}`
                ).join(", ")}
              </p>
            </div>
          ))
        ))}
      </div>
    </div>
  );
}

