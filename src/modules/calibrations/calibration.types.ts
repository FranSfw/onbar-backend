export interface GrinderInfo {
  grinderModel: string;  
  grinderName: string;
  setting: string;   
}

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
  grinder: GrinderInfo;
}

export interface SensoryRadar {
  acidity: number;       // Escala 1-5 o 1-10
  body: number;
  sweetness: number;
  balance: number;
  cleanliness: number;
  complexity: number;
}

export interface ExtractionTimeline {
  sourIntensity: number;
  sweetIntensity: number;
  bitterIntensity: number; 
}

export interface SensoryEvaluation {
  tasteRating: number;      
  tds?: number;
  radarProfile: SensoryRadar;         
  timelineProfile: ExtractionTimeline; 
  roasterNotes?: string;
  notes?: string;
}

// Interfaz para lo que el Frontend envía en la petición HTTP Body
export interface CreateCalibrationInput {
  userID: string;
  coffeeDetails: CoffeeDetails;
  parameters: ExtractionParameters;
  sensory?: SensoryEvaluation;
}