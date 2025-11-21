import { graphql, ResultOf } from '@/gql';

export const collectionsListQueryDocument = graphql(`
  query CollectionsList {
    collections(options: { take: 200 }) {
      items {
        id
        name
      }
    }
  }
`);

export const collectionProductsQueryDocument = graphql(`
  query CollectionProducts($id: ID!, $options: ProductVariantListOptions) {
    collection(id: $id) {
      id
      name
      productVariants(options: $options) {
        totalItems
        items {
          product {
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
    }
  }
`);

export type CollectionsListQueryResult = ResultOf<typeof collectionsListQueryDocument>;
export type CollectionProductsQueryResult = ResultOf<typeof collectionProductsQueryDocument>;

