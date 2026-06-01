// src/modules/recipes/recipe.types.ts

export type GrindMacroZone = 
  | 'Turkish' | 'Espresso' | 'Moka Pot' | 'Aeropress' 
  | 'Medium (V60/Filtrados)' | 'Medium-Coarse (Chemex)' | 'Coarse (French Press/Cold Brew)';

export type IngredientUnit = 'g' | 'kg' | 'ml' | 'l' | 'oz' | 'oz_fl' | 'dash' | 'piece';

export interface MediaItem {
  type: 'image' | 'video';
  url: string;
}

export interface Ingredient {
  ingredientName: string;   
  quantity: number;
  unit: IngredientUnit;     
  isSubRecipe: boolean;     
  subRecipeID?: string;     // ID de la subreceta conectada (Ej: El Foam apunta al Jarabe, el Matcha apunta al Foam)
}

export interface RecipeStep {
  stepNumber: number;
  description: string;
  media?: MediaItem[];
}

// 🎯 TODO SE QUEDA EN UN SOLO DOCUMENTO PLANO (Cero historial de versiones estricto)
export interface CreateRecipeInput {
  userID: string;
  name: string;
  description?: string;
  privacy: 'public' | 'private';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'drink' | 'sub_recipe';
  gallery: MediaItem[];
  
  // 🔌 Los parámetros de preparación entran directo a la raíz
  preparationTime?: number;
  servingType?: string;
  servingsNumber?: number;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  grinderModel: string;
  grinderSetting: string;
  grindMacro: GrindMacroZone;
  notes?: string;
}

// Para el PATCH de edición directa
export interface UpdateRecipeInput extends Partial<CreateRecipeInput> {
  [key: string]: any;
}