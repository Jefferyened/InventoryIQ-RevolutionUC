import { useMemo, useState } from "react";
import "./App.css";
import "./components/InventoryPage.jsx";

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
      { label: "No Tomato", type: "remove", ingredient: "tomato", priceChange: 0 },
      { label: "Extra Cheese", type: "add", ingredient: "cheese", quantity: 1, priceChange: 1.0 },
      { label: "Extra Patty", type: "add", ingredient: "patty", quantity: 1, priceChange: 2.5 },
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
];

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

  const addToCart = () => {
    if (!selectedItem) return;

    const modifierCost = selectedModifiers.reduce(
      (sum, mod) => sum + (mod.priceChange || 0),
      0
    );

    const cartItem = {
      cartId: Date.now(),
      id: selectedItem.id,
      name: selectedItem.name,
      image: selectedItem.image,
      basePrice: selectedItem.price,
      finalPrice: selectedItem.price + modifierCost,
      modifiers: selectedModifiers,
      baseIngredients: selectedItem.baseIngredients,
    };

    setCart([...cart, cartItem]);
    setSelectedItem(null);
    setSelectedModifiers([]);
  };

  const removeFromCart = (cartId) => {
    setCart(cart.filter((item) => item.cartId !== cartId));
  };

  const total = useMemo(() => {
    return cart.reduce((sum, item) => sum + item.finalPrice, 0).toFixed(2);
  }, [cart]);

  const submitOrder = () => {
    if (cart.length === 0) {
      alert("Cart is empty.");
      return;
    }

    alert("Order submitted! Next step: connect this to Flask backend.");
    console.log("Submitted cart:", cart);
  };

  return (
    <div className="app">
      <header className="topbar">
        <div>
          <h1>Stacked</h1>
          <p>Build an order. Track inventory. Simulate the kitchen.</p>
        </div>
      </header>

      <main className="layout">
        <section className="menu-section">
          <div className="section-header">
            <h2>Menu</h2>
            <p>Choose an item to customize and add to cart.</p>
          </div>

          <div className="menu-grid">
            {menuItems.map((item) => (
              <div className="menu-card" key={item.id}>
                <img src={item.image} alt={item.name} className="menu-image" />
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
            <h2>Your Cart</h2>
            <p>{cart.length} item(s)</p>
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
                {selectedItem.modifierOptions.map((modifier, index) => {
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
                })}
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