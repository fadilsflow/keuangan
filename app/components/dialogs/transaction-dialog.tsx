"use client";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TransactionForm } from "@/app/components/forms/TransactionForm";

interface TransactionDialogProps {
  isOpen: boolean;
  onClose: () => void;
  type: "income" | "expense";
}

export function TransactionDialog({ isOpen, onClose, type }: TransactionDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>
            {type === "income" ? "Buat Transaksi Pemasukan" : "Buat Transaksi Pengeluaran"}
          </DialogTitle>
        </DialogHeader>
        <TransactionForm defaultType={type} onSuccess={onClose} />
      </DialogContent>
    </Dialog>
  );
} 