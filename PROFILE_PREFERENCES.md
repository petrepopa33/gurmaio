# Profile Preferences - Meal Plan Generation

## Overview
Gurmaio folosește TOATE preferințele din profilul utilizatorului pentru a genera planuri de mese personalizate. Acest document descrie cum fiecare preferință este utilizată în generarea planurilor.

## Preferințe Utilizate

### 1. **Budget (Buget)**
- **Câmp**: `budget_eur`, `budget_period`
- **Utilizare**: Constraint CRITIC în generarea planului
- **Impact**: 
  - Calculează bugetul total pentru perioada planificată
  - Fiecare masă este optimizată pentru a rămâne în buget
  - Sistemul preferă ingrediente cost-eficiente
  - Afișează vizual dacă bugetul este depășit

### 2. **Meal Plan Days (Zile Plan)**
- **Câmp**: `meal_plan_days`
- **Utilizare**: Determină câte zile de mese să genereze
- **Impact**: Planul conține exact numărul de zile solicitat (3, 5, 7, etc.)

### 3. **Meals Per Day (Mese pe Zi)**
- **Câmp**: `meals_per_day`
- **Utilizare**: Determină structura zilnică a meselor
- **Impact**: 
  - 1 masă: Lunch
  - 2 mese: Breakfast, Dinner
  - 3 mese: Breakfast, Lunch, Dinner
  - 4 mese: Breakfast, Snack, Lunch, Dinner
  - 5+ mese: Include multiple snacks

### 4. **Dietary Preferences (Preferințe Dietetice)**
- **Câmp**: `dietary_preferences` (array)
- **Opțiuni**: Balanced, High Protein, Low Carb, Vegetarian, Vegan, Mediterranean, Paleo
- **Utilizare**: MUST FOLLOW - AI-ul trebuie să urmeze strict aceste preferințe
- **Impact**: 
  - Vegetarian: Nu include carne
  - Vegan: Nu include produse animale
  - High Protein: Prioritizează surse bogate în proteine
  - Low Carb: Limitează carbohidrații
  - Etc.

### 5. **Allergens (Alergeni)**
- **Câmp**: `allergens` (array)
- **Opțiuni**: Gluten, Dairy, Nuts, Shellfish, Eggs, Soy, Fish, Peanuts, Sesame, Sulfites
- **Utilizare**: CRITICAL - NEVER INCLUDE - Restricție absolută
- **Impact**: AI-ul este instruit să nu includă NICIODATĂ acești alergeni în retețe

### 6. **Cuisine Preferences (Preferințe Culinare)**
- **Câmp**: `cuisine_preferences` (array), `other_cuisines` (string)
- **Opțiuni**: Italian, Asian, Mediterranean, Mexican, American, Indian, French, Greek, Middle Eastern, Japanese, Thai, Spanish, Others
- **Utilizare**: PRIORITIZE THESE - Preferință mare în selecția rețetelor
- **Impact**: 
  - Sistemul prioritizează rețete din aceste bucătării
  - Poate combina multiple stiluri culinare
  - Câmpul `other_cuisines` permite specificarea de bucătării custom

### 7. **Target Calories (Calorii Țintă)**
- **Câmp**: `target_calories`
- **Calculat din**: `weight_kg`, `height_cm`, `age`, `sex`, `activity_level`, `objective`
- **Utilizare**: Target zilnic pentru calorii totale
- **Impact**: 
  - Fiecare zi trebuie să fie în ±10% din targetul caloric
  - Porțiile sunt ajustate pentru a atinge targetul
  - Afectat de obiectivul utilizatorului (pierdere greutate, menținere, câștig muscular)

### 8. **Physical Metrics (Metrici Fizice)**
- **Câmpuri**: `weight_kg`, `height_cm`, `age`, `sex`
- **Utilizare**: Calculul caloriilor țintă și informare context AI
- **Impact**: 
  - Folosit pentru calculul BMR (Basal Metabolic Rate)
  - Ajută AI-ul să înțeleagă nevoile nutriționale specifice
  - Influențează porțiile și densitatea calorică

### 9. **Activity Level (Nivel Activitate)**
- **Câmp**: `activity_level`
- **Opțiuni**: sedentary, light, moderate, active, very_active
- **Utilizare**: Multiplicator pentru calculul caloriilor
- **Impact**: 
  - Sedentary: 1.2x BMR
  - Light: 1.375x BMR
  - Moderate: 1.55x BMR
  - Active: 1.725x BMR
  - Very Active: 1.9x BMR

