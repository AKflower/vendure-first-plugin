import { useCallback, useMemo } from "react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import type { AnyRoute } from "@tanstack/react-router";
import { api } from "@vendure/dashboard";

import { BasePage } from "../../../shared/components/layouts/base-page";
import { ProductTable, type ProductTableFilters } from "./table/product-table";
import { useRouteFilters } from "../../../shared/hooks/use-route-filters";
import {
  productsListQueryDocument,
  type ProductListItem,
  type ProductsListQueryResult,
} from "../queries/get-products";
import {
  facetByCodeQueryDocument,
  type FacetByCodeQueryResult,
} from "../queries/facets";

const DEFAULT_FILTERS: ProductTableFilters = {
  page: 1,
  limit: 10,
  key: "",
  status: "all",
  categoryId: "all", // Đây sẽ là facetValueId
  sortBy: "createdAt",
  sortOrder: "DESC",
};

interface ViewProductsProps {
  route: AnyRoute;
}

export function ViewProducts({ route }: ViewProductsProps) {
  const [filters, setFilters] = useRouteFilters<ProductTableFilters>(route, DEFAULT_FILTERS);
  const navigate = route.useNavigate();

  // Fetch products với filter trực tiếp từ backend
  const { data, isError, error, isLoading, isFetching } = useQuery<ProductsListQueryResult>({
    queryKey: ["products", filters],
    queryFn: () =>
      api.query(productsListQueryDocument, {
        options: buildProductQueryOptions(filters),
      }),
      placeholderData: (prev) => prev,
  });

  // Fetch facet values for category filter
  const { data: facetData } = useQuery<FacetByCodeQueryResult>({
    queryKey: ["facet-category"],
    queryFn: () => api.query(facetByCodeQueryDocument, { code: "category" }),
  });

  const rows = data?.products.items ?? [];
  const totalItems = data?.products.totalItems ?? 0;

  const categoryOptions = useMemo(() => {
    const facet = facetData?.facets.items?.[0];
    return facet?.values?.map(value => ({ id: value.id, name: value.name })) ?? [];
  }, [facetData]);

  const handleViewProduct = useCallback(
    (product: ProductListItem) => {
      navigate({ to: `/products-extend/${product.id}` });
    },
    [navigate]
  );

  const handleDuplicateProduct = useCallback((product: ProductListItem) => {
    // Later
  }, []);

  const handleDeleteProduct = useCallback((product: ProductListItem) => {
    // Later
  }, []);

  return (
    <BasePage title="Products">
      <ProductTable
        data={rows}
        totalItems={totalItems}
        filters={filters}
        onFiltersChange={setFilters}
        isLoading={isLoading || isFetching}
        isError={isError}
        categories={categoryOptions}
        onViewProduct={handleViewProduct}
        onDuplicateProduct={handleDuplicateProduct}
        onDeleteProduct={handleDeleteProduct}
      />
    </BasePage>
  );
}

function buildProductQueryOptions(filters: ProductTableFilters) {
  const { page, limit, key, status, sortBy, sortOrder, categoryId } = filters;

  const filterInput: Record<string, unknown> = {};

  // Search filter
  if (key) {
    filterInput.name = { contains: key };
  }

  // Status filter
  if (status !== "all") {
    filterInput.enabled = { eq: status === "enabled" };
  }

  // Collection filter qua facetValueIds
  if (categoryId && categoryId !== "all") {
    filterInput.facetValueId = { eq: categoryId };
  }

  const sortInput: Record<string, unknown> = {};
  if (sortBy) {
    sortInput.sort = {
      [sortBy]: sortOrder ?? "DESC",
    };
  }

  return {
    take: limit,
    skip: (page - 1) * limit,
    ...sortInput,
    ...(Object.keys(filterInput).length > 0 ? { filter: filterInput } : {})
  };
}
