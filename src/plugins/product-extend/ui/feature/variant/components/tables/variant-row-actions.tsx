//AI generated code

import { lazy, Suspense } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Button,
  api,
} from "@vendure/dashboard";
import { EllipsisIcon, TagIcon, Trash2 } from "lucide-react";
import { Trans } from "@lingui/react/macro";
import { BaseAlertDialog } from "../../../product/components/dialogs/base-alert-dialog";
import { useDialog } from "../../../product/hooks/useDialog";
import {
  getVariantsWithFacetValuesByIdsQueryDocument,
  updateVariantsMutationDocument,
  deleteVariantsMutationDocument,
} from "../../graphql/graphql";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";

// Lazy load

const AssignFacetValuesDialog = lazy(() =>
  import("../../../product/components/dialogs/assign-facet-values-dialog").then((m) => ({
    default: m.AssignFacetValuesDialog,
  }))
);

interface VariantRowActionsProps {
  variant: {
    id: string;
    name: string | null;
  };
  onEditFacetValues?: (variant: any) => void;
  onDeleteVariant?: (variant: any) => void;
  isDeleting?: boolean;
}

export function VariantRowActions({
  variant,
  onEditFacetValues,
  onDeleteVariant,
  isDeleting = false,
}: VariantRowActionsProps) {
  const queryClient = useQueryClient();
  const deleteDialog = useDialog();
  const facetValuesDialog = useDialog();

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.mutate(deleteVariantsMutationDocument, { ids: [id] }),
    onSuccess: (data) => {
      const result = data.deleteProductVariants[0];
      if (result.result === "DELETED") {
        toast.success(<Trans>Variant deleted successfully</Trans>);
        queryClient.invalidateQueries({ queryKey: ["product-variants"] });
        onDeleteVariant?.(variant);
      } else {
        toast.error(result.message || <Trans>Failed to delete variant</Trans>);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || <Trans>Failed to delete variant</Trans>);
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate(variant.id);
  };

  return (
    <>
      <div className="flex justify-center w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8 p-0">
              <span className="sr-only">Open actions</span>
              <EllipsisIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={facetValuesDialog.openDialog}>
              <TagIcon className="mr-2 size-4" />
              <Trans>Edit facet values</Trans>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={deleteDialog.openDialog}
              disabled={isDeleting || deleteMutation.isPending}
            >
              <Trash2 className="mr-2 size-4" />
              <Trans>Delete</Trans>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <BaseAlertDialog
        open={deleteDialog.open}
        onOpenChange={deleteDialog.onOpenChange}
        title={<Trans>Delete variant</Trans>}
        description={
          <Trans>
            Are you sure you want to delete "{variant.name ?? "this variant"}"? This action cannot be undone.
          </Trans>
        }
        confirmLabel={<Trans>Delete</Trans>}
        cancelLabel={<Trans>Cancel</Trans>}
        onConfirm={handleDelete}
        variant="destructive"
        disabled={deleteMutation.isPending}
      />

      {facetValuesDialog.open && (
        <Suspense fallback={null}>
          <AssignFacetValuesDialog
            open={facetValuesDialog.open}
            onOpenChange={facetValuesDialog.onOpenChange}
            entityIds={[variant.id]}
            queryFn={(variables) => api.query(getVariantsWithFacetValuesByIdsQueryDocument, variables)}
            mutationFn={(variables) => api.mutate(updateVariantsMutationDocument, variables)}
            onSuccess={() => {
              facetValuesDialog.closeDialog();
              queryClient.invalidateQueries({ queryKey: ["product-variants"] });
            }}
            entityType="variant"
            queryKey="product-variants"
            dataPath="productVariants.items"
          />
        </Suspense>
      )}
    </>
  );
}

