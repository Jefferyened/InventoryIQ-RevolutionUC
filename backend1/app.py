from flask import Flask, request, jsonify, Response
from flask_cors import CORS
import json
from pathlib import Path
from datetime import datetime, timedelta

app = Flask(__name__)
CORS(app)

BASE_DIR = Path(__file__).resolve().parent
INVENTORY_FILE = BASE_DIR / "inventory.json"
ORDERS_FILE = BASE_DIR / "orders.json"


def ensure_file_exists(file_path, default_data):
    if not file_path.exists():
        with open(file_path, "w") as f:
            json.dump(default_data, f, indent=2)


def load_json(file_path):
    with open(file_path, "r") as f:
        return json.load(f)


def save_json(file_path, data):
    with open(file_path, "w") as f:
        json.dump(data, f, indent=2)


def apply_modifiers(ingredients, modifiers):
    updated = ingredients.copy()

    for mod in modifiers:
        mod_type = mod.get("type")
        ingredient = mod.get("ingredient")
        quantity = mod.get("quantity", 1)
        replacement = mod.get("replacement")

        if mod_type == "remove":
            if ingredient in updated and updated[ingredient] > 0:
                updated[ingredient] -= 1

        elif mod_type == "add":
            updated[ingredient] = updated.get(ingredient, 0) + quantity

        elif mod_type == "swap":
            if ingredient in updated and updated[ingredient] > 0:
                updated[ingredient] -= 1
            if replacement:
                updated[replacement] = updated.get(replacement, 0) + 1

    updated = {k: v for k, v in updated.items() if v > 0}
    return updated


def get_recent_orders(orders, minutes=30):
    cutoff = datetime.now() - timedelta(minutes=minutes)
    recent = []

    for order in orders:
        try:
            ts = datetime.fromisoformat(order["timestamp"])
            if ts >= cutoff:
                recent.append(order)
        except Exception:
            continue

    return recent


def get_last_n_orders(orders, n=5):
    if n <= 0:
        return []
    return orders[-n:] if len(orders) >= n else orders


def calculate_usage_from_orders(order_list):
    usage = {}

    for order in order_list:
        for item in order.get("items", []):
            base_ingredients = item.get("baseIngredients", {})
            modifiers = item.get("modifiers", [])
            final_ingredients = apply_modifiers(base_ingredients, modifiers)

            for ingredient, amount in final_ingredients.items():
                usage[ingredient] = usage.get(ingredient, 0) + amount

    return usage


def generate_weighted_forecast(orders):
    usage_5 = calculate_usage_from_orders(get_recent_orders(orders, 5))
    usage_15 = calculate_usage_from_orders(get_recent_orders(orders, 15))
    usage_30 = calculate_usage_from_orders(get_recent_orders(orders, 30))

    all_ingredients = set(usage_5) | set(usage_15) | set(usage_30)
    forecast = {}

    for ingredient in all_ingredients:
        last_5 = usage_5.get(ingredient, 0)
        last_15 = usage_15.get(ingredient, 0)
        last_30 = usage_30.get(ingredient, 0)

        hourly_from_5 = last_5 * 12
        hourly_from_15 = last_15 * 4
        hourly_from_30 = last_30 * 2

        predicted = (0.5 * hourly_from_5) + (0.3 * hourly_from_15) + (0.2 * hourly_from_30)
        forecast[ingredient] = round(predicted, 2)

    return dict(sorted(forecast.items(), key=lambda x: x[1], reverse=True))


