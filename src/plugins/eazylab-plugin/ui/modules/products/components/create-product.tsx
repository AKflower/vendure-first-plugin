import type { AnyRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { api } from "@vendure/dashboard";
import type { ResultOf } from "@/gql";

import { BasePage } from "../../../shared/components/layouts/base-page";
import { ProductForm, type ProductFormValues } from "./form/product-form";
import { createProductMutationDocument } from "../queries/product-detail";

interface CreateProductPageProps {
  route: AnyRoute;
}

type CreateProductResult = ResultOf<typeof createProductMutationDocument>;

export function CreateProductPage({ route }: CreateProductPageProps) {
  const navigate = route.useNavigate();
  const mutation = useMutation<CreateProductResult, Error, ProductFormValues>({
    mutationFn: values =>
      api.mutate(createProductMutationDocument, {
        input: {
          enabled: values.enabled,
          translations: [
            {
              languageCode: "en",
              name: values.name,
              slug: values.slug,
              description: values.description ?? "",
            },
          ],
        },
      }) as Promise<CreateProductResult>,
    onSuccess: result => {
      navigate({ to: `/products-extend/${result.createProduct.id}` });
    },
  });

  return (
    <BasePage title="Tạo sản phẩm">
      {mutation.isError ? (
        <div className="mb-4 rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {(mutation.error as Error)?.message ?? "Không thể tạo sản phẩm"}
        </div>
      ) : null}
      <ProductForm
        heading="Thông tin cơ bản"
        onSubmit={async values => {
          await mutation.mutateAsync(values);
        }}
        isSubmitting={mutation.isPending}
        submitLabel="Tạo sản phẩm"
      />
    </BasePage>
  );
}

