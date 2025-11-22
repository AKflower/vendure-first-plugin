/**
 * Translation type definition
 */
export interface Translation {
  id?: string;
  languageCode: string;
  name?: string | null;
  slug?: string | null;
  description?: string | null;
}

/**
 * Find translation by language code, fallback to first available
 * @param translations - Array of translations
 * @param languageCode - Preferred language code (default: "en")
 * @returns Translation object or undefined
 */
export function findTranslation(
  translations: Translation[] | undefined | null,
  languageCode: string = "en"
): Translation | undefined {
  if (!translations || translations.length === 0) {
    return undefined;
  }

  // Try to find by language code
  const translation = translations.find((t) => t.languageCode === languageCode);
  
  // Fallback to first translation
  return translation ?? translations[0];
}

/**
 * Get product name from translations
 * @param translations - Array of translations
 * @param languageCode - Preferred language code (default: "en")
 * @param fallback - Fallback text if no translation found
 * @returns Product name
 */
export function getProductName(
  translations: Translation[] | undefined | null,
  languageCode: string = "en",
  fallback: string = "Untitled product"
): string {
  const translation = findTranslation(translations, languageCode);
  return translation?.name ?? fallback;
}

/**
 * Get product slug from translations
 * @param translations - Array of translations
 * @param languageCode - Preferred language code (default: "en")
 * @returns Product slug or empty string
 */
export function getProductSlug(
  translations: Translation[] | undefined | null,
  languageCode: string = "en"
): string {
  const translation = findTranslation(translations, languageCode);
  return translation?.slug ?? "";
}

/**
 * Get product description from translations
 * @param translations - Array of translations
 * @param languageCode - Preferred language code (default: "en")
 * @returns Product description or empty string
 */
export function getProductDescription(
  translations: Translation[] | undefined | null,
  languageCode: string = "en"
): string {
  const translation = findTranslation(translations, languageCode);
  return translation?.description ?? "";
}

