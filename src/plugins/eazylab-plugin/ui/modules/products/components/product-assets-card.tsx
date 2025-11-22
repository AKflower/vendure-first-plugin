import { useMemo, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button, AssetPickerDialog, api } from "@vendure/dashboard";
import { Paperclip } from "lucide-react";

import { updateProductAssetsMutationDocument } from "../queries/product-detail";

type ProductAsset = {
  id: string;
  preview?: string | null;
};

interface ProductAssetsCardProps {
  productId: string;
  assets: ProductAsset[];
  featuredAsset?: ProductAsset | null;
  onUpdated?: () => void;
}

export function ProductAssetsCard({
  productId,
  assets,
  featuredAsset,
  onUpdated,
}: ProductAssetsCardProps) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assetIds = assets?.map((asset) => asset.id) ?? [];
  const currentFeaturedId = featuredAsset?.id ?? assetIds[0];
  const heroImage = useMemo(() => {
    return assets.find((asset) => asset.id === currentFeaturedId) ?? featuredAsset ?? null;
  }, [assets, currentFeaturedId, featuredAsset]);

  const mutation = useMutation({
    mutationFn: async ({
      newAssetIds,
      featuredAssetId,
    }: {
      newAssetIds: string[];
      featuredAssetId?: string | null;
    }) => {
      setError(null);
      return api.mutate(updateProductAssetsMutationDocument, {
        input: {
          id: productId,
          assetIds: newAssetIds,
          featuredAssetId: featuredAssetId ?? undefined,
        },
      });
    },
    onSuccess: () => {
      onUpdated?.();
    },
    onError: (err: unknown) => {
      setError(err instanceof Error ? err.message : "Failed to update assets");
    },
  });

  const handleAssetSelect = (selection: ProductAsset[]) => {
    if (!selection.length) {
      return;
    }
    mutation.mutate({
      newAssetIds: selection.map((asset) => asset.id),
      featuredAssetId: selection[0]?.id,
    });
    setPickerOpen(false);
  };

  const handleSetFeatured = (assetId: string) => {
    mutation.mutate({
      newAssetIds: assetIds,
      featuredAssetId: assetId,
    });
  };

  return (
    <div className="rounded-2xl border bg-card text-card-foreground shadow-sm">
      <div className="space-y-4 p-4">
        <div>
          <h3 className="text-lg font-semibold">Assets</h3>
          <p className="text-sm text-muted-foreground">
            Featured image plus additional media displayed across the storefront.
          </p>
        </div>

        <div className="rounded-xl border border-dashed bg-muted/40 p-2">
          {heroImage?.preview ? (
            <div className="flex items-center justify-center rounded-lg bg-background">
              <img
                src={heroImage.preview}
                alt="Featured asset"
                className="h-64 w-full rounded-lg object-cover"
              />
            </div>
          ) : (
            <div className="flex h-64 flex-col items-center justify-center rounded-lg bg-background text-muted-foreground">
              <Paperclip className="mb-2 size-8" />
              <p className="text-sm">No asset selected</p>
            </div>
          )}
        </div>

        {assets.length ? (
          <div className="flex flex-wrap gap-3">
            {assets.map((asset) => (
              <button
                key={asset.id}
                type="button"
                onClick={() => handleSetFeatured(asset.id)}
                className={`rounded-lg border p-1 transition ${
                  asset.id === currentFeaturedId
                    ? "border-primary ring-2 ring-primary/50"
                    : "border-transparent hover:border-muted-foreground/40"
                }`}
                disabled={mutation.isPending}
              >
                {asset.preview ? (
                  <img
                    src={asset.preview}
                    alt="Asset thumbnail"
                    className="h-16 w-16 rounded-md object-cover"
                  />
                ) : (
                  <div className="flex h-16 w-16 items-center justify-center rounded-md bg-muted text-xs text-muted-foreground">
                    N/A
                  </div>
                )}
              </button>
            ))}
          </div>
        ) : null}

        {error ? (
          <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            {error}
          </div>
        ) : null}

        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={() => setPickerOpen(true)}
            disabled={mutation.isPending}
            className="flex w-full items-center justify-center gap-2"
          >
            <Paperclip className="size-4" />
            {assets.length ? "Add or replace assets" : "Add asset"}
          </Button>
        </div>
      </div>

      <AssetPickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleAssetSelect}
        multiSelect
        initialSelectedAssets={assets}
      />
    </div>
  );
}

