import type { ProductListItem } from "../queries/get-products";

export function getPrimaryVariant(product?: ProductListItem) {
  if (!product?.variants?.length) {
    return undefined;
  }
  return product.variants[0];
}

export function getVariantPrice(variant?: ProductListItem["variants"][number]) {
  if (!variant) {
    return undefined;
  }
  return variant.priceWithTax ?? variant.price ?? 0;
}

export function formatMoney(value?: number, currencyCode = "VND") {
  if (value == null) {
    return "—";
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: currencyCode,
  }).format(value / 100);
}

export function getStockSummary(product: ProductListItem) {
  if (!product.variants?.length) {
    return { stockOnHand: 0, stockAvailable: 0 };
  }
  return product.variants.reduce(
    (acc, variant) => {
      const onHand = variant.stockOnHand ?? 0;
      const allocated = variant.stockAllocated ?? 0;
      return {
        stockOnHand: acc.stockOnHand + onHand,
        stockAvailable: acc.stockAvailable + (onHand - allocated),
      };
    },
    { stockOnHand: 0, stockAvailable: 0 },
  );
}

