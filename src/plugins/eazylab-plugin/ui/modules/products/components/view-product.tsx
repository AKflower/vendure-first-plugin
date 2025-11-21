import { useMemo } from "react";
import type { AnyRoute } from "@tanstack/react-router";
import { keepPreviousData, useMutation, useQuery } from "@tanstack/react-query";
import { api } from "@vendure/dashboard";
import type { ResultOf } from "@/gql";

import { BasePage } from "../../../shared/components/layouts/base-page";
import { LoadingState } from "../../../shared/components/common/loading-state";
import { ProductForm, type ProductFormValues } from "./form/product-form";
import { ProductAssetsCard } from "./product-assets-card";
import {
  productDetailQueryDocument,
  updateProductMutationDocument,
  type ProductDetailQueryResult,
} from "../queries/product-detail";
import { formatMoney } from "../utils/product-helpers";

interface ViewProductProps {
  route: AnyRoute;
}

const DEFAULT_LANGUAGE = "en";

type UpdateProductResult = ResultOf<typeof updateProductMutationDocument>;

export function ViewProduct({ route }: ViewProductProps) {
  const { id } = route.useParams() as { id: string };
  const navigate = route.useNavigate();

  const detailQuery = useQuery<ProductDetailQueryResult>({
    queryKey: ["product-detail", id],
    queryFn: () => api.query(productDetailQueryDocument, { id }),
    placeholderData: keepPreviousData,
  });

  const updateMutation = useMutation<UpdateProductResult, Error, ProductFormValues>({
    mutationFn: async values => {
      const translation = detailQuery.data?.product?.translations.find(
        t => t.languageCode === DEFAULT_LANGUAGE,
      );
      return api.mutate(updateProductMutationDocument, {
        input: {
          id,
          enabled: values.enabled,
          translations: [
            {
              id: translation?.id,
              languageCode: DEFAULT_LANGUAGE,
              name: values.name,
              slug: values.slug,
              description: values.description ?? "",
            },
          ],
        },
      }) as Promise<UpdateProductResult>;
    },
    onSuccess: () => {
      detailQuery.refetch();
    },
  });

  const defaultValues = useMemo<ProductFormValues | undefined>(() => {
    const product = detailQuery.data?.product;
    if (!product) {
      return undefined;
    }
    const translation = product.translations.find(t => t.languageCode === DEFAULT_LANGUAGE);
    return {
      name: translation?.name ?? "",
      slug: translation?.slug ?? "",
      description: translation?.description ?? "",
      enabled: product.enabled,
    };
  }, [detailQuery.data]);

  if (detailQuery.isLoading && !detailQuery.data) {
    return (
      <BasePage title="Product Detail">
        <LoadingState label="Loading product" description="Fetching the latest product data" minHeight={240} />
      </BasePage>
    );
  }

  if (detailQuery.isError || !detailQuery.data?.product) {
    return (
      <BasePage title={`Product Detail - ${detailQuery.data?.product?.translations[0]?.name ?? "N/A"}`}>
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Unable to load product details.{" "}
          <button className="underline" onClick={() => navigate({ to: "/products-extend" })}>
            Back to list
          </button>
        </div>
      </BasePage>
    );
  }

  const product = detailQuery.data.product;
  const variants = product.variants ?? [];
  const collections = product.collections ?? [];

  return (
    <BasePage title="Product details">
      {updateMutation.isError ? (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {(updateMutation.error as Error)?.message ?? "Update failed"}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-4">
          <ProductAssetsCard
            productId={product.id}
            assets={product.assets ?? []}
            featuredAsset={product.featuredAsset ?? null}
            onUpdated={() => detailQuery.refetch()}
          />

          <div className="rounded-2xl border bg-card p-4 text-card-foreground">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="whitespace-pre-wrap text-muted-foreground">
              {product.translations[0]?.description || "No description"}
            </p>
            {collections.length ? (
              <div className="mt-4 space-y-2">
                <h3 className="text-sm font-medium text-muted-foreground">Categories</h3>
                <div className="flex flex-wrap gap-2">
                  {collections.map((collection) => (
                    <span key={collection.id} className="rounded-full bg-muted px-3 py-1 text-sm">
                      {collection.name}
                    </span>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
        <div className="border rounded-2xl p-4">
          <ProductForm
            heading="Basic information"
            defaultValues={defaultValues}
            onSubmit={async (values) => {
              await updateMutation.mutateAsync(values);
            }}
            isSubmitting={updateMutation.isPending}
            submitLabel="Update product"
          />
        </div>
      </div>

      <section className="mt-8 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Variants & inventory</h3>
          <p className="text-sm text-muted-foreground">Total {variants.length} variants</p>
        </div>
        <div className="overflow-x-auto rounded-md border">
          <table className="min-w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-2 text-left font-medium">SKU</th>
                <th className="px-4 py-2 text-left font-medium">Name</th>
                <th className="px-4 py-2 text-left font-medium">Options</th>
                <th className="px-4 py-2 text-left font-medium">Price</th>
                <th className="px-4 py-2 text-left font-medium">Inventory</th>
              </tr>
            </thead>
            <tbody>
              {variants.length ? (
                variants.map(variant => {
                  const available = (variant.stockOnHand ?? 0) - (variant.stockAllocated ?? 0);
                  const optionLabel = variant.options
                    ?.map(option => `${option.group?.name ?? "Option"}: ${option.name}`)
                    .join(", ");
                  return (
                    <tr key={variant.id} className="border-t">
                      <td className="px-4 py-2">{variant.sku}</td>
                      <td className="px-4 py-2">{variant.name}</td>
                      <td className="px-4 py-2 text-muted-foreground">{optionLabel || "—"}</td>
                      <td className="px-4 py-2">
                        {formatMoney(variant.priceWithTax ?? variant.price, variant.currencyCode)}
                      </td>
                      <td className="px-4 py-2">
                        {available}/{variant.stockOnHand ?? 0}
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-muted-foreground">
                    No variants yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </BasePage>
  );
}
