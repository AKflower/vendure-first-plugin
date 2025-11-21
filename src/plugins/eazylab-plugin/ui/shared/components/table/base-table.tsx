/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";
import React from "react";
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../common/table";
import { Checkbox } from "../common/checkbox";
import { LoadingState } from "../common/loading-state";
import { TableToolbar } from "./table-toolbar";
import { PaginationFilter, TablePagination } from "./table-pagination";

export interface BaseTableProps<TData, TFilter = any>  {
  data: TData[];
  columns?: ColumnDef<TData>[];
  filters?: TFilter & PaginationFilter
  hasSearch?: boolean
  FilterComponent?: React.ComponentType<{
    filters: TFilter;
    onFilterChange: (newFilters: Partial<TFilter>) => void;
  }>;
  ToolComponents? : React.ReactNode
  FilterSummaryComponent?: React.ReactNode
  onFilterChange?: (newFilters: TFilter) => void
  total?: number
  enableRowSelection?: boolean
  getRowId?: (row: TData) => string
  isLoading?: boolean
  isError?: boolean
}

export function BaseTable<TData>({
  data,
  columns=[],
  filters,
  hasSearch=true,
  FilterComponent,
  ToolComponents,
  FilterSummaryComponent,
  onFilterChange,
  total,
  enableRowSelection=false,
  getRowId,
  isLoading=false,
  isError=false

}: BaseTableProps<TData >) {

  const selectionColumn: ColumnDef<TData> = React.useMemo(
    () => ({
      id: "__select",
      header: ({ table }) => (
        <div className="flex justify-center w-max">
          <Checkbox
            checked={table.getIsAllPageRowsSelected()}
            onCheckedChange={(value) => {
              table.toggleAllPageRowsSelected(!!value);
            }}
            className="lg:size-4 size-3 hover:cursor-pointer hover:border-primary/60 border-primary  data-[state=checked]:border-blue-600 data-[state=checked]:bg-white data-[state=checked]:text-blue-600 dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
          />

        </div>
      ),
      cell: ({ row }) => (
        <div className="flex justify-center w-max">
          <Checkbox
            checked={row.getIsSelected()}
            onCheckedChange={(value) => {
              row.toggleSelected(!!value);
            }}
            className="lg:size-4 size-3 hover:cursor-pointer hover:border-primary/60 border-primary  data-[state=checked]:border-blue-600 data-[state=checked]:bg-white data-[state=checked]:text-blue-600 dark:data-[state=checked]:border-blue-700 dark:data-[state=checked]:bg-blue-700"
          />

        </div>
      ),
      enableSorting: false,
      enableHiding: false,
      size: 25,
      minSize: 40,
    }),
    []
  );

  // BƯỚC 2: Thêm 'selectionColumn' vào dependency array của 'finalColumns'
  const finalColumns = React.useMemo(() => {
    return enableRowSelection
      ? [selectionColumn, ...columns]
      : columns;
  }, [columns, enableRowSelection, selectionColumn]); // <-- Thêm vào đây

  const table = useReactTable({
    data,
    columns: finalColumns,
    getCoreRowModel: getCoreRowModel(),
    enableRowSelection: enableRowSelection,
    getRowId: getRowId,
    columnResizeMode: "onChange",
    defaultColumn: {
      minSize: 25, // <-- Đặt kích thước tối thiểu mới (ví dụ: 5px)
    },

  });

  const colSpan =
    table.getAllLeafColumns().length ||
    finalColumns.length ||
    columns.length ||
    1;

  return (
    <div className="space-y-4">

      <TableToolbar
        hasSearch={hasSearch}
        filters={filters}
        FilterComponent={FilterComponent}
        ToolComponents={ToolComponents}
        FilterSummaryComponent={FilterSummaryComponent}
        onFilterChange={onFilterChange}
      />

       <div className="rounded-md border">
        <Table className="">
         <TableHeader>
          {table.getHeaderGroups().map((headerGroup) => (
            <TableRow key={headerGroup.id}>
              {headerGroup.headers.map((header, idx) => {
                const isFirst = idx === 0;
                const isLast = idx === headerGroup.headers.length - 1;

                return (
                  <TableHead
                    key={header.id}
                    className={`
                      bg-table-header
                      ${isFirst ? "rounded-tl-md" : ""}
                      ${isLast ? "rounded-tr-md" : ""}
                    `}
                    style={{
                      width: `${header.getSize()}px`,
                    }}

                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                );
              })}
            </TableRow>
          ))}
        </TableHeader>
          <TableBody>
            {isError ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="h-24 text-center text-destructive">
                  Something went wrong. Please try again.
                </TableCell>
              </TableRow>
            ) : isLoading ? (
              <TableRow>
                <TableCell colSpan={colSpan} className="h-32 text-center">
                  <LoadingState minHeight={64} />
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} style={{
                      width: `${cell.column.getSize()}px`,
                    }}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={colSpan} className="h-24 text-center">
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="">
        {
          total ?
           <TablePagination
              page={filters?.page || 0}
              limit={filters?.limit || 0}
              total={total}
              onChange={(newPagination) =>
                onFilterChange?.({ ...filters, ...newPagination })
              }
            />
          :
          null
        }
      </div>
    </div>

  );
}
