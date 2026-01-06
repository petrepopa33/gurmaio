import { useState, useEffect } from 'react';
import type { MealPlan } from '@/types/domain';
import type { Language } from '@/lib/i18n/translations';
import { translateMealPlanContent } from '@/lib/ai-content-translator';

interface TranslatedMealPlan extends MealPlan {
  _isTranslating?: boolean;
  _translationLanguage?: Language;
}

interface UseTranslatedMealPlanOptions {
  onTranslationComplete?: () => void;
  onTranslationError?: (error: Error) => void;
}

export function useTranslatedMealPlan(
  mealPlan: MealPlan | null, 
  targetLanguage: Language,
  options?: UseTranslatedMealPlanOptions
) {
  const [translatedPlan, setTranslatedPlan] = useState<TranslatedMealPlan | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (!mealPlan) {
      setTranslatedPlan(null);
      return;
    }

    if (targetLanguage === 'en') {
      setTranslatedPlan(mealPlan);
      return;
    }

    const translate = async () => {
      setIsTranslating(true);

      try {
        const allMealNames: string[] = [];
        const allIngredients: string[] = [];
        const allInstructions: string[] = [];

        mealPlan.days.forEach(day => {
          day.meals.forEach(meal => {
            allMealNames.push(meal.recipe_name);
            meal.ingredients.forEach(ing => {
              if (!allIngredients.includes(ing.name)) {
                allIngredients.push(ing.name);
              }
            });
            (meal.cooking_instructions || []).forEach(inst => {
              if (!allInstructions.includes(inst)) {
                allInstructions.push(inst);
              }
            });
          });
        });

        const { mealNames, ingredients, cookingInstructions } = await translateMealPlanContent(
          allIngredients,
          allMealNames,
          allInstructions,
          targetLanguage
        );

        const translatedDays = mealPlan.days.map(day => ({
          ...day,
          meals: day.meals.map(meal => {
            const translatedMealName = mealNames.get(meal.recipe_name) || meal.recipe_name;

            const translatedIngredients = meal.ingredients.map(ing => {
              return {
                ...ing,
                name: ingredients.get(ing.name) || ing.name,
              };
            });

            const translatedInstructions = (meal.cooking_instructions || []).map(inst => {
              return cookingInstructions.get(inst) || inst;
            });

            return {
              ...meal,
              recipe_name: translatedMealName,
              ingredients: translatedIngredients,
              cooking_instructions: translatedInstructions,
            };
          }),
        }));

        const translated: TranslatedMealPlan = {
          ...mealPlan,
          days: translatedDays,
          _translationLanguage: targetLanguage,
        };

        setTranslatedPlan(translated);
        options?.onTranslationComplete?.();
      } catch (error) {
        console.error('Translation error:', error);
        setTranslatedPlan(mealPlan);
        options?.onTranslationError?.(error as Error);
      } finally {
        setIsTranslating(false);
      }
    };

    translate();
  }, [mealPlan?.plan_id, targetLanguage]);

  return {
    translatedPlan,
    isTranslating,
  };
}
