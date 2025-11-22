import { graphql, type ResultOf } from "@/gql";

export const productsListQueryDocument = graphql(`
  query ProductExtend_List($options: ProductListOptions) {
    products(options: $options) {
      totalItems
      items {
        id
        enabled
        createdAt
        slug
        featuredAsset {
          id
          preview
        }
        collections {
          id
          name
        }
        translations {
          languageCode
          name
          description
        }
        assets {
          id
          preview
          name
        }
        description
      }
    }
  }
`);

export const productDetailQueryDocument = graphql(`
  query ProductExtend_Detail($id: ID!) {
    product(id: $id) {
      id
      enabled
      slug
      createdAt
      updatedAt
      featuredAsset {
        id
        preview
        createdAt
        updatedAt
        name
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
        createdAt
        updatedAt
        name
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
      collections {
        id
        name
      }
      optionGroups {
        id
        name
        code
      }
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

export const createProductMutationDocument = graphql(`
  mutation ProductExtend_Create($input: CreateProductInput!) {
    createProduct(input: $input) {
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

export const updateProductMutationDocument = graphql(`
  mutation ProductExtend_Update($input: UpdateProductInput!) {
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
  mutation ProductExtend_UpdateAssets($input: UpdateProductInput!) {
    updateProduct(input: $input) {
      id
      featuredAsset {
        id
        preview
        createdAt
        updatedAt
        name
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
        createdAt
        updatedAt
        name
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
    }
  }
`);

export const facetByCodeQueryDocument = graphql(`
  query ProductExtend_Facets($code: String!) {
    facets(options: { filter: { code: { eq: $code } } }) {
      items {
        id
        name
        values {
          id
          name
        }
      }
      totalItems
    }
  }
`);

export const deleteProductsMutationDocument = graphql(`
  mutation ProductExtend_DeleteProducts($ids: [ID!]!) {
    deleteProducts(ids: $ids) {
      result
      message
    }
  }
`);

export const duplicateEntityMutationDocument = graphql(`
  mutation ProductExtend_DuplicateEntity($input: DuplicateEntityInput!) {
    duplicateEntity(input: $input) {
      ... on DuplicateEntitySuccess {
        newEntityId
      }
      ... on DuplicateEntityError {
        message
        duplicationError
      }
    }
  }
`);

export const updateProductsMutationDocument = graphql(`
  mutation ProductExtend_UpdateProducts($input: [UpdateProductInput!]!) {
    updateProducts(input: $input) {
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

export const getProductsWithFacetValuesByIdsQueryDocument = graphql(`
  query ProductExtend_GetProductsWithFacetValuesByIds($ids: [String!]!) {
    products(options: { filter: { id: { in: $ids } } }) {
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

export type ProductsListQueryResult = ResultOf<typeof productsListQueryDocument>;
export type ProductDetailQueryResult = ResultOf<typeof productDetailQueryDocument>;
export type FacetByCodeQueryResult = ResultOf<typeof facetByCodeQueryDocument>;

