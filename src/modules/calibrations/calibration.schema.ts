import S from 'fluent-json-schema';

export const createCalibrationSchema = S.object()
  .id('createCalibrationSchema')
  .title('Create Calibration Schema')
  .description('Valida la entrada para un nuevo registro de calibración de espresso')
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
      .prop('grindSetting', S.string().required())
  )
  .prop(
    'sensory',
    S.object()
      .prop('tasteRating', S.integer().minimum(1).maximum(5))
      .prop('tds', S.number())
      .prop('notes', S.string())
  );