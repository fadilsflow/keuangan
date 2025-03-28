"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { DatePickerWithRange } from "./ui/date-range-picker";

const categories = [
  "Bahan Baku",
  "Tenaga Kerja",
  "Overhead",
  "Penjualan",
  "Lainnya",
];

interface Filters {
  search: string;
  type: string;
  category: string;
  dateRange?: { from: Date; to: Date } | undefined;
}

interface TransactionFiltersProps {
  onFilterChange: (filters: Filters) => void;
}

export function TransactionFilters({ onFilterChange }: TransactionFiltersProps) {
  const [filters, setFilters] = useState<Filters>({
    search: "",
    type: "all",
    category: "all",
    dateRange: undefined,
  });

  const handleFilterChange = (key: keyof Filters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters = {
      search: "",
      type: "all",
      category: "all",
      dateRange: undefined,
    };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        {/* Search Input */}
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari transaksi..."
            className="w-full pl-9"
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
        </div>

        {/* Type Select */}
        <div className="flex-1 min-w-[150px]">
          <Select
            value={filters.type}
            onValueChange={(value) => handleFilterChange("type", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Jenis" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Jenis</SelectItem>
              <SelectItem value="pemasukan">Pemasukan</SelectItem>
              <SelectItem value="pengeluaran">Pengeluaran</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Category Select */}
        <div className="flex-1 min-w-[150px]">
          <Select
            value={filters.category}
            onValueChange={(value) => handleFilterChange("category", value)}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Kategori</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category} value={category}>
                  {category}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Date Range Picker */}
        <div className="flex-1 ">
          <DatePickerWithRange
            date={filters.dateRange}
            onDateChange={(range) => handleFilterChange("dateRange", range)}
          />
        </div>

        {/* Reset Button */}
        <Button
          variant="outline"
          onClick={handleReset}
          className="flex-1 "
        >
          Reset
        </Button>
      </div>
    </div>
  );
}