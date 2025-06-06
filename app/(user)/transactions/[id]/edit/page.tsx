"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { TransactionForm } from "@/components/forms/transaction";
import { use } from "react";
import { ErrorBoundary } from "@/app/components/error-boundary";

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

        return data;
      } catch (error) {
        throw error;
      }
    },
  });

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-destructive text-lg font-medium">
          Gagal memuat transaksi
        </div>
        <div className="text-muted-foreground text-sm">
          {error instanceof Error ? error.message : "Unknown error occurred"}
        </div>
      </div>
    );
  }

  if (!transaction && !isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
        <div className="text-destructive text-lg font-medium">
          Transaksi tidak ditemukan
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-semibold tracking-tight">
              Edit Transaksi
            </h2>
            <p className="text-muted-foreground">
              Edit data transaksi yang sudah ada
            </p>
          </div>
        </div>

        <TransactionForm
          mode="edit"
          defaultValues={transaction}
          defaultType={transaction?.type}
          isLoading={isLoading}
          onSuccess={() => {
            router.push("/transactions");
          }}
        />
      </div>
    </ErrorBoundary>
  );
}
