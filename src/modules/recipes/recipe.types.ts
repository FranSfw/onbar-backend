// src/modules/recipes/recipe.types.ts

export type GrindMacroZone = 
  | 'Turkish' 
  | 'Espresso' 
  | 'Moka Pot' 
  | 'Aeropress' 
  | 'Medium (V60/Filtrados)' 
  | 'Medium-Coarse (Chemex)' 
  | 'Coarse (French Press/Cold Brew)';

// REF-UNIDADES-ESTANDAR: Catálogo cerrado de unidades permitidas en OnBar
export type IngredientUnit = 
  | 'g'       // Gramos (Sólidos)
  | 'kg'      // Kilogramos (Insumos mayoristas)
  | 'ml'      // Mililitros (Líquidos ordinarios)
  | 'l'       // Litros (Grandes lotes de Cold Brew)
  | 'oz'      // Onzas de peso
  | 'oz_fl'   // Onzas fluidas (Mixología y Jarabes)
  | 'dash'    // Toques / Gotas (Bitters o Concentrados)
  | 'piece';  // Unidades discretas (Garnituras, Canela, etc.)

// Estructura para la Galería Multimedia
export interface MediaItem {
  type: 'image' | 'video';
  url: string; // URL de Firebase Storage, YouTube o Vimeo
}

// Estructura de ingrediente mejorada y modular
export interface Ingredient {
  ingredientName: string;   
  quantity: number;
  unit: IngredientUnit;     
  isSubRecipe: boolean;     
  subRecipeID?: string;     
  subRecipeVersion?: string;
}

export interface RecipeStep {
  stepNumber: number;
  description: string;
  media?: MediaItem[]; // Videos/Fotos exclusivos de los detalles de este paso
}

export interface RecipeVersion {
  createdAt?: string;
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

export interface CreateRecipeInput {
  userID: string;
  name: string;
  description?: string;
  privacy: 'public' | 'private';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  type: 'drink' | 'sub_recipe';
  gallery: MediaItem[]; // Galería de identidad visual global de la bebida
  initialVersion: RecipeVersion;
}

export interface CreateRecipeVersionInput extends RecipeVersion {
  versionName?: string; // Declarado aquí correctamente para lectura opcional en las rutas
}