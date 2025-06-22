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
  uosmo: "OSMO",
  ustars: "STARS",
  uatom: "ATOM",
  utia: "TIA",
  uakt: "AKT",
  uusdc: "USDC",
  // IBC denoms
  "ibc/655BCEF3CDEBE32863FF281DBBE3B06160339E9897DC9C9C9821932A5F8BA6F8": "OSMO",
  "ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E5CB02B7C0A4": "STARS",
  "ibc/FED316EA6AA1F52581F61D5D4B38F2A09042D5EA1DABA07B8A23C1EE3C0C4651": "TIA",
  "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2": "ATOM",
  "ibc/D189335C6E4A68B513C10AB227BF1C1D38C746766278BA3EEB4FB14124F1D858": "USDC",
  "ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4": "AKT"
};

export default function Home() {
  const [osmosisData, setOsmosisData] = useState([]);
  const [stargazeData, setStargazeData] = useState([]);
  const [prices, setPrices] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load balances and prices
  useEffect(() => {
    Promise.all([
      fetch("/api").then(r => r.json()),
      fetch("/api/stargaze/balance").then(r => r.json()),
      fetch("https://api.coingecko.com/api/v3/simple/price?ids=" +
        Object.values(COINGECKO_IDS).join(",") +
        "&vs_currencies=usd"
      ).then(r => r.json())
    ])
    .then(([osmo, starg, pr]) => {
      setOsmosisData(osmo.balances || []);
      setStargazeData(starg.balances || []);
      // map CoinGecko to symbol → USD
      const mapped = {};
      for (let sym in COINGECKO_IDS) {
        const id = COINGECKO_IDS[sym];
        mapped[sym] = pr[id]?.usd || 0;
      }
      setPrices(mapped);
    })
    .catch(err => {
      console.error(err);
      setError(err);
    })
    .finally(() => setLoading(false));
  }, []);

  const formatBalances = (raw) => {
    return raw
      .map(b => {
        const sym = denomToSymbol[b.denom];
        if (!sym) return null;
        const amt = parseFloat(b.amount)/1_000_000;
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
        <li key={sym} style={{
          fontSize: "22px",
          marginBottom: "6px",
          color: "#4CAF50",
        }}>
          {amt.toFixed(2)} {sym} ≈ {usd.toFixed(2)} USDC
        </li>
      );
    });

    return (
      <div style={{textAlign:"center", marginBottom:"30px"}}>
        <h1 style={{fontSize:"32px"}}>{title}</h1>
        <h3 style={{fontSize:"20px", color:"#333"}}>
          Общий баланс: {totalUsd.toFixed(2)} USDC
        </h3>
        <ul style={{listStyle:"none", padding:0}}>{lines}</ul>
      </div>
    );
  };

  if (loading) return <p>Загрузка...</p>;
  if (error) return <p>Ошибка: {error.message}</p>;

  return (
    <div style={{fontFamily:"Arial, sans-serif", padding:"20px", maxWidth:"800px", margin:"0 auto"}}>
      {renderSection("💰 Баланс Osmosis", osmosisData)}
      {renderSection("🌟 Баланс Stargaze", stargazeData)}
    </div>
  );
}


