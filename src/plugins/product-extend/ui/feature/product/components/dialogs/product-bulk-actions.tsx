import type { BulkActionComponent } from "@vendure/dashboard";
import { DataTableBulkActionItem, api } from "@vendure/dashboard";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { useDialog } from "../../hooks/useDialog";
import { Trans } from "@lingui/react/macro";
import { toast } from "sonner";
import { TagIcon, Trash2, Copy } from "lucide-react";
import type { ConfigurableOperationInput } from "@vendure/common/lib/generated-types";
import { lazy, Suspense } from "react";
import { getProductName } from "../../../../utils/translation";

import {
  deleteProductsMutationDocument,
  duplicateEntityMutationDocument,
  updateProductsMutationDocument,
  getProductsWithFacetValuesByIdsQueryDocument,
} from "../../graphql/graphql";

// Lazy load dialogs
const AssignFacetValuesDialog = lazy(() =>
  import("./assign-facet-values-dialog").then((m) => ({ default: m.AssignFacetValuesDialog }))
);

// Bulk action component for edit facet values
export const EditFacetValuesBulkAction: BulkActionComponent<any> = ({ selection, table }) => {
  const queryClient = useQueryClient();
  const dialog = useDialog();

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["products"] });
    table.resetRowSelection();
  };

  return (
    <>
      <DataTableBulkActionItem
        onClick={dialog.openDialog}
        label={<Trans>Edit facet values</Trans>}
        icon={TagIcon}
      />
      {dialog.open && (
        <Suspense fallback={null}>
          <AssignFacetValuesDialog
            open={dialog.open}
            onOpenChange={dialog.onOpenChange}
            entityIds={selection.map((s: any) => s.id)}
            queryFn={(variables) => api.query(getProductsWithFacetValuesByIdsQueryDocument, variables)}
            mutationFn={(variables) => api.mutate(updateProductsMutationDocument, variables)}
            onSuccess={handleSuccess}
          />
        </Suspense>
      )}
    </>
  );
};

// Bulk action component for delete
export const DeleteProductsBulkAction: BulkActionComponent<any> = ({ selection, table }) => {
  const queryClient = useQueryClient();

  const deleteMutation = useMutation({
    mutationFn: (ids: string[]) => api.mutate(deleteProductsMutationDocument, { ids }),
    onSuccess: (data) => {
      const results = data.deleteProducts;
      const successCount = results.filter((r) => r.result === "DELETED").length;
      const failedCount = results.length - successCount;

      if (successCount > 0) {
        toast.success(
          <Trans>
            {successCount} product{successCount > 1 ? "s" : ""} deleted successfully
          </Trans>
        );
        queryClient.invalidateQueries({ queryKey: ["products"] });
        table.resetRowSelection();
      }
      if (failedCount > 0) {
        const errorMessages = results
          .filter((r) => r.result !== "DELETED")
          .map((r) => r.message)
          .filter(Boolean);
        toast.error(
          <Trans>
            Failed to delete {failedCount} product{failedCount > 1 ? "s" : ""}
            {errorMessages.length > 0 ? `: ${errorMessages[0]}` : ""}
          </Trans>
        );
      }
    },
    onError: (error: any) => {
      toast.error(error.message || <Trans>Failed to delete products</Trans>);
    },
  });

  return (
    <DataTableBulkActionItem
      onClick={() => {
        deleteMutation.mutate(selection.map((s: any) => s.id));
      }}
      label={<Trans>Delete</Trans>}
      confirmationText={
        <Trans>
          Are you sure you want to delete {selection.length} product{selection.length > 1 ? "s" : ""}?
        </Trans>
      }
      icon={Trash2}
      className="text-destructive"
      disabled={deleteMutation.isPending}
    />
  );
};

// Bulk action component for duplicate
export const DuplicateProductsBulkAction: BulkActionComponent<any> = ({ selection, table }) => {
  const queryClient = useQueryClient();
  const [isDuplicating, setIsDuplicating] = useState(false);

  const duplicateMutation = useMutation({
    mutationFn: (input: { entityName: string; entityId: string; duplicatorInput: ConfigurableOperationInput }) =>
      api.mutate(duplicateEntityMutationDocument, { input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });

  const handleDuplicate = async () => {
    if (isDuplicating) return;

    setIsDuplicating(true);
    const results = {
      success: 0,
      failed: 0,
      errors: [] as string[],
    };

    try {
      for (const product of selection) {
        try {
          const result = await duplicateMutation.mutateAsync({
            entityName: "Product",
            entityId: product.id,
            duplicatorInput: {
              code: "product-duplicator",
              arguments: [],
            },
          });

          if ("newEntityId" in result.duplicateEntity) {
            results.success++;
          } else {
            results.failed++;
            const errorMsg =
              result.duplicateEntity.message || result.duplicateEntity.duplicationError || "Unknown error";
            results.errors.push(`${getProductName(product.translations, "en", product.id)}: ${errorMsg}`);
          }
        } catch (error: any) {
          results.failed++;
          results.errors.push(`${getProductName(product.translations, "en", product.id)}: ${error.message || "Unknown error"}`);
        }
      }

      if (results.success > 0) {
        toast.success(
          <Trans>
            {results.success} product{results.success > 1 ? "s" : ""} duplicated successfully
          </Trans>
        );
      }
      if (results.failed > 0) {
        toast.error(
          <Trans>
            Failed to duplicate {results.failed} product{results.failed > 1 ? "s" : ""}
          </Trans>
        );
        if (results.errors.length > 0) {
          console.error("Duplication errors:", results.errors);
        }
      }

      queryClient.invalidateQueries({ queryKey: ["products"] });
      table.resetRowSelection();
    } finally {
      setIsDuplicating(false);
    }
  };

  return (
    <DataTableBulkActionItem
      onClick={handleDuplicate}
      label={<Trans>Duplicate</Trans>}
      icon={Copy}
      disabled={isDuplicating || duplicateMutation.isPending}
    />
  );
};

