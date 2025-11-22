import { graphql, type ResultOf } from "@/gql";

// Query to get product with all variants
export const productVariantsQueryDocument = graphql(`
  query ProductVariants_List($productId: ID!) {
    product(id: $productId) {
      id
      name
      variants {
        id
        name
        sku
        enabled
        price
        priceWithTax
        currencyCode
        stockOnHand
        stockAllocated
        trackInventory
        useGlobalOutOfStockThreshold
        outOfStockThreshold
        createdAt
        updatedAt
        featuredAsset {
          id
          preview
          name
        }
        assets {
          id
          preview
          name
        }
        options {
          id
          name
          code
          group {
            id
            name
            code
          }
        }
        taxCategory {
          id
          name
        }
        taxRateApplied {
          id
          name
          value
        }
      }
      optionGroups {
        id
        name
        code
        options {
          id
          name
          code
        }
      }
    }
  }
`);

// Query to get single variant detail
export const variantDetailQueryDocument = graphql(`
  query VariantDetail($id: ID!) {
    productVariant(id: $id) {
      id
      name
      sku
      enabled
      price
      priceWithTax
      currencyCode
      stockOnHand
      stockAllocated
      trackInventory
      useGlobalOutOfStockThreshold
      outOfStockThreshold
      createdAt
      updatedAt
      product {
        id
        name
      }
      featuredAsset {
        id
        preview
        name
        createdAt
        updatedAt
        fileSize
        mimeType
        type
        source
        width
        height
        focalPoint {
          x
          y
        }
      }
      assets {
        id
        preview
        name
        createdAt
        updatedAt
        fileSize
        mimeType
        type
        source
        width
        height
        focalPoint {
          x
          y
        }
      }
      options {
        id
        name
        code
        group {
          id
          name
          code
        }
      }
      taxCategory {
        id
        name
      }
      taxRateApplied {
        id
        name
        value
      }
    }
  }
`);

// Mutation to create variant
export const createVariantMutationDocument = graphql(`
  mutation CreateVariant($input: CreateProductVariantInput!) {
    createProductVariants(input: [$input]) {
      id
      name
      sku
      enabled
      price
      priceWithTax
      currencyCode
    }
  }
`);

// Mutation to update variant
export const updateVariantMutationDocument = graphql(`
  mutation UpdateVariant($input: UpdateProductVariantInput!) {
    updateProductVariants(input: [$input]) {
      id
      name
      sku
      enabled
      price
      priceWithTax
      currencyCode
      stockOnHand
      stockAllocated
    }
  }
`);

// Mutation to delete variants
export const deleteVariantsMutationDocument = graphql(`
  mutation DeleteVariants($ids: [ID!]!) {
    deleteProductVariants(ids: $ids) {
      result
      message
    }
  }
`);

// Mutation to update variant assets
export const updateVariantAssetsMutationDocument = graphql(`
  mutation UpdateVariantAssets($input: UpdateProductVariantInput!) {
    updateProductVariants(input: [$input]) {
      id
      featuredAsset {
        id
        preview
      }
      assets {
        id
        preview
      }
    }
  }
`);

// Mutation to update variants with facet values
export const updateVariantsMutationDocument = graphql(`
  mutation UpdateVariants($input: [UpdateProductVariantInput!]!) {
    updateProductVariants(input: $input) {
      id
      name
      facetValues {
        id
        name
        code
      }
    }
  }
`);

// Query to get variants with facet values by IDs
export const getVariantsWithFacetValuesByIdsQueryDocument = graphql(`
  query GetVariantsWithFacetValuesByIds($ids: [String!]!) {
    productVariants(options: { filter: { id: { in: $ids } } }) {
      items {
        id
        name
        facetValues {
          id
          name
          code
          facet {
            id
            name
            code
          }
        }
      }
    }
  }
`);

export type ProductVariantsQueryResult = ResultOf<typeof productVariantsQueryDocument>;
export type VariantDetailQueryResult = ResultOf<typeof variantDetailQueryDocument>;

