import { useEffect, useState } from "react";

const BACKEND_URL = "http://127.0.0.1:5001";

function PredictionsDashboard() {
  const [data, setData] = useState([]);
  const [trending, setTrending] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const res = await fetch(`${BACKEND_URL}/predictions`);
      const json = await res.json();

      if (!res.ok) {
        setError("Failed to load predictions.");
        return;
      }

      setData(json?.predictions?.ingredientUsageLastOrders || []);
      setTrending(json?.predictions?.trendingItems || []);
    } catch (err) {
      console.error("Error fetching predictions:", err);
      setError("Could not connect to backend /predictions route.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const maxUsed =
    data.length > 0 ? Math.max(...data.map((item) => item.used)) : 1;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#f7f4ef",
        padding: "32px",
        fontFamily: "Arial, sans-serif",
        color: "#1f2937",
      }}
    >
      <div
        style={{
          maxWidth: "1100px",
          margin: "0 auto",
        }}
      >
        <header style={{ marginBottom: "32px" }}>
          <h1 style={{ margin: 0, fontSize: "2rem" }}>Predictions Dashboard</h1>
          <p style={{ marginTop: "8px", color: "#4b5563" }}>
            Ingredient demand based on recent orders
          </p>
        </header>

        <div
          style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
            marginBottom: "24px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: "16px",
              marginBottom: "24px",
              flexWrap: "wrap",
            }}
          >
            <div>
              <h2 style={{ margin: 0 }}>Ingredient Usage Bar Graph</h2>
              <p style={{ marginTop: "8px", color: "#6b7280" }}>
                X-axis shows ingredients. Bar height shows how much was used in recent orders.
              </p>
            </div>

            <button
              onClick={fetchData}
              style={{
                backgroundColor: "#1f4d3d",
                color: "white",
                border: "none",
                borderRadius: "999px",
                padding: "12px 20px",
                cursor: "pointer",
                fontWeight: "bold",
              }}
            >
              Refresh Data
            </button>
          </div>

          {loading ? (
            <p>Loading chart...</p>
          ) : error ? (
            <p style={{ color: "crimson" }}>{error}</p>
          ) : data.length === 0 ? (
            <p>No data yet. Submit some orders first.</p>
          ) : (
            <div
              style={{
                display: "flex",
                alignItems: "flex-end",
                gap: "16px",
                height: "380px",
                padding: "20px 0 10px 0",
                borderBottom: "2px solid #d1d5db",
                overflowX: "auto",
              }}
            >
              {data.map((item) => {
                const heightPercent = (item.used / maxUsed) * 100;

                return (
                  <div
                    key={item.ingredient}
                    style={{
                      minWidth: "90px",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "flex-end",
                      height: "100%",
                    }}
                  >
                    <div
                      style={{
                        marginBottom: "8px",
                        fontWeight: "bold",
                        fontSize: "0.95rem",
                      }}
                    >
                      {item.used}
                    </div>

                    <div
                      style={{
                        width: "56px",
                        height: `${Math.max(heightPercent, 6)}%`,
                        backgroundColor: "#8b4513",
                        borderRadius: "10px 10px 0 0",
                        transition: "height 0.3s ease",
                      }}
                    />

                    <div
                      style={{
                        marginTop: "12px",
                        textAlign: "center",
                        fontSize: "0.9rem",
                        wordBreak: "break-word",
                      }}
                    >
                      {item.ingredient}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div
          style={{
            backgroundColor: "white",
            borderRadius: "16px",
            padding: "24px",
            boxShadow: "0 4px 14px rgba(0,0,0,0.08)",
          }}
        >
          <h2 style={{ marginTop: 0 }}>Trending Items</h2>

          {loading ? (
            <p>Loading trends...</p>
          ) : trending.length === 0 ? (
            <p>No trending data yet.</p>
          ) : (
            <div style={{ display: "grid", gap: "12px" }}>
              {trending.map((item, i) => (
                <div
                  key={`${item.item}-${i}`}
                  style={{
                    padding: "14px 16px",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    backgroundColor: "#fafafa",
                  }}
                >
                  <strong>{item.item}</strong>
                  <div style={{ marginTop: "4px", color: "#4b5563" }}>
                    {item.orders} recent order{item.orders !== 1 ? "s" : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default PredictionsDashboard;