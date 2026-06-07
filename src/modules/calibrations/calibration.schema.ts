// src/modules/calibrations/calibration.schema.ts
import S from 'fluent-json-schema';

// 🎯 Sub-esquema para las notas de sabor del Radar Chart
const radarSchema = S.object()
  .prop('acidity', S.number().minimum(1).maximum(5))
  .prop('bitterness', S.number().minimum(1).maximum(5)) // ☕ Añadido para el balance real del espresso
  .prop('body', S.number().minimum(1).maximum(5))
  .prop('sweetness', S.number().minimum(1).maximum(5))
  .prop('balance', S.number().minimum(1).maximum(5));

export const createCalibrationSchema = S.object()
  .id('createCalibrationSchema')
  .title('Create Calibration Schema')
  .required(['userID', 'coffeeDetails', 'parameters']) // 🎯 Solo lo vital a nivel raíz
  .prop('userID', S.string())
  .prop('cafeID', S.string()) // 🔌 Opcional: Viaja si están trabajando en una barra física
  
  // 🍒 Detalles del Grano Seleccionado
  .prop(
    'coffeeDetails',
    S.object()
      .required(['name']) // 🎯 Único campo obligatorio aquí adentro
      .prop('coffeeID', S.string())
      .prop('name', S.string().minLength(2).maxLength(50))
      .prop('ratio', S.string())
  )
  
  // ⏱️ Parámetros Técnicos de Extracción (Mapeado exacto a tu controlador)
  .prop(
    'parameters',
    S.object()
      .required(['coffeeIn', 'waterOut', 'extractionTime', 'grinderModel', 'grinderSetting', 'grindMacro'])
      .prop('coffeeIn', S.number().minimum(0))
      .prop('waterOut', S.number().minimum(0))
      .prop('extractionTime', S.integer().minimum(0))
      .prop('temperature', S.number().minimum(80).maximum(100))
      .prop('grinderModel', S.string())
      .prop('grinderSetting', S.string())
      .prop('grindMacro', S.string().enum(['Turkish', 'Espresso', 'Moka Pot', 'Aeropress', 'Medium (V60/Filtrados)', 'Medium-Coarse (Chemex)', 'Coarse (French Press/Cold Brew)']))
  )
  
  // 👅 Evaluación Sensorial de la Taza
  .prop(
    'sensory',
    S.object()
      .prop('acidity', S.number().minimum(1).maximum(5))
      .prop('bitterness', S.number().minimum(1).maximum(5))
      .prop('body', S.number().minimum(1).maximum(5))
      .prop('sweetness', S.number().minimum(1).maximum(5))
      .prop('balance', S.number().minimum(1).maximum(5))
      .prop('notes', S.string().minLength(0)) // 🎯 Soporta comillas vacías "" sin quejarse
  );