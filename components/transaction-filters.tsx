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
        console.log("Fetched categories:", data.data);
        setCategories(data.data);
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
    console.log("Current filters:", filters);
    onFilterChange(filters);
  }, [filters, onFilterChange]);

  const handleFilterChange = (key: keyof Filters, value: any) => {
    console.log(`Filter changed: ${key} = ${value}`);
    const newFilters = { ...filters, [key]: value };
    if (key === "dateRange") {
      newFilters.dateRange = normalizeDateRange(value);
    }
    setFilters(newFilters);
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
            onValueChange={(value) => {
              console.log("Category selected:", value);
              handleFilterChange("category", value);
            }}
            disabled={loadingCategories}
          >
            <SelectTrigger className="w-full">
              <SelectValue
                placeholder={loadingCategories ? "Loading..." : "Kategori"}
              >
                {filters.category === "all"
                  ? "Kategori"
                  : categories.find((cat) => cat.id === filters.category)
                      ?.name || "Kategori"}
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Kategori</SelectItem>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex-1 ">
          <DatePickerWithRange date={dateRange} setDate={setDateRange} />
        </div>

        <Button
          variant="outline"
          onClick={() => {
            setSearch("");
            setDateRange(undefined);
            setFilters({
              search: "",
              type: "all",
              category: "all",
              dateRange: undefined,
            });
          }}
        >
          Reset
        </Button>
      </div>
    </div>
  );
}
