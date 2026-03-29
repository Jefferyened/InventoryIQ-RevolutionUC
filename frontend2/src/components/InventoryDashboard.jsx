import React from "react";

function InventoryDashboard({ inventory = [] }) {
  const fallbackInventory = [
    { name: "bun", quantity: 45, max: 50 },
    { name: "patty", quantity: 8, max: 40 },
    { name: "cheese", quantity: 3, max: 35 },
    { name: "lettuce", quantity: 12, max: 30 },
    { name: "tomato", quantity: 5, max: 30 },
    { name: "onion", quantity: 9, max: 20 },
    { name: "pickles", quantity: 11, max: 25 },
  ];

  const items = inventory.length > 0 ? inventory : fallbackInventory;

  const formatName = (name) =>
    name
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase());

  const getPercent = (quantity, max) => {
    if (!max || max <= 0) return 0;
    return Math.round((quantity / max) * 100);
  };

  const getStatus = (pct) => {
    if (pct <= 10) return "Critical";
    if (pct <= 33) return "Low";
    if (pct <= 75) return "Normal";
    return "Full";
  };

  const getStatusColor = (pct) => {
    if (pct <= 10) return "#b91c1c";
    if (pct <= 33) return "#f59e0b";
    if (pct <= 75) return "#facc15";
    return "#16a34a";
  };

  return (
    <section style={{ padding: "24px" }}>
      <div style={{ marginBottom: "20px" }}>
        <h2>Inventory Dashboard</h2>
        <p>Current ingredient levels for the business.</p>
      </div>

      <div style={{ display: "grid", gap: "12px" }}>
        {items.map((item) => {
          const pct = getPercent(item.quantity, item.max);
          const status = getStatus(pct);
          const color = getStatusColor(pct);

          return (
            <div
              key={item.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px",
                border: "1px solid #e6e6e6",
                borderRadius: 10,
                background: "#fff",
                boxShadow: "0 1px 4px rgba(0,0,0,0.04)",
              }}
            >
              <div style={{ flex: "0 0 180px" }}>
                <h4 style={{ margin: 0 }}>{formatName(item.name)}</h4>
                <div style={{ fontSize: 12, color: "#666" }}>
                  {item.quantity} / {item.max} ·{" "}
                  <strong style={{ color }}>{status}</strong>
                </div>
              </div>

              <div style={{ flex: 1 }}>
                <div
                  style={{
                    height: 14,
                    background: "#f3f4f6",
                    borderRadius: 8,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.max(0, Math.min(100, pct))}%`,
                      background: color,
                      transition: "width 300ms ease",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  width: 64,
                  textAlign: "right",
                  fontVariantNumeric: "tabular-nums",
                }}
              >
                <strong>{pct}%</strong>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}

export default InventoryDashboard;