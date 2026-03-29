import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom/client";
import InventoryDashboard from "./components/InventoryDashboard";
import "./styles.css";

const fallbackInventory = [
  { name: "bun", quantity: 20, max: 50 },
  { name: "patty", quantity: 10, max: 40 },
  { name: "lettuce", quantity: 15, max: 30 },
  { name: "tomato", quantity: 12, max: 30 },
  { name: "onion", quantity: 8, max: 20 },
  { name: "cheese", quantity: 18, max: 35 },
  { name: "pickles", quantity: 9, max: 25 },
];

function App() {
  const [inventory, setInventory] = useState(fallbackInventory);

  useEffect(() => {
    fetch("http://10.11.110.20:5000/api/inventory")
      .then((res) => res.json())
      .then((data) => {
        const maxValues = {
          bun: 50,
          patty: 40,
          lettuce: 30,
          tomato: 30,
          onion: 20,
          cheese: 35,
          pickles: 25,
        };

        const formattedInventory = Object.entries(data).map(([name, quantity]) => ({
          name,
          quantity,
          max: maxValues[name] || quantity || 1,
        }));

        setInventory(formattedInventory);
      })
      .catch((error) => {
        console.error("Failed to fetch inventory:", error);
      });
  }, []);

  return <InventoryDashboard inventory={inventory} />;
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);