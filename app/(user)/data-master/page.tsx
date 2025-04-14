"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryManagement } from "./components/category-management";
import { MasterItemManagement } from "./components/master-item-management";
import { RelatedPartyManagement } from "./components/related-party-management";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function DataMasterPage() {
  const [transactionType, setTransactionType] = useState<"income" | "expense">("expense");

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold tracking-tight">Data Master</h1>
        <Select
          value={transactionType}
          onValueChange={(value) => setTransactionType(value as "income" | "expense")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pilih Jenis Transaksi" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Pemasukan</SelectItem>
            <SelectItem value="expense">Pengeluaran</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="categories" className="space-y-4">
        <TabsList className="space-x-4">
          <TabsTrigger value="categories">Kategori</TabsTrigger>
          <TabsTrigger value="master-items" >Item</TabsTrigger>
          <TabsTrigger value="related-parties">Pihak Terkait</TabsTrigger>
        </TabsList>

        <TabsContent value="categories">
          <CategoryManagement transactionType={transactionType} />
        </TabsContent>

        <TabsContent value="master-items">
          <MasterItemManagement transactionType={transactionType} />
        </TabsContent>

        <TabsContent value="related-parties">
          <RelatedPartyManagement transactionType={transactionType} />
        </TabsContent>
      </Tabs>
    </div>
  );
} 