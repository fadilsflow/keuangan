"use client"

import { useQuery } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { TransactionForm } from "@/components/forms/TransactionForm"
import { ErrorBoundary } from "@/app/components/error-boundary"
import { use } from "react"

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

export default function EditTransactionPage({ params }: { params: Promise<{ id: string }> }) {
    const router = useRouter()
    const resolvedParams = use(params)
    const transactionId = resolvedParams.id

    const { data: transaction, isLoading, error } = useQuery({
        queryKey: ["transaction", transactionId],
        queryFn: async () => {
            try {
                const response = await fetch(`/api/transactions/${transactionId}`)
                if (!response.ok) {
                    throw new Error("Failed to fetch transaction")
                }
                const data = await response.json()
                if (!data) {
                    throw new Error("Transaction not found")
                }
                // Format date untuk form
                return {
                    ...data,
                    date: new Date(data.date).toISOString().slice(0, 16),
                    items: data.items.map((item: any) => ({
                        ...item,
                        itemPrice: Number(item.itemPrice),
                        quantity: Number(item.quantity),
                        totalPrice: Number(item.totalPrice)
                    }))
                } as Transaction
            } catch (error) {
                console.error("Error fetching transaction:", error)
                throw error
            }
        },
    })

    if (isLoading) {
        return (
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Edit Transaksi</h1>
                </div>
                <div className="rounded-lg border bg-card p-6">
                    <div className="flex items-center justify-center h-32">
                        Loading...
                    </div>
                </div>
            </div>
        )
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
        )
    }

    if (!transaction) {
        return (
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">Edit Transaksi</h1>
                </div>
                <div className="rounded-lg border bg-card p-6">
                    <div className="text-center">
                        Transaction not found
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 px-4 lg:px-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold">Edit Transaksi</h1>
            </div>
            <div className="rounded-lg border bg-card p-6">
                <ErrorBoundary>
                    <TransactionForm
                        defaultValues={transaction}
                        mode="edit"
                        onSuccess={() => router.push("/transactions")}
                    />
                </ErrorBoundary>
            </div>
        </div>
    )
} 