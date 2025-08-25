// src/components/common/Pagination.tsx
"use client";
import { FC } from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

const Pagination: FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  // Always show pagination, even if totalPages = 1
  totalPages = totalPages || 1;

  return (
    <div className="mt-8 flex justify-end gap-2 flex-wrap">
      <button
        className="px-3 py-1 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        Prev
      </button>

      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <button
          key={page}
          className={`px-3 py-1 rounded-lg border ${
            currentPage === page
              ? "bg-indigo-600 text-white"
              : "bg-white hover:bg-gray-100"
          }`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}

      <button
        className="px-3 py-1 rounded-lg border bg-white hover:bg-gray-100 disabled:opacity-50"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
      </button>
    </div>
  );
};

export default Pagination;
