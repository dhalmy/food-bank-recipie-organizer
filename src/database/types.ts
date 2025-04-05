export interface NutritionalFacts {
  calories: number;
  protein: number;
  fat: number;
  carbohydrates: number;
  sodium: number;
  sugar: number;
}

export interface FoodItem {
  serialNumber: string;
  foodTypeId: number;
  subCategory: string;
  nutritionalFacts: NutritionalFacts;
  expirationDate: string;
}

export interface FoodType {
  foodTypeId: number;
  name: string;
  description?: string;
}