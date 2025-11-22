import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";

export interface BuildQueryOptionsParams {
  page: number;
  pageSize: number;
  sorting: SortingState;
  filters: ColumnFiltersState;
  searchTerm: string;
}

export function buildQueryOptions({
  page,
  pageSize,
  sorting,
  filters,
  searchTerm,
}: BuildQueryOptionsParams) {
  const filterObj: any = {};
  const filterArray: any[] = [];

  // Add search filter
  if (searchTerm) {
    filterArray.push({
      _or: [{ name: { contains: searchTerm } }, { slug: { contains: searchTerm } }],
    });
  }

  // Add column filters
  filters.forEach((f) => {
    if (f.id === "enabled") {
      // Handle Boolean filter - can be { eq: value } or array or direct value
      if (f.value && typeof f.value === "object" && "eq" in f.value) {
        // Already in correct format from DataTableFacetedFilter
        filterArray.push({ enabled: f.value });
      } else if (Array.isArray(f.value)) {
        filterArray.push({ enabled: { in: f.value } });
      } else {
        filterArray.push({ enabled: { eq: f.value } });
      }
    }
    if (f.id === "categoryFilter") {
      if (Array.isArray(f.value)) {
        filterArray.push({ facetValueId: { in: f.value } });
      } else {
        filterArray.push({ facetValueId: { eq: f.value } });
      }
    }
  });

  if (filterArray.length > 0) {
    filterObj._and = filterArray;
  }

  const sortObj: any = {};
  if (sorting.length > 0) {
    const sortItem = sorting[0];
    // Map column IDs to Vendure API field names
    // Vendure ProductSortParameter supports: id, createdAt, updatedAt, name, slug, description
    // Note: "name" in our table refers to translations[0].name, but Vendure API uses "name" directly
    const fieldName = sortItem.id;
    sortObj[fieldName] = sortItem.desc ? "DESC" : "ASC";
  }

  return {
    take: pageSize,
    skip: (page - 1) * pageSize,
    ...(Object.keys(filterObj).length > 0 ? { filter: filterObj } : {}),
    ...(Object.keys(sortObj).length > 0 ? { sort: sortObj } : {}),
  };
}

