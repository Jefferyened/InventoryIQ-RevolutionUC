// Import the helper function
import { calculateIngredientUsage } from "./calculateIngredientUsage";

// Fake cart for testing
const mockCart = [
  {
    id: 1,
    name: "Classic Burger",
    baseIngredients: {
      bun: 1,
      patty: 1,
      cheese: 1,
      lettuce: 1,
      tomato: 1,
      onion: 1,
    },
    modifiers: [
      { label: "Extra Cheese", type: "add", ingredient: "cheese", quantity: 1 },
      { label: "No Onion", type: "remove", ingredient: "onion" },
    ],
  },
];

// Print the result to the browser console
console.log("Ingredient Usage:", calculateIngredientUsage(mockCart));