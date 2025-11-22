import type { Translation } from "./translation";

/**
 * Create translation input for product mutations
 * @param translation - Existing translation or null
 * @param values - Form values
 * @param languageCode - Language code (default: "en")
 * @returns Translation input array
 */
export function createTranslationInput(
  translation: Translation | undefined | null,
  values: {
    name: string;
    slug: string;
    description?: string | null;
  },
  languageCode: string = "en"
) {
  return [
    {
      id: translation?.id,
      languageCode: translation?.languageCode ?? languageCode,
      name: values.name,
      slug: values.slug,
      description: values.description ?? "",
    },
  ];
}

/**
 * Transform assets array to mutation input format
 * @param assets - Array of assets with id
 * @returns Object with assetIds and featuredAssetId
 */
export function transformAssetsForMutation(assets: Array<{ id: string }>) {
  return {
    assetIds: assets.map((asset) => asset.id),
    featuredAssetId: assets[0]?.id,
  };
}

/**
 * Extract asset IDs from assets array
 * @param assets - Array of assets
 * @returns Array of asset IDs
 */
export function extractAssetIds(assets: Array<{ id: string }>): string[] {
  return assets.map((asset) => asset.id);
}

