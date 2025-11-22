import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useMemo } from "react";
import type { ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { api } from "@vendure/dashboard";
import { productsListQueryDocument, type ProductsListQueryResult } from "../graphql/graphql";
import { buildQueryOptions } from "../utils/buildQueryOptions";
import type { ProductFilters } from "./useProductFilters";

export function useProductQuery(filters: ProductFilters) {
  const queryOptions = useMemo(
    () =>
      buildQueryOptions({
        page: filters.page,
        pageSize: filters.pageSize,
        sorting: filters.sorting,
        filters: filters.filters,
        searchTerm: filters.searchTerm,
      }),
    [filters.page, filters.pageSize, filters.sorting, filters.filters, filters.searchTerm]
  );

  const { data, isLoading } = useQuery<ProductsListQueryResult>({
    queryKey: ["products", queryOptions],
    queryFn: () => api.query(productsListQueryDocument, { options: queryOptions }),
    placeholderData: keepPreviousData,
  });

  const products = data?.products.items ?? [];
  const totalItems = data?.products.totalItems ?? 0;

  return {
    products,
    totalItems,
    isLoading,
  };
}
