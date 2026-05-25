export interface CoffeeDetails {
  name: string;
  roastDate?: string;
  notes?: string;
}

export interface ExtractionParameters {
  coffeeIn: number;
  waterOut: number;
  timeSeconds: number;
  temperatureCelsius?: number;
  grindSetting: string;
}

export interface SensoryEvaluation {
  tasteRating: number;
  tds?: number;
  notes?: string;
}

// Interfaz para lo que el Frontend envía en la petición HTTP Body
export interface CreateCalibrationInput {
  userID: string;
  coffeeDetails: CoffeeDetails;
  parameters: ExtractionParameters;
  sensory?: SensoryEvaluation;
}