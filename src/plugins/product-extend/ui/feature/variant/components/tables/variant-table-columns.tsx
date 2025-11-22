import { ColumnDef, HeaderContext } from "@tanstack/react-table";
import { Checkbox, DataTableColumnHeader } from "@vendure/dashboard";
import { useMemo, Suspense } from "react";
import { Paperclip } from "lucide-react";
import type { VariantTableVariant } from "./variant-table";
import { VariantRowActions } from "./variant-row-actions";
import { formatPrice } from "../../../../utils/format";

type Variant = VariantTableVariant;

interface UseVariantColumnsProps {
  onVariantClick?: (variantId: string) => void;
  productId?: string;
  onEditFacetValues?: (variant: any) => void;
  onDeleteVariant?: (variant: any) => void;
  isDeleting?: (variantId: string) => boolean;
}

export function useVariantColumns({
  onVariantClick,
  productId,
  onEditFacetValues,
  onDeleteVariant,
  isDeleting,
}: UseVariantColumnsProps): ColumnDef<Variant>[] {
  return useMemo(
    () => [
      {
        id: "select",
        header: ({ table }) => (
          <Checkbox
            className="mx-1"
            checked={table.getIsAllRowsSelected()}
            onCheckedChange={(checked) =>
              table.toggleAllRowsSelected(checked === "indeterminate" ? undefined : checked)
            }
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            className="mx-1"
            checked={row.getIsSelected()}
            onCheckedChange={row.getToggleSelectedHandler()}
          />
        ),
        enableColumnFilter: false,
        enableHiding: false,
        enableSorting: false,
      },
      {
        id: "featuredAsset",
        header: () => <span className="sr-only">Featured asset</span>,
        cell: ({ row }) => {
          const variant = row.original;
          return (
            <div className="flex items-center">
              {variant.featuredAsset?.preview ? (
                <img
                  src={variant.featuredAsset.preview}
                  alt={variant.name ?? ""}
                  className="h-8 w-8 rounded object-cover"
                />
              ) : (
                <div className="h-8 w-8 rounded bg-muted flex items-center justify-center">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </div>
          );
        },
        enableSorting: false,
        enableColumnFilter: false,
      },
      {
        id: "name",
        accessorKey: "name",
        header: (headerContext: HeaderContext<Variant, unknown>) => (
          <DataTableColumnHeader headerContext={headerContext} customConfig={{ header: "Name" }} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const variant = row.original;
          return (
            <button
              type="button"
              className="text-left hover:underline font-medium"
              onClick={() => onVariantClick?.(variant.id)}
            >
              {variant.name} &gt;
            </button>
          );
        },
      },
      {
        id: "enabled",
        accessorKey: "enabled",
        header: (headerContext: HeaderContext<Variant, unknown>) => (
          <DataTableColumnHeader headerContext={headerContext} customConfig={{ header: "Enabled" }} />
        ),
        enableSorting: true,
        meta: {
          fieldInfo: {
            type: "Boolean",
          },
        },
        cell: ({ row }) => {
          const variant = row.original;
          return (
            <span
              className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs ${
                variant.enabled
                  ? "bg-green-100 text-green-800"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {variant.enabled ? "Enabled" : "Disabled"}
            </span>
          );
        },
      },
      {
        id: "price",
        accessorKey: "price",
        header: (headerContext: HeaderContext<Variant, unknown>) => (
          <DataTableColumnHeader headerContext={headerContext} customConfig={{ header: "Price" }} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const variant = row.original;
          return <span className="text-muted-foreground">{formatPrice(variant.price, variant.currencyCode)}</span>;
        },
      },
      {
        id: "priceWithTax",
        accessorKey: "priceWithTax",
        header: (headerContext: HeaderContext<Variant, unknown>) => (
          <DataTableColumnHeader headerContext={headerContext} customConfig={{ header: "Price with tax" }} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const variant = row.original;
          return (
            <span className="text-muted-foreground">{formatPrice(variant.priceWithTax, variant.currencyCode)}</span>
          );
        },
      },
      {
        id: "stockLevels",
        accessorFn: (row) => {
          const available = (row.stockOnHand ?? 0) - (row.stockAllocated ?? 0);
          return `${available}/${row.stockOnHand ?? 0}`;
        },
        header: (headerContext: HeaderContext<Variant, unknown>) => (
          <DataTableColumnHeader headerContext={headerContext} customConfig={{ header: "Stock levels" }} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const variant = row.original;
          const available = (variant.stockOnHand ?? 0) - (variant.stockAllocated ?? 0);
          return <span className="text-muted-foreground">{available}/{variant.stockOnHand ?? 0}</span>;
        },
      },
      {
        id: "actions",
        header: () => {
          return (
            <div className="flex justify-center w-full">
              <span className="sr-only">Actions</span>
            </div>
          );
        },
        cell: ({ row }) => {
          const variant = row.original;
          return (
            <Suspense fallback={null}>
              <VariantRowActions
                variant={variant}
                onEditFacetValues={onEditFacetValues}
                onDeleteVariant={onDeleteVariant}
                isDeleting={isDeleting?.(variant.id)}
              />
            </Suspense>
          );
        },
        enableColumnFilter: false,
        enableHiding: false,
        enableSorting: false,
      },
    ],
    [onVariantClick, productId, onEditFacetValues, onDeleteVariant, isDeleting]
  );
}

