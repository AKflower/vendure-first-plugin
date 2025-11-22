import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Trans } from "@lingui/react/macro";
import { api } from "@vendure/dashboard";
import type { ConfigurableOperationInput } from "@vendure/common/lib/generated-types";
import {
  deleteProductsMutationDocument,
  duplicateEntityMutationDocument,
  updateProductMutationDocument,
  updateProductAssetsMutationDocument,
} from "../graphql/graphql";
import { transformAssetsForMutation } from "../../../utils/data-transform";

export function useProductMutations() {
  const queryClient = useQueryClient();
  const [updatingProductId, setUpdatingProductId] = useState<string | null>(null);

  const deleteProductMutation = useMutation({
    mutationFn: (id: string) => api.mutate(deleteProductsMutationDocument, { ids: [id] }),
    onSuccess: (data) => {
      const result = data.deleteProducts[0];
      if (result.result === "DELETED") {
        toast.success(<Trans>Product deleted successfully</Trans>);
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } else {
        toast.error(result.message || <Trans>Failed to delete product</Trans>);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || <Trans>Failed to delete product</Trans>);
    },
  });

  const duplicateProductMutation = useMutation({
    mutationFn: (input: {
      entityName: string;
      entityId: string;
      duplicatorInput: ConfigurableOperationInput;
    }) => api.mutate(duplicateEntityMutationDocument, { input }),
    onSuccess: (data) => {
      if ("newEntityId" in data.duplicateEntity) {
        toast.success(<Trans>Product duplicated successfully</Trans>);
        queryClient.invalidateQueries({ queryKey: ["products"] });
      } else {
        const errorMsg =
          data.duplicateEntity.message || data.duplicateEntity.duplicationError || "Unknown error";
        toast.error(<Trans>Failed to duplicate product: {errorMsg}</Trans>);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || <Trans>Failed to duplicate product</Trans>);
    },
  });

  const assetMutation = useMutation({
    mutationFn: async ({
      productId,
      selectedAssets,
    }: {
      productId: string;
      selectedAssets: Array<{ id: string }>;
    }) => {
      return api.mutate(updateProductAssetsMutationDocument, {
        input: {
          id: productId,
          ...transformAssetsForMutation(selectedAssets),
        },
      });
    },
    onSuccess: () => {
      toast.success(<Trans>Product image updated successfully</Trans>);
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
    onError: (error: any) => {
      toast.error(error.message || <Trans>Failed to update product image</Trans>);
    },
  });

  const updateEnabledMutation = useMutation({
    mutationFn: async ({ productId, enabled }: { productId: string; enabled: boolean }) => {
      setUpdatingProductId(productId);
      await api.mutate(updateProductMutationDocument, {
        input: {
          id: productId,
          enabled,
        },
      });
    },
    onMutate: async ({ productId, enabled }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["products"] });

      // Snapshot the previous value
      const previousQueries = queryClient.getQueriesData({ queryKey: ["products"] });

      // Optimistically update the cache
      queryClient.setQueriesData({ queryKey: ["products"] }, (old: any) => {
        if (!old?.products?.items) return old;
        return {
          ...old,
          products: {
            ...old.products,
            items: old.products.items.map((product: any) =>
              product.id === productId ? { ...product, enabled } : product
            ),
          },
        };
      });

      // Return context with the snapshotted value
      return { previousQueries };
    },
    onSuccess: (_, variables) => {
      toast.success(
        <Trans>Product {variables.enabled ? "enabled" : "disabled"} successfully</Trans>
      );
      setUpdatingProductId(null);
    },
    onError: (error: any, _variables, context) => {
      // Rollback to the previous value
      if (context?.previousQueries) {
        context.previousQueries.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      toast.error(error.message || <Trans>Failed to update product status</Trans>);
      setUpdatingProductId(null);
    },
    onSettled: () => {
      // Refetch to ensure consistency, but with keepPreviousData it won't cause UI jumps
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  return {
    deleteProductMutation,
    duplicateProductMutation,
    assetMutation,
    updateEnabledMutation,
    updatingProductId,
  };
}

