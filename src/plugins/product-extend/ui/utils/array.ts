/**
 * Slice array to show limited items with remaining count
 * @param array - Array to slice
 * @param maxVisible - Maximum number of visible items
 * @returns Object with visible items and remaining count
 */
export function sliceWithRemaining<T>(array: T[], maxVisible: number = 3): {
  visible: T[];
  remaining: number;
} {
  if (!array || array.length === 0) {
    return { visible: [], remaining: 0 };
  }

  const visible = array.slice(0, maxVisible);
  const remaining = Math.max(0, array.length - maxVisible);

  return { visible, remaining };
}

/**
 * Format array of items to comma-separated string
 * @param items - Array of items with name property
 * @param fallback - Fallback text if array is empty
 * @returns Comma-separated string or fallback
 */
export function formatArrayToString<T extends { name?: string | null }>(
  items: T[] | undefined | null,
  fallback: string = "—"
): string {
  if (!items || items.length === 0) {
    return fallback;
  }

  return items.map((item) => item.name).filter(Boolean).join(", ") || fallback;
}

/**
 * Reorder array by moving item from one index to another
 * @param array - Array to reorder
 * @param fromIndex - Source index
 * @param toIndex - Destination index
 * @returns New array with reordered items
 */
export function reorderArray<T>(array: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= array.length || toIndex >= array.length) {
    return array;
  }

  const newArray = [...array];
  const [movedItem] = newArray.splice(fromIndex, 1);
  newArray.splice(toIndex, 0, movedItem);
  return newArray;
}

