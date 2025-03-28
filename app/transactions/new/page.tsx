"use client";

import { ErrorBoundary } from "@/app/components/error-boundary";
import { TransactionForm } from "@/components/forms/TransactionForm";


export default function NewTransactionPage() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Buat Transaksi Baru</h1>
      </div>
      <div className="rounded-lg border bg-card p-6">
        <ErrorBoundary>
          <TransactionForm mode="create" />
        </ErrorBoundary>
      </div>
    </div>
  );
} 