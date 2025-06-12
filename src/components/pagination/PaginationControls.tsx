import React from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export const PaginationControls: React.FC<PaginationControlsProps> = ({
  currentPage,
  totalPages,
  onPageChange,
}) => {
  if (totalPages <= 1) {
    return null;
  }

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  return (
    <Pagination className="flex self-end">
      <PaginationContent className="flex items-center gap-10">
        <PaginationItem>
          <PaginationPrevious
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handlePrevious();
            }}
            className={
              currentPage === 1 ? "pointer-events-none opacity-50" : undefined
            }
          />
        </PaginationItem>
        <PaginationItem className="px-4">
          <PaginationLink isActive className="w-full p-4">
            Page {currentPage} of {totalPages}
          </PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext
            href="#"
            onClick={(e) => {
              e.preventDefault();
              handleNext();
            }}
            className={
              currentPage === totalPages
                ? "pointer-events-none opacity-50"
                : undefined
            }
          />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
};
