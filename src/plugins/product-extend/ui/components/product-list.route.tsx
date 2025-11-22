import type { DashboardRouteDefinition } from "@vendure/dashboard";
import { ProductListPage } from "../feature/product/components/pages/product-list-page";
import { productListSearchSchema } from "../feature/product/hooks/useProductFilters";

export const productListRoute: DashboardRouteDefinition = {
  navMenuItem: {
    sectionId: "catalog",
    id: "products-extend-list",
    url: "/products-extend",
    title: "Products (Extend)",
  },
  path: "/products-extend",
  loader: () => ({ breadcrumb: "Products" }),
  validateSearch: productListSearchSchema,
  component: (route) => <ProductListPage route={route} />,
};