### 10. **Objective (Obiectiv)**
- **Câmp**: `objective`
- **Opțiuni**: lose_weight, maintain, gain_muscle
- **Utilizare**: Ajustare calorii și macro-uri
- **Impact**: 
  - Lose weight: -500 cal/zi (deficit)
  - Maintain: TDEE exact
  - Gain muscle: +300 cal/zi (surplus)

### 11. **Macro Targets (Ținte Macro-nutrienți)**
- **Câmp**: `macro_targets` (object)
- **Sub-câmpuri**: `protein_percentage`, `carbs_percentage`, `fats_percentage`
- **Utilizare**: CRITICAL - Distribuția macro-nutrienților
- **Impact**: 
  - Fiecare masă este optimizată pentru aceste procente
  - AI-ul ajustează ingredientele pentru a atinge ratios corecte
  - Exemple presets: Balanced (30/40/30), High Protein (40/30/30), Keto (20/10/70)

## Utilizare în Meal Substitution (Înlocuire Mese)

Când utilizatorul înlocuiește o masă (swap), TOATE preferințele de mai sus sunt folosite, plus:

### 12. **User Ratings (Evaluări Utilizator)**
- **Câmp**: `mealRatings` (array)
- **Utilizare**: Învățare preferințe personale
- **Impact**: 
  - Mese cu rating 4-5 stele → Similar meals preferred
  - Ingrediente din mese apreciate → Include when appropriate
  - Mese cu rating 1-2 stele → Avoid similar recipes
  - Ingrediente din mese cu rating scăzut → Never use

## Prioritizare în Prompt-uri AI

Toate prompt-urile către AI folosesc următoarea ierarhie:

1. **CRITICAL/MUST**: Alergeni (nu include niciodată)
2. **CRITICAL**: Budget (nu depăși)
3. **MUST FOLLOW**: Dietary Preferences
4. **TARGET**: Calories și Macros (±10% toleranță)
5. **PRIORITIZE**: Cuisine Preferences
6. **STRONGLY PREFER**: User Ratings (ingrediente apreciate)
7. **CONTEXT**: Physical metrics, Activity Level, Objective

## Exemple de Utilizare

### Exemplu 1: Utilizator Vegan cu Alergii
```javascript
{
  dietary_preferences: ['Vegan'],
  allergens: ['Gluten', 'Nuts'],
  cuisine_preferences: ['Mediterranean', 'Asian'],
  target_calories: 2000,
  macro_targets: { protein_percentage: 25, carbs_percentage: 50, fats_percentage: 25 }
}
```
**Rezultat**: Rețete vegane, fără gluten și fără nuci, inspirate din bucătăria mediteraneană și asiatică, cu 2000 cal/zi și 25% proteine.

### Exemplu 2: Sportiv High Protein
```javascript
{
  dietary_preferences: ['High Protein'],
  allergens: [],
  cuisine_preferences: ['American', 'Mexican'],
  objective: 'gain_muscle',
  activity_level: 'active',
  weight_kg: 80,
  target_calories: 2800,
  macro_targets: { protein_percentage: 40, carbs_percentage: 35, fats_percentage: 25 }
}
```
**Rezultat**: Mese bogate în proteine (40%), surplus caloric (+300), stil american/mexican, porții mari pentru sportiv activ.

### Exemplu 3: Pierdere Greutate Budget Redus
```javascript
{
  dietary_preferences: ['Balanced'],
  allergens: ['Shellfish'],
  cuisine_preferences: ['Italian', 'Mediterranean'],
  objective: 'lose_weight',
  activity_level: 'sedentary',
  budget_eur: 30,
  budget_period: 'weekly',
  meal_plan_days: 7,
  target_calories: 1500
}
```
**Rezultat**: Plan de 7 zile la €30/săptămână, 1500 cal/zi (deficit), fără shellfish, stil italian/mediterranean, ingrediente cost-eficiente.

## Validare

Sistemul validează că:
- ✅ Budget nu este depășit
- ✅ Alergenii nu sunt incluși niciodată
- ✅ Dietary preferences sunt respectate
- ✅ Numărul de mese pe zi este corect
- ✅ Numărul de zile este corect
- ✅ Caloriile sunt în range (±10%)
- ✅ Macro ratios sunt aproximativ corecte

## Note Tehnice

- Toate preferințele sunt stocate în `useKV('user_profile')`
- Profilul poate fi editat oricând prin Onboarding Dialog
- Preferințele se aplică atât la generarea inițială cât și la swap-uri
- AI model folosit: GPT-4o cu JSON mode
- Fallback: Dacă AI fail-uiește, folosește un plan template generic
