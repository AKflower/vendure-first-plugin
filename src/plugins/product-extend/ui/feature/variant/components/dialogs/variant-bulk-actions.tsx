import type { BulkActionComponent } from "@vendure/dashboard";
import { DataTableBulkActionItem, api } from "@vendure/dashboard";
import { useQueryClient } from "@tanstack/react-query";
import { useState, lazy, Suspense } from "react";
import { useDialog } from "../../../product/hooks/useDialog";
import { Trans } from "@lingui/react/macro";
import { TagIcon, Trash2 } from "lucide-react";
import {
  deleteVariantsMutationDocument,
  updateVariantsMutationDocument,
  getVariantsWithFacetValuesByIdsQueryDocument,
} from "../../graphql/graphql";
import { toast } from "sonner";

// Lazy load dialogs
const AssignFacetValuesDialog = lazy(() =>
  import("../../../product/components/dialogs/assign-facet-values-dialog").then((m) => ({
    default: m.AssignFacetValuesDialog,
  }))
);

// Bulk action component for edit facet values
export const EditFacetValuesVariantBulkAction: BulkActionComponent<any> = ({ selection, table }) => {
  const queryClient = useQueryClient();
  const dialog = useDialog();

  const handleSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["product-variants"] });
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
            queryFn={(variables) => api.query(getVariantsWithFacetValuesByIdsQueryDocument, variables)}
            mutationFn={(variables) => api.mutate(updateVariantsMutationDocument, variables)}
            onSuccess={handleSuccess}
            entityType="variant"
            queryKey="product-variants"
            dataPath="productVariants.items"
          />
        </Suspense>
      )}
    </>
  );
};

// Bulk action component for delete variants
export const DeleteVariantsBulkAction: BulkActionComponent<any> = ({ selection, table }) => {
  const queryClient = useQueryClient();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const ids = selection.map((s: any) => s.id);
      const result = await api.mutate(deleteVariantsMutationDocument, { ids });

      const allDeleted = result.deleteProductVariants.every((r: any) => r.result === "DELETED");
      if (allDeleted) {
        toast.success(
          <Trans>
            Successfully deleted {ids.length} variant{ids.length > 1 ? "s" : ""}
          </Trans>
        );
        queryClient.invalidateQueries({ queryKey: ["product-variants"] });
        table.resetRowSelection();
      } else {
        const errors = result.deleteProductVariants
          .filter((r: any) => r.result !== "DELETED")
          .map((r: any) => r.message)
          .join(", ");
        toast.error(<Trans>Failed to delete some variants: {errors}</Trans>);
      }
    } catch (error: any) {
      toast.error(error.message || <Trans>Failed to delete variants</Trans>);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <DataTableBulkActionItem
      onClick={handleDelete}
      label={<Trans>Delete</Trans>}
      icon={Trash2}
      disabled={isDeleting}
    />
  );
};

