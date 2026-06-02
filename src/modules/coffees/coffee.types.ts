// src/modules/coffees/coffee.types.ts

export interface CoffeeDetails {
  cafeID: string;         // ID de la cafetería dueña de este grano (o UID del barista si es personal)
  name: string;           // Ej: "Etiopía Sidamo"
  roaster: string;        // Ej: "Tostadores Locales Co."
  originCountry: string;  // Ej: "Etiopía", "México"
  region?: string;        // Ej: "Oaxaca", "Yirgacheffe"
  farm?: string;          // Ej: "Finca Las Flores"
  process: 'Lavado' | 'Natural' | 'Honey' | 'Maceración Carbónica' | 'Otro';
  roastLevel: 'Claro' | 'Medio' | 'Oscuro';
  variety?: string;       // Ej: "Geisha", "Bourbon", "Typica"
  tastingNotes: string[]; // Ej: ["Jazmín", "Cítricos", "Chocolate amargo"]
  photoURL?: string;      // 🎯 Apartado para la imagen del empaque o grano asignado
  isActive: boolean;      // TRUE si está actualmente montado en las tolvas de la barra
  createdAt: string;
}

export interface CreateCoffeeInput extends Omit<CoffeeDetails, 'createdAt'> {}
export interface UpdateCoffeeInput extends Partial<CreateCoffeeInput> {
  [key: string]: any;
}