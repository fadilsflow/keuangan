"use client"

import { ReactNode } from "react"
import { Pagination } from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Skeleton } from "@/components/ui/skeleton"

interface PaginatedDataTableProps<T> {
  data: T[]
  pageSize?: number
  totalItems: number
  totalPages: number
  currentPage: number
  onPageChange: (page: number) => void
  columns: {
    header: string
    key: string | ((item: T) => ReactNode)
    cell?: (item: T) => ReactNode
    isCurrency?: boolean
  }[]
  emptyMessage?: string
  isLoading?: boolean
}

export function PaginatedDataTable<T extends { id: string }>({
  data,
  pageSize = 10,
  totalPages,
  currentPage,
  onPageChange,
  columns,
  emptyMessage = "No data available",
  isLoading,
}: PaginatedDataTableProps<T>) {
  return (
    <div className="space-y-4">
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((column) => (
                <TableHead key={typeof column.key === 'string' ? column.key : column.header}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: pageSize }).map((_, index) => (
                <TableRow key={`skeleton-${index}`}>
                  {columns.map((column, colIndex) => (
                    <TableCell key={`skeleton-cell-${index}-${colIndex}`}>
                      {column.isCurrency ? (
                        <div className="flex items-center">
                          <span className="text-muted-foreground text-sm mr-1">Rp</span>
                          <Skeleton className="h-4 w-20" />
                        </div>
                      ) : (
                        <Skeleton className="h-4 w-full max-w-24" />
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-6 text-muted-foreground">
                  {emptyMessage}
                </TableCell>
              </TableRow>
            ) : (
              data.map((item) => (
                <TableRow
                  key={item.id}
                  className="transition-colors hover:bg-muted/50"
                >
                  {columns.map((column) => (
                    <TableCell key={typeof column.key === 'string' ? `${item.id}-${column.key}` : `${item.id}-${column.header}`}>
                      {column.cell
                        ? column.cell(item)
                        : typeof column.key === 'function'
                          ? column.key(item)
                          : (item as any)[column.key]}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          {isLoading ? (
            <Skeleton className="h-8 w-64" />
          ) : (
            <Pagination
              totalPages={totalPages}
              currentPage={currentPage}
              onPageChange={onPageChange}
            />
          )}
        </div>
      )}
    </div>
  )
} 