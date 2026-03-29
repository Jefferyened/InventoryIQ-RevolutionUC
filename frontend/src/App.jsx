<<<<<<< HEAD
import { useState, useEffect } from 'react'
import './App.css'

function App() {
  // This variable holds your inventory data once it arrives from Python
  const [inventory, setInventory] = useState({})

  // useEffect is a React hook that runs exactly once when the page loads
  useEffect(() => {
    // 1. Ask Python for the data
    fetch('http://localhost:5000/api/inventory')
      .then(response => response.json())
      // 2. Save the data into our React state
      .then(data => setInventory(data))
      .catch(error => console.error("Error fetching data:", error))
  }, [])

  return (
    <div className="app-container">
      <h1>🍔 Restaurant Management System</h1>
      
      <div className="table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Category</th>
              <th>Stock</th>
              <th>Unit</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {/* We loop through your Python dictionary using Object.entries */}
            {Object.entries(inventory).map(([id, info]) => (
              <tr key={id}>
                <td><strong>{id}</strong></td>
                <td>{info.name}</td>
                <td>{info.category}</td>
                <td>{info.quantity}</td>
                <td>{info.unit}</td>
                <td>
                  {info.quantity <= info.reorder_threshold 
                    ? "⚠️ LOW" 
                    : "✅ OK"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App
=======
import { useMemo, useState } from "react";
import "./App.css";

const menuItems = [
  {
    id: 1,
    name: "Classic Burger",
    price: 9.99,
    image:
      "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80",
    description: "Beef patty, bun, cheese, lettuce, tomato, onion",
    baseIngredients: {
      bun: 1,
      patty: 1,
      cheese: 1,
      lettuce: 1,
      tomato: 1,
      onion: 1,
    },
    modifierOptions: [
      { label: "No Onion", type: "remove", ingredient: "onion", priceChange: 0 },
      { label: "Extra Onion", type: "add", ingredient: "onion", quantity: 1, priceChange: 0.25 },
      { label: "No Tomato", type: "remove", ingredient: "tomato", priceChange: 0 },
      { label: "Extra Tomato", type: "add", ingredient: "tomato", quantity: 1, priceChange: 0.25 },
      { label: "No Cheese", type: "remove", ingredient: "cheese", priceChange: 0 },
      { label: "Extra Cheese", type: "add", ingredient: "cheese", quantity: 1, priceChange: 1.0 },
      {
        label: "Extra Patty",
        type: "add",
        ingredient: "patty",
        quantity: 1,
        priceChange: 2.5,
      },
      {
        label: "Vegan Patty",
        type: "swap",
        ingredient: "patty",
        replacement: "vegan patty",
        priceChange: 1.5,
      },
    ],
  },
  {
    id: 2,
    name: "Chicken Sandwich",
    price: 8.99,
    image:
      "https://images.unsplash.com/photo-1606755962773-d324e0a13086?auto=format&fit=crop&w=900&q=80",
    description: "Chicken, bun, lettuce, pickles, sauce",
    baseIngredients: {
      bun: 1,
      chicken: 1,
      lettuce: 1,
      pickles: 1,
      sauce: 1,
    },
    modifierOptions: [
      { label: "No Pickles", type: "remove", ingredient: "pickles", priceChange: 0 },
      { label: "Extra Pickles", type: "add", ingredient: "pickles", quantity: 1, priceChange: 0.25 },
      { label: "No Sauce", type: "remove", ingredient: "sauce", priceChange: 0 },
      { label: "Extra Sauce", type: "add", ingredient: "sauce", quantity: 1, priceChange: 0.5 },
      { label: "Add Cheese", type: "add", ingredient: "cheese", quantity: 1, priceChange: 1.0 },
    ],
  },
  {
    id: 3,
    name: "Fries",
    price: 3.99,
    image:
      "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=900&q=80",
    description: "Golden fries with salt",
    baseIngredients: {
      fries: 1,
      salt: 1,
    },
    modifierOptions: [
      { label: "Extra Fries", type: "add", ingredient: "fries", quantity: 1, priceChange: 1.5 },
      { label: "No Salt", type: "remove", ingredient: "salt", priceChange: 0 },
    ],
  },
  {
    id: 4,
    name: "Coca-Cola",
    price: 2.49,
    image:
      "https://images.unsplash.com/photo-1581006852262-e4307cf6283a?auto=format&fit=crop&w=900&q=80",
    description: "Classic Coca-Cola served ice cold",
    baseIngredients: {
      coke: 1,
      ice: 1,
    },
    modifierOptions: [
      { label: "No Ice", type: "remove", ingredient: "ice", priceChange: 0 },
      { label: "Extra Ice", type: "add", ingredient: "ice", quantity: 1, priceChange: 0 },
    ],
  },
  {
    id: 5,
    name: "Diet Coke",
    price: 2.49,
    image:
      "https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=900&q=80",
    description: "Diet Coke served ice cold",
    baseIngredients: {
      dietCoke: 1,
      ice: 1,
    },
    modifierOptions: [
      { label: "No Ice", type: "remove", ingredient: "ice", priceChange: 0 },
      { label: "Extra Ice", type: "add", ingredient: "ice", quantity: 1, priceChange: 0 },
    ],
  },
  {
    id: 6,
    name: "Sprite",
    price: 2.49,
    image:
      "https://images.unsplash.com/photo-1624517452488-04869289c4ca?auto=format&fit=crop&w=900&q=80",
    description: "Crisp lemon-lime Sprite",
    baseIngredients: {
      sprite: 1,
      ice: 1,
    },
    modifierOptions: [
      { label: "No Ice", type: "remove", ingredient: "ice", priceChange: 0 },
      { label: "Extra Ice", type: "add", ingredient: "ice", quantity: 1, priceChange: 0 },
    ],
  },
  {
    id: 7,
    name: "Bottled Water",
    price: 1.99,
    image:
      "https://images.unsplash.com/photo-1564419320461-6870880221ad?auto=format&fit=crop&w=900&q=80",
    description: "Chilled bottled water",
    baseIngredients: {
      water: 1,
    },
    modifierOptions: [],
  },
];

const BACKEND_URL = "http://127.0.0.1:5001";

function App() {
  const [cart, setCart] = useState([]);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedModifiers, setSelectedModifiers] = useState([]);

  const toggleModifier = (modifier) => {
    const exists = selectedModifiers.some((m) => m.label === modifier.label);

    if (exists) {
      setSelectedModifiers(selectedModifiers.filter((m) => m.label !== modifier.label));
    } else {
      setSelectedModifiers([...selectedModifiers, modifier]);
    }
  };

  const openCustomizer = (item) => {
    setSelectedItem(item);
    setSelectedModifiers([]);
  };

  const addDefaultItemToCart = (item) => {
    const cartItem = {
      cartId: Date.now() + Math.random(),
      id: item.id,
      name: item.name,
      image: item.image,
      basePrice: item.price,
      finalPrice: item.price,
      modifiers: [],
      baseIngredients: item.baseIngredients,
    };

    setCart((prev) => [...prev, cartItem]);
  };

  const addToCart = () => {
    if (!selectedItem) return;

    const modifierCost = selectedModifiers.reduce(
      (sum, mod) => sum + (mod.priceChange || 0),
      0
    );

    const cartItem = {
      cartId: Date.now() + Math.random(),
      id: selectedItem.id,
      name: selectedItem.name,
      image: selectedItem.image,
      basePrice: selectedItem.price,
      finalPrice: selectedItem.price + modifierCost,
      modifiers: selectedModifiers,
      baseIngredients: selectedItem.baseIngredients,
    };

    setCart((prev) => [...prev, cartItem]);
    setSelectedItem(null);
    setSelectedModifiers([]);
  };

  const removeFromCart = (cartId) => {
    setCart((prev) => prev.filter((item) => item.cartId !== cartId));
  };

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.finalPrice, 0).toFixed(2);
  }, [cart]);

  const submitOrder = async () => {
    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }

    try {
      const response = await fetch(`${BACKEND_URL}/submit-order`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ items: cart }),
      });

      const result = await response.json();

      if (!response.ok) {
        alert(result.error || "Failed to submit order.");
        return;
      }

      console.log("Order submission result:", result);
      alert("Order submitted successfully!");
      setCart([]);
      setSelectedItem(null);
      setSelectedModifiers([]);
    } catch (error) {
      console.error("Error submitting order:", error);
      alert("Could not connect to backend.");
    }
  };

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1 className="restaurant-title">Braunstein&apos;s Burgers & Grill</h1>
          <p className="restaurant-subtitle">
            Build an order and simulate the kitchen workflow.
          </p>
        </div>
      </header>

      <main className="layout">
        <section className="menu-section">
          <div className="section-header">
            <h2 className="section-title">Menu</h2>
            <p className="section-subtitle">
              Click an image for quick add or customize your item.
            </p>
          </div>

          <div className="menu-grid">
            {menuItems.map((item) => (
              <div className="menu-card" key={item.id}>
                <img
                  src={item.image}
                  alt={item.name}
                  className="menu-image"
                  onClick={() => addDefaultItemToCart(item)}
                  style={{ cursor: "pointer" }}
                  title={`Add ${item.name} to cart`}
                />
                <div className="menu-card-body">
                  <div className="menu-card-top">
                    <h3>{item.name}</h3>
                    <span>${item.price.toFixed(2)}</span>
                  </div>
                  <p>{item.description}</p>
                  <button className="primary-btn" onClick={() => openCustomizer(item)}>
                    Customize
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <aside className="cart-section">
          <div className="section-header">
            <h2 className="section-title">Your Cart</h2>
            <p className="section-subtitle">{cart.length} item(s)</p>
          </div>

          {selectedItem && (
            <div className="customizer">
              <img
                src={selectedItem.image}
                alt={selectedItem.name}
                className="customizer-image"
              />
              <h3>{selectedItem.name}</h3>
              <p className="muted">Base price: ${selectedItem.price.toFixed(2)}</p>

              <div className="modifier-list">
                {selectedItem.modifierOptions.length > 0 ? (
                  selectedItem.modifierOptions.map((modifier, index) => {
                    const checked = selectedModifiers.some(
                      (m) => m.label === modifier.label
                    );

                    return (
                      <label className="modifier-row" key={index}>
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleModifier(modifier)}
                        />
                        <span>{modifier.label}</span>
                        <span className="modifier-price">
                          {modifier.priceChange > 0
                            ? `+$${modifier.priceChange.toFixed(2)}`
                            : "Free"}
                        </span>
                      </label>
                    );
                  })
                ) : (
                  <p className="muted">No customizations available for this item.</p>
                )}
              </div>

              <div className="customizer-actions">
                <button className="secondary-btn" onClick={() => setSelectedItem(null)}>
                  Cancel
                </button>
                <button className="primary-btn" onClick={addToCart}>
                  Add to Cart
                </button>
              </div>
            </div>
          )}

          <div className="cart-list">
            {cart.length === 0 ? (
              <div className="empty-cart">Your cart is empty.</div>
            ) : (
              cart.map((item) => (
                <div className="cart-item" key={item.cartId}>
                  <div className="cart-item-header">
                    <div>
                      <h4>{item.name}</h4>
                      <p>${item.finalPrice.toFixed(2)}</p>
                    </div>
                    <button
                      className="remove-btn"
                      onClick={() => removeFromCart(item.cartId)}
                    >
                      Remove
                    </button>
                  </div>

                  {item.modifiers.length > 0 && (
                    <div className="modifier-tags">
                      {item.modifiers.map((mod, i) => (
                        <span className="tag" key={i}>
                          {mod.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          <div className="cart-footer">
            <div className="total-row">
              <span>Total</span>
              <strong>${total}</strong>
            </div>
            <button className="submit-btn" onClick={submitOrder}>
              Submit Order
            </button>
          </div>
        </aside>
      </main>
    </div>
  );
}

export default App;
>>>>>>> c9a79b499e3fdc4446053d3a98c78f295404779a
