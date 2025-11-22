import { DataTable, FullWidthPageBlock, Button } from "@vendure/dashboard";
import { useMemo } from "react";
import { useVariantColumns } from "./variant-table-columns";
import type { SortingState, ColumnFiltersState } from "@tanstack/react-table";
import {
  EditFacetValuesVariantBulkAction,
  DeleteVariantsBulkAction,
} from "../dialogs/variant-bulk-actions";

// Common variant type with only the fields needed for the table
export interface VariantTableVariant {
  id: string;
  name: string | null;
  sku: string | null;
  enabled: boolean;
  price?: number | null;
  priceWithTax: number;
  currencyCode: string;
  stockOnHand: number | null;
  stockAllocated: number | null;
  featuredAsset?: {
    id: string;
    preview: string | null;
    name?: string | null;
  } | null;
  assets?: Array<{
    id: string;
    preview: string | null;
    name?: string | null;
  }>;
  options?: Array<{
    id: string;
    name: string;
    code?: string | null;
    group?: {
      id: string;
      name: string;
      code?: string | null;
    } | null;
  }>;
}

interface VariantTableProps {
  variants: VariantTableVariant[];
  totalItems?: number;
  page?: number;
  pageSize?: number;
  onVariantClick?: (variantId: string) => void;
  onManageVariants?: () => void;
  sorting?: SortingState;
  filters?: ColumnFiltersState;
  searchTerm?: string;
  onPageChange?: (event: any, newPage: number, newPageSize: number) => void;
  onSortChange?: (event: any, newSorting: SortingState) => void;
  onFilterChange?: (event: any, newFilters: ColumnFiltersState) => void;
  onSearchTermChange?: (term: string) => void;
  onEditFacetValues?: (variant: any) => void;
  onDeleteVariant?: (variant: any) => void;
  isDeleting?: (variantId: string) => boolean;
}

export function VariantTable({
  variants,
  totalItems,
  page = 1,
  pageSize = 10,
  onVariantClick,
  onManageVariants,
  sorting = [],
  filters = [],
  searchTerm = "",
  onPageChange,
  onSortChange,
  onFilterChange,
  onSearchTermChange,
  onEditFacetValues,
  onDeleteVariant,
  isDeleting,
}: VariantTableProps) {
  const columns = useVariantColumns({
    onVariantClick,
    onEditFacetValues,
    onDeleteVariant,
    isDeleting,
  });

  const defaultColumnVisibility = useMemo(
    () => ({
      featuredAsset: true,
      name: true,
      enabled: true,
      price: true,
      priceWithTax: true,
      stockLevels: true,
      actions: true,
    }),
    []
  );

  // Calculate total items - use provided totalItems or fallback to variants length
  const calculatedTotalItems = totalItems ?? variants.length;
  // Calculate page size - use provided pageSize or show all if no pagination
  const calculatedPageSize = onPageChange ? pageSize : variants.length || 10;

  return (
    <FullWidthPageBlock blockId="variants-table">
      <div className="flex items-center justify-between mb-4">
        {onManageVariants && (
          <Button variant="outline" size="sm" onClick={onManageVariants}>
            + Manage variants
          </Button>
        )}
      </div>
      <DataTable
        columns={columns}
        data={variants ?? []}
        totalItems={calculatedTotalItems}
        page={page}
        itemsPerPage={calculatedPageSize}
        sorting={sorting}
        columnFilters={filters}
        defaultColumnVisibility={defaultColumnVisibility}
        onPageChange={onPageChange}
        onSortChange={onSortChange}
        onFilterChange={onFilterChange}
        onSearchTermChange={onSearchTermChange}
        bulkActions={[
          {
            component: EditFacetValuesVariantBulkAction,
            order: 25,
          },
          {
            component: DeleteVariantsBulkAction,
            order: 100,
          },
        ]}
      />
    </FullWidthPageBlock>
  );
}

