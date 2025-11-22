import { ColumnDef } from "@tanstack/react-table";
import { Checkbox, DetailPageButton, Switch, DataTableColumnHeader } from "@vendure/dashboard";
import { useMemo, Suspense } from "react";

interface Product {
  id: string;
  slug: string;
  enabled: boolean;
  createdAt: string;
  description?: string;
  featuredAsset?: { preview: string } | null;
  assets?: Array<{ id: string; preview: string; name?: string }>;
  collections?: Array<{ name: string }>;
  translations?: Array<{ name?: string }>;
}

interface UseProductColumnsProps {
  onToggleEnabled: (product: Product, enabled: boolean) => void;
  updatingProductId: string | null;
  RowActionsComponent: React.ComponentType<{
    product: Product;
    onViewProduct: (productId: string) => void;
    onEditImage: (product: Product) => void;
    onEditFacetValues: (product: Product) => void;
    onDuplicateProduct: (product: Product) => void;
    onDeleteProduct: (product: Product) => void;
    isDeleting?: boolean;
    isDuplicating?: boolean;
    isUpdatingAsset?: boolean;
  }>;
  onViewProduct: (productId: string) => void;
  onEditImage: (product: Product) => void;
  onEditFacetValues: (product: Product) => void;
  onDuplicateProduct: (product: Product) => void;
  onDeleteProduct: (product: Product) => void;
  isDeleting?: (productId: string) => boolean;
  isDuplicating?: (productId: string) => boolean;
  isUpdatingAsset?: (productId: string) => boolean;
}

export function useProductColumns({
  onToggleEnabled,
  updatingProductId,
  RowActionsComponent,
  onViewProduct,
  onEditImage,
  onEditFacetValues,
  onDuplicateProduct,
  onDeleteProduct,
  isDeleting,
  isDuplicating,
  isUpdatingAsset,
}: UseProductColumnsProps): ColumnDef<Product>[] {
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
      },
      {
        id: "name",
        accessorFn: (row) => row.translations?.[0]?.name ?? "",
        header: (headerContext) => (
          <DataTableColumnHeader headerContext={headerContext} customConfig={{ header: "Product" }} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const product = row.original;
          const translation = product.translations?.[0];
          return (
            <div className="flex items-center gap-3">
              {product.featuredAsset?.preview ? (
                <img
                  src={product.featuredAsset.preview}
                  alt={translation?.name ?? ""}
                  className="size-10 rounded border object-cover"
                />
              ) : (
                <div className="size-10 rounded border bg-muted text-xs text-muted-foreground flex items-center justify-center">
                  N/A
                </div>
              )}
              <DetailPageButton
                id={product.id}
                label={<p className="font-medium">{translation?.name ?? "Untitled product"}</p>}
                className="font-medium"
              />
            </div>
          );
        },
      },
      {
        id: "slug",
        accessorKey: "slug",
        header: (headerContext) => (
          <DataTableColumnHeader headerContext={headerContext} customConfig={{ header: "Slug" }} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const slug = row.original.slug;
          return <span className="text-muted-foreground">{slug}</span>;
        },
      },
      {
        id: "enabled",
        accessorKey: "enabled",
        header: "Status",
        enableSorting: true,
        meta: {
          fieldInfo: {
            type: "Boolean",
          },
        },
        cell: ({ row }) => {
          const product = row.original;
          const enabled = product.enabled;
          const isUpdating = updatingProductId === product.id;
          return (
            <div className="flex items-center gap-2">
              <Switch
                checked={enabled}
                className="data-[state=checked]:bg-green-500 data-[state=unchecked]:bg-red-500 cursor-pointer"
                onCheckedChange={(checked) => onToggleEnabled(product, checked)}
                disabled={isUpdating}
              />
              <span className="text-xs text-muted-foreground">{enabled ? "Enabled" : "Disabled"}</span>
            </div>
          );
        },
      },
      {
        id: "collections",
        accessorFn: (row) => row.collections?.map((c) => c.name).join(", ") ?? "",
        header: "Collections",
        cell: ({ row }) => {
          const collections = row.original.collections;
          return (
            <span className="text-muted-foreground">{collections?.map((c) => c.name).join(", ") ?? "—"}</span>
          );
        },
      },
      {
        id: "assets",
        accessorKey: "assets",
        header: "Assets",
        enableSorting: true,
        cell: ({ row }) => {
          const assets = row.original.assets;
          if (!assets || assets.length === 0) return <span className="text-muted-foreground">—</span>;
          
          const visibleAssets = assets.slice(0, 3);
          const remainingCount = assets.length - 3;
          
          return (
            <div className="flex items-center gap-1.5">
              {visibleAssets.map((a) => (
                <img
                  key={a.id}
                  src={a.preview}
                  alt={a.name}
                  className="size-8 rounded border object-cover flex-shrink-0"
                  title={a.name}
                />
              ))}
              {remainingCount > 0 && (
                <span
                  className="text-xs font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex-shrink-0"
                  title={`${remainingCount} more asset${remainingCount > 1 ? "s" : ""}`}
                >
                  +{remainingCount}
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: "createdAt",
        accessorKey: "createdAt",
        header: (headerContext) => (
          <DataTableColumnHeader headerContext={headerContext} customConfig={{ header: "Created" }} />
        ),
        enableSorting: true,
        meta: {
          fieldInfo: {
            type: "DateTime",
          },
        },
        cell: ({ row }) => {
          const date = row.original.createdAt;
          if (!date) return <span className="text-muted-foreground">—</span>;
          try {
            return (
              <span className="text-muted-foreground">
                {new Intl.DateTimeFormat("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                }).format(new Date(date))}
              </span>
            );
          } catch {
            return <span className="text-muted-foreground">{date}</span>;
          }
        },
      },
      {
        id: "description",
        accessorKey: "description",
        header: (headerContext) => (
          <DataTableColumnHeader headerContext={headerContext} customConfig={{ header: "Description" }} />
        ),
        enableSorting: true,
        cell: ({ row }) => {
          const description = row.original.description;
          return <span className="text-muted-foreground">{description ?? "—"}</span>;
        },
      },
      {
        id: "categoryFilter",
        header: "Category",
        cell: () => null,
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
          const product = row.original;
          return (
            <Suspense fallback={null}>
              <RowActionsComponent
                product={product}
                onViewProduct={onViewProduct}
                onEditImage={onEditImage}
                onEditFacetValues={onEditFacetValues}
                onDuplicateProduct={onDuplicateProduct}
                onDeleteProduct={onDeleteProduct}
                isDeleting={isDeleting?.(product.id)}
                isDuplicating={isDuplicating?.(product.id)}
                isUpdatingAsset={isUpdatingAsset?.(product.id)}
              />
            </Suspense>
          );
        },
        enableColumnFilter: false,
        enableHiding: false,
        enableSorting: false,
      },
    ],
    [
      onToggleEnabled,
      updatingProductId,
      RowActionsComponent,
      onViewProduct,
      onEditImage,
      onEditFacetValues,
      onDuplicateProduct,
      onDeleteProduct,
      isDeleting,
      isDuplicating,
      isUpdatingAsset,
    ]
  );
}

