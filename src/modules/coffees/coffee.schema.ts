// src/modules/coffees/coffee.schema.ts
import S from 'fluent-json-schema';

const allowedProcesses = ['Lavado', 'Natural', 'Honey', 'Maceración Carbónica', 'Otro'];
const allowedRoastLevels = ['Claro', 'Medio', 'Oscuro'];

export const createCoffeeSchema = S.object()
  .id('createCoffeeSchema')
  .title('Create Coffee Schema')
  .required(['cafeID', 'name', 'roaster', 'originCountry', 'process', 'roastLevel'])
  .prop('cafeID', S.string())
  .prop('name', S.string().minLength(2).maxLength(50))
  .prop('roaster', S.string().minLength(2).maxLength(50))
  .prop('originCountry', S.string())
  .prop('region', S.string())
  .prop('farm', S.string())
  .prop('process', S.string().enum(allowedProcesses))
  .prop('roastLevel', S.string().enum(allowedRoastLevels))
  .prop('variety', S.string())
  .prop('tastingNotes', S.array().items(S.string()).default([]))
  .prop('photoURL', S.string().format('url'))
  .prop('isActive', S.boolean().default(true));

export const updateCoffeeSchema = S.object()
  .prop('name', S.string().minLength(2).maxLength(50))
  .prop('roaster', S.string().minLength(2).maxLength(50))
  .prop('region', S.string())
  .prop('farm', S.string())
  .prop('process', S.string().enum(allowedProcesses))
  .prop('roastLevel', S.string().enum(allowedRoastLevels))
  .prop('variety', S.string())
  .prop('tastingNotes', S.array().items(S.string()))
  .prop('photoURL', S.string().format('url'))
  .prop('isActive', S.boolean());