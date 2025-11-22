/**
 * Format price with currency
 * @param value - Price value in cents
 * @param currencyCode - Currency code (e.g., "USD", "EUR")
 * @returns Formatted price string or "—" if invalid
 */
export function formatPrice(value: number | null | undefined, currencyCode?: string | null): string {
  if (value === null || value === undefined || !currencyCode) {
    return "—";
  }

  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currencyCode,
    }).format(value / 100);
  } catch {
    // Fallback formatting
    return `${(value / 100).toFixed(2)} ${currencyCode}`;
  }
}

/**
 * Format number with thousand separators
 * @param value - Number to format
 * @param options - Intl.NumberFormatOptions
 * @returns Formatted number string
 */
export function formatNumber(
  value: number | null | undefined,
  options: Intl.NumberFormatOptions = {}
): string {
  if (value === null || value === undefined) {
    return "—";
  }

  try {
    return new Intl.NumberFormat("en-US", options).format(value);
  } catch {
    return String(value);
  }
}

