/**
 * Format a date string to a readable format
 * @param date - Date string or Date object
 * @param options - Intl.DateTimeFormatOptions
 * @returns Formatted date string or original string if invalid
 */
export function formatDate(
  date: string | Date | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    dateStyle: "medium",
    timeStyle: "short",
  }
): string {
  if (!date) return "—";
  
  try {
    const dateObj = typeof date === "string" ? new Date(date) : date;
    if (isNaN(dateObj.getTime())) {
      return typeof date === "string" ? date : "—";
    }
    return new Intl.DateTimeFormat("en-US", options).format(dateObj);
  } catch {
    return typeof date === "string" ? date : "—";
  }
}

/**
 * Format date for display in tooltips or detailed views
 */
export function formatDateDetailed(date: string | Date | null | undefined): string {
  return formatDate(date, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

/**
 * Format date for table display (shorter format)
 */
export function formatDateShort(date: string | Date | null | undefined): string {
  return formatDate(date, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

