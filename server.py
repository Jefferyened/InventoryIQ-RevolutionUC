from flask import Flask, jsonify, request
from flask_cors import CORS
import json
import os

app = Flask(__name__)
CORS(app)  # Allows your React app to communicate with this server

# --- DATA PERSISTENCE ---
Inventory = {}
Menu = {}
INVENTORY_FILE = "Inventory_data.json"
MENU_FILE = "Menu_data.json"

def load_data():
    global Inventory, Menu
    if os.path.exists(INVENTORY_FILE):
        with open(INVENTORY_FILE, "r") as file:
            Inventory = json.load(file)
    if os.path.exists(MENU_FILE):
        with open(MENU_FILE, "r") as file:
            Menu = json.load(file)

def save_data():
    with open(INVENTORY_FILE, "w") as file:
        json.dump(Inventory, file, indent=4) 
    with open(MENU_FILE, "w") as file:
        json.dump(Menu, file, indent=4)

load_data()

# --- INVENTORY ROUTES ---

@app.route('/api/inventory', methods=['GET'])
def get_inventory():
    return jsonify(Inventory), 200

@app.route('/api/inventory', methods=['POST'])
def add_inventory_item():
    data = request.json
    item_id = data.get('id')
    
    if not item_id:
        return jsonify({"error": "Missing item ID"}), 400
    
    # This acts as both ADD and UPDATE (Restock)
    Inventory[item_id] = {
        "name": data.get('name', 'Unknown'),
        "category": data.get('category', 'Uncategorized'),
        "quantity": float(data.get('quantity', 0)),
        "unit": data.get('unit', 'units'),
        "reorder_threshold": float(data.get('reorder_threshold', 0))
    }
    save_data()
    return jsonify({"message": f"Inventory updated for {Inventory[item_id]['name']}"}), 201

@app.route('/api/inventory/<item_id>', methods=['DELETE'])
def delete_inventory_item(item_id):
    if item_id in Inventory:
        del Inventory[item_id]
        save_data()
        return jsonify({"message": "Item deleted"}), 200
    return jsonify({"error": "Item not found"}), 404

# --- MENU ROUTES ---

@app.route('/api/menu', methods=['GET'])
def get_menu():
    """Returns the menu with human-readable ingredient names and availability status"""
    detailed_menu = {}
    for dish_name, recipe in Menu.items():
        can_make = True
        ingredient_names = []
        
        for i_id, amount in recipe.items():
            name = Inventory[i_id]['name'] if i_id in Inventory else f"Unknown({i_id})"
            ingredient_names.append(name)
            if i_id not in Inventory or Inventory[i_id]['quantity'] < amount:
                can_make = False
        
        detailed_menu[dish_name] = {
            "ingredients": ingredient_names,
            "available": can_make,
            "recipe": recipe
        }
    return jsonify(detailed_menu), 200

@app.route('/api/menu', methods=['POST'])
def add_menu_item():
    data = request.json
    dish_name = data.get('name')
    recipe = data.get('recipe') # Expecting {"item_01": 2, "item_02": 1}

    if not dish_name or not recipe:
        return jsonify({"error": "Missing dish name or recipe"}), 400
    
    Menu[dish_name] = recipe
    save_data()
    return jsonify({"message": f"{dish_name} added to menu"}), 201

# --- ORDERING LOGIC ---

@app.route('/api/order', methods=['POST'])
def place_order():
    data = request.json
    dish_name = data.get('dish_name')

    if dish_name not in Menu:
        return jsonify({"error": "Dish not found"}), 404

    recipe = Menu[dish_name]
    
    # Check Stock
    for item_id, amount in recipe.items():
        if item_id not in Inventory or Inventory[item_id]['quantity'] < amount:
            return jsonify({"error": f"Insufficient stock for {dish_name}"}), 400

    # Subtract Stock
    low_stock_alerts = []
    for item_id, amount in recipe.items():
        Inventory[item_id]['quantity'] -= amount
        if Inventory[item_id]['quantity'] <= Inventory[item_id]['reorder_threshold']:
            low_stock_alerts.append(Inventory[item_id]['name'])

    save_data()
    return jsonify({
        "message": f"Order for {dish_name} successful!",
        "alerts": low_stock_alerts
    }), 200

if __name__ == '__main__':
    app.run(debug=True, port=5000)


