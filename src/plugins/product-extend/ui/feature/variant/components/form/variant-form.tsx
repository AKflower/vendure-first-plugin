import { Button, Card, Input, Label, Switch, RichTextInput } from "@vendure/dashboard";
import { useForm, Controller, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect, useImperativeHandle, forwardRef } from "react";

const variantFormSchema = z.object({
  name: z.string().min(1, "Variant name is required"),
  sku: z.string().min(1, "SKU is required"),
  price: z.number().min(0, "Price must be positive"),
  enabled: z.boolean().default(true),
  trackInventory: z.boolean().default(true),
  stockOnHand: z.number().int().min(0).optional(),
  outOfStockThreshold: z.number().int().min(0).optional(),
});

export type VariantFormValues = z.infer<typeof variantFormSchema>;

export interface VariantFormRef {
  submit: () => void;
}

interface VariantFormProps {
  defaultValues?: Partial<VariantFormValues>;
  onSubmit: (values: VariantFormValues) => void | Promise<void>;
  productId?: string;
  variantId?: string;
  isDirty?: boolean;
  onFormChange?: (isDirty: boolean) => void;
}

export const VariantForm = forwardRef<VariantFormRef, VariantFormProps>(
  ({ defaultValues, onSubmit, variantId, onFormChange }, ref) => {
    const form = useForm<VariantFormValues>({
      resolver: zodResolver(variantFormSchema),
      defaultValues: {
        name: defaultValues?.name ?? "",
        sku: defaultValues?.sku ?? "",
        price: defaultValues?.price ?? 0,
        enabled: defaultValues?.enabled ?? true,
        trackInventory: defaultValues?.trackInventory ?? true,
        stockOnHand: defaultValues?.stockOnHand,
        outOfStockThreshold: defaultValues?.outOfStockThreshold,
      },
    });

    const {
      register,
      handleSubmit,
      formState: { errors, isDirty },
      reset,
      control,
      watch,
    } = form;

    const trackInventory = watch("trackInventory");

    // Update form when defaultValues change (for edit mode)
    useEffect(() => {
      if (defaultValues) {
        reset({
          name: defaultValues.name ?? "",
          sku: defaultValues.sku ?? "",
          price: defaultValues.price ?? 0,
          enabled: defaultValues.enabled ?? true,
          trackInventory: defaultValues.trackInventory ?? true,
          stockOnHand: defaultValues.stockOnHand,
          outOfStockThreshold: defaultValues.outOfStockThreshold,
        });
      }
    }, [defaultValues, reset]);

    // Notify parent of form state changes
    useEffect(() => {
      onFormChange?.(isDirty);
    }, [isDirty, onFormChange]);

    // Expose submit handler to parent via ref
    useImperativeHandle(ref, () => ({
      submit: () => {
        handleSubmit(onSubmit)();
      },
    }));

    return (
      <FormProvider {...form}>
        <form id="variant-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Card className="p-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Variant name</Label>
              <Input
                id="name"
                {...register("name")}
                placeholder="Enter variant name"
                className={errors.name ? "border-destructive" : ""}
              />
              {errors.name && <p className="text-sm text-destructive">{errors.name.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="sku">SKU</Label>
              <Input
                id="sku"
                {...register("sku")}
                placeholder="Enter SKU"
                className={errors.sku ? "border-destructive" : ""}
              />
              {errors.sku && <p className="text-sm text-destructive">{errors.sku.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                {...register("price", { valueAsNumber: true })}
                placeholder="0.00"
                className={errors.price ? "border-destructive" : ""}
              />
              {errors.price && <p className="text-sm text-destructive">{errors.price.message}</p>}
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="enabled"
                checked={watch("enabled")}
                onCheckedChange={(checked) => form.setValue("enabled", checked)}
              />
              <Label htmlFor="enabled" className="cursor-pointer">
                Enable variant
              </Label>
            </div>

            <div className="flex items-center gap-3">
              <Switch
                id="trackInventory"
                checked={trackInventory}
                onCheckedChange={(checked) => form.setValue("trackInventory", checked)}
              />
              <Label htmlFor="trackInventory" className="cursor-pointer">
                Track inventory
              </Label>
            </div>

            {trackInventory && (
              <>
                <div className="space-y-2">
                  <Label htmlFor="stockOnHand">Stock on hand</Label>
                  <Input
                    id="stockOnHand"
                    type="number"
                    {...register("stockOnHand", { valueAsNumber: true })}
                    placeholder="0"
                    className={errors.stockOnHand ? "border-destructive" : ""}
                  />
                  {errors.stockOnHand && (
                    <p className="text-sm text-destructive">{errors.stockOnHand.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="outOfStockThreshold">Out of stock threshold</Label>
                  <Input
                    id="outOfStockThreshold"
                    type="number"
                    {...register("outOfStockThreshold", { valueAsNumber: true })}
                    placeholder="0"
                    className={errors.outOfStockThreshold ? "border-destructive" : ""}
                  />
                  {errors.outOfStockThreshold && (
                    <p className="text-sm text-destructive">{errors.outOfStockThreshold.message}</p>
                  )}
                </div>
              </>
            )}
          </Card>
        </form>
      </FormProvider>
    );
  }
);

VariantForm.displayName = "VariantForm";

