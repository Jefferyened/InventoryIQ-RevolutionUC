// This function totals ingredient usage from the cart
export function calculateIngredientUsage(cart) {
  const usage = {};

  for (const item of cart) {
    const baseIngredients = item.baseIngredients || {};

    for (const [ingredient, quantity] of Object.entries(baseIngredients)) {
      usage[ingredient] = (usage[ingredient] || 0) + quantity;
    }

    const modifiers = item.modifiers || [];

    for (const mod of modifiers) {
      if (mod.type === "add") {
        const qtyToAdd = mod.quantity || 1;
        usage[mod.ingredient] = (usage[mod.ingredient] || 0) + qtyToAdd;
      }

      if (mod.type === "remove") {
        usage[mod.ingredient] = (usage[mod.ingredient] || 0) - 1;
      }
    }
  }

  for (const key in usage) {
    if (usage[key] < 0) {
      usage[key] = 0;
    }
  }

  return usage;
}