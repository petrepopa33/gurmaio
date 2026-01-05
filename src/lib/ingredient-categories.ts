export type IngredientCategory = 
  | 'produce' 
  | 'dairy' 
  | 'meat-seafood' 
  | 'pantry' 
  | 'bakery' 
  | 'frozen'
  | 'beverages'
  | 'other';

export interface CategoryConfig {
  id: IngredientCategory;
  label: string;
  icon: string;
  sortOrder: number;
}

export const CATEGORIES: Record<IngredientCategory, CategoryConfig> = {
  'produce': {
    id: 'produce',
    label: 'Produce',
    icon: '🥬',
    sortOrder: 1,
  },
  'meat-seafood': {
    id: 'meat-seafood',
    label: 'Meat & Seafood',
    icon: '🥩',
    sortOrder: 2,
  },
  'dairy': {
    id: 'dairy',
    label: 'Dairy & Eggs',
    icon: '🥛',
    sortOrder: 3,
  },
  'bakery': {
    id: 'bakery',
    label: 'Bakery & Bread',
    icon: '🥖',
    sortOrder: 4,
  },
  'pantry': {
    id: 'pantry',
    label: 'Pantry & Grains',
    icon: '🏺',
    sortOrder: 5,
  },
  'frozen': {
    id: 'frozen',
    label: 'Frozen',
    icon: '❄️',
    sortOrder: 6,
  },
  'beverages': {
    id: 'beverages',
    label: 'Beverages',
    icon: '🥤',
    sortOrder: 7,
  },
  'other': {
    id: 'other',
    label: 'Other',
    icon: '📦',
    sortOrder: 8,
  },
};

const PRODUCE_KEYWORDS = [
  'apple', 'banana', 'orange', 'lemon', 'lime', 'grape', 'strawberry', 'blueberry', 'raspberry', 'blackberry',
  'tomato', 'lettuce', 'spinach', 'kale', 'arugula', 'cabbage', 'broccoli', 'cauliflower', 'carrot', 'celery',
  'onion', 'garlic', 'ginger', 'potato', 'sweet potato', 'pepper', 'bell pepper', 'chili', 'cucumber', 'zucchini',
  'eggplant', 'mushroom', 'avocado', 'berry', 'berries', 'fruit', 'vegetable', 'salad', 'greens', 'herbs',
  'parsley', 'cilantro', 'basil', 'mint', 'rosemary', 'thyme', 'oregano', 'dill', 'chive', 'scallion',
  'shallot', 'leek', 'radish', 'beet', 'turnip', 'squash', 'pumpkin', 'melon', 'watermelon', 'pear',
  'peach', 'plum', 'cherry', 'apricot', 'mango', 'pineapple', 'papaya', 'kiwi', 'fig', 'date',
];

const MEAT_SEAFOOD_KEYWORDS = [
  'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'bacon', 'sausage', 'ham', 'steak',
  'ground beef', 'ground turkey', 'ground chicken', 'ground pork', 'mince', 'meatball', 'ribs',
  'fish', 'salmon', 'tuna', 'cod', 'tilapia', 'trout', 'mackerel', 'sardine', 'anchovy', 'herring',
  'shrimp', 'prawn', 'crab', 'lobster', 'scallop', 'mussel', 'clam', 'oyster', 'squid', 'octopus',
  'seafood', 'meat', 'poultry', 'breast', 'thigh', 'wing', 'drumstick',
];

const DAIRY_KEYWORDS = [
  'milk', 'cream', 'butter', 'cheese', 'cheddar', 'mozzarella', 'parmesan', 'feta', 'goat cheese',
  'yogurt', 'yoghurt', 'greek yogurt', 'sour cream', 'cottage cheese', 'ricotta', 'mascarpone',
  'egg', 'eggs', 'cream cheese', 'whipping cream', 'heavy cream', 'half and half', 'buttermilk',
  'ghee', 'paneer', 'queso', 'brie', 'camembert', 'gouda', 'swiss', 'provolone',
];

