"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CategoryManagement } from "./components/category-management";
import { RelatedPartyManagement } from "./components/related-party-management";
import { MasterItemManagement } from "./components/master-item-management";

export default function DataMasterPage() {
  const [activeTab, setActiveTab] = useState("categories");

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Data Master</h1>
        <p className="text-muted-foreground">
          Kelola kategori, pihak terkait, dan item master untuk transaksi Anda
        </p>
      </div>

      <Tabs defaultValue="categories" value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="categories">Kategori</TabsTrigger>
          <TabsTrigger value="relatedParties">Pihak Terkait</TabsTrigger>
          <TabsTrigger value="masterItems">Item Master</TabsTrigger>
        </TabsList>
        
        <TabsContent value="categories">
          <Card>
            <CardHeader>
              <CardTitle>Kategori</CardTitle>
              <CardDescription>
                Kelola kategori untuk transaksi Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CategoryManagement />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="relatedParties">
          <Card>
            <CardHeader>
              <CardTitle>Pihak Terkait</CardTitle>
              <CardDescription>
                Kelola data pihak terkait untuk transaksi Anda
              </CardDescription>
            </CardHeader>
            <CardContent>
              <RelatedPartyManagement  />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="masterItems">
          <Card>
            <CardHeader>
              <CardTitle>Item Master</CardTitle>
              <CardDescription>
                Kelola data item master untuk memudahkan pembuatan transaksi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MasterItemManagement />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 