const MEAL_IMAGES: Record<string, string> = {
  'Scrambled Eggs': 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400&h=300&fit=crop',
  'Greek Yogurt Bowl': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
  'Oatmeal': 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400&h=300&fit=crop',
  'Avocado Toast': 'https://images.unsplash.com/photo-1588137378633-dea1336ce1e2?w=400&h=300&fit=crop',
  'Protein Pancakes': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
  'Smoothie Bowl': 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop',
  'Veggie Omelet': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  'Banana Protein Shake': 'https://images.unsplash.com/photo-1505252585461-04db1eb84625?w=400&h=300&fit=crop',
  
  'Chicken Salad': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
  'Grilled Chicken': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop',
  'Turkey Sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop',
  'Tuna Wrap': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop',
  'Quinoa Bowl': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  'Salmon Bowl': 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?w=400&h=300&fit=crop',
  'Veggie Wrap': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop',
  'Pasta Salad': 'https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&h=300&fit=crop',
  
  'Salmon': 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=400&h=300&fit=crop',
  'Grilled Steak': 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop',
  'Chicken Breast': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop',
  'Tofu Stir-fry': 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=400&h=300&fit=crop',
  'Beef Stir-fry': 'https://images.unsplash.com/photo-1603073544878-358bcce5bc65?w=400&h=300&fit=crop',
  'Pasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop',
  'Rice Bowl': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  'Roasted Vegetables': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
  'Baked Chicken': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop',
  
  'Apple': 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&h=300&fit=crop',
  'Banana': 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&h=300&fit=crop',
  'Almonds': 'https://images.unsplash.com/photo-1508735793819-5bb7440b5b3c?w=400&h=300&fit=crop',
  'Protein Bar': 'https://images.unsplash.com/photo-1571312847489-7f52c0b8fa0a?w=400&h=300&fit=crop',
  'Mixed Nuts': 'https://images.unsplash.com/photo-1508735793819-5bb7440b5b3c?w=400&h=300&fit=crop',
  'Fruit Salad': 'https://images.unsplash.com/photo-1564093497595-593b96d80180?w=400&h=300&fit=crop',
  'Carrot Sticks': 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400&h=300&fit=crop',
  'Hummus': 'https://images.unsplash.com/photo-1571324041918-b2a92cbd0db4?w=400&h=300&fit=crop',
};

const MEAL_TYPE_FALLBACKS: Record<string, string> = {
  'breakfast': 'https://images.unsplash.com/photo-1533089860892-a7c6f0a88666?w=400&h=300&fit=crop',
  'lunch': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  'dinner': 'https://images.unsplash.com/photo-1476224203421-9ac39bcb3327?w=400&h=300&fit=crop',
  'snack': 'https://images.unsplash.com/photo-1564093497595-593b96d80180?w=400&h=300&fit=crop',
};

const INGREDIENT_KEYWORDS: Record<string, string> = {
  'chicken': 'https://images.unsplash.com/photo-1598103442097-8b74394b95c6?w=400&h=300&fit=crop',
  'salmon': 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=400&h=300&fit=crop',
  'beef': 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop',
  'steak': 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop',
  'tofu': 'https://images.unsplash.com/photo-1546069901-d5bfd2cbfb1f?w=400&h=300&fit=crop',
  'fish': 'https://images.unsplash.com/photo-1485921325833-c519f76c4927?w=400&h=300&fit=crop',
  'egg': 'https://images.unsplash.com/photo-1608039829572-78524f79c4c7?w=400&h=300&fit=crop',
  'pasta': 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400&h=300&fit=crop',
  'salad': 'https://images.unsplash.com/photo-1546793665-c74683f339c1?w=400&h=300&fit=crop',
  'rice': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  'quinoa': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  'avocado': 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=300&fit=crop',
  'yogurt': 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop',
  'oatmeal': 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400&h=300&fit=crop',
  'smoothie': 'https://images.unsplash.com/photo-1590301157890-4810ed352733?w=400&h=300&fit=crop',
  'pancake': 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&h=300&fit=crop',
  'wrap': 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f?w=400&h=300&fit=crop',
  'sandwich': 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop',
  'bowl': 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=400&h=300&fit=crop',
  'stir': 'https://images.unsplash.com/photo-1603073544878-358bcce5bc65?w=400&h=300&fit=crop',
  'vegetable': 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400&h=300&fit=crop',
  'fruit': 'https://images.unsplash.com/photo-1564093497595-593b96d80180?w=400&h=300&fit=crop',
  'nut': 'https://images.unsplash.com/photo-1508735793819-5bb7440b5b3c?w=400&h=300&fit=crop',
};

export function getMealImage(recipeName: string, mealType: string): string {
  if (MEAL_IMAGES[recipeName]) {
    return MEAL_IMAGES[recipeName];
  }

  const lowerRecipeName = recipeName.toLowerCase();
  for (const [keyword, imageUrl] of Object.entries(INGREDIENT_KEYWORDS)) {
    if (lowerRecipeName.includes(keyword)) {
      return imageUrl;
    }
  }

  return MEAL_TYPE_FALLBACKS[mealType.toLowerCase()] || MEAL_TYPE_FALLBACKS['lunch'];
}
