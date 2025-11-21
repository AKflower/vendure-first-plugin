import { Input } from "../common/input"


export interface TableToolbarProps<TFilter> {
  hasSearch?: boolean
  filters: TFilter
  onFilterChange?: (filters: TFilter) => void
  FilterComponent?: React.ComponentType<{
    filters: TFilter;
    onFilterChange: (newFilters: Partial<TFilter>) => void;
  }>
  ToolComponents? : React.ReactNode
  FilterSummaryComponent?: React.ReactNode


}

export function TableToolbar<TFilter> ({
  hasSearch=true,
  filters,
  onFilterChange,
  FilterComponent,
  ToolComponents,
  FilterSummaryComponent
} : TableToolbarProps<TFilter>) {
  return (
     <div className="space-y-2">
        <div className="grid grid-cols-2">
          {hasSearch ? (
            <Input
              placeholder="Search..."
              value={((filters as Record<string, unknown>)?.key as string) ?? ""}
              onChange={(e) =>
                onFilterChange?.({
                  ...filters,
                  key: e.target.value,
                })
              }
              className="rounded-full max-w-sm"
            />
          ) : null}
          <div className="text-right">
            {FilterComponent && (
              <FilterComponent
                filters={filters}
                onFilterChange={(changed) =>
                  onFilterChange?.({ ...filters, ...changed })
                }
              />
            )}
            {ToolComponents}
          </div>
        </div>
        {FilterSummaryComponent ? <div>{FilterSummaryComponent}</div> : null}
      </div>
  )
}