def build_recent_sales_summary(orders):
    recent_orders_5 = get_recent_orders(orders, 5)
    recent_orders_15 = get_recent_orders(orders, 15)
    recent_orders_30 = get_recent_orders(orders, 30)

    item_count_5 = sum(len(order.get("items", [])) for order in recent_orders_5)
    item_count_15 = sum(len(order.get("items", [])) for order in recent_orders_15)
    item_count_30 = sum(len(order.get("items", [])) for order in recent_orders_30)

    return {
        "ordersLast5Minutes": len(recent_orders_5),
        "ordersLast15Minutes": len(recent_orders_15),
        "ordersLast30Minutes": len(recent_orders_30),
        "itemsSoldLast5Minutes": item_count_5,
        "itemsSoldLast15Minutes": item_count_15,
        "itemsSoldLast30Minutes": item_count_30
    }


def build_product_usage_chart_data(orders, last_n_orders=5):
    recent_orders = get_last_n_orders(orders, last_n_orders)
    counts = {}

    for order in recent_orders:
        for item in order.get("items", []):
            name = item.get("name", "Unknown")
            counts[name] = counts.get(name, 0) + 1

    chart_data = [
        {"product": name, "orders": count}
        for name, count in counts.items()
    ]

    chart_data.sort(key=lambda x: x["orders"], reverse=True)
    return chart_data


def generate_trending_items(recent_orders, limit=5):
    counts = {}

    for order in recent_orders:
        for item in order.get("items", []):
            name = item.get("name", "Unknown")
            counts[name] = counts.get(name, 0) + 1

    sorted_items = sorted(counts.items(), key=lambda x: x[1], reverse=True)

    return [
        {"item": name, "orders": count}
        for name, count in sorted_items[:limit]
    ]


def build_predictions(orders):
    recent_orders_5 = get_recent_orders(orders, 5)
    product_usage = build_product_usage_chart_data(orders, last_n_orders=8)
    forecast_next_hour = generate_weighted_forecast(orders)
    trending_items = generate_trending_items(recent_orders_5, limit=5)
    recent_sales_summary = build_recent_sales_summary(orders)
    top_product = product_usage[0]["product"] if product_usage else None

    return {
        "productUsage": product_usage,
        "topProduct": top_product,
        "trendingItems": trending_items,
        "forecastNextHour": forecast_next_hour,
        "recentSalesSummary": recent_sales_summary
    }


@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "Backend is running",
        "available_routes": [
            "/health",
            "/inventory",
            "/orders",
            "/predictions",
            "/predictions-data",
            "/submit-order"
        ]
    })


@app.route("/health", methods=["GET"])
def health():
    return jsonify({"status": "ok"})


@app.route("/inventory", methods=["GET"])
def get_inventory():
    inventory = load_json(INVENTORY_FILE)
    return jsonify(inventory)


@app.route("/orders", methods=["GET"])
def get_orders():
    orders = load_json(ORDERS_FILE)
    return jsonify(orders)


@app.route("/predictions-data", methods=["GET"])
def get_predictions_data():
    orders = load_json(ORDERS_FILE)
    predictions = build_predictions(orders)
    return jsonify({"predictions": predictions})


