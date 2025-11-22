import { useCallback } from "react";
import type { ConfigurableOperationInput } from "@vendure/common/lib/generated-types";
import type { useProductMutations } from "./useProductMutations";
import type { useProductDialogs } from "./useProductDialogs";

type Product = {
  id: string;
  [key: string]: any;
};

interface UseProductActionsParams {
  navigate: (options: { to: string }) => void;
  mutations: ReturnType<typeof useProductMutations>;
  dialogs: ReturnType<typeof useProductDialogs>;
}

export function useProductActions({ navigate, mutations, dialogs }: UseProductActionsParams) {
  const {
    deleteProductMutation,
    duplicateProductMutation,
    assetMutation,
    updateEnabledMutation,
    updatingProductId,
  } = mutations;

  const handleViewProduct = useCallback(
    (productId: string) => {
      navigate({ to: `/products-extend/${productId}` });
    },
    [navigate]
  );

  const handleDuplicateProduct = useCallback(
    async (product: Product) => {
      try {
        await duplicateProductMutation.mutateAsync({
          entityName: "Product",
          entityId: product.id,
          duplicatorInput: {
            code: "product-duplicator",
            arguments: [],
          } as ConfigurableOperationInput,
        });
      } catch (error) {
        // Error handled in mutation
      }
    },
    [duplicateProductMutation]
  );

  const handleDeleteProduct = useCallback(
    (product: Product) => {
      deleteProductMutation.mutate(product.id);
    },
    [deleteProductMutation]
  );

  const handleEditFacetValues = useCallback(
    (product: Product) => {
      dialogs.openFacetValuesDialog([product.id]);
    },
    [dialogs]
  );

  const handleEditImage = useCallback(
    (product: Product) => {
      dialogs.openAssetDialog(product);
    },
    [dialogs]
  );

  const handleAssetSelect = useCallback(
    (assets: Array<{ id: string; [key: string]: any }>) => {
      const selectedProduct = dialogs.selectedProductForAsset;
      if (assets.length > 0 && selectedProduct) {
        const productId = selectedProduct.id;
        assetMutation.mutate(
          { productId, selectedAssets: assets },
          {
            onSuccess: () => {
              dialogs.closeAssetDialog(false);
            },
          }
        );
      }
    },
    [assetMutation, dialogs]
  );

  const handleToggleEnabled = useCallback(
    (product: Product, enabled: boolean) => {
      updateEnabledMutation.mutate({ productId: product.id, enabled });
    },
    [updateEnabledMutation]
  );

  return {
    handleViewProduct,
    handleDuplicateProduct,
    handleDeleteProduct,
    handleEditFacetValues,
    handleEditImage,
    handleAssetSelect,
    handleToggleEnabled,
    isDeleting: (productId: string) => deleteProductMutation.isPending,
    isDuplicating: (productId: string) => duplicateProductMutation.isPending,
    isUpdatingAsset: (productId: string) =>
      assetMutation.isPending && dialogs.selectedProductForAsset?.id === productId,
    updatingProductId,
  };
}

