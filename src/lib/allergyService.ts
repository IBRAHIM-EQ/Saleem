import { ALLERGEN_LIST } from "../constants";
import { ALLERGY_DATA, ALLERGY_DATA_AR } from "../constants/allergyData";
import { storage } from "./storage";

export interface CustomAllergen {
  key: string;
  name: string;
  type: string;
  emoji: string;
  symptoms: string;
  avoidFoods: string[];
  safeFoods: string[];
  prevention: string; // recommendation
  description: string;
  isHidden?: boolean;
  isCustom?: boolean;
}

export function getCustomAllergens(): CustomAllergen[] {
  return storage.get("saleem_custom_allergens", []);
}

export function saveCustomAllergens(list: CustomAllergen[]): void {
  storage.set("saleem_custom_allergens", list);
}

// Get all allergen list (standard + custom)
// Includes isHidden filter for client-side selection
export function getAllAllergens(includeHidden = false): { key: string; emoji: string; isHidden?: boolean; isCustom?: boolean; name?: string; type?: string }[] {
  const custom = getCustomAllergens();
  const customList = custom.map((c) => ({
    key: c.key,
    emoji: c.emoji || "⚠️",
    isHidden: c.isHidden || false,
    isCustom: true,
    name: c.name,
    type: c.type || "Food",
  }));

  const standardList = ALLERGEN_LIST.map((s) => ({
    key: s.key,
    emoji: s.emoji,
    isHidden: storage.get(`saleem_hidden_std_${s.key}`, false),
    isCustom: false,
    name: s.key,
  })).filter((s) => !storage.get(`saleem_deleted_std_${s.key}`, false));

  const combined = [...standardList, ...customList];
  if (!includeHidden) {
    return combined.filter(a => !a.isHidden);
  }
  return combined;
}

// Map key to details, dynamically supports standard & custom
export function getAllergyDetails(key: string, lang: "ar" | "en" = "en") {
  // Check standard first
  if (ALLERGY_DATA[key]) {
    const isDeleted = storage.get(`saleem_deleted_std_${key}`, false);
    if (isDeleted) return null;

    const std = (lang === "ar" && ALLERGY_DATA_AR?.[key]) ? ALLERGY_DATA_AR[key] : ALLERGY_DATA[key];
    const isHidden = storage.get(`saleem_hidden_std_${key}`, false);
    return {
      name: std.name,
      emoji: std.emoji,
      description: std.description,
      prevention: std.prevention,
      avoidFoods: std.avoidFoods,
      safeFoods: std.safeFoods,
      symptoms: std.symptoms,
      type: "Standard",
      isCustom: false,
      isHidden,
    };
  }

  // Check custom
  const custom = getCustomAllergens();
  const found = custom.find((c) => c.key === key);
  if (found) {
    return {
      name: found.name,
      emoji: found.emoji || "⚠️",
      description: found.description || "",
      prevention: found.prevention || "", // Recommendation
      avoidFoods: found.avoidFoods || [],
      safeFoods: found.safeFoods || [],
      symptoms: found.symptoms || "",
      type: found.type || "Food Allergy",
      isCustom: true,
      isHidden: found.isHidden || false,
    };
  }
  return null;
}

// Localized allergen naming mapping (supporting multilingual or fallback default)
export function mapAllergenName(key: string, lang: "ar" | "en" = "ar"): string {
  const details = getAllergyDetails(key, lang);
  if (details) {
    if (details.isCustom) {
      return details.name; // return custom name directly (e.g. as saved by admin)
    }
  }

  if (lang !== "ar") return key;

  const standardMapAr: Record<string, string> = {
    Dairy: "الحليب ومشتقاته",
    Peanuts: "الفول السوداني",
    Gluten: "الغلوتين والقمح",
    Eggs: "البيض",
    Fish: "الأسماك",
    Soy: "الصويا",
    "Tree Nuts": "المكسرات الشجرية",
    Shellfish: "القشريات البحرية",
    Sesame: "السمسم",
    Mustard: "الخردل",
  };

  return standardMapAr[key] || key;
}

// Localized standard emojis
export const ALLERGEN_EMOJIS: Record<string, string> = {
  Dairy: "🥛",
  Peanuts: "🥜",
  Gluten: "🌾",
  Eggs: "🥚",
  Fish: "🐟",
  Soy: "🫘",
  "Tree Nuts": "🌰",
  Shellfish: "🦐",
  Sesame: "🌿",
  Mustard: "🌼",
};

export function getAllergenEmoji(key: string): string {
  const details = getAllergyDetails(key);
  if (details) return details.emoji;
  return ALLERGEN_EMOJIS[key] || "⚠️";
}

// Toggle visibility of any allergen (standard / custom)
export function toggleAllergenVisibility(key: string): void {
  const custom = getCustomAllergens();
  const index = custom.findIndex((c) => c.key === key);
  
  if (index !== -1) {
    // It's custom
    custom[index].isHidden = !custom[index].isHidden;
    saveCustomAllergens(custom);
  } else {
    // It's standard
    const current = storage.get(`saleem_hidden_std_${key}`, false);
    storage.set(`saleem_hidden_std_${key}`, !current);
  }
}

// Delete custom allergen completely
export function deleteCustomAllergen(key: string): void {
  const custom = getCustomAllergens();
  const filtered = custom.filter((c) => c.key !== key);
  saveCustomAllergens(filtered);
}

// Delete any allergen (standard or custom) completely
export function deleteAllergen(key: string): void {
  const custom = getCustomAllergens();
  const index = custom.findIndex((c) => c.key === key);
  if (index !== -1) {
    const filtered = custom.filter((c) => c.key !== key);
    saveCustomAllergens(filtered);
  } else {
    storage.set(`saleem_deleted_std_${key}`, true);
  }
}

// Save or Update custom allergen
export function saveOrUpdateCustomAllergen(item: CustomAllergen): void {
  const custom = getCustomAllergens();
  const index = custom.findIndex((c) => c.key === item.key);
  if (index !== -1) {
    custom[index] = item;
  } else {
    custom.push(item);
  }
  saveCustomAllergens(custom);
}
