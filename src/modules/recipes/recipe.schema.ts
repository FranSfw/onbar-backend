// src/modules/recipes/recipe.schema.ts
import S from 'fluent-json-schema';

const allowedUnits = ['g', 'kg', 'ml', 'l', 'oz', 'oz_fl', 'dash', 'piece'];
const allowedMediaTypes = ['image', 'video'];

const grindMacroEnum = [
  'Turkish', 'Espresso', 'Moka Pot', 'Aeropress',
  'Medium (V60/Filtrados)', 'Medium-Coarse (Chemex)', 'Coarse (French Press/Cold Brew)'
];

const mediaItemSchema = S.object()
  .prop('type', S.string().enum(allowedMediaTypes).required())
  .prop('url', S.string().format('url').required());

const ingredientSchema = S.object()
  .prop('ingredientName', S.string().required())
  .prop('quantity', S.number().required())
  .prop('unit', S.string().enum(allowedUnits).required())
  .prop('isSubRecipe', S.boolean().required().default(false))
  .prop('subRecipeID', S.string())
  .prop('subRecipeVersion', S.string());

const stepSchema = S.object()
  .prop('stepNumber', S.integer().required())
  .prop('description', S.string().required())
  .prop('media', S.array().items(mediaItemSchema));

// 🎯 Construcción limpia y explícita de la versión:
const versionSchema = S.object()
  // 🚨 Aquí le decimos a Fastify: "Únicamente estos 5 campos son obligatorios para que la receta funcione"
  .required([
    'ingredients', 
    'steps', 
    'grinderModel', 
    'grinderSetting', 
    'grindMacro'
  ])
  .prop('preparationTime', S.integer().minimum(0))
  .prop('servingType', S.string())
  .prop('servingsNumber', S.integer().minimum(1))
  .prop('ingredients', S.array().items(ingredientSchema))
  .prop('steps', S.array().items(stepSchema))
  .prop('grinderModel', S.string())
  .prop('grinderSetting', S.string())
  .prop('grindMacro', S.string().enum(grindMacroEnum))
  .prop('notes', S.string().minLength(0)); // 😎 Queda fuera de la lista de requeridos, haciéndolo 100% opcional

export const createRecipeSchema = S.object()
  .id('createRecipeSchema')
  .title('Create Recipe Schema')
  .prop('userID', S.string().required())
  .prop('name', S.string().required().minLength(3).maxLength(58))
  .prop('description', S.string())
  .prop('privacy', S.string().enum(['public', 'private']).default('public'))
  .prop('difficulty', S.string().enum(['Easy', 'Medium', 'Hard']).default('Medium'))
  .prop('type', S.string().enum(['drink', 'sub_recipe']).required()) 
  .prop('gallery', S.array().items(mediaItemSchema).required()) 
  .prop('initialVersion', versionSchema.required()); // Obliga a que venga 'initialVersion' como objeto

// Esquema independiente para nuevos Commits/Versiones externas
export const createVersionSchema = S.object()
  .required([
    'ingredients', 
    'steps', 
    'grinderModel', 
    'grinderSetting', 
    'grindMacro'
  ])
  .prop('versionName', S.string().minLength(2).maxLength(10))
  .prop('preparationTime', S.integer().minimum(0))
  .prop('servingType', S.string())
  .prop('servingsNumber', S.integer().minimum(1))
  .prop('ingredients', S.array().items(ingredientSchema))
  .prop('steps', S.array().items(stepSchema))
  .prop('grinderModel', S.string())
  .prop('grinderSetting', S.string())
  .prop('grindMacro', S.string().enum(grindMacroEnum))
  .prop('notes', S.string().minLength(0));