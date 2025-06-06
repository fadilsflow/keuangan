"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { TransactionForm } from "@/components/forms/TransactionForm";
import { ErrorBoundary } from "@/app/components/error-boundary";
import { use } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  relatedParty: string;
  amountTotal: number;
  type: "pemasukan" | "pengeluaran";
  paymentImg: string;
  items: Array<{
    id: string;
    name: string;
    itemPrice: number;
    quantity: number;
    totalPrice: number;
    transactionId: string;
  }>;
}

export default function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const resolvedParams = use(params);
  const transactionId = resolvedParams.id;

  const {
    data: transaction,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["transaction", transactionId],
    queryFn: async () => {
      try {
        const response = await fetch(`/api/transactions/${transactionId}`);
        if (!response.ok) {
          throw new Error("Failed to fetch transaction");
        }
        const data = await response.json();
        if (!data) {
          throw new Error("Transaction not found");
        }
        // Format date untuk form
        return {
          ...data,
          date: new Date(data.date).toISOString().slice(0, 16),
          items: data.items.map((item: any) => ({
            ...item,
            itemPrice: Number(item.itemPrice),
            quantity: Number(item.quantity),
            totalPrice: Number(item.totalPrice),
          })),
        } as Transaction;
      } catch (error) {
        console.error("Error fetching transaction:", error);
        throw error;
      }
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit Transaksi</h1>
        </div>
        <div className="rounded-lg border bg-card p-6 space-y-6">
          {/* Basic Info Section */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-24" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Transaction Type Section */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </div>

          {/* Items Section */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-20" />
            {Array.from({ length: 2 }).map((_, index) => (
              <div
                key={index}
                className="grid gap-4 md:grid-cols-4 items-center border rounded-lg p-4"
              >
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
            <Skeleton className="h-9 w-[140px]" /> {/* Add Item Button */}
          </div>

          {/* Payment Image Section */}
          <div className="space-y-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-32 w-full max-w-md" />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-4 pt-4">
            <Skeleton className="h-10 w-24" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit Transaksi</h1>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-center text-red-500">
            Error: {(error as Error).message}
          </div>
        </div>
      </div>
    );
  }

  if (!transaction) {
    return (
      <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Edit Transaksi</h1>
        </div>
        <div className="rounded-lg border bg-card p-6">
          <div className="text-center">Transaction not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Edit Transaksi</h1>
      </div>
      <ErrorBoundary>
        <TransactionForm
          defaultValues={transaction}
          mode="edit"
          onSuccess={() => router.push("/transactions")}
        />
      </ErrorBoundary>
    </div>
  );
}
