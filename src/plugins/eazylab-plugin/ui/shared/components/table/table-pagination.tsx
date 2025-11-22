"use client";

import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@vendure/dashboard";

export interface PaginationFilter {
  page: number;
  limit: number;
}


export interface Pagination {
  page: number;
  limit: number;
  total: number;
}

export interface TablePaginationProps {
  page: number;
  limit: number;
  total: number;
  onChange: (newPagination: Pagination) => void;
  maxButtons?: number; // số nút page tối đa hiển thị
}

export function TablePagination({
  page,
  limit,
  total,
  onChange,
  maxButtons = 4, // mặc định hiển thị 7 nút
}: TablePaginationProps) {
  const totalPages = Math.max(Math.ceil(total / limit), 1);

  const next = () => {
    if (page < totalPages) onChange({ page: page + 1, limit, total });
  };

  const prev = () => {
    if (page > 1) onChange({ page: page - 1, limit, total });
  };

  const changePage = (p: number) => {
    if (p !== page) onChange({ page: p, limit, total });
  };

  // Tạo mảng nút trang hiển thị
  const getPageNumbers = () => {
    const pages: (number | "...")[] = [];
  
    if (totalPages <= maxButtons) {
      // Hiển thị hết luôn
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
  
    const left = Math.max(2, page - 1);
    const right = Math.min(totalPages - 1, page + 1);
  
    pages.push(1);
  
    if (left > 2) {
      pages.push("...");
    }
  
    for (let i = left; i <= right; i++) {
      pages.push(i);
    }
  
    if (right < totalPages - 1) {
      pages.push("...");
    }
  
    pages.push(totalPages);
  
    return pages;
  };
  

  return (
    <div className="flex justify-between items-center text-sm">
      <div className="">
        <span className="font-semibold">Total </span>
        {" "}
        <span className="">{total}</span>
      </div>
      <div className="flex justify-end items-center gap-2 p-2 flex-wrap">
       {/* Limit selector */}
       <div className="">

       </div>
      <div className="flex items-center gap-2 ml-4">
        <span>Show</span>
        <select
          value={limit}
          onChange={(e) =>
            onChange({ page: 1, limit: Number(e.target.value), total })
          }
          className="border rounded px-2 py-1"
        >
          {[10, 20, 50, 100].map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>
        <span>rows per page</span>
      </div>
      <Button
        onClick={prev}
        variant="outline"
        size="icon"
        disabled={page <= 1}
        className="text-sm px-3 py-1 border rounded disabled:opacity-50 hover:cursor-pointer"
      >
        <ArrowLeft className="size-4 hover:cursor-pointer" />
      </Button>

      {getPageNumbers().map((p, idx) =>
        p === "..." ? (
          <span key={idx} className="px-2">
            ...
          </span>
        ) : (
          <Button
            key={idx}
            onClick={() => changePage(p as number)}
            variant="outline"
            size="icon"
            className={`text-sm px-3 py-1 border rounded-full hover:cursor-pointer disabled:opacity-50 ${
              p === page ? "bg-blue-500 text-white" : ""
            }`}
          >
            {p}
          </Button>
        )
      )}

      <Button
        onClick={next}
        variant="outline"
        size="icon"
        disabled={page >= totalPages}
        className="text-sm px-3 py-1 border rounded disabled:opacity-50 hover:cursor-pointer"
      >
        <ArrowRight className="size-4 hover:cursor-pointer" />
      </Button>


    </div>

    </div>

  );
}
