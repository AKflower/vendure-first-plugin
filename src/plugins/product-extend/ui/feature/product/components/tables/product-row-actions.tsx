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
import { EllipsisIcon, Eye, TagIcon, Copy, Trash2, ImageIcon } from "lucide-react";
import { Trans } from "@lingui/react/macro";
import { BaseAlertDialog } from "../dialogs/base-alert-dialog";
import { useDialog } from "../../hooks/useDialog";
import { getProductName } from "../../../../utils/translation";
import {
  getProductsWithFacetValuesByIdsQueryDocument,
  updateProductsMutationDocument,
} from "../../graphql/graphql";

// Lazy load dialogs
const AssignFacetValuesDialog = lazy(() =>
  import("../dialogs/assign-facet-values-dialog").then((m) => ({ default: m.AssignFacetValuesDialog }))
);

interface ProductRowActionsProps {
  product: any;
  onViewProduct: (productId: string) => void;
  onEditImage: (product: any) => void;
  onEditFacetValues: (product: any) => void;
  onDuplicateProduct: (product: any) => void;
  onDeleteProduct: (product: any) => void;
  isDeleting?: boolean;
  isDuplicating?: boolean;
  isUpdatingAsset?: boolean;
}

export function ProductRowActions({
  product,
  onViewProduct,
  onEditImage,
  onEditFacetValues,
  onDuplicateProduct,
  onDeleteProduct,
  isDeleting = false,
  isDuplicating = false,
  isUpdatingAsset = false,
}: ProductRowActionsProps) {
  const deleteDialog = useDialog();
  const facetValuesDialog = useDialog();

  return (
    <>
      <div className="flex justify-center w-full">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-10 p-0">
              <span className="sr-only">Open actions</span>
              <EllipsisIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onClick={() => onViewProduct(product.id)}>
              <Eye className="mr-2 size-4" />
              <Trans>View details</Trans>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onEditImage(product)} disabled={isUpdatingAsset}>
              <ImageIcon className="mr-2 size-4" />
              <Trans>Edit image</Trans>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={facetValuesDialog.openDialog}>
              <TagIcon className="mr-2 size-4" />
              <Trans>Edit facet values</Trans>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onDuplicateProduct(product)} disabled={isDuplicating}>
              <Copy className="mr-2 size-4" />
              <Trans>Duplicate</Trans>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              variant="destructive"
              onClick={deleteDialog.openDialog}
              disabled={isDeleting}
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
        title={<Trans>Delete product</Trans>}
        description={
          <Trans>
            Are you sure you want to delete "{getProductName(product.translations, "en", "this product")}"? This action
            cannot be undone.
          </Trans>
        }
        confirmLabel={<Trans>Delete</Trans>}
        cancelLabel={<Trans>Cancel</Trans>}
        onConfirm={() => onDeleteProduct(product)}
        variant="destructive"
        disabled={isDeleting}
      />

      {facetValuesDialog.open && (
        <Suspense fallback={null}>
          <AssignFacetValuesDialog
            open={facetValuesDialog.open}
            onOpenChange={facetValuesDialog.onOpenChange}
            entityIds={[product.id]}
            queryFn={(variables) => api.query(getProductsWithFacetValuesByIdsQueryDocument, variables)}
            mutationFn={(variables) => api.mutate(updateProductsMutationDocument, variables)}
            onSuccess={facetValuesDialog.closeDialog}
          />
        </Suspense>
      )}
    </>
  );
}

