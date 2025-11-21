import { graphql, ResultOf } from '@/gql';

export const productsListQueryDocument = graphql(`
  query ProductsList($options: ProductListOptions) {
    products(options: $options) {
      totalItems
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

export type ProductsListQueryResult = ResultOf<typeof productsListQueryDocument>;
export type ProductListItem = ProductsListQueryResult['products']['items'][number];

