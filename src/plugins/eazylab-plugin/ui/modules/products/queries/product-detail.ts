import { graphql, ResultOf } from '@/gql';

export const productDetailQueryDocument = graphql(`
  query ProductDetail($id: ID!) {
    product(id: $id) {
      id
      enabled
      slug
      description
      createdAt
      updatedAt
      featuredAsset {
        id
        preview
      }
      assets {
        id
        preview
      }
      collections {
        id
        name
      }
      translations {
        id
        languageCode
        name
        slug
        description
      }
      variants {
        id
        name
        sku
        priceWithTax
        price
        currencyCode
        stockOnHand
        stockAllocated
        featuredAsset {
          id
          preview
        }
        options {
          id
          name
          groupId
          group {
            id
            name
          }
        }
      }
    }
  }
`);

export const createProductMutationDocument = graphql(`
  mutation CreateProduct($input: CreateProductInput!) {
    createProduct(input: $input) {
      id
    }
  }
`);

export const updateProductMutationDocument = graphql(`
  mutation UpdateProduct($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      id
      enabled
      slug
      translations {
        id
        languageCode
        name
        slug
        description
      }
    }
  }
`);

export const updateProductAssetsMutationDocument = graphql(`
  mutation UpdateProductAssets($input: UpdateProductInput!) {
    updateProduct(input: $input) {
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

export type ProductDetailQueryResult = ResultOf<typeof productDetailQueryDocument>;

