"use client"

import { ReactNode, useState } from "react"
import { Pagination } from "@/components/ui/pagination"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

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
  }[]
  emptyMessage?: string
  isLoading?: boolean
}

export function PaginatedDataTable<T extends { id: string }>({
  data,
  pageSize = 10,
  totalItems,
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
              <TableRow>
                <TableCell colSpan={columns.length} className="text-center py-6">
                  Loading...
                </TableCell>
              </TableRow>
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
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={onPageChange}
          />
        </div>
      )}
    </div>
  )
} 