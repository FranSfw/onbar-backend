import S from 'fluent-json-schema';

const ingredientSchema = S.object()
  .prop('ingredient', S.string().required())
  .prop('quantity', S.number().required())
  .prop('unit', S.string().required());

const stepSchema = S.object()
  .prop('stepNumber', S.integer().required())
  .prop('description', S.string().required());

const versionSchema = S.object()
  .prop('preparationTime', S.integer().minimum(0))
  .prop('servingType', S.string())
  .prop('servingsNumber', S.integer().minimum(1))
  .prop('ingredients', S.array().items(ingredientSchema).required())
  .prop('steps', S.array().items(stepSchema).required())
  .prop('notes', S.string());

export const createRecipeSchema = S.object()
  .id('createRecipeSchema')
  .title('Create Recipe Schema')
  .prop('userID', S.string().required())
  .prop('name', S.string().required().minLength(3).maxLength(58))
  .prop('description', S.string())
  .prop('privacy', S.string().enum(['public', 'private']).default('public'))
  .prop('difficulty', S.string().enum(['Easy', 'Medium', 'Hard']).default('Medium'))
  .prop('photoURL', S.string().format('url'))
  .prop('initialVersion', versionSchema.required());

export const createVersionSchema = versionSchema
  .prop('versionName', S.string().minLength(2).maxLength(10));