import { Page } from "@vendure/dashboard";
import { lazy } from "react";
import { useProductFilters } from "../../hooks/useProductFilters";
import { useProductQuery } from "../../hooks/useProductQuery";
import { useProductMutations } from "../../hooks/useProductMutations";
import { useProductActions } from "../../hooks/useProductActions";
import { useProductDialogs } from "../../hooks/useProductDialogs";
import { ProductPageHeader } from "../layouts/ProductPageHeader";
import { ProductTable } from "../tables/product-table";
import { useProductColumns } from "../tables/product-table-columns";

// Lazy load row actions component
const ProductRowActions = lazy(() =>
  import("../tables/product-row-actions").then((m) => ({ default: m.ProductRowActions }))
);

export function ProductListPage({ route }: { route: any }) {
  const navigate = route.useNavigate();

  // URL params management
  const { filters, localSearchTerm, handlePageChange, handleSortChange, handleFilterChange, handleSearchTermChange } =
    useProductFilters(route);

  // Data query
  const query = useProductQuery(filters);

  // Mutations and actions
  const mutations = useProductMutations();
  const dialogs = useProductDialogs();
  const actions = useProductActions({ navigate, mutations, dialogs });

  // Columns
  const columns = useProductColumns({
    onToggleEnabled: actions.handleToggleEnabled,
    updatingProductId: actions.updatingProductId,
    RowActionsComponent: ProductRowActions,
    onViewProduct: actions.handleViewProduct,
    onEditImage: actions.handleEditImage,
    onEditFacetValues: actions.handleEditFacetValues,
    onDuplicateProduct: actions.handleDuplicateProduct,
    onDeleteProduct: actions.handleDeleteProduct,
    isDeleting: actions.isDeleting,
    isDuplicating: actions.isDuplicating,
    isUpdatingAsset: actions.isUpdatingAsset,
  });

  return (
    <Page pageId="product-extend-list">
      <ProductPageHeader />
     
        <ProductTable
          columns={columns}
          products={query.products}
          totalItems={query.totalItems}
          page={filters.page}
          pageSize={filters.pageSize}
          sorting={filters.sorting}
          filters={filters.filters}
          searchTerm={localSearchTerm}
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
          onFilterChange={handleFilterChange}
          onSearchTermChange={handleSearchTermChange}
          actions={actions}
          dialogs={{
            ...dialogs,
            handleAssetSelect: actions.handleAssetSelect,
          }}
        />
      
    </Page>
  );
}
