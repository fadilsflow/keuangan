"use client";

import { useState } from "react";
import { TransactionDataTable } from "@/components/transaction-data-table";
import { TransactionFilters } from "@/components/transaction-filters";

export default function TransactionsPage() {
  const [filters, setFilters] = useState({
    search: "",
    type: "",
    category: "",
    startDate: undefined,
    endDate: undefined,
  });

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
      <TransactionFilters onFilterChange={setFilters} />
      <TransactionDataTable filters={filters} />
    </div>
  );
} 