import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button, Input, Textarea, Switch } from "@vendure/dashboard";

export type ProductFormValues = {
  name: string;
  slug: string;
  description?: string;
  enabled: boolean;
};

const productFormSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  enabled: z.boolean().default(true),
});

export interface ProductFormProps {
  defaultValues?: ProductFormValues;
  onSubmit: (values: ProductFormValues) => Promise<void> | void;
  isSubmitting?: boolean;
  submitLabel?: string;
  heading?: string;
}

export function ProductForm({
  defaultValues,
  onSubmit,
  isSubmitting,
  submitLabel = "Save product",
  heading,
}: ProductFormProps) {
  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: defaultValues ?? {
      name: "",
      slug: "",
      description: "",
      enabled: true,
    },
  });

  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  const handleSubmit = form.handleSubmit(async values => {
    await onSubmit(values);
  });

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl">
      {heading ? <h2 className="text-xl font-semibold">{heading}</h2> : null}
      <div className="space-y-2">
        <label className="font-medium text-sm">Product name</label>
        <Input placeholder="Enter product name" {...form.register("name")} />
        {form.formState.errors.name ? (
          <p className="text-sm text-destructive">{form.formState.errors.name.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="font-medium text-sm">Slug</label>
        <Input placeholder="enter-slug" {...form.register("slug")} />
        {form.formState.errors.slug ? (
          <p className="text-sm text-destructive">{form.formState.errors.slug.message}</p>
        ) : null}
      </div>

      <div className="space-y-2">
        <label className="font-medium text-sm">Description</label>
        <Textarea rows={5} placeholder="Product description" {...form.register("description")} />
      </div>

      <div className="flex items-center gap-3">
        <Switch checked={form.watch("enabled")} onCheckedChange={value => form.setValue("enabled", value)} />
        <span>Enable product</span>
      </div>

      <div className="flex justify-end">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : submitLabel}
        </Button>
      </div>
    </form>
  );
}

