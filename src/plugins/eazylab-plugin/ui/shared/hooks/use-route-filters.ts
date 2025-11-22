import type { AnyRoute } from "@tanstack/react-router";
import { useCallback, useMemo } from "react";

export type RouteFiltersSetter<TFilters> =
  | TFilters
  | ((prev: TFilters) => TFilters);

export function useRouteFilters<TFilters extends object>(
  route: AnyRoute,
  defaultFilters: TFilters
) {
  const navigate = route.useNavigate();
  const search = route.useSearch() as Partial<TFilters>;

  const filters = useMemo<TFilters>(() => {
    return {
      ...defaultFilters,
      ...search,
    };
  }, [defaultFilters, search]);

  const setFilters = useCallback(
    (next: RouteFiltersSetter<TFilters>) => {
      navigate({
        search: (prev: Partial<TFilters>) => {
          const prevFilters = {
            ...defaultFilters,
            ...prev,
          } as TFilters;

          const resolved =
            typeof next === "function"
              ? (next as (prevState: TFilters) => TFilters)(prevFilters)
              : next;

          return resolved as Record<string, unknown>;
        },
      } as any);
    },
    [defaultFilters, navigate]
  );

  return [filters, setFilters] as const;
}

