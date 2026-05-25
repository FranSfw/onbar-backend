export interface Ingredient {
  ingredient: string;
  quantity: number;
  unit: string;
}

export interface RecipeStep {
  stepNumber: number;
  description: string;
}

export interface RecipeVersion {
  createdAt?: string;
  preparationTime?: number;
  servingType?: string;
  servingsNumber?: number;
  ingredients: Ingredient[];
  steps: RecipeStep[];
  notes?: string;
}

export interface CreateRecipeInput {
  userID: string;
  name: string;
  description?: string;
  privacy: 'public' | 'private';
  difficulty: 'Easy' | 'Medium' | 'Hard';
  photoURL?: string;
  initialVersion: RecipeVersion;
}

export interface CreateRecipeVersionInput extends RecipeVersion {
  versionName?: string;
}