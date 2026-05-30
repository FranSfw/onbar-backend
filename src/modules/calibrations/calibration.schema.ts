// src/modules/calibrations/calibration.schema.ts
import S from 'fluent-json-schema';

const grinderSchema = S.object()
  .required()
  .prop('grinderModel', S.string().required().minLength(2))
  .prop('grinderName', S.string().required().minLength(2))
  .prop('setting', S.string().required()); // Mantenemos string por si usan letras o clics (Ej: "A12")

const radarSchema = S.object()
  .required()
  .prop('acidity', S.number().minimum(1).maximum(5))
  .prop('body', S.number().minimum(1).maximum(5))
  .prop('sweetness', S.number().minimum(1).maximum(5))
  .prop('balance', S.number().minimum(1).maximum(5))
  .prop('cleanliness', S.number().minimum(1).maximum(5))
  .prop('complexity', S.number().minimum(1).maximum(5));

const timelineSchema = S.object()
  .required()
  .prop('sourIntensity', S.number().minimum(1).maximum(5))
  .prop('sweetIntensity', S.number().minimum(1).maximum(5))
  .prop('bitterIntensity', S.number().minimum(1).maximum(5));

export const createCalibrationSchema = S.object()
  .id('createCalibrationSchema')
  .title('Create Calibration Schema')
  .prop('userID', S.string().required())
  .prop(
    'coffeeDetails',
    S.object()
      .required()
      .prop('name', S.string().required().minLength(3))
      .prop('roastDate', S.string().format('date'))
      .prop('notes', S.string())
  )
  .prop(
    'parameters',
    S.object()
      .required()
      .prop('coffeeIn', S.number().required().minimum(0))
      .prop('waterOut', S.number().required().minimum(0))
      .prop('timeSeconds', S.integer().required().minimum(0))
      .prop('temperatureCelsius', S.number().minimum(80).maximum(100))
      .prop('grinder', grinderSchema) // 🔌 Enganchamos el nuevo validador del molino
  )
  .prop(
    'sensory',
    S.object()
      .required()
      .prop('tasteRating', S.integer().minimum(1).maximum(5).required())
      .prop('tds', S.number())
      .prop('notes', S.string())
      .prop('radarProfile', radarSchema)
      .prop('timelineProfile', timelineSchema)
  );