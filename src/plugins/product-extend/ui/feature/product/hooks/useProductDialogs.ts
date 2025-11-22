import { useState, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";

type Product = {
  id: string;
  [key: string]: any;
};

export function useProductDialogs() {
  const queryClient = useQueryClient();
  const [facetValuesDialogOpen, setFacetValuesDialogOpen] = useState(false);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [assetDialogOpen, setAssetDialogOpen] = useState(false);
  const [selectedProductForAsset, setSelectedProductForAsset] = useState<Product | null>(null);

  const openFacetValuesDialog = useCallback((productIds: string[]) => {
    setSelectedProductIds(productIds);
    setFacetValuesDialogOpen(true);
  }, []);

  const closeFacetValuesDialog = useCallback(() => {
    setFacetValuesDialogOpen(false);
    setSelectedProductIds([]);
    queryClient.invalidateQueries({ queryKey: ["products"] });
  }, [queryClient]);

  const openAssetDialog = useCallback((product: Product) => {
    setSelectedProductForAsset(product);
    setAssetDialogOpen(true);
  }, []);

  const closeAssetDialog = useCallback((isPending: boolean) => {
    setAssetDialogOpen(false);
    if (!isPending) {
      setSelectedProductForAsset(null);
    }
  }, []);

  return {
    facetValuesDialogOpen,
    selectedProductIds,
    assetDialogOpen,
    selectedProductForAsset,
    openFacetValuesDialog,
    closeFacetValuesDialog,
    openAssetDialog,
    closeAssetDialog,
    setFacetValuesDialogOpen,
  };
}

