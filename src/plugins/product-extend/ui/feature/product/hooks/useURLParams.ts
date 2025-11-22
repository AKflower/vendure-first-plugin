import { useCallback } from "react";
import type { AnyRoute } from "@tanstack/react-router";
import type { z } from "zod";

export function useURLParams<
  TSchema extends z.ZodTypeAny,
  TParsed extends z.infer<TSchema>,
  TDefaults extends Partial<TParsed>
>(
  route: AnyRoute,
  schema: TSchema,
  defaults: TDefaults
) {
  const navigate = route.useNavigate();
  const search = route.useSearch() as Partial<TParsed>;

  // Parse & merge defaults
  const parsed: TParsed = {
    ...defaults,
    ...schema.parse(search),
  };

  // Update search params
  const setURL = useCallback(
    (updates: Partial<TParsed>) => {
      navigate({
        search: (prev: Partial<TParsed>) => {
          const next: Partial<TParsed> = { ...prev, ...updates };

          // Clean empty values
          Object.keys(next).forEach((key) => {
            const v = (next as any)[key];
            if (v === undefined || v === "" || v === null) {
              delete (next as any)[key];
            }
          });

          return next;
        },
      });
    },
    [navigate]
  );

  return { params: parsed, setURL };
}
