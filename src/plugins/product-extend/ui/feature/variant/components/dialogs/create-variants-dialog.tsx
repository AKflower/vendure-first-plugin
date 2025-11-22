import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  Button,
  Input,
  Label,
  api,
} from "@vendure/dashboard";
import { Trans } from "@lingui/react/macro";
import { toast } from "sonner";
import { Plus, X } from "lucide-react";
import { createVariantMutationDocument } from "../../graphql/graphql";

interface VariantInput {
  sku: string;
  price: number;
  stockOnHand: number;
}

interface CreateVariantsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: string;
  currencyCode?: string;
  onSuccess?: () => void;
}

export function CreateVariantsDialog({
  open,
  onOpenChange,
  productId,
  currencyCode = "USD",
  onSuccess,
}: CreateVariantsDialogProps) {
  const queryClient = useQueryClient();
  const [variants, setVariants] = useState<VariantInput[]>([
    { sku: "", price: 0, stockOnHand: 0 },
  ]);

  const createMutation = useMutation({
    mutationFn: async (inputs: VariantInput[]) => {
      const results = await Promise.all(
        inputs.map((input) =>
          api.mutate(createVariantMutationDocument, {
            input: {
              productId,
              sku: input.sku || undefined,
              price: Math.round(input.price * 100), // Convert to cents
              stockOnHand: input.stockOnHand,
              enabled: true,
              translations: [
                {
                  languageCode: "en",
                  name: input.sku || "Variant",
                },
              ],
            },
          })
        )
      );
      return results;
    },
    onSuccess: () => {
      toast.success(
        <Trans>
          {variants.length} variant{variants.length > 1 ? "s" : ""} created successfully
        </Trans>
      );
      queryClient.invalidateQueries({ queryKey: ["product-variants"] });
      onSuccess?.();
      handleClose();
    },
    onError: (error: any) => {
      toast.error(error.message || <Trans>Failed to create variants</Trans>);
    },
  });

  const handleAddVariant = () => {
    setVariants([...variants, { sku: "", price: 0, stockOnHand: 0 }]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variants.length > 1) {
      setVariants(variants.filter((_, i) => i !== index));
    }
  };

  const handleVariantChange = (index: number, field: keyof VariantInput, value: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = {
      ...newVariants[index],
      [field]: field === "price" || field === "stockOnHand" ? Number(value) || 0 : value,
    };
    setVariants(newVariants);
  };

  const handleSubmit = () => {
    // Validate
    const hasEmptySku = variants.some((v) => !v.sku.trim());
    if (hasEmptySku) {
      toast.error(<Trans>Please fill in SKU for all variants</Trans>);
      return;
    }

    createMutation.mutate(variants);
  };

  const handleClose = () => {
    setVariants([{ sku: "", price: 0, stockOnHand: 0 }]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            <Trans>Create Variants</Trans>
          </DialogTitle>
          <DialogDescription>
            <Trans>Create variants for your product.</Trans>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex justify-end">
            <Button type="button" variant="outline" size="sm" onClick={handleAddVariant}>
              <Plus className="mr-2 h-4 w-4" />
              <Trans>Add Option</Trans>
            </Button>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <div className="grid grid-cols-12 gap-4 p-4 bg-muted/50 border-b font-medium text-sm">
              <div className="col-span-4">
                <Trans>SKU</Trans>
              </div>
              <div className="col-span-4">
                <Trans>Price</Trans>
              </div>
              <div className="col-span-3">
                <Trans>Stock on Hand</Trans>
              </div>
              <div className="col-span-1"></div>
            </div>

            <div className="divide-y">
              {variants.map((variant, index) => (
                <div key={index} className="grid grid-cols-12 gap-4 p-4 items-center">
                  <div className="col-span-4">
                    <Input
                      placeholder="SKU"
                      value={variant.sku}
                      onChange={(e) => handleVariantChange(index, "sku", e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="col-span-4">
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {currencyCode === "USD" ? "$" : currencyCode}
                      </span>
                      <Input
                        type="number"
                        step="0.01"
                        min="0"
                        placeholder="0.00"
                        value={variant.price || ""}
                        onChange={(e) => handleVariantChange(index, "price", e.target.value)}
                        className="w-full pl-8"
                      />
                    </div>
                  </div>
                  <div className="col-span-3">
                    <Input
                      type="number"
                      min="0"
                      placeholder="0"
                      value={variant.stockOnHand || ""}
                      onChange={(e) => handleVariantChange(index, "stockOnHand", e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <div className="col-span-1 flex justify-end">
                    {variants.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => handleRemoveVariant(index)}
                        className="h-8 w-8"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={handleClose}>
            <Trans>Cancel</Trans>
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={createMutation.isPending || variants.length === 0}
          >
            <Trans>
              Create {variants.length} variant{variants.length > 1 ? "s" : ""}
            </Trans>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

