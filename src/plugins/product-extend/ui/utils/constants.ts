export const DEFAULT_PAGE_SIZE = 10;
export const DEFAULT_SORTING = [{ id: "createdAt", desc: true }] as const;

export const DEFAULT_COLUMN_VISIBILITY = {
  id: false,
  slug: true,
  featuredAsset: false,
  categoryFilter: false,
  description: false,
  collections: true,
  enabled: true,
  assets: false,
  createdAt: false,
} as const;

export const FACETED_FILTERS = {
  enabled: {
    title: "Status",
    options: [
      { label: "Enabled", value: true },
      { label: "Disabled", value: false },
    ],
  },
} as const;

