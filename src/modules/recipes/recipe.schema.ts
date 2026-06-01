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
  .prop('subRecipeID', S.string());

const stepSchema = S.object()
  .prop('stepNumber', S.integer().required())
  .prop('description', S.string().required())
  .prop('media', S.array().items(mediaItemSchema));

// 🎯 El esquema definitivo de OnBar: directo, plano y poderoso
export const createRecipeSchema = S.object()
  .id('createRecipeSchema')
  .title('Create Recipe Schema')
  .required([
    'userID', 'name', 'type', 'gallery', 'ingredients', 'steps', 
    'grinderModel', 'grinderSetting', 'grindMacro'
  ])
  .prop('userID', S.string())
  .prop('name', S.string().minLength(3).maxLength(58))
  .prop('description', S.string())
  .prop('privacy', S.string().enum(['public', 'private']).default('public'))
  .prop('difficulty', S.string().enum(['Easy', 'Medium', 'Hard']).default('Medium'))
  .prop('type', S.string().enum(['drink', 'sub_recipe'])) 
  .prop('gallery', S.array().items(mediaItemSchema))
  .prop('preparationTime', S.integer().minimum(0))
  .prop('servingType', S.string())
  .prop('servingsNumber', S.integer().minimum(1))
  .prop('ingredients', S.array().items(ingredientSchema))
  .prop('steps', S.array().items(stepSchema))
  .prop('grinderModel', S.string())
  .prop('grinderSetting', S.string())
  .prop('grindMacro', S.string().enum(grindMacroEnum))
  .prop('notes', S.string().minLength(0)); // 🎯 Acepta comillas vacías "" sin quejarse

export const updateRecipeSchema = S.object()
  .prop('name', S.string().minLength(3).maxLength(58))
  .prop('description', S.string())
  .prop('privacy', S.string().enum(['public', 'private']))
  .prop('difficulty', S.string().enum(['Easy', 'Medium', 'Hard']))
  .prop('gallery', S.array().items(mediaItemSchema))
  .prop('preparationTime', S.integer().minimum(0))
  .prop('servingType', S.string())
  .prop('servingsNumber', S.integer().minimum(1))
  .prop('ingredients', S.array().items(ingredientSchema))
  .prop('steps', S.array().items(stepSchema))
  .prop('grinderModel', S.string())
  .prop('grinderSetting', S.string())
  .prop('grindMacro', S.string().enum(grindMacroEnum))
  .prop('notes', S.string().minLength(0));