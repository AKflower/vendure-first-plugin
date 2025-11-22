import type { AnyRoute } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  Button,
  Card,
  Page,
  PageBlock,
  PageTitle,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  api,
} from "@vendure/dashboard";
import { toast } from "sonner";
import { Trash2, Info } from "lucide-react";
import { BaseAlertDialog } from "../dialogs/base-alert-dialog";
import { useDialog } from "../../hooks/useDialog";
import { Trans } from "@lingui/react/macro";
import { ViewVariants } from "../../../variant/components/view-variants";
import { findTranslation } from "../../../../utils/translation";
import { formatDateDetailed } from "../../../../utils/date";
import { createTranslationInput, transformAssetsForMutation } from "../../../../utils/data-transform";
import {
  productDetailQueryDocument,
  updateProductAssetsMutationDocument,
  updateProductMutationDocument,
  updateProductsMutationDocument,
  getProductsWithFacetValuesByIdsQueryDocument,
  deleteProductsMutationDocument,
  type ProductDetailQueryResult,
} from "../../graphql/graphql";
import { ProductForm, type ProductFormValues } from "../forms/product-form";
import { ProductOptionsCard } from "../forms/product-options-card";
import { FacetValuesCard } from "../forms/facet-values-card";
import { ProductAssetsCard } from "../forms/product-assets-card";
import { AssignFacetValuesDialog } from "../dialogs/assign-facet-values-dialog";

export function ProductDetailPage({ route }: { route: AnyRoute }) {
  const { id } = route.useParams() as { id: string };
  const navigate = route.useNavigate();

  const detailQuery = useQuery<ProductDetailQueryResult>({
    queryKey: ["product-extend-detail", id],
    queryFn: () => api.query(productDetailQueryDocument, { id }),
  });

  const product = detailQuery.data?.product;
  const translation = findTranslation(product?.translations, "en");

  const updateMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      if (!product) {
        return;
      }
      await api.mutate(updateProductMutationDocument, {
        input: {
          id: product.id,
          enabled: values.enabled,
          translations: createTranslationInput(translation, values, "en"),
        },
      });
    },
    onSuccess: () => {
      toast.success(<Trans>Product updated successfully</Trans>);
      detailQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || <Trans>Failed to update product</Trans>);
    },
  });

  const assetMutation = useMutation({
    mutationFn: async (selectedAssets: { id: string }[]) => {
      if (!product) {
        return;
      }
      await api.mutate(updateProductAssetsMutationDocument, {
        input: {
          id: product.id,
          ...transformAssetsForMutation(selectedAssets),
        },
      });
    },
    onSuccess: () => {
      toast.success(<Trans>Assets updated successfully</Trans>);
      detailQuery.refetch();
    },
    onError: (error: any) => {
      toast.error(error.message || <Trans>Failed to update assets</Trans>);
    },
  });

  const facetValuesDialog = useDialog();
  const deleteDialog = useDialog();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!product) {
        return;
      }
      return api.mutate(deleteProductsMutationDocument, { ids: [product.id] });
    },
    onSuccess: (data) => {
      const result = data.deleteProducts[0];
      if (result.result === "DELETED") {
        toast.success(<Trans>Product deleted successfully</Trans>);
        navigate({ to: "/products-extend" });
      } else {
        toast.error(result.message || <Trans>Failed to delete product</Trans>);
      }
    },
    onError: (error: any) => {
      toast.error(error.message || <Trans>Failed to delete product</Trans>);
    },
  });

  if (detailQuery.isLoading) {
    return (
      <Page pageId="product-extend-detail">
        <PageTitle>
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
        </PageTitle>

        <div className="mx-auto max-w-7xl pb-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            {/* Product Form Skeleton */}
            <Card className="p-4 space-y-4">
              <div className="space-y-2">
                <div className="h-4 w-20 bg-muted animate-pulse rounded" />
                <div className="h-10 w-full bg-muted animate-pulse rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-16 bg-muted animate-pulse rounded" />
                <div className="h-10 w-full bg-muted animate-pulse rounded" />
              </div>
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted animate-pulse rounded" />
                <div className="h-32 w-full bg-muted animate-pulse rounded" />
              </div>
              <div className="flex items-center gap-3">
                <div className="h-6 w-11 bg-muted animate-pulse rounded-full" />
                <div className="h-5 w-16 bg-muted animate-pulse rounded" />
              </div>
            </Card>

            {/* Variants Table Skeleton */}
            <PageBlock column="main" blockId="variants-table" className="space-y-4">
              <div className="h-9 w-32 bg-muted animate-pulse rounded" />
              <Card className="p-4">
                <div className="space-y-3">
                  <div className="h-10 w-full bg-muted animate-pulse rounded" />
                  <div className="h-10 w-full bg-muted animate-pulse rounded" />
                  <div className="h-10 w-full bg-muted animate-pulse rounded" />
                </div>
              </Card>
            </PageBlock>
          </div>

          <div className="space-y-4">
            {/* Assets Card Skeleton */}
            <Card className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="h-5 w-16 bg-muted animate-pulse rounded" />
                <div className="h-8 w-24 bg-muted animate-pulse rounded" />
              </div>
              <div className="h-48 w-full bg-muted animate-pulse rounded-lg" />
            </Card>

            {/* Options Card Skeleton */}
            <Card className="p-4">
              <div className="h-5 w-32 bg-muted animate-pulse rounded mb-3" />
              <div className="space-y-2">
                <div className="h-10 w-full bg-muted animate-pulse rounded" />
                <div className="h-10 w-full bg-muted animate-pulse rounded" />
              </div>
            </Card>

            {/* Facet Values Card Skeleton */}
            <Card className="p-4">
              <div className="h-5 w-28 bg-muted animate-pulse rounded mb-3" />
              <div className="flex flex-wrap gap-2">
                <div className="h-6 w-20 bg-muted animate-pulse rounded-full" />
                <div className="h-6 w-24 bg-muted animate-pulse rounded-full" />
                <div className="h-6 w-18 bg-muted animate-pulse rounded-full" />
              </div>
            </Card>

            {/* Danger Zone Skeleton */}
            <Card className="p-4 border-destructive/50">
              <div className="h-5 w-24 bg-muted animate-pulse rounded mb-2" />
              <div className="h-8 w-28 bg-muted animate-pulse rounded" />
            </Card>
          </div>
        </div>
      </Page>
    );
  }

  if (detailQuery.isError || !product) {
    return (
      <Page pageId="product-extend-detail">
        <PageTitle>Product detail</PageTitle>
          <PageBlock column="main" blockId="error">
              Unable to load product.
              <Button variant="link" className="pl-2" onClick={() => navigate({ to: "/products-extend" })}>
                Back to list
              </Button>
          </PageBlock>
      </Page>
    );
  }

  return (
    <Page pageId="product-extend-detail">
      <PageTitle>
        <div className="flex items-center gap-2">
          <span>{translation?.name ?? "Product detail"}</span>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  type="button"
                  className="inline-flex items-center justify-center rounded-full text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="Product information"
                >
                  <Info className="h-4 w-4" />
                </button>
              </TooltipTrigger>
              <TooltipContent className="max-w-xs">
                <div className="space-y-1 text-sm">
                  <div>
                    <span className="font-medium">ID: </span>
                    <span>{product.id}</span>
                  </div>
                  {product.createdAt && (
                    <div>
                      <span className="font-medium">Created: </span>
                      <span>{formatDateDetailed(product.createdAt)}</span>
                    </div>
                  )}
                  {product.updatedAt && (
                    <div>
                      <span className="font-medium">Updated: </span>
                      <span>{formatDateDetailed(product.updatedAt)}</span>
                    </div>
                  )}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </PageTitle>

        <div className="mx-auto max-w-7xl pb-10 grid gap-8 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-4">
            <ProductForm
              defaultValues={{
                name: translation?.name ?? "",
                slug: translation?.slug ?? "",
                description: translation?.description ?? "",
                enabled: product?.enabled ?? true,
              }}
              productId={product?.id}
              isPending={updateMutation.isPending}
              onSubmit={async (values) => {
                await updateMutation.mutateAsync(values);
              }}
            />

            <PageBlock column="main" blockId="variants-table" className="space-y-4">
              <Button variant="outline" size="sm" onClick={() => navigate({ to: `/products/${product.id}/variants` })}>Manage variants</Button>
              <ViewVariants productId={product.id} />
            </PageBlock>
          </div>

          <div className="space-y-4">
            <ProductAssetsCard
              assets={product.assets ?? []}
              onAssetsChange={(assets) => assetMutation.mutate(assets)}
              isPending={assetMutation.isPending}
            />

            <ProductOptionsCard
              optionGroups={product.optionGroups ?? []}
              onEdit={(id) => {
                navigate({ to: `/products/${product.id}/option-groups/${id}` });
              }}
            />

            <FacetValuesCard
              facetValues={product.facetValues ?? []}
              onRemove={(facetValueId) => {
                // Handle remove facet value
                toast.info("Remove facet value functionality coming soon");
              }}
              onAdd={facetValuesDialog.openDialog}
            />

            {/* Danger Zone */}
            <Card className="p-4 border-destructive/50">
              <div className="space-y-3">
                <div>
                  <h3 className="text-sm font-semibold text-destructive">Danger Zone</h3>
                  <p className="text-xs text-muted-foreground mt-1">
                    Once you delete a product, there is no going back. Please be certain.
                  </p>
                </div>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={deleteDialog.openDialog}
                  disabled={deleteMutation.isPending}
                >
                  <Trash2 className="mr-2 size-4" />
                  Delete product
                </Button>
              </div>
            </Card>
          </div>
        </div>

      {/* Delete Confirmation Dialog */}
      <BaseAlertDialog
        open={deleteDialog.open}
        onOpenChange={deleteDialog.onOpenChange}
        title={<Trans>Delete product</Trans>}
        description={
          <Trans>
            Are you sure you want to delete "{translation?.name ?? "this product"}"? This action
            cannot be undone.
          </Trans>
        }
        confirmLabel={<Trans>Delete</Trans>}
        cancelLabel={<Trans>Cancel</Trans>}
        onConfirm={() => deleteMutation.mutate()}
        variant="destructive"
        disabled={deleteMutation.isPending}
      />

      <AssignFacetValuesDialog
        open={facetValuesDialog.open}
        onOpenChange={facetValuesDialog.onOpenChange}
        entityIds={[product.id]}
        queryFn={(variables) =>
          api.query(getProductsWithFacetValuesByIdsQueryDocument, variables)
        }
        mutationFn={(variables) =>
          api.mutate(updateProductsMutationDocument, variables)
        }
        onSuccess={() => {
          detailQuery.refetch();
        }}
      />
    </Page>
  );
}


