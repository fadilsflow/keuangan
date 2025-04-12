"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryManagement } from "./components/category-management";
import { RelatedPartyManagement } from "./components/related-party-management";
import { MasterItemManagement } from "./components/master-item-management";
import { Suspense } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

export default function DataMasterPage() {
  return (
    <div className="container py-6 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Data Master</h1>
        <p className="text-muted-foreground">Kelola data master untuk sistem keuangan.</p>
      </div>

      <div className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Kategori</CardTitle>
            <CardDescription>Kelola kategori untuk transaksi pemasukan dan pengeluaran.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<EnhancedDataTableSkeleton type="category" />}>
              <CategoryManagement />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pihak Terkait</CardTitle>
            <CardDescription>Kelola pihak terkait untuk transaksi pemasukan dan pengeluaran.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<EnhancedDataTableSkeleton type="party" />}>
              <RelatedPartyManagement />
            </Suspense>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Item Master</CardTitle>
            <CardDescription>Kelola item master untuk memudahkan pembuatan transaksi.</CardDescription>
          </CardHeader>
          <CardContent>
            <Suspense fallback={<EnhancedDataTableSkeleton type="item" />}>
              <MasterItemManagement />
            </Suspense>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function EnhancedDataTableSkeleton({ type }: { type: "category" | "party" | "item" }) {
  const getColumns = () => {
    switch (type) {
      case "category":
        return [
          { header: "Nama", width: "w-40" },
          { header: "Deskripsi", width: "w-64" },
          { header: "Jenis", width: "w-24" },
          { header: "Aksi", width: "w-24" },
        ];
      case "party":
        return [
          { header: "Nama", width: "w-40" },
          { header: "Deskripsi", width: "w-64" },
          { header: "Jenis", width: "w-24" },
          { header: "Aksi", width: "w-24" },
        ];
      case "item":
        return [
          { header: "Nama", width: "w-40" },
          { header: "Harga", width: "w-36" },
          { header: "Kategori", width: "w-32" },
          { header: "Deskripsi", width: "w-48" },
          { header: "Aksi", width: "w-24" },
        ];
    }
  };

  const columns = getColumns();

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-32" />
        </div>
        <Skeleton className="h-9 w-32" />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/50">
              {columns.map((column, index) => (
                <TableHead key={index}>
                  {column.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(5).fill(0).map((_, i) => (
              <TableRow key={i}>
                {columns.map((column, j) => (
                  <TableCell key={`${i}-${j}`}>
                    {j === 1 && type === "item" ? (
                      <div className="flex items-center">
                        <span className="text-muted-foreground mr-1">Rp</span>
                        <Skeleton className={`h-4 w-24`} />
                      </div>
                    ) : (
                      <Skeleton className={`h-4 ${column.width}`} />
                    )}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
          <Skeleton className="h-8 w-8 rounded" />
        </div>
      </div>
    </div>
  );
}

function DataTableSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-20" />
        </div>
        <Skeleton className="h-9 w-24" />
      </div>
      
      <div className="rounded-md border">
        <div className="border-b">
          <div className="flex items-center h-10 px-4">
            <Skeleton className="h-4 w-4 mr-2" />
            <Skeleton className="h-4 w-24 mr-6" />
            <Skeleton className="h-4 w-48 mr-6" />
            <Skeleton className="h-4 w-24 mr-6" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
        <div>
          {Array(5).fill(0).map((_, i) => (
            <div key={i} className="flex items-center h-16 px-4 border-b last:border-b-0">
              <Skeleton className="h-4 w-4 mr-2" />
              <Skeleton className="h-4 w-24 mr-6" />
              <Skeleton className="h-4 w-48 mr-6" />
              <Skeleton className="h-4 w-24 mr-6" />
              <Skeleton className="h-8 w-16" />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <Skeleton className="h-8 w-40" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-8" />
        </div>
      </div>
    </div>
  );
} 