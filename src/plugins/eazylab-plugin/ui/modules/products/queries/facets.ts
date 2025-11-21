import { graphql, ResultOf } from '@/gql';

export const facetByCodeQueryDocument = graphql(`
  query FacetByCode($code: String!) {
    facets(options: { filter: { code: { eq: $code } } }) {
      items {
        id
        name
        code
        isPrivate
        createdAt
        updatedAt
        values {
          id
          name
          code
        }
      }
      totalItems
    }
  }
`);

export type FacetByCodeQueryResult = ResultOf<typeof facetByCodeQueryDocument>;

