import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { TransactionCreateSchema } from "~/api/schemas/transaction.schema";
import type { z } from "zod";
import { useState } from "react";
import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import { toast } from "sonner";
import { TransactionBasicInfo } from "./TransactionBasicInfo";
import { CategorySelect } from "./CategorySelect";
import { RelatedPartySelect } from "./RelatedPartySelect";
import { TransactionItems } from "./TransactionItems";
import { useMutation } from "@tanstack/react-query";
import { useNavigate } from "@remix-run/react";

type TransactionFormData = z.infer<typeof TransactionCreateSchema>;

interface TransactionFormProps {
  onClose?: () => void;
}

export function TransactionForm({ onClose }: TransactionFormProps) {
  const [transactionType, setTransactionType] = useState<"pemasukan" | "pengeluaran">("pengeluaran");
  const navigate = useNavigate();

  const form = useForm<TransactionFormData>({
    resolver: zodResolver(TransactionCreateSchema),
    defaultValues: {
      type: "pengeluaran",
      items: [],
      amountTotal: 0,
      paymentImg: "",
    },
  });

  const { mutate: createTransaction, isPending } = useMutation({
    mutationFn: async (data: TransactionFormData) => {
      const response = await fetch("/api/transactions", {
        method: "POST",
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Failed to create transaction");
      }
      return response.json();
    },
    onSuccess: () => {
      toast.success("Transaction created successfully");
      onClose?.();
      navigate("/transactions");
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create transaction");
    },
  });

  function onSubmit(data: TransactionFormData) {
    createTransaction(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <TransactionBasicInfo
          form={form}
          onTypeChange={(type) => setTransactionType(type)}
        />

        <div className="space-y-4">
          <CategorySelect form={form} type={transactionType} />
          <RelatedPartySelect form={form} type={transactionType} />
        </div>

        <TransactionItems form={form} type={transactionType} />

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isPending}>
            {isPending ? "Creating..." : "Create Transaction"}
          </Button>
        </div>
      </form>
    </Form>
  );
} 