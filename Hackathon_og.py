import json
import os

Inventory = {}
Menu = {}

INVENTORY_FILE = "Inventory_data.json"
MENU_FILE = "Menu_data.json"

def save_data():
    with open(INVENTORY_FILE, "w") as file:
        json.dump(Inventory, file, indent=4) 
    with open(MENU_FILE, "w") as file:
        json.dump(Menu, file, indent=4)
    print("Data saved")

def load_data():
    global Inventory, Menu
    if os.path.exists(INVENTORY_FILE):
        with open(INVENTORY_FILE, "r") as file:
            Inventory = json.load(file)
        print("Inventory loaded")
    else:
        print("No saved inventory, starting fresh")

    if os.path.exists(MENU_FILE):
        with open(MENU_FILE, "r") as file:
            Menu = json.load(file)
        print("Menu loaded")
    else:
        print("No saved menu, starting fresh")

#Decrement stock of item by amount_used given the item_id
def decrement_stock(item_id, amount_used):
    print()
    #check that its an item in inventory
    if item_id in Inventory:
            #Check valid input
            if amount_used < 0:
                print("Please enter a positive number")
                return
            #Check that we have enough stock
            if amount_used > Inventory[item_id]['quantity']:
                print(f"Error not enough {Inventory[item_id]['name']} is stock!")
                print(f"Current stock level:{Inventory[item_id]['quantity']} {Inventory[item_id]['unit']}")
                return   
            else:                             
                Inventory[item_id]['quantity'] -= amount_used
                print(f"Subtracted {amount_used} from {Inventory[item_id]['name']}")
                print(f"New stock level:{Inventory[item_id]['quantity']} {Inventory[item_id]['unit']}")
            if Inventory[item_id]['quantity'] <= Inventory[item_id]['reorder_threshold']:
                print(f"ALERT! {Inventory[item_id]['name']} is low order soon")
                print(f"Current stock level:{Inventory[item_id]['quantity']} {Inventory[item_id]['unit']}")
                
    else:
        print("That item is not in inventory")
    save_data()

def add_item():
    print(f"Adding new item")
    item_id = input("Enter item ID(Example item_03): ").strip()
    if item_id in Inventory:
        print(f"Item already in inventory")
        return
    name = input("Enter item name: ").strip()
    category = input(f"Enter item catagory(Meat, Dairy etc.): ").strip()
    unit = input(f"Enter unit: ").strip()
    try:
        quantity = float(input(f"Enter item quantity: "))
        reorder_threshold = float(input(f"Enter reorder threshold: "))
    except ValueError:
        print(f"Invalid input please input numbers only")
        return
    Inventory[item_id] = {
        "name": name,
        "category": category,
        "quantity": quantity,
        "unit": unit,
        "reorder_threshold": reorder_threshold
    }
    print(f"Successfully Added {name} to inventory!")
    save_data()

def remove_item():
    item_id = input("Enter item id to remove: ").strip()
    if not Inventory:
        print("No items to remove")
    elif item_id in Inventory:
        name = Inventory[item_id]['name']
        del Inventory[item_id]
        print(f"Removed {name} from system")
    else:
        print("Item not found")
    save_data()

def view_inventory():
    print(f"\n{'ID':<10} {'NAME':<15} {'STOCK':<10} {'UNIT':<8} {'STATUS':<10}")
    print("-" * 55)
    
    for i_id, info in Inventory.items():
        # Check if stock is low
        if info['quantity'] <= info['reorder_threshold']:
            status = "⚠️  LOW"
        else:
            status = "✅ OK"
        # Print the row with the new status column
        print(f"{i_id:<10} {info['name']:<15} {info['quantity']:<10} {info['unit']:<8} {status:<10}")

def order_dish():
    print("Place an order")
    dish_name = input("Please input dish name: ").strip()

    if dish_name in Menu:
        recipe = Menu[dish_name]
        #check if you can make the dish
        can_make = True
        for ingredient_id, amount_needed in recipe.items():
            #check for low stock
            if ingredient_id not in Inventory or Inventory[ingredient_id]['quantity'] < amount_needed:
                name = Inventory[ingredient_id]['name'] if ingredient_id in Inventory else ingredient_id
                print(f"Cannot make {dish_name}. Not enough {name}!")
                can_make = False
                break
        if can_make:
            for ingredient_id, amount_needed in recipe.items():
                Inventory[ingredient_id]['quantity'] -= amount_needed
                
                if Inventory[ingredient_id]['quantity'] <= Inventory[ingredient_id]['reorder_threshold']:
                    print(f"LOW STOCK ALERT: Time to order {Inventory[ingredient_id]['name']}")
            print(f"Order for {dish_name} placed!")
    save_data()
def add_menu_item():
    print("Add new menu item")
    dish_name = input("Enter dish name: ").strip()
    if dish_name in Menu:
        print("Dsih is already in menu")
        return
    recipe = {}
    while True:
        ingredient_id = input("Enter ingredient ID (or type 'done' to finish): ").strip()
        if ingredient_id.lower() == 'done':
            break
        if ingredient_id not in Inventory:
            print("That ingredient is not in inventory")
            continue
        try:
            amount = float(input(f"How much {Inventory[ingredient_id]['name']} is needed for one {dish_name}?: "))
            recipe[ingredient_id] = amount
        except ValueError:
            print("Please enter a valid number for the amount")
    if recipe:
        Menu[dish_name] = recipe
        print(f"{dish_name} added to menu with {len(recipe)} ingredients")
    else:
        print("Dish cancelled no ingredients added")
    save_data()

def remove_menu_item():
    item_id = input("What menu item would you like to remove? ").strip()
    if item_id not in Menu:
        print(f"'{item_id}' not in menu")
    else:
        del Menu[item_id]
        print(f"Successfully removed {item_id} from menu")
        save_data()

def view_menu():
    if not Menu:
        print("\nMenu is currently empty")
        return
    
    print(f"\n{'DISH':<15} {'INGREDIENTS':<30} {'STATUS':<10}")
    print("-" * 60)

    for dish_name, recipe in Menu.items():
        ingredient_names = []
        can_make = True

        for i_id, amount_needed in recipe.items():
    
            if i_id in Inventory:
                name = Inventory[i_id]['name']
                # Also check if we have enough stock while we're here
                if Inventory[i_id]['quantity'] < amount_needed:
                    can_make = False
            else:
                name = f"Unknown({i_id})"
                can_make = False
            
            ingredient_names.append(name)

        ing_string = ", ".join(ingredient_names)
        
        if len(ing_string) > 27:
            ing_string = ing_string[:25] + ".."

        status = "✅ READY" if can_make else "❌ OUT"
        
        print(f"{dish_name:<15} {ing_string:<30} {status:<10}")

def restock():
    print(" Restock Item ")
    
    item_id = input("Input the item ID you would like to restock: ").strip()
    
    if item_id in Inventory:
        try:
            name = Inventory[item_id]['name']
            amount = float(input(f"How much {name} are you adding? "))
            
            if amount < 0:
                print("Error: No negative numbers allowed. Use 'Log Usage' to remove stock.")
                return
            
            # Update the total
            Inventory[item_id]['quantity'] += amount
            
            print(f"Successfully added {amount} to {name}.")
            print(f"New total inventory for {name}: {Inventory[item_id]['quantity']} {Inventory[item_id]['unit']}")
            save_data()
            
        except ValueError:
            print("Invalid input. Please enter a numeric value.")
    else:
        print(f"Error: ID '{item_id}' is not in Inventory.")

def generate_shopping_list():
    print(f"{'ITEM':<15} {'CURRENT':<10} {'THRESHOLD':<10} {'ORDER AMT':<10}")
    print("-" * 50)

    found_low_stock = False
    for i_id, info in Inventory.items():
        if info['quantity'] <= info['reorder_threshold']:
            target_stock = info['reorder_threshold'] * 3
            needed = target_stock - info['quantity']

            print(f"{info['name']:<15} {info['quantity']:<10} {info['reorder_threshold']:<10} {needed:<10.2f} {info['unit']}")

            found_low_stock = True

    if not found_low_stock:
        print("Everything is fully stocked!")

def search_inventory():
    print("Search Inventory")
    query = input("Enter item name or category to search for: ").lower().strip()
    
    # Header
    print(f"\n{'ID':<10} {'NAME':<15} {'STOCK':<10} {'CATEGORY':<15}")
    print("-" * 50)
    
    found = False
    for i_id, info in Inventory.items():
        # Check if the query exists in the name or the category
        if query in info['name'].lower() or query in info['category'].lower():
            print(f"{i_id:<10} {info['name']:<15} {info['quantity']:<10.2f} {info['category']:<15}")
            found = True
            
    if not found:
        print(f"No items found matching '{query}'.")


def main_menu():
    load_data()
    while True:
        print("Inventory management system")
        print("1. View inventory")
        print("2. Add item")
        print("3. Log usage")
        print("4. Remove item")
        print("5. Add menu item")
        print("6. Remove menu item")
        print("7. View Menu")
        print("8. Order a dish")
        print("9. Restock")
        print("10. Generate shopping list")
        print("11. Search inventory")
        print("12. Exit")

        choice = input("Select an option (1-12): ")
        if choice == "1":
            if not Inventory:
                print("Inventory empty")
            else:
                view_inventory()
        elif choice == "2":
            add_item()
        elif choice == "3":
            id_to_edit = input("Enter item id to edit: ")
            amount = float(input("Amount used: "))
            decrement_stock(id_to_edit, amount)
        elif choice == "4":
            remove_item()
        elif choice == "5":
            add_menu_item()
        elif choice == "6":
            remove_menu_item()
        elif choice == "7":
            view_menu()
        elif choice == "8":
            order_dish()
        elif choice == "9":
            restock()
        elif choice == "10":
            generate_shopping_list()
        elif choice == "11":
            search_inventory()
        elif choice == "12":
            print("Exiting system")
            break
        else:
            print("Invalid choice, please try again")

if __name__ == "__main__":
    main_menu()