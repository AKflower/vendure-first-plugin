import { Card, Input, Label, RichTextInput, SlugInput, Button, Switch } from "@vendure/dashboard";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";

const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
});

export type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  defaultValues?: Partial<ProductFormValues>;
  onSubmit: (values: ProductFormValues) => void | Promise<void>;
  productId?: string; 
  isPending?: boolean; 
}

export function ProductForm({ defaultValues, onSubmit, productId, isPending }: ProductFormProps) {
    const form = useForm<ProductFormValues>({
      resolver: zodResolver(productFormSchema),
      defaultValues: {
        name: defaultValues?.name ?? "",
        slug: defaultValues?.slug ?? "",
        description: defaultValues?.description ?? "",
        enabled: defaultValues?.enabled ?? true,
      },
    });

    const {
      register,
      handleSubmit,
      formState: { errors, isDirty },
      control,
      reset,
    } = form;

    // Reset form after successful submission
    const handleFormSubmit = handleSubmit(async (values) => {
      await onSubmit(values);
      // Reset form with submitted values to mark it as not dirty
      reset(values);
    });

    return (
      <FormProvider {...form}>
        <form id="product-form" onSubmit={handleFormSubmit} className="space-y-4">
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter product name"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Controller
                name="slug"
                control={control}
                render={({ field }) => (
                  <SlugInput
                    {...field}
                    entityName="Product"
                    fieldName="slug"
                    watchFieldName="name"
                    entityId={productId}
                    defaultReadonly={true}
                  />
                )}
              />
              {errors.slug && <p className="text-sm text-destructive">{errors.slug.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Controller
                name="description"
                control={control}
                render={({ field }) => (
                  <RichTextInput
                    {...field}
                    value={field.value ?? ""}
                    fieldDef={undefined}
                  />
                )}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Controller
                  name="enabled"
                  control={control}
                  render={({ field }) => (
                    <Switch
                      id="enabled"
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      disabled={isPending}
                      className="cursor-pointer data-[state=checked]:bg-green-500"
                    />
                  )}
                />
                <Label htmlFor="enabled" className="cursor-pointer font-semibold">
                  Enabled
                </Label>
              </div>
              <p className="text-xs text-muted-foreground pl-11">
                When enabled, this product is visible and available for purchase in the shop
              </p>
            </div>
            <div className="flex justify-end">
           {productId ?
            <Button
              type="submit"
              disabled={isPending || !isDirty}
            >
              {isPending ? "Updating..." : "Update"}
            </Button>
            :
            null
            }
          </div>
          </Card>
         
        </form>
      </FormProvider>
    );
}

