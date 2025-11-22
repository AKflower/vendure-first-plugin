import { useQuery, useMutation } from "@tanstack/react-query";
import {

  Card,
  api,
} from "@vendure/dashboard";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { useMemo, useState } from "react";
import { Trans } from "@lingui/react/macro";
import type { SortingState, ColumnFiltersState } from "@tanstack/react-table";
import {
  productVariantsQueryDocument,
  type ProductVariantsQueryResult,
} from "../graphql/graphql";
import { VariantTable } from "./tables/variant-table";
import { LoadingState } from "../../../components/loading-state";

interface ViewVariantsProps {
  productId: string;
  onUpdateButtonClick?: () => void;
  showUpdateButton?: boolean;
}

export function ViewVariants({ productId, onUpdateButtonClick, showUpdateButton = true }: ViewVariantsProps) {
  const navigate = useNavigate();

  const variantsQuery = useQuery<ProductVariantsQueryResult>({
    queryKey: ["product-variants", productId],
    queryFn: () => api.query(productVariantsQueryDocument, { productId }),
  });

  const product = variantsQuery.data?.product;
  const variants = product?.variants ?? [];

  // const updateMutation = useMutation({
  //   mutationFn: async (values: VariantFormValues & { variantId: string }) => {
  //     await api.mutate(updateVariantMutationDocument, {
  //       input: {
  //         id: values.variantId,
  //         enabled: values.enabled,
  //         price: Math.round(values.price * 100), // Convert to cents
  //         stockOnHand: values.stockOnHand,
  //         outOfStockThreshold: values.outOfStockThreshold,
  //         trackInventory: values.trackInventory,
  //       },
  //     });
  //   },
  //   onSuccess: () => {
  //     toast.success(<Trans>Variant updated successfully</Trans>);
  //     variantsQuery.refetch();
  //   },
  //   onError: (error: any) => {
  //     toast.error(error.message || <Trans>Failed to update variant</Trans>);
  //   },
  // });

  // const assetMutation = useMutation({
  //   mutationFn: async ({
  //     variantId,
  //     selectedAssets,
  //   }: {
  //     variantId: string;
  //     selectedAssets: Array<{ id: string }>;
  //   }) => {
  //     await api.mutate(updateVariantAssetsMutationDocument, {
  //       input: {
  //         id: variantId,
  //         assetIds: selectedAssets.map((asset) => asset.id),
  //         featuredAssetId: selectedAssets[0]?.id,
  //       },
  //     });
  //   },
  //   onSuccess: () => {
  //     toast.success(<Trans>Variant assets updated successfully</Trans>);
  //     variantsQuery.refetch();
  //   },
  //   onError: (error: any) => {
  //     toast.error(error.message || <Trans>Failed to update variant assets</Trans>);
  //   },
  // });


  // Table state management
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [filters, setFilters] = useState<ColumnFiltersState>([]);
  const [searchTerm, setSearchTerm] = useState("");

  
  const filteredAndPaginatedVariants = useMemo(() => {
    let filtered = [...variants];

    // Apply search filter
    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.name?.toLowerCase().includes(searchLower) ||
          v.sku?.toLowerCase().includes(searchLower)
      );
    }

    // Apply column filters
    filters.forEach((filter) => {
      if (filter.id === "enabled" && filter.value) {
        const enabledValue = typeof filter.value === "object" && "eq" in filter.value
          ? filter.value.eq
          : filter.value;
        filtered = filtered.filter((v) => v.enabled === enabledValue);
      }
    });

    // Apply sorting
    if (sorting.length > 0) {
      const sortItem = sorting[0];
      filtered.sort((a, b) => {
        let aValue: any;
        let bValue: any;

        switch (sortItem.id) {
          case "name":
            aValue = a.name ?? "";
            bValue = b.name ?? "";
            break;
          case "sku":
            aValue = a.sku ?? "";
            bValue = b.sku ?? "";
            break;
          case "enabled":
            aValue = a.enabled;
            bValue = b.enabled;
            break;
          case "price":
            aValue = a.price ?? 0;
            bValue = b.price ?? 0;
            break;
          case "priceWithTax":
            aValue = a.priceWithTax ?? 0;
            bValue = b.priceWithTax ?? 0;
            break;
          case "stockLevels":
            aValue = (a.stockOnHand ?? 0) - (a.stockAllocated ?? 0);
            bValue = (b.stockOnHand ?? 0) - (b.stockAllocated ?? 0);
            break;
          default:
            return 0;
        }

        if (aValue < bValue) return sortItem.desc ? 1 : -1;
        if (aValue > bValue) return sortItem.desc ? -1 : 1;
        return 0;
      });
    }

    // Apply pagination
    const startIndex = (page - 1) * pageSize;
    const endIndex = startIndex + pageSize;
    return filtered.slice(startIndex, endIndex);
  }, [variants, searchTerm, filters, sorting, page, pageSize]);

  const totalFilteredItems = useMemo(() => {
    let filtered = [...variants];

    if (searchTerm) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (v) =>
          v.name?.toLowerCase().includes(searchLower) ||
          v.sku?.toLowerCase().includes(searchLower)
      );
    }

    filters.forEach((filter) => {
      if (filter.id === "enabled" && filter.value) {
        const enabledValue = typeof filter.value === "object" && "eq" in filter.value
          ? filter.value.eq
          : filter.value;
        filtered = filtered.filter((v) => v.enabled === enabledValue);
      }
    });

    return filtered.length;
  }, [variants, searchTerm, filters]);

  // const handleFormSubmit = () => {
  //   if (!selectedVariantId) return;
  //   formRef.current?.submit();
  // };

  const handleVariantClick = (variantId: string) => {
    // Too late to do... :(
    navigate({ to: `/products/${productId}/variants` });
  };

  if (variantsQuery.isLoading) {
    return <LoadingState label="Loading variants..." />;
  }

  if (variantsQuery.isError || !product) {
    return (
      <Card className="p-4 text-sm text-destructive">
        Unable to load product variants.
      </Card>
    );
  }

  return (
    <>
      <div className="">
        <div className="space-y-4">
          <VariantTable 
            variants={filteredAndPaginatedVariants}
            totalItems={totalFilteredItems}
            page={page}
            pageSize={pageSize}
            sorting={sorting}
            filters={filters}
            searchTerm={searchTerm}
            onVariantClick={handleVariantClick}
            onPageChange={(_, newPage, newPageSize) => {
              setPage(newPage);
              setPageSize(newPageSize);
            }}
            onSortChange={(_, newSorting) => {
              setSorting(newSorting);
              setPage(1);
            }}
            onFilterChange={(_, newFilters) => {
              setFilters(newFilters);
              setPage(1); 
            }}
            onSearchTermChange={(term) => {
              setSearchTerm(term);
              setPage(1); 
            }}
          />
        </div>

     
      </div>

  
    </>
  );
}

