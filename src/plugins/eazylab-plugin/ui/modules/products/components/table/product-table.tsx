import { ColumnDef } from "@tanstack/react-table";
import {
  Button,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@vendure/dashboard";
import { Copy, Eye, MoreHorizontal, Trash2 } from "lucide-react";

import { BaseTable } from "../../../../shared/components/table/base-table";
import type { PaginationFilter } from "../../../../shared/components/table/table-pagination";
import { Truncate } from "../../../../shared/components/common/truncate";
import type { ProductListItem } from "../../queries/get-products";
import { ProductFilterSheet } from "./product-filter-sheet";

export type SortField = "createdAt" | "name" | "productId";
export type SortOrder = "ASC" | "DESC";

const FILTER_DEFAULTS = {
  key: "",
  status: "all" as const,
  categoryId: "all",
};

type ClearableFilterKey = keyof typeof FILTER_DEFAULTS;

export type ProductTableFilters = PaginationFilter & {
  key?: string;
  status?: "all" | "enabled" | "disabled";
  categoryId?: string;
  sortBy?: SortField;
  sortOrder?: SortOrder;
};

interface ProductRowActionHandlers {
  onViewProduct?: (product: ProductListItem) => void;
  onDuplicateProduct?: (product: ProductListItem) => void;
  onDeleteProduct?: (product: ProductListItem) => void;
}

export interface ProductTableProps extends ProductRowActionHandlers {
  data: ProductListItem[];
  totalItems: number;
  filters: ProductTableFilters;
  onFiltersChange: (filters: ProductTableFilters) => void;
  isLoading?: boolean;
  isError?: boolean;
  categories?: { id: string; name: string }[];
}

const buildColumns = (actions: ProductRowActionHandlers = {}): ColumnDef<ProductListItem>[] => [
  {
    accessorKey: "name",
    header: "Product",
    cell: ({ row }) => {
      const product = row.original;
      const name = getProductName(product);
      const thumbnail = product.featuredAsset?.preview;

      const Content = (
        <div className="w-max flex items-center gap-3 hover:cursor-pointer" onClick={() => actions.onViewProduct?.(product)}>
          {thumbnail ? (
            <img
              src={thumbnail}
              alt={name}
              className="size-10 lg:size-14 rounded border object-cover"
            />
          ) : (
            <div className="size-10 lg:size-14 rounded border bg-muted flex items-center justify-center text-xs text-muted-foreground">
              N/A
            </div>
          )}
          <div className="min-w-0 text-left hover:bg-muted rounded-md px-1 py-1 transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary">
            <Truncate className="font-medium text-sm lg:text-md">{name}</Truncate>
            <Truncate className="block text-xs lg:text-sm text-muted-foreground">#{product.id}</Truncate>
          </div>
        </div>
      );

      if (!actions.onViewProduct) {
        return Content;
      }

      return (
        <button
          type="button"
          className="w-full  text-left hover:bg-muted/50 rounded-md px-1 py-1 transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary"
        >
          {Content}
        </button>
      );
    },
    minSize: 300,
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => (
      <Truncate className="text-sm text-muted-foreground max-w-[200px]">{row.original.slug}</Truncate>
    ),
  },
  {
    id: "collections",
    header: "Collection",
    cell: ({ row }) => (
      <Truncate className="text-sm text-muted-foreground max-w-[220px]">
        {row.original.collections?.map(c => c.name).join(", ") || "—"}
      </Truncate>
    ),
  },
  {
    accessorKey: "enabled",
    header: "Status",
    cell: ({ row }) => {
      const enabled = row.original.enabled;
      return (
        <span
          className={`px-2 py-1 rounded-full text-xs font-semibold ${
            enabled ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
          }`}
        >
          {enabled ? "Enabled" : "Disabled"}
        </span>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created at",
    cell: ({ row }) => <span className="text-sm text-muted-foreground">{formatDate(row.original.createdAt)}</span>,
  },
  {
    id: "actions",
    header: () => {
      return (
        <div className="flex justify-center w-full">
          <span className="">Actions</span>
        </div>
      );
    },
    cell: ({ row }) => {
      const product = row.original;
      return (
        <div className="flex justify-center w-full">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="size-8 p-0">
                <span className="sr-only">Open actions</span>
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem
                onClick={() => actions.onDuplicateProduct?.(product)}
                disabled={!actions.onDuplicateProduct}
              >
                <Copy className="size-4" />
                Duplicate
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => actions.onViewProduct?.(product)}
                disabled={!actions.onViewProduct}
              >
                <Eye className="size-4" />
                View details
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                variant="destructive"
                onClick={() => actions.onDeleteProduct?.(product)}
                disabled={!actions.onDeleteProduct}
              >
                <Trash2 className="size-4" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];

export function ProductTable({
  data,
  totalItems,
  filters,
  onFiltersChange,
  isLoading = false,
  isError = false,
  onDuplicateProduct,
  onViewProduct,
  onDeleteProduct,
  categories = [],
}: ProductTableProps) {
  const handleFilterChange = (nextFilters: ProductTableFilters) => {
    const keyChanged = (filters.key ?? FILTER_DEFAULTS.key) !== (nextFilters.key ?? FILTER_DEFAULTS.key);
    const statusChanged = (filters.status ?? FILTER_DEFAULTS.status) !== (nextFilters.status ?? FILTER_DEFAULTS.status);
    const categoryChanged =
      (filters.categoryId ?? FILTER_DEFAULTS.categoryId) !== (nextFilters.categoryId ?? FILTER_DEFAULTS.categoryId);
    const nextPage = keyChanged || statusChanged || categoryChanged ? 1 : nextFilters.page;

    onFiltersChange?.({ ...nextFilters, page: nextPage });
  };

  const clearFilter = (filterKey: ClearableFilterKey) => {
    const resetValue = FILTER_DEFAULTS[filterKey];
    handleFilterChange({
      ...filters,
      [filterKey]: resetValue,
    });
  };

  const clearAllFilters = () => {
    handleFilterChange({
      ...filters,
      ...FILTER_DEFAULTS,
    });
  };

  return (
    <div className="space-y-4">
      <BaseTable
        data={data}
        columns={buildColumns({ onViewProduct, onDuplicateProduct, onDeleteProduct })}
        filters={filters}
        onFilterChange={(nextFilters) => {
          const typedFilters = nextFilters as ProductTableFilters;
          handleFilterChange(typedFilters);
        }}
        total={totalItems}
        FilterComponent={({ filters, onFilterChange }) => (
          <ProductFilterSheet
            filters={filters}
            onFilterChange={onFilterChange}
            categories={categories}
          />
        )}
        FilterSummaryComponent={
          <ActiveFilterBadges
            filters={filters}
            categories={categories}
            onClear={clearFilter}
            onClearAll={clearAllFilters}
          />
        }
        enableRowSelection
        getRowId={(row) => row.id}
        isLoading={isLoading}
        isError={isError}
      />
    </div>
  );
}


function getProductName(product: ProductListItem) {
  return product.translations?.[0]?.name ?? "Không tên";
}

function formatDate(value: string) {
  try {
    return new Intl.DateTimeFormat("vi-VN", {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

interface ActiveFilterBadgesProps {
  filters: ProductTableFilters;
  categories: { id: string; name: string }[];
  onClear: (key: ClearableFilterKey) => void;
  onClearAll: () => void;
}

function ActiveFilterBadges({ filters, categories, onClear, onClearAll }: ActiveFilterBadgesProps) {
  const badges: { key: ClearableFilterKey; label: string; value: string }[] = [];

  const trimmedKey = filters.key?.trim();
  if (trimmedKey) {
    badges.push({
      key: "key",
      label: "Từ khóa",
      value: trimmedKey,
    });
  }

  if (filters.status && filters.status !== FILTER_DEFAULTS.status) {
    const statusLabel = filters.status === "enabled" ? "Đang bật" : "Đang tắt";
    badges.push({
      key: "status",
      label: "Trạng thái",
      value: statusLabel,
    });
  }

  if (filters.categoryId && filters.categoryId !== FILTER_DEFAULTS.categoryId) {
    const collectionName = categories.find(category => category.id === filters.categoryId)?.name ?? "Chưa rõ";
    badges.push({
      key: "categoryId",
      label: "Danh mục",
      value: collectionName,
    });
  }

  if (badges.length === 0) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 text-xs">
      {badges.map(badge => (
        <button
          type="button"
          key={badge.key}
          className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-muted-foreground transition hover:border-primary hover:text-primary"
          onClick={() => onClear(badge.key)}
        >
          <span className="font-medium text-foreground">{badge.label}:</span>
          <span>{badge.value}</span>
          <span aria-hidden="true">&times;</span>
        </button>
      ))}
      {badges.length > 1 ? (
        <button
          type="button"
          className="text-xs font-semibold text-primary underline-offset-4 hover:underline"
          onClick={onClearAll}
        >
          Xóa tất cả
        </button>
      ) : null}
    </div>
  );
}
