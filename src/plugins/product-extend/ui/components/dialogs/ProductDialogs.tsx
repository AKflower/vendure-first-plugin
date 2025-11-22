// import { lazy, Suspense } from "react";
// import { api } from "@vendure/dashboard";

// const AssignFacetValuesDialog = lazy(() =>
//   import("./assign-facet-values-dialog").then((m) => ({ default: m.AssignFacetValuesDialog }))
// );
// const ProductAssetDialog = lazy(() =>
//   import("./product-asset-dialog").then((m) => ({ default: m.ProductAssetDialog }))
// );

// interface ProductDialogsProps {
//   dialogs: {
//     facetValuesDialogOpen: boolean;
//     selectedProductIds: string[];
//     assetDialogOpen: boolean;
//     selectedProductForAsset: any;
//     closeFacetValuesDialog: () => void;
//     closeAssetDialog: (isPending: boolean) => void;
//     handleAssetSelect: (assets: Array<{ id: string; [key: string]: any }>) => void;
//     setFacetValuesDialogOpen: (open: boolean) => void;
//   };
//   actions: {
//     isUpdatingAsset: (productId: string) => boolean;
//   };
// }

// export function ProductDialogs({ dialogs, actions }: ProductDialogsProps) {
//   return (
//     <>
//       {dialogs.facetValuesDialogOpen && (
//         <Suspense fallback={null}>
//           <AssignFacetValuesDialog
//             open={dialogs.facetValuesDialogOpen}
//             onOpenChange={dialogs.setFacetValuesDialogOpen}
//             entityIds={dialogs.selectedProductIds}
//             queryFn={async (variables) => {
//               const { getProductsWithFacetValuesByIdsQueryDocument } = await import("../../feature/product/graphql/graphql");
//               return api.query(getProductsWithFacetValuesByIdsQueryDocument, variables);
//             }}
//             mutationFn={async (variables) => {
//               const { updateProductsMutationDocument } = await import("../../feature/product/graphql/graphql");
//               return api.mutate(updateProductsMutationDocument, variables);
//             }}
//             onSuccess={dialogs.closeFacetValuesDialog}
//           />
//         </Suspense>
//       )}
//       {dialogs.selectedProductForAsset && (
//         <Suspense fallback={null}>
//           <ProductAssetDialog
//             open={dialogs.assetDialogOpen}
//             onClose={() => {
//               dialogs.closeAssetDialog(actions.isUpdatingAsset(dialogs.selectedProductForAsset.id));
//             }}
//             onSelect={dialogs.handleAssetSelect}
//             productId={dialogs.selectedProductForAsset.id}
//           />
//         </Suspense>
//       )}
//     </>
//   );
// }