const BAKERY_KEYWORDS = [
  'bread', 'baguette', 'roll', 'bun', 'bagel', 'croissant', 'muffin', 'pita', 'tortilla', 'wrap',
  'naan', 'flatbread', 'sourdough', 'rye', 'wheat', 'white bread', 'whole grain', 'multigrain',
  'toast', 'crouton', 'breadcrumb',
];

const PANTRY_KEYWORDS = [
  'rice', 'pasta', 'noodle', 'quinoa', 'couscous', 'bulgur', 'farro', 'barley', 'oat', 'oatmeal',
  'flour', 'sugar', 'salt', 'pepper', 'oil', 'olive oil', 'vegetable oil', 'coconut oil', 'sesame oil',
  'vinegar', 'balsamic', 'soy sauce', 'tamari', 'fish sauce', 'worcestershire', 'hot sauce',
  'ketchup', 'mustard', 'mayonnaise', 'mayo', 'peanut butter', 'almond butter', 'tahini', 'hummus',
  'bean', 'beans', 'lentil', 'chickpea', 'black bean', 'kidney bean', 'pinto bean', 'white bean',
  'can', 'canned', 'jar', 'jarred', 'dried', 'stock', 'broth', 'bouillon', 'tomato paste', 'tomato sauce',
  'coconut milk', 'almond milk', 'soy milk', 'oat milk', 'nut', 'nuts', 'almond', 'walnut', 'cashew',
  'pecan', 'pistachio', 'seed', 'seeds', 'sunflower', 'pumpkin seed', 'chia', 'flax', 'sesame',
  'spice', 'spices', 'seasoning', 'cumin', 'paprika', 'turmeric', 'cinnamon', 'nutmeg', 'cardamom',
  'coriander', 'curry', 'chili powder', 'cayenne', 'bay leaf', 'vanilla', 'extract', 'honey', 'maple syrup',
  'agave', 'molasses', 'jam', 'jelly', 'preserves', 'chocolate', 'cocoa', 'baking powder', 'baking soda',
  'yeast', 'cornstarch', 'gelatin', 'cereal', 'granola', 'muesli', 'cracker', 'chip', 'chips',
];

const FROZEN_KEYWORDS = [
  'frozen', 'ice cream', 'sorbet', 'gelato', 'popsicle', 'frozen peas', 'frozen corn', 'frozen vegetables',
  'frozen fruit', 'frozen berries', 'frozen pizza', 'frozen meal',
];

const BEVERAGES_KEYWORDS = [
  'water', 'juice', 'coffee', 'tea', 'soda', 'cola', 'beer', 'wine', 'alcohol', 'liquor', 'spirits',
  'coconut water', 'energy drink', 'sports drink', 'lemonade', 'iced tea',
];

export function categorizeIngredient(ingredientName: string): IngredientCategory {
  const nameLower = ingredientName.toLowerCase();

  if (PRODUCE_KEYWORDS.some(keyword => nameLower.includes(keyword))) {
    return 'produce';
  }
  
  if (MEAT_SEAFOOD_KEYWORDS.some(keyword => nameLower.includes(keyword))) {
    return 'meat-seafood';
  }
  
  if (DAIRY_KEYWORDS.some(keyword => nameLower.includes(keyword))) {
    return 'dairy';
  }
  
  if (BAKERY_KEYWORDS.some(keyword => nameLower.includes(keyword))) {
    return 'bakery';
  }
  
  if (FROZEN_KEYWORDS.some(keyword => nameLower.includes(keyword))) {
    return 'frozen';
  }
  
  if (BEVERAGES_KEYWORDS.some(keyword => nameLower.includes(keyword))) {
    return 'beverages';
  }
  
  if (PANTRY_KEYWORDS.some(keyword => nameLower.includes(keyword))) {
    return 'pantry';
  }
  
  return 'other';
}

export function groupItemsByCategory<T extends { display_name: string }>(
  items: T[]
): Map<IngredientCategory, T[]> {
  const grouped = new Map<IngredientCategory, T[]>();
  
  items.forEach(item => {
    const category = categorizeIngredient(item.display_name);
    if (!grouped.has(category)) {
      grouped.set(category, []);
    }
    grouped.get(category)!.push(item);
  });
  
  return grouped;
}
