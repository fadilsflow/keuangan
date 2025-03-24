"use client";

import { useQuery } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatRupiah } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";

async function fetchRecentTransactions() {
  const response = await fetch("/api/transactions/recent");
  if (!response.ok) {
    throw new Error("Failed to fetch transactions");
  }
  return response.json();
}

export function TransactionHistoryTable() {
  const { data: transactions = [] } = useQuery({
    queryKey: ["recentTransactions"],
    queryFn: fetchRecentTransactions,
  });

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Tanggal</TableHead>
            <TableHead>Deskripsi</TableHead>
            <TableHead>Kategori</TableHead>
            <TableHead>Pihak Terkait</TableHead>
            <TableHead>Jenis</TableHead>
            <TableHead className="text-right">Total</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {transactions.map((transaction: any) => (
            <TableRow key={transaction.id}>
              <TableCell>
                {format(new Date(transaction.date), "d MMMM yyyy", { locale: id })}
              </TableCell>
              <TableCell>{transaction.description}</TableCell>
              <TableCell>{transaction.category}</TableCell>
              <TableCell>{transaction.relatedParty}</TableCell>
              <TableCell>
                <span
                  className={
                    transaction.type === "pemasukan"
                      ? "text-green-600 font-medium"
                      : "text-red-600 font-medium"
                  }
                >
                  {transaction.type === "pemasukan" ? "Pemasukan" : "Pengeluaran"}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <span
                  className={
                    transaction.type === "pemasukan"
                      ? "text-green-600 font-medium"
                      : "text-red-600 font-medium"
                  }
                >
                  {formatRupiah(transaction.amountTotal)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
} 