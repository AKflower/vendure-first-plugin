import { DataTable, FullWidthPageBlock, api } from "@vendure/dashboard";
import { useMemo, lazy, useEffect, useRef } from "react";
import type { ColumnDef, ColumnFiltersState, SortingState } from "@tanstack/react-table";
import { facetByCodeQueryDocument } from "../../graphql/graphql";
import { DEFAULT_COLUMN_VISIBILITY, FACETED_FILTERS } from "../../../../utils/constants";
import {
  EditFacetValuesBulkAction,
  DeleteProductsBulkAction,
  DuplicateProductsBulkAction,
} from "../dialogs/product-bulk-actions";
import { ProductDialogs } from "../dialogs/product-dialog";

interface ProductTableProps {
  columns: ColumnDef<any>[];
  products: any[];
  totalItems: number;
  page: number;
  pageSize: number;
  sorting: SortingState;
  filters: ColumnFiltersState;
  searchTerm: string;
  onPageChange: (event: any, newPage: number, newPageSize: number) => void;
  onSortChange: (event: any, newSorting: SortingState) => void;
  onFilterChange: (event: any, newFilters: ColumnFiltersState) => void;
  onSearchTermChange: (term: string) => void;
  actions: {
    handleViewProduct: (productId: string) => void;
    handleEditImage: (product: any) => void;
    handleEditFacetValues: (product: any) => void;
    handleDuplicateProduct: (product: any) => void;
    handleDeleteProduct: (product: any) => void;
    handleToggleEnabled: (product: any, enabled: boolean) => void;
    isDeleting: (productId: string) => boolean;
    isDuplicating: (productId: string) => boolean;
    isUpdatingAsset: (productId: string) => boolean;
    updatingProductId: string | null;
  };
  dialogs: {
    facetValuesDialogOpen: boolean;
    selectedProductIds: string[];
    assetDialogOpen: boolean;
    selectedProductForAsset: any;
    closeFacetValuesDialog: () => void;
    closeAssetDialog: (isPending: boolean) => void;
    handleAssetSelect: (assets: Array<{ id: string; [key: string]: any }>) => void;
    setFacetValuesDialogOpen: (open: boolean) => void;
  };
}

export function ProductTable({
  columns,
  products,
  totalItems,
  page,
  pageSize,
  sorting,
  filters,
  searchTerm,
  onPageChange,
  onSortChange,
  onFilterChange,
  onSearchTermChange,
  actions,
  dialogs,
}: ProductTableProps) {
  const facetedFilters = useMemo(
    () => ({
      ...FACETED_FILTERS,
      categoryFilter: {
        title: "Category",
        optionsFn: async () => {
          try {
            const { facets } = await api.query(facetByCodeQueryDocument, { code: "category" });
            const facet = facets?.items?.[0];
            if (!facet?.values || facet.values.length === 0) return [];
            return facet.values.map((value: { id: string; name: string }) => ({
              label: value.name,
              value: value.id,
            }));
          } catch (error) {
            console.error("Error fetching categories:", error);
            return [];
          }
        },
      },
    }),
    []
  );

  // Debug: log when sorting prop changes
  useEffect(() => {
    console.log("ProductTable: sorting prop changed:", sorting);
  }, [sorting]);

  return (
    <FullWidthPageBlock blockId="products-table">
      <DataTable
        columns={columns}
        data={products}
        totalItems={totalItems}
        page={page}
        itemsPerPage={pageSize}
        sorting={sorting}
        columnFilters={filters}
        defaultColumnVisibility={DEFAULT_COLUMN_VISIBILITY}
        onPageChange={onPageChange}
        onSortChange={onSortChange}
        onFilterChange={onFilterChange}
        onSearchTermChange={onSearchTermChange}
        facetedFilters={facetedFilters as any}
        bulkActions={[
          {
            component: EditFacetValuesBulkAction,
            order: 25,
          },
          {
            component: DuplicateProductsBulkAction,
            order: 50,
          },
          {
            component: DeleteProductsBulkAction,
            order: 100,
          },
        ]}
      />
      <ProductDialogs dialogs={dialogs} actions={actions} />
    </FullWidthPageBlock>
  );
}

