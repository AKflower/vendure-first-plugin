import { AssetPickerDialog, api } from "@vendure/dashboard";
import { useQuery } from "@tanstack/react-query";
import { productDetailQueryDocument } from "../../graphql/graphql";
import type { ProductDetailQueryResult } from "../../graphql/graphql";

interface ProductAssetDialogProps {
  open: boolean;
  onClose: () => void;
  onSelect: (assets: Array<{ id: string; [key: string]: any }>) => void;
  productId: string | null;
}

export function ProductAssetDialog({ open, onClose, onSelect, productId }: ProductAssetDialogProps) {
  // Only fetch product detail when dialog is open and productId is available (lazy loading)
  const { data: productDetailData, isLoading: isLoadingProductDetail } = useQuery<ProductDetailQueryResult>({
    queryKey: ["product-extend-detail-for-asset", productId],
    queryFn: () => api.query(productDetailQueryDocument, { id: productId! }),
    enabled: !!productId && open, // Lazy load: only fetch when dialog is open
  });

  if (!productId) {
    return null;
  }

  return (
    <AssetPickerDialog
      key={productId}
      open={open && !isLoadingProductDetail}
      onClose={onClose}
      onSelect={onSelect}
      multiSelect={true}
      initialSelectedAssets={productDetailData?.product?.assets ? productDetailData.product.assets : []}
    />
  );
}

