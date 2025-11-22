import { graphql, ResultOf } from '@/gql';

// Query search để filter và lấy productIds
export const searchProductsQuery = graphql(`
  query SearchProducts($input: SearchInput!) {
    search(input: $input) {
      totalItems
      items {
        productId
      }
    }
  }
`);

// Query products với IDs để lấy đầy đủ thông tin
export const productsByIdsQuery = graphql(`
  query ProductsByIds($ids: [ID!]!) {
    products(options: { filter: { id: { in: $ids } } }) {
      items {
        id
        createdAt
        updatedAt
        enabled
        slug
        description
        featuredAsset {
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
        }
      }
    }
  }
`);

export type SearchProductsResult = ResultOf<typeof searchProductsQuery>;
export type ProductsByIdsResult = ResultOf<typeof productsByIdsQuery>;