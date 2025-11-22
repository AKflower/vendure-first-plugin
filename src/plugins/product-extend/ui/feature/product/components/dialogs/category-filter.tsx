import { useQuery } from "@tanstack/react-query";
import { api, Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@vendure/dashboard";
import { useMemo } from "react";

import { facetByCodeQueryDocument } from "../../graphql/graphql";

interface CategoryFilterProps {
  value?: string;
  onChange: (value: string | undefined) => void;
}

export function CategoryFilter({ value, onChange }: CategoryFilterProps) {
  const { data, isLoading } = useQuery({
    queryKey: ["facet-category"],
    queryFn: () => api.query(facetByCodeQueryDocument, { code: "category" }),
  });

  const categories = useMemo(() => {
    const facet = data?.facets?.items?.[0];
    return facet?.values?.map((value: { id: string; name: string }) => ({
      id: value.id,
      name: value.name,
    })) ?? [];
  }, [data]);

  return (
    <Select
      value={value || "all"}
      onValueChange={(newValue) => {
        onChange(newValue === "all" ? undefined : newValue);
      }}
      disabled={isLoading}
    >
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="All categories" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All categories</SelectItem>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {category.name}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

