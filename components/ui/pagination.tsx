"use client"

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react"
import * as React from "react"

import { cn } from "@/lib/utils"
import { buttonVariants } from "@/components/ui/button"

interface PaginationProps {
  className?: string
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
}

interface PaginationButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  isActive?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

const PaginationButton = ({
  className,
  isActive,
  variant = "outline",
  ...props
}: PaginationButtonProps) => (
  <button
    className={cn(
      buttonVariants({
        variant: isActive ? "default" : variant,
        size: "sm",
      }),
      className
    )}
    {...props}
  />
)

export function Pagination({
  className,
  totalPages,
  currentPage,
  onPageChange,
}: PaginationProps) {
  // Generate page numbers to show
  const generatePagination = () => {
    if (totalPages <= 5) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // Always show first and last page
    // Show ellipsis when needed
    // Show current page and 1 page on each side when possible
    const pages: (number | string)[] = []

    // First page
    pages.push(1)

    // Handle start ellipsis
    if (currentPage > 3) {
      pages.push("...")
    }

    // Pages around current
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }

    // Handle end ellipsis
    if (currentPage < totalPages - 2) {
      pages.push("...")
    }

    // Last page
    if (totalPages > 1) {
      pages.push(totalPages)
    }

    return pages
  }

  const pages = generatePagination()

  return (
    <div className={cn("flex flex-wrap items-center gap-1", className)}>
      <PaginationButton
        aria-label="Go to previous page"
        onClick={() => {
          if (currentPage > 1) onPageChange(currentPage - 1)
        }}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4" />
      </PaginationButton>
      {pages.map((page, i) => (
        page === "..." ? (
          <span key={`ellipsis-${i}`} className="flex h-8 w-8 items-center justify-center">
            <MoreHorizontal className="h-4 w-4" />
          </span>
        ) : (
          <PaginationButton
            key={`page-${page}`}
            onClick={() => onPageChange(Number(page))}
            isActive={currentPage === page}
            aria-label={`Go to page ${page}`}
            aria-current={currentPage === page ? "page" : undefined}
          >
            {page}
          </PaginationButton>
        )
      ))}
      <PaginationButton
        aria-label="Go to next page"
        onClick={() => {
          if (currentPage < totalPages) onPageChange(currentPage + 1)
        }}
        disabled={currentPage === totalPages || totalPages === 0}
      >
        <ChevronRight className="h-4 w-4" />
      </PaginationButton>
    </div>
  )
}
