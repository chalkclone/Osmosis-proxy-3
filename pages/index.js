// Файл: pages/index.js

import { useEffect, useState } from "react";
import osmoTokenMap from "../utils/osmoTokenMap";
import stargazeTokenMap from "../utils/stargazeTokenMap";

export default function Home() {
  const [osmosisData, setOsmosisData] = useState([]);
  const [stargazeData, setStargazeData] = useState([]);
  const [osmosisTxs, setOsmosisTxs] = useState([]);
  const [stargazeTxs, setStargazeTxs] = useState([]);
  const [prices, setPrices] = useState({});
  const [showTxs, setShowTxs] = useState(false);

  useEffect(() => {
    fetch("/api/osmosis/balance").then(res => res.json()).then(data => setOsmosisData(data.balances || []));
    fetch("/api/stargaze/balance").then(res => res.json()).then(data => setStargazeData(data.balances || []));
    fetch("/api/osmosis/transactions").then(res => res.json()).then(data => setOsmosisTxs(data.tx_responses || []));
    fetch("/api/stargaze/transactions").then(res => res.json()).then(data => setStargazeTxs(data.tx_responses || []));

    fetch("https://api.coingecko.com/api/v3/simple/price?ids=osmosis,stargaze,cosmos,celestia,tether&vs_currencies=usd")
      .then(res => res.json())
      .then(data =>
        setPrices({
          OSMO: data.osmosis.usd,
          STARS: data.stargaze.usd,
          ATOM: data.cosmos.usd,
          TIA: data.celestia.usd,
          USDC: data.tether.usd,
        })
      );
  }, []);

  const formatBalance = (balances, map) => {
    let total = 0;
    const items = balances.map((token, idx) => {
      const denom = token.denom;
      const ticker = map[denom] || denom.slice(-6).toUpperCase();
      const amount = parseFloat(token.amount) / 1_000_000;
      const price = prices[ticker] || 0;
      const value = amount * price;
      total += value;

      return (
        <div key={idx} className="flex justify-between text-sm py-1">
          <span>{amount.toFixed(6)} {ticker}</span>
          <span>{value.toFixed(2)} USDC</span>
        </div>
      );
    });

    return { items, total };
  };

  const renderTxs = (txs, network, map) => {
    return txs.map((tx) => {
      const msg = tx.tx.body.messages[0];
      const from = msg?.from_address;
      const amountList = msg?.amount || [];
      const success = tx.code === 0; // добавлено определение успеха транзакции

      return (
        <div key={tx.txhash} className="relative border p-4 rounded-xl bg-white shadow mb-3 text-sm">
          {/* Логотип сети в левом верхнем углу */}
          <div className="absolute top-2 left-2">
            {network === "Osmosis" ? "🌊" : "🌟"}
          </div>
          {/* Название сети (с отступом слева) */}
          <div className="mb-1 font-semibold ml-6">{network}</div>
          <div><strong>Hash:</strong> {tx.txhash.slice(0, 16)}...</div>
          <div><strong>From:</strong> {from}</div>
          <div><strong>Time:</strong> {new Date(tx.timestamp).toLocaleString()}</div>
          <div><strong>Amount:</strong> {
            amountList.map((a, idx) => {
              const ticker = map[a.denom] || a.denom.slice(-6).toUpperCase();
              const val = (parseFloat(a.amount) / 1_000_000).toFixed(6);
              return <span key={idx}>{val} {ticker} </span>
            })
          }</div>
          {/* Иконка результата транзакции в правом нижнем углу */}
          <div className="absolute bottom-2 right-2">
            {success ? "✅" : "❌"}
          </div>
        </div>
      );
    });
  };

  const { items: osmoItems, total: osmoTotal } = formatBalance(osmosisData, osmoTokenMap);
  const { items: starItems, total: starTotal } = formatBalance(stargazeData, stargazeTokenMap);

  return (
    <div className="p-6 max-w-3xl mx-auto bg-gray-100 min-h-screen rounded-xl">
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">🌊 Osmosis — {osmoTotal.toFixed(2)} USDC</h2>
        <div>{osmoItems}</div>
      </div>

      <div className="mb-8">
        <h2 className="text-xl font-bold mb-2">🌟 Stargaze — {starTotal.toFixed(2)} USDC</h2>
        <div>{starItems}</div>
      </div>

      <h2
        onClick={() => setShowTxs(!showTxs)}
        className="text-lg font-bold mb-4 cursor-pointer flex items-center gap-2"
      >
        📥 Входящие транзакции {showTxs ? "▲" : "▼"}
      </h2>

      {showTxs && (
        <div>
          {renderTxs(osmosisTxs, "Osmosis", osmoTokenMap)}
          {renderTxs(stargazeTxs, "Stargaze", stargazeTokenMap)}
        </div>
      )}
    </div>
  );
}


