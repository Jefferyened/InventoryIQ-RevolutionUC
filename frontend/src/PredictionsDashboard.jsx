import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import "./App.css";

const BACKEND_URL = "http://127.0.0.1:5001";

function PredictionsDashboard() {
  const [productUsage, setProductUsage] = useState([]);
  const [trending, setTrending] = useState([]);
  const [forecastChart, setForecastChart] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [summary, setSummary] = useState({});
  const [topProduct, setTopProduct] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);

      const res = await fetch(`${BACKEND_URL}/predictions-data`);
      const json = await res.json();
      const predictions = json.predictions || {};

      setProductUsage(predictions.productUsage || []);
      setTrending(predictions.trendingItems || []);
      setForecastChart(predictions.forecastChartData || []);
      setAlerts(predictions.lowStockAlerts || []);
      setSummary(predictions.recentSalesSummary || {});
      setTopProduct(predictions.topProduct || "");
    } catch (err) {
      console.error("Error fetching predictions:", err);
      setProductUsage([]);
      setTrending([]);
      setForecastChart([]);
      setAlerts([]);
      setSummary({});
      setTopProduct("");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return (
    <div className="app">
      <header className="topbar">
        <h1 className="restaurant-title">Predictions Dashboard</h1>
        <p className="restaurant-subtitle">
          Demand trends, next-hour forecasts, and low-stock warnings
        </p>
      </header>

      <main className="layout" style={{ display: "block", padding: "20px" }}>
        {loading ? (
          <p>Loading dashboard...</p>
        ) : (
          <>
            {topProduct && (
              <div
                style={{
                  marginBottom: "20px",
                  padding: "14px 18px",
                  borderRadius: "12px",
                  background: "#fff3cd",
                  border: "1px solid #f1d58a",
                  fontWeight: "bold",
                }}
              >
                🔥 Hottest product right now: {topProduct}
              </div>
            )}

            <h2>Hot Products Bar Graph</h2>
            {productUsage.length === 0 ? (
              <p>No product usage data yet. Submit some orders first.</p>
            ) : (
              <div style={{ width: "100%", height: 400 }}>
                <ResponsiveContainer>
                  <BarChart data={productUsage}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="product" />
                    <YAxis allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="orders">
                      <LabelList dataKey="orders" position="top" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <h2 style={{ marginTop: "40px" }}>Trending Items</h2>
            {trending.length === 0 ? (
              <p>No trending data yet.</p>
            ) : (
              trending.map((item, i) => (
                <div
                  key={i}
                  style={{
                    padding: "12px",
                    marginBottom: "10px",
                    border: "1px solid #ddd",
                    borderRadius: "10px",
                    background: "#fafafa",
                  }}
                >
                  <strong>{item.item}</strong> — {item.orders} recent orders
                </div>
              ))
            )}

            <h2 style={{ marginTop: "40px" }}>Next Hour Ingredient Forecast</h2>
            {forecastChart.length === 0 ? (
              <p>No forecast data yet.</p>
            ) : (
              <div style={{ width: "100%", height: 420 }}>
                <ResponsiveContainer>
                  <BarChart data={forecastChart}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="ingredient" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="predicted">
                      <LabelList dataKey="predicted" position="top" />
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}

            <h2 style={{ marginTop: "40px" }}>Low Stock Alerts</h2>
            {alerts.length === 0 ? (
              <div
                style={{
                  padding: "14px",
                  borderRadius: "12px",
                  background: "#e8f5e9",
                  border: "1px solid #c8e6c9",
                }}
              >
                All inventory looks okay for the next hour.
              </div>
            ) : (
              alerts.map((alert, i) => (
                <div
                  key={i}
                  style={{
                    padding: "14px",
                    marginBottom: "12px",
                    borderRadius: "12px",
                    background:
                      alert.severity === "critical" ? "#ffebee" : "#fff8e1",
                    border:
                      alert.severity === "critical"
                        ? "1px solid #ef9a9a"
                        : "1px solid #ffe082",
                  }}
                >
                  <strong>{alert.severity.toUpperCase()}</strong>
                  <div style={{ marginTop: "6px" }}>{alert.message}</div>
                </div>
              ))
            )}

            <h2 style={{ marginTop: "40px" }}>Recent Sales Summary</h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                gap: "12px",
                marginTop: "15px",
              }}
            >
              <div style={summaryCardStyle}>
                <strong>Orders Last 5 Minutes</strong>
                <div style={summaryValueStyle}>{summary.ordersLast5Minutes ?? 0}</div>
              </div>

              <div style={summaryCardStyle}>
                <strong>Orders Last 15 Minutes</strong>
                <div style={summaryValueStyle}>{summary.ordersLast15Minutes ?? 0}</div>
              </div>

              <div style={summaryCardStyle}>
                <strong>Orders Last 30 Minutes</strong>
                <div style={summaryValueStyle}>{summary.ordersLast30Minutes ?? 0}</div>
              </div>

              <div style={summaryCardStyle}>
                <strong>Items Sold Last 5 Minutes</strong>
                <div style={summaryValueStyle}>{summary.itemsSoldLast5Minutes ?? 0}</div>
              </div>

              <div style={summaryCardStyle}>
                <strong>Items Sold Last 15 Minutes</strong>
                <div style={summaryValueStyle}>{summary.itemsSoldLast15Minutes ?? 0}</div>
              </div>

              <div style={summaryCardStyle}>
                <strong>Items Sold Last 30 Minutes</strong>
                <div style={summaryValueStyle}>{summary.itemsSoldLast30Minutes ?? 0}</div>
              </div>
            </div>

            <button
              style={{ marginTop: "24px" }}
              onClick={fetchData}
              className="primary-btn"
            >
              Refresh
            </button>
          </>
        )}
      </main>
    </div>
  );
}

const summaryCardStyle = {
  border: "1px solid #ddd",
  borderRadius: "12px",
  padding: "16px",
  background: "#fafafa",
};

const summaryValueStyle = {
  marginTop: "8px",
  fontSize: "24px",
  fontWeight: "bold",
};

export default PredictionsDashboard;