"use client";

import { useState, useEffect } from "react";
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
import { DateRange } from "react-day-picker";
import { DatePickerWithRange } from "./ui/date-range-picker";
import useDebouncedSearch from "@/app/hooks/use-debounced-search";

interface Filters {
  search: string;
  type: string;
  category: string;
  dateRange?: { from: Date; to: Date } | undefined;
}

interface TransactionFiltersProps {
  onFilterChange: (filters: Filters) => void;
}

interface Category {
  id: string;
  name: string;
  type: string;
}

interface CategoryResponse {
  data: Category[];
}

export function TransactionFilters({
  onFilterChange,
}: TransactionFiltersProps) {
  const { search, debouncedSearch, setSearch } = useDebouncedSearch(500);
  const [filters, setFilters] = useState<Filters>({
    search: "",
    type: "all",
    category: "all",
    dateRange: undefined,
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Update filters when debounced search changes
  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      search: debouncedSearch,
    }));
  }, [debouncedSearch]);

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoadingCategories(true);
        const response = await fetch("/api/categories/all");

        if (!response.ok) throw new Error("Failed to fetch categories");

        const data: CategoryResponse = await response.json();
        const uniqueCategories = Array.from(
          new Map(data.data.map((cat) => [cat.name, cat])).values()
        ) as Category[];

        setCategories(uniqueCategories);
      } catch (e) {
        console.error("Error fetching categories:", e);
        setCategories([]);
      } finally {
        setLoadingCategories(false);
      }
    }
    fetchCategories();
  }, []);

  function normalizeDateRange(
    dr: DateRange | undefined
  ): { from: Date; to: Date } | undefined {
    if (dr && dr.from && dr.to) {
      return { from: dr.from, to: dr.to };
    }
    return undefined;
  }

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      dateRange: normalizeDateRange(dateRange),
    }));
  }, [dateRange]);

  useEffect(() => {
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (key: keyof Filters, value: any) => {
    const newFilters = { ...filters, [key]: value };
    if (key === "dateRange") {
      newFilters.dateRange = normalizeDateRange(value);
    }
    setFilters(newFilters);
  };

  const handleReset = () => {
    setSearch("");
    const resetFilters = {
      search: "",
      type: "all",
      category: "all",
      dateRange: undefined,
    };
    setDateRange(undefined);
    setFilters(resetFilters);
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Cari transaksi..."
            className="w-full pl-9"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

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

        <div className="flex-1 min-w-[150px]">
          <Select
            value={filters.category}
            onValueChange={(value) => handleFilterChange("category", value)}
            disabled={loadingCategories}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={loadingCategories ? "Loading..." : "Kategori"}
              />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Kategori</SelectItem>
              {categories.map((category) => (
                <SelectItem
                  key={category.id || category.name}
                  value={category.name}
                >
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 ">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
        </div>

        <Button variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </div>
  );
}
