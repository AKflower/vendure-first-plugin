import { useMemo, useCallback, useState, useEffect, useRef } from "react";
import type { AnyRoute } from "@tanstack/react-router";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { z } from "zod";
import { DEFAULT_PAGE_SIZE, DEFAULT_SORTING } from "../../../utils/constants";

// URL search params schema - optimized for clean URLs
export const productListSearchSchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().optional(),
  sort: z.string().optional(), // Format: "column:asc" or "column:desc"
  enabled: z
    .union([z.string(), z.boolean()])
    .optional()
    .transform((val) => {
      if (val === undefined || val === null) return undefined;
      if (typeof val === "boolean") return val;
      if (val === "true") return true;
      if (val === "false") return false;
      return undefined;
    }),
  categories: z
    .union([z.string(), z.array(z.string())])
    .optional()
    .transform((val) => {
      if (!val) return [];
      if (Array.isArray(val)) {
        // If already array, return as is (shouldn't happen but handle it)
        return val.filter(Boolean);
      }
      // Support comma-separated values: "id1,id2,id3"
      return val.split(",").filter(Boolean);
    }), // Multiple category IDs
});

export type ProductListSearchParams = z.infer<typeof productListSearchSchema>;

export interface ProductFilters {
  page: number;
  pageSize: number;
  sorting: SortingState;
  filters: ColumnFiltersState;
  searchTerm: string;
}

export function useProductFilters(route: AnyRoute) {
  const navigate = route.useNavigate();
  const search = route.useSearch() as Partial<ProductListSearchParams>;

  // Parse search params with defaults
  const page = search.page ?? 1;
  const pageSize = search.pageSize ?? DEFAULT_PAGE_SIZE;

  // Parse sorting from URL: "column:asc" or "column:desc"
  const sorting: SortingState = useMemo(() => {
    if (!search.sort) return [...DEFAULT_SORTING] as SortingState;
    const [column, direction] = search.sort.split(":");
    if (!column) return [...DEFAULT_SORTING] as SortingState;
    return [{ id: column, desc: direction === "desc" }] as SortingState;
  }, [search.sort]);

  // Parse filters from URL
  const filters: ColumnFiltersState = useMemo(() => {
    const result: ColumnFiltersState = [];
    if (search.enabled !== undefined) {
      result.push({
        id: "enabled",
        value: { eq: search.enabled },
      });
    }
    if (search.categories && search.categories.length > 0) {
      result.push({
        id: "categoryFilter",
        value: search.categories.length === 1 ? search.categories[0] : search.categories,
      });
    }
    return result;
  }, [search.enabled, search.categories]);

  const updateSearchParams = useCallback(
    (updates: Record<string, any>) => {
      navigate({
        search: (prev: any) => {
          const newParams: Record<string, any> = {
            ...prev,
          };

          // Apply updates - if value is explicitly undefined, remove it
          Object.keys(updates).forEach((key) => {
            if (updates[key] === undefined || updates[key] === null) {
              delete newParams[key];
            } else {
              // Convert categories array to string immediately
              if (key === "categories" && Array.isArray(updates[key])) {
                newParams[key] = updates[key].join(",");
              } else {
                newParams[key] = updates[key];
              }
            }
          });

          // Ensure categories is always string (not array) from prev params too
          if (newParams.categories && Array.isArray(newParams.categories)) {
            newParams.categories = newParams.categories.join(",");
          }

          // Remove default/empty values to keep URL clean
          if (newParams.page === 1) delete newParams.page;
          if (newParams.pageSize === DEFAULT_PAGE_SIZE) delete newParams.pageSize;
          if (!newParams.sort) delete newParams.sort;
          if (newParams.enabled === undefined) delete newParams.enabled;
          if (!newParams.categories || newParams.categories === "") delete newParams.categories;

          // Remove undefined/null values
          Object.keys(newParams).forEach((key) => {
            if (newParams[key] === undefined || newParams[key] === null) delete newParams[key];
          });

          // Final check: ensure categories is string, never array
          if (newParams.categories !== undefined) {
            if (Array.isArray(newParams.categories)) {
              newParams.categories = newParams.categories.join(",");
            }
            // If empty string, remove it
            if (newParams.categories === "") {
              delete newParams.categories;
            }
          }

          return newParams;
        },
      } as any);
    },
    [navigate]
  );

  // Local state for search (not in URL) - moved before setFilters
  const [localSearchTerm, setLocalSearchTerm] = useState("");

  // Debounced search term for query
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Debounce search term (500ms delay)
  useEffect(() => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      setDebouncedSearchTerm(localSearchTerm);
    }, 500);

    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [localSearchTerm]);

  const setFilters = useCallback(
    (updates: Partial<ProductFilters> | ((prev: ProductFilters) => Partial<ProductFilters>)) => {
      const currentFilters: ProductFilters = {
        page,
        pageSize,
        sorting,
        filters,
        searchTerm: debouncedSearchTerm,
      };

      const resolved = typeof updates === "function" ? updates(currentFilters) : updates;

      const urlUpdates: Record<string, any> = {};

      // Handle page
      if (resolved.page !== undefined) {
        if (resolved.page !== 1) urlUpdates.page = resolved.page;
        else delete urlUpdates.page;
      }

      // Handle pageSize
      if (resolved.pageSize !== undefined) {
        if (resolved.pageSize !== DEFAULT_PAGE_SIZE) urlUpdates.pageSize = resolved.pageSize;
        else delete urlUpdates.pageSize;
      }

      // Handle sorting
      if (resolved.sorting !== undefined) {
        const sortItem = resolved.sorting[0];
        const isDefault =
          sortItem?.id === DEFAULT_SORTING[0].id && sortItem?.desc === DEFAULT_SORTING[0].desc;
        if (!isDefault && sortItem) {
          urlUpdates.sort = `${sortItem.id}:${sortItem.desc ? "desc" : "asc"}`;
        } else {
          urlUpdates.sort = undefined;
        }
      }

      // Handle filters
      if (resolved.filters !== undefined) {
        const enabledFilter = resolved.filters.find((f) => f.id === "enabled");
        if (enabledFilter?.value && typeof enabledFilter.value === "object" && "eq" in enabledFilter.value) {
          urlUpdates.enabled = enabledFilter.value.eq;
        } else {
          // Explicitly set to undefined to remove from URL
          urlUpdates.enabled = undefined;
        }

        const categoryFilter = resolved.filters.find((f) => f.id === "categoryFilter");
        if (categoryFilter?.value) {
          const categoryValues = Array.isArray(categoryFilter.value)
            ? categoryFilter.value
            : [categoryFilter.value];
          if (categoryValues.length > 0) {
            // Store as comma-separated string in URL
            urlUpdates.categories = categoryValues.join(",");
          } else {
            urlUpdates.categories = undefined;
          }
        } else {
          // Explicitly set to undefined to remove from URL
          urlUpdates.categories = undefined;
        }
      }

      // Search term is not stored in URL, handled by local state

      updateSearchParams(urlUpdates);
    },
    [page, pageSize, sorting, filters, debouncedSearchTerm, updateSearchParams]
  );

  const handlePageChange = useCallback(
    (_: any, newPage: number, newPageSize: number) => {
      setFilters({ page: newPage, pageSize: newPageSize });
    },
    [setFilters]
  );

  const handleSortChange = useCallback(
    (_: any, newSorting: SortingState) => {
      console.log("handleSortChange called:", newSorting);
      setFilters({ sorting: newSorting, page: 1 });
    },
    [setFilters]
  );

  const handleFilterChange = useCallback(
    (_: any, newFilters: ColumnFiltersState) => {
      setFilters({ filters: newFilters, page: 1 });
    },
    [setFilters]
  );

  const handleSearchTermChange = useCallback((term: string) => {
    setLocalSearchTerm(term);
  }, []);

  return {
    filters: {
      page,
      pageSize,
      sorting,
      filters,
      searchTerm: debouncedSearchTerm, // Debounced search term for query
    },
    localSearchTerm, // Local state for immediate UI feedback in input
    setFilters,
    handlePageChange,
    handleSortChange,
    handleFilterChange,
    handleSearchTermChange,
  };
}

