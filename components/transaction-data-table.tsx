"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatRupiah } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { MoreHorizontal, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface TransactionDataTableProps {
  filters: {
    search: string;
    type: string;
    category: string;
    dateRange?: {
      from: Date;
      to: Date;
    };
  };
}

async function fetchTransactions(filters: TransactionDataTableProps["filters"]) {
  const params = new URLSearchParams();
  if (filters.search) params.append("search", filters.search);
  if (filters.type) params.append("type", filters.type);
  if (filters.category) params.append("category", filters.category);
  if (filters.dateRange?.from) params.append("from", filters.dateRange.from.toISOString());
  if (filters.dateRange?.to) params.append("to", filters.dateRange.to.toISOString());

  const response = await fetch(`/api/transactions?${params.toString()}`);
  if (!response.ok) throw new Error("Failed to fetch transactions");
  const data = await response.json();
  return data.data || [];
}

async function deleteTransaction(id: string) {
  const response = await fetch(`/api/transactions/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete transaction");
  return response.json();
}

async function deleteMultipleTransactions(ids: string[]) {
  const response = await fetch("/api/transactions/bulk-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) throw new Error("Failed to delete transactions");
  return response.json();
}

export function TransactionDataTable({ filters }: TransactionDataTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: transactions = [], isLoading } = useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => fetchTransactions(filters),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaksi berhasil dihapus");
    },
    onError: () => {
      toast.error("Gagal menghapus transaksi");
    },
  });

  const bulkDeleteMutation = useMutation({
    mutationFn: deleteMultipleTransactions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setSelectedRows([]);
      toast.success("Transaksi terpilih berhasil dihapus");
    },
    onError: () => {
      toast.error("Gagal menghapus transaksi terpilih");
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(transactions.map((t: any) => t.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (checked: boolean, id: string) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;

    if (window.confirm(`Apakah Anda yakin ingin menghapus ${selectedRows.length} transaksi terpilih?`)) {
      bulkDeleteMutation.mutate(selectedRows);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold">Daftar Transaksi</h2>
        {selectedRows.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={bulkDeleteMutation.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Hapus {selectedRows.length} Transaksi
          </Button>
        )}
      </div>

      <div className="rounded-lg ">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.length === transactions.length}
                  onCheckedChange={(checked: boolean) => handleSelectAll(checked)}
                />
              </TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>Pihak Terkait</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead className="text-right">Total</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-4">
                  Tidak ada transaksi
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction: any) => (
                <TableRow key={transaction.id}>
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(transaction.id)}
                      onCheckedChange={(checked: boolean) =>
                        handleSelectRow(checked, transaction.id)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(transaction.date), "d MMMM yyyy", { locale: id })}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>{transaction.relatedParty}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-sm font-normal ${transaction.type === "pemasukan"
                        ? "border bg-green-100 dark:bg-green-500/40"
                        : "bg-red-100 dark:bg-red-500/40"
                        }`}
                    >
                      {transaction.type === "pemasukan" ? "Pemasukan" : "Pengeluaran"}
                    </span>
                  </TableCell>
                  <TableCell className="text-right">
                    <span

                    >
                      {formatRupiah(transaction.amountTotal)}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 