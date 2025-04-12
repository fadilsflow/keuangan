"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryManagement } from "./components/category-management";
import { RelatedPartyManagement } from "./components/related-party-management";
import { MasterItemManagement } from "./components/master-item-management";

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
            <CategoryManagement />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Pihak Terkait</CardTitle>
            <CardDescription>Kelola pihak terkait untuk transaksi pemasukan dan pengeluaran.</CardDescription>
          </CardHeader>
          <CardContent>
            <RelatedPartyManagement />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Item Master</CardTitle>
            <CardDescription>Kelola item master untuk memudahkan pembuatan transaksi.</CardDescription>
          </CardHeader>
          <CardContent>
            <MasterItemManagement />
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 