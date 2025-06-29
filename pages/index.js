import { useEffect, useState } from "react";
import osmoTokenMap from "../utils/osmoTokenMap";
import stargazeTokenMap from "../utils/stargazeTokenMap";

export default function Home() {
  const [osmosisData, setOsmosisData] = useState([]);
  const [stargazeData, setStargazeData] = useState([]);
  const [osmosisTxs, setOsmosisTxs] = useState([]);
  const [stargazeTxs, setStargazeTxs] = useState([]);
  const [prices, setPrices] = useState({});

  useEffect(() => {
    fetch("/api/osmosis/balance").then(res => res.json()).then(data => setOsmosisData(data.balances || []));
    fetch("/api/stargaze/balance").then(res => res.json()).then(data => setStargazeData(data.balances || []));
    fetch("/api/osmosis/transactions").then(res => res.json()).then(data => setOsmosisTxs((data.tx_responses || []).slice(0, 20)));
    fetch("/api/stargaze/transactions").then(res => res.json()).then(data => setStargazeTxs((data.tx_responses || []).slice(0, 20)));

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

  const formatAmount = (amount, denom, priceMap) => {
    const tokenMap = { ...osmoTokenMap, ...stargazeTokenMap };
    const info = tokenMap[denom] || { denom };
    const displayAmount = (parseFloat(amount) / Math.pow(10, info.decimals || 6)).toFixed(2);
    const usdValue = priceMap[info.symbol] ? (displayAmount * priceMap[info.symbol]).toFixed(2) : null;
    return {
      symbol: info.symbol || denom,
      amount: displayAmount,
      usd: usdValue,
    };
  };

  const renderTxs = (txs, network) => {
    return txs.map((tx, index) => {
      const transfers = tx.logs?.[0]?.events?.find(e => e.type === "transfer")?.attributes || [];
      const recipient = transfers.find(a => a.key === "recipient")?.value || "";
      const amountAttr = transfers.find(a => a.key === "amount")?.value || "";

      const match = amountAttr.match(/(\d+)([a-zA-Z]+)/);
      if (!match) return null;

      const [_, rawAmount, denom] = match;
      const { symbol, amount, usd } = formatAmount(rawAmount, denom, prices);

      return (
        <div className={`tx-card ${network}`} key={tx.txhash + index}>
          <p><strong>Hash:</strong> {tx.txhash.slice(0, 10)}...</p>
          <p><strong>To:</strong> {recipient}</p>
          <p><strong>Amount:</strong> {amount} {symbol}</p>
          {usd && <p><strong>USD:</strong> ${usd}</p>}
        </div>
      );
    });
  };

  return (
    <main className="container">
      <h1>💸 Баланс и Транзакции</h1>

      <section className="section osmosis">
        <h2>🌊 Osmosis</h2>
        <div className="tx-list">{renderTxs(osmosisTxs, "osmosis")}</div>
      </section>

      <section className="section stargaze">
        <h2>✨ Stargaze</h2>
        <div className="tx-list">{renderTxs(stargazeTxs, "stargaze")}</div>
      </section>
    </main>
  );
}


