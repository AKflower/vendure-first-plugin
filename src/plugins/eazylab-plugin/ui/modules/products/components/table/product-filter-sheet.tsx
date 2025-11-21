import { useState } from "react";
import { Filter } from "lucide-react";
import { Button } from "@vendure/dashboard";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@vendure/dashboard";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/vdb/components/ui/select";
import type { ProductTableFilters, SortField } from "./product-table";

interface ProductFilterSheetProps {
  filters: ProductTableFilters;
  onFilterChange: (filters: Partial<ProductTableFilters>) => void;
  categories: { id: string; name: string }[];
}

export function ProductFilterSheet({
  filters,
  onFilterChange,
  categories,
}: ProductFilterSheetProps) {
  const [open, setOpen] = useState(false);
  const status = filters.status ?? "all";

  const handleFilterChange = (newFilters: Partial<ProductTableFilters>) => {
    onFilterChange(newFilters);
  };

  const hasActiveFilters =
    (filters.status && filters.status !== "all") ||
    (filters.categoryId && filters.categoryId !== "all") ||
    (filters.sortBy && filters.sortBy !== "createdAt") ||
    (filters.sortOrder && filters.sortOrder !== "DESC");

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <Filter className="size-4" />
          {hasActiveFilters && (
            <span className="ml flex h-2 w-2 rounded-full bg-success" />
          )}
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader>
          <SheetTitle>Product filters</SheetTitle>
          <SheetDescription>
            Adjust the criteria below to narrow the product list.
          </SheetDescription>
        </SheetHeader>
        <div className="mt-6 space-y-6 px-1">
          {/* Status Filter */}
          <div className="space-y-3 px-4">
            <label className="text-sm font-medium">Status</label>
            <Select
              value={status}
              onValueChange={(value) =>
                handleFilterChange({
                  status: value as ProductTableFilters["status"],
                  page: 1,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="enabled">Enabled</SelectItem>
                <SelectItem value="disabled">Disabled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Collection Filter */}
          <div className="space-y-3 px-4">
            <label className="text-sm font-medium">Category</label>
            <Select
              value={filters.categoryId ?? "all"}
              onValueChange={(value) =>
                handleFilterChange({
                  categoryId: value,
                  page: 1,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Sort By */}
          <div className="space-y-3 px-4">
            <label className="text-sm font-medium">Sort by</label>
            <Select
              value={filters.sortBy ?? "createdAt"}
              onValueChange={(value) =>
                handleFilterChange({
                  sortBy: value as SortField,
                  page: 1,
                })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select sort field" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">Created date</SelectItem>
                <SelectItem value="name">Product name</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Sort Order */}
          <div className="space-y-3 px-4">
            <label className="text-sm font-medium">Sort order</label>
            <div className="flex gap-2">
              <Button
                variant={filters.sortOrder === "ASC" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => handleFilterChange({ sortOrder: "ASC" })}
              >
                Ascending ↑
              </Button>
              <Button
                variant={filters.sortOrder === "DESC" ? "default" : "outline"}
                size="sm"
                className="flex-1"
                onClick={() => handleFilterChange({ sortOrder: "DESC" })}
              >
                Descending ↓
              </Button>
            </div>
          </div>

          {/* Reset Filters */}
          {hasActiveFilters && (
            <div className="pt-4 border-t px-4">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  handleFilterChange({
                    status: "all",
                    categoryId: "all",
                    sortBy: "createdAt",
                    sortOrder: "DESC",
                    page: 1,
                  });
                }}
              >
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

