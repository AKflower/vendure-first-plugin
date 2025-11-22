import { defineDashboardExtension, Page, PageTitle } from "@vendure/dashboard";

import { ProductDetailPage } from "../ui/feature/product/components/pages/product-detail-page";
import { ProductCreatePage } from "../ui/feature/product/components/pages/product-create-page";
import { productListRoute } from "../ui/components/product-list.route";
import { ViewVariants } from "../ui/feature/variant/components/view-variants";
import "../ui/global.css";
defineDashboardExtension({
  routes: [
    productListRoute,
    {
      path: "/products-extend/create",
      loader: () => ({ breadcrumb: "Create Product" }),
      component: (route) => <ProductCreatePage route={route} />,
    },
    {
      path: "/products-extend/$id",
      loader: () => ({ breadcrumb: "Product Detail" }),
      component: (route) => <ProductDetailPage route={route} />,
    },
    {
      path: "/products-extend/$productId/variants",
      loader: () => ({ breadcrumb: "Product Variants" }),
      component: (route) => {
        const { productId } = route.useParams() as { productId: string };
        return (
          <Page pageId="product-variants">
            <PageTitle>Product Variants</PageTitle>
            <ViewVariants productId={productId} />
          </Page>
        );
      },
    },
  ],
});

