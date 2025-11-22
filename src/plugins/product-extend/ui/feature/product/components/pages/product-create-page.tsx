import type { AnyRoute } from "@tanstack/react-router";
import { useMutation } from "@tanstack/react-query";
import { Button, Page, PageTitle, PageBlock, api } from "@vendure/dashboard";
import { toast } from "sonner";
import { Trans } from "@lingui/react/macro";
import { ProductForm, type ProductFormValues } from "../forms/product-form";
import { createProductMutationDocument } from "../../graphql/graphql";

export function ProductCreatePage({ route }: { route: AnyRoute }) {
  const navigate = route.useNavigate();

  const createMutation = useMutation({
    mutationFn: async (values: ProductFormValues) => {
      const result = await api.mutate(createProductMutationDocument, {
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
      });
      return result;
    },
    onSuccess: (data) => {
      toast.success(<Trans>Product created successfully</Trans>);
      navigate({ to: `/products-extend/${data.createProduct.id}` });
    },
    onError: (error: any) => {
      toast.error(error.message || <Trans>Failed to create product</Trans>);
    },
  });

  return (
    <Page pageId="product-extend-create">
      <PageTitle>Create Product</PageTitle>
        <ProductForm
          defaultValues={{
            name: "",
            slug: "",
            description: "",
            enabled: true,
          }}
          onSubmit={async (values) => {
            await createMutation.mutateAsync(values);
          }}
        />
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={() => navigate({ to: "/products-extend" })}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              const form = document.getElementById("product-form") as HTMLFormElement;
              if (form) form.requestSubmit();
            }}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? "Creating..." : "Create Product"}
          </Button>
        </div>
    </Page>
  );
}