@app.route("/predictions", methods=["GET"])
def predictions_dashboard():
    html = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>Predictions Dashboard</title>
      <style>
        body {
          margin: 0;
          font-family: Arial, sans-serif;
          background: #f7f4ef;
          color: #1f2937;
        }

        .container {
          max-width: 1100px;
          margin: 0 auto;
          padding: 32px;
        }

        .header {
          margin-bottom: 28px;
        }

        .header h1 {
          margin: 0;
          font-size: 2rem;
        }

        .header p {
          margin-top: 8px;
          color: #4b5563;
        }

        .card {
          background: white;
          border-radius: 18px;
          padding: 24px;
          box-shadow: 0 4px 14px rgba(0,0,0,0.08);
          margin-bottom: 24px;
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 16px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }

        .card-header h2 {
          margin: 0;
        }

        .muted {
          color: #6b7280;
        }

        .button {
          background: #1f4d3d;
          color: white;
          border: none;
          border-radius: 999px;
          padding: 12px 20px;
          cursor: pointer;
          font-weight: bold;
        }

        .chart-wrap {
          display: flex;
          align-items: flex-end;
          gap: 16px;
          height: 380px;
          padding: 20px 0 10px 0;
          border-bottom: 2px solid #d1d5db;
          overflow-x: auto;
        }

        .bar-column {
          min-width: 100px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: flex-end;
          height: 100%;
        }

        .bar-value {
          margin-bottom: 8px;
          font-weight: bold;
          font-size: 0.95rem;
        }

        .bar {
          width: 60px;
          background: #8b4513;
          border-radius: 10px 10px 0 0;
          min-height: 22px;
          transition: height 0.3s ease;
        }

        .bar-label {
          margin-top: 12px;
          text-align: center;
          font-size: 0.9rem;
          word-break: break-word;
        }

        .trend-item {
          padding: 14px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #fafafa;
          margin-bottom: 12px;
        }

        .summary-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
        }

        .summary-box {
          padding: 14px 16px;
          border: 1px solid #e5e7eb;
          border-radius: 12px;
          background: #fafafa;
        }

        .hot-item {
          margin-top: 10px;
          padding: 12px 16px;
          background: #fff3cd;
          border: 1px solid #f1d58a;
          border-radius: 12px;
          font-weight: bold;
        }

        .error {
          color: crimson;
          font-weight: bold;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Predictions Dashboard</h1>
          <p>Demand-focused view based on recent restaurant orders.</p>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <h2>Hot Products Bar Graph</h2>
              <p class="muted">X-axis shows menu items. Bar height shows how many times each product appeared in the last 8 orders.</p>
            </div>
            <button class="button" onclick="loadPredictions()">Refresh Data</button>
          </div>

          <div id="top-product"></div>
          <div id="chart-status" class="muted">Loading chart...</div>
          <div id="chart" class="chart-wrap" style="display:none;"></div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <h2>Trending Items</h2>
              <p class="muted">Based on very recent sales activity.</p>
            </div>
          </div>
          <div id="trending-status" class="muted">Loading trends...</div>
          <div id="trending"></div>
        </div>

        <div class="card">
          <div class="card-header">
            <div>
              <h2>Recent Sales Summary</h2>
              <p class="muted">Short-window order and item counts.</p>
            </div>
          </div>
          <div id="summary" class="summary-grid"></div>
        </div>
      </div>

      <script>
        async function loadPredictions() {
          const chart = document.getElementById("chart");
          const chartStatus = document.getElementById("chart-status");
          const trending = document.getElementById("trending");
          const trendingStatus = document.getElementById("trending-status");
          const summary = document.getElementById("summary");
          const topProduct = document.getElementById("top-product");

          chart.style.display = "none";
          chart.innerHTML = "";
          chartStatus.textContent = "Loading chart...";
          trending.innerHTML = "";
          trendingStatus.textContent = "Loading trends...";
          summary.innerHTML = "";
          topProduct.innerHTML = "";

          try {
            const res = await fetch("/predictions-data");
            const json = await res.json();

            if (!res.ok) {
              chartStatus.innerHTML = '<span class="error">Failed to load predictions.</span>';
              trendingStatus.innerHTML = '<span class="error">Failed to load trends.</span>';
              return;
            }

            const predictions = json.predictions || {};
            const chartData = predictions.productUsage || [];
            const trendingData = predictions.trendingItems || [];
            const salesSummary = predictions.recentSalesSummary || {};
            const hottestProduct = predictions.topProduct || null;

            if (hottestProduct) {
              topProduct.innerHTML = `<div class="hot-item">🔥 Hottest product right now: ${hottestProduct}</div>`;
            }

            if (chartData.length === 0) {
              chartStatus.textContent = "No data yet. Submit some orders first.";
            } else {
              const maxOrders = Math.max(...chartData.map(item => item.orders), 1);
              chartStatus.textContent = "";
              chart.style.display = "flex";

              chartData.forEach(item => {
                const heightPercent = Math.max((item.orders / maxOrders) * 100, 6);

                const col = document.createElement("div");
                col.className = "bar-column";

                col.innerHTML = `
                  <div class="bar-value">${item.orders}</div>
                  <div class="bar" style="height:${heightPercent}%;"></div>
                  <div class="bar-label">${item.product}</div>
                `;

                chart.appendChild(col);
              });
            }

            if (trendingData.length === 0) {
              trendingStatus.textContent = "No trending data yet.";
            } else {
              trendingStatus.textContent = "";
              trendingData.forEach(item => {
                const div = document.createElement("div");
                div.className = "trend-item";
                div.innerHTML = `
                  <strong>${item.item}</strong>
                  <div style="margin-top:4px;color:#4b5563;">
                    ${item.orders} recent order${item.orders !== 1 ? "s" : ""}
                  </div>
                `;
                trending.appendChild(div);
              });
            }

            const summaryItems = [
              ["Orders Last 5 Minutes", salesSummary.ordersLast5Minutes ?? 0],
              ["Orders Last 15 Minutes", salesSummary.ordersLast15Minutes ?? 0],
              ["Orders Last 30 Minutes", salesSummary.ordersLast30Minutes ?? 0],
              ["Items Sold Last 5 Minutes", salesSummary.itemsSoldLast5Minutes ?? 0],
              ["Items Sold Last 15 Minutes", salesSummary.itemsSoldLast15Minutes ?? 0],
              ["Items Sold Last 30 Minutes", salesSummary.itemsSoldLast30Minutes ?? 0]
            ];

            summaryItems.forEach(([label, value]) => {
              const div = document.createElement("div");
              div.className = "summary-box";
              div.innerHTML = `
                <div style="font-weight:bold;">${label}</div>
                <div style="margin-top:8px;font-size:1.2rem;">${value}</div>
              `;
              summary.appendChild(div);
            });

          } catch (err) {
            chartStatus.innerHTML = '<span class="error">Could not connect to backend predictions data.</span>';
            trendingStatus.innerHTML = '<span class="error">Could not connect to backend predictions data.</span>';
          }
        }

        loadPredictions();
      </script>
    </body>
    </html>
    """
    return Response(html, mimetype="text/html")


@app.route("/submit-order", methods=["POST"])
def submit_order():
    data = request.get_json()

    if not data or "items" not in data:
        return jsonify({"error": "Missing items in request body"}), 400

    items = data["items"]
    inventory = load_json(INVENTORY_FILE)
    orders = load_json(ORDERS_FILE)

    inventory_changes = {}

    for item in items:
        base_ingredients = item.get("baseIngredients", {})
        modifiers = item.get("modifiers", [])
        final_ingredients = apply_modifiers(base_ingredients, modifiers)

        for ingredient, amount_needed in final_ingredients.items():
            current_stock = inventory.get(ingredient, 0)

            if current_stock < amount_needed:
                return jsonify({
                    "error": f"Not enough inventory for {ingredient}",
                    "ingredient": ingredient,
                    "needed": amount_needed,
                    "available": current_stock
                }), 400

        for ingredient, amount_needed in final_ingredients.items():
            inventory[ingredient] -= amount_needed
            inventory_changes[ingredient] = inventory_changes.get(ingredient, 0) + amount_needed

    order_record = {
        "timestamp": datetime.now().isoformat(),
        "items": items
    }

    orders.append(order_record)

    save_json(INVENTORY_FILE, inventory)
    save_json(ORDERS_FILE, orders)

    predictions = build_predictions(orders)

    return jsonify({
        "message": "Order submitted successfully",
        "inventoryChanges": inventory_changes,
        "updatedInventory": inventory,
        "orderCount": len(orders),
        "predictions": predictions
    })


if __name__ == "__main__":
    ensure_file_exists(INVENTORY_FILE, {})
    ensure_file_exists(ORDERS_FILE, [])
    app.run(debug=True, port=5001)