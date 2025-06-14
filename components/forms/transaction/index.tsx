"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Loader2 } from "lucide-react";
import {
  CreateTransactionDTO,
  TransactionCreateSchema,
} from "@/lib/validations/transaction";
import { formatDateForInput } from "@/lib/utils";
import { TransactionBasicInfo } from "./TransactionBasicInfo";
import { CategorySelect } from "./CategorySelect";
import { RelatedPartySelect } from "./RelatedPartySelect";
import { TransactionItems } from "./TransactionItems";
import { Skeleton } from "@/components/ui/skeleton";

interface TransactionItem {
  id?: string;
  name: string;
  itemPrice: number;
  quantity: number;
  totalPrice: number;
  transactionId?: string;
  masterItemId?: string;
}

interface TransactionFormProps {
  defaultValues?: any;
  defaultType?: "pemasukan" | "pengeluaran";
  mode?: "create" | "edit";
  onSuccess?: () => void;
  isLoading?: boolean;
}

async function createTransaction(data: CreateTransactionDTO) {
  const response = await fetch("/api/transactions", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...data,
      date: new Date(data.date),
    }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || "Failed to create transaction");
  }

  return response.json();
}

export function TransactionForm({
  defaultValues,
  defaultType = "pengeluaran",
  mode = "create",
  onSuccess,
  isLoading,
}: TransactionFormProps) {
  const queryClient = useQueryClient();
  const [isInitialized, setIsInitialized] = useState(false);
  const [transactionType, setTransactionType] = useState<
    "pemasukan" | "pengeluaran"
  >(defaultValues?.type || defaultType);
  const [items, setItems] = useState<TransactionItem[]>(() => {
    if (defaultValues?.items && defaultValues.items.length > 0) {
      return defaultValues.items.map((item: TransactionItem) => ({
        id: item.id || undefined,
        name: item.name || "",
        itemPrice: Number(item.itemPrice) || 0,
        quantity: Number(item.quantity) || 1,
        totalPrice: Number(item.totalPrice) || 0,
        transactionId: item.transactionId || undefined,
        masterItemId: item.masterItemId || undefined,
      }));
    }
    return [{ name: "", itemPrice: 0, quantity: 1, totalPrice: 0 }];
  });

  const form = useForm<CreateTransactionDTO>({
    resolver: zodResolver(TransactionCreateSchema),
    defaultValues: {
      date: defaultValues?.date
        ? formatDateForInput(new Date(defaultValues.date))
        : formatDateForInput(new Date()),
      description: defaultValues?.description || "",
      categoryId: defaultValues?.categoryId || "",
      relatedPartyId: defaultValues?.relatedPartyId || "",
      amountTotal: defaultValues?.amountTotal || 0,
      type: defaultValues?.type || defaultType,
      paymentImg: defaultValues?.paymentImg || "",
      items: items,
      ...(defaultValues?.id && { id: defaultValues.id }),
    },
  });

  // Reset form when defaultValues change (for edit mode mainly)
  useEffect(() => {
    if (defaultValues && !isInitialized) {
      const formattedItems = defaultValues.items?.map(
        (item: TransactionItem) => {
          return {
            id: item.id || undefined,
            name: item.name || "",
            itemPrice: Number(item.itemPrice) || 0,
            quantity: Number(item.quantity) || 1,
            totalPrice: Number(item.totalPrice) || 0,
            transactionId: item.transactionId || undefined,
            masterItemId: item.masterItemId || undefined,
          };
        }
      ) || [{ name: "", itemPrice: 0, quantity: 1, totalPrice: 0 }];

      const resetValues = {
        date: defaultValues?.date
          ? formatDateForInput(new Date(defaultValues.date))
          : formatDateForInput(new Date()),
        description: defaultValues?.description || "",
        categoryId: defaultValues?.categoryId || "",
        relatedPartyId: defaultValues?.relatedPartyId || "",
        amountTotal: defaultValues?.amountTotal || 0,
        type: defaultValues?.type || defaultType,
        paymentImg: defaultValues?.paymentImg || "",
        items: formattedItems,
        ...(defaultValues?.id && { id: defaultValues.id }),
      };

      form.reset(resetValues);
      setTransactionType(resetValues.type as "pemasukan" | "pengeluaran");
      setItems(formattedItems);

      // Force update the select fields
      if (resetValues.categoryId) {
        form.setValue("categoryId", resetValues.categoryId, {
          shouldValidate: true,
        });
      }
      if (resetValues.relatedPartyId) {
        form.setValue("relatedPartyId", resetValues.relatedPartyId, {
          shouldValidate: true,
        });
      }

      setIsInitialized(true);
    }
  }, [defaultValues, form, defaultType, isInitialized]);

  const updateTransaction = async (data: CreateTransactionDTO) => {
    if (!defaultValues?.id)
      throw new Error("Transaction ID is required for update");

    const response = await fetch(`/api/transactions/${defaultValues.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        date: new Date(data.date),
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to update transaction");
    }

    return response.json();
  };

  const mutation = useMutation({
    mutationFn: mode === "edit" ? updateTransaction : createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success(
        mode === "edit"
          ? "Transaksi berhasil diperbarui"
          : "Transaksi berhasil dibuat"
      );
      if (mode === "create") {
        form.reset({
          date: formatDateForInput(new Date()),
          description: "",
          categoryId: "",
          relatedPartyId: "",
          amountTotal: 0,
          type: defaultType,
          paymentImg: "",
          items: [{ name: "", itemPrice: 0, quantity: 1, totalPrice: 0 }],
        });
        setItems([{ name: "", itemPrice: 0, quantity: 1, totalPrice: 0 }]);
        setTransactionType(defaultType);
      }
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(
        mode === "edit"
          ? "Gagal memperbarui transaksi"
          : "Gagal membuat transaksi",
        { description: error.message }
      );
    },
  });

  const onSubmit = async (data: CreateTransactionDTO) => {
    try {
      const submitData = {
        ...data,
        amountTotal: items.reduce(
          (sum, item) => sum + item.itemPrice * item.quantity,
          0
        ),
        items: items.map((item) => ({
          ...(item.id && { id: item.id }),
          name: item.name,
          itemPrice: item.itemPrice,
          quantity: item.quantity,
          totalPrice: item.itemPrice * item.quantity,
          ...(item.masterItemId && { masterItemId: item.masterItemId }),
        })),
      };
      if (!submitData.items) {
        submitData.items = [];
      }
      mutation.mutate(submitData);
    } catch (error) {
      toast.error("Error submitting form");
      console.error(error);
    }
  };

  if (isLoading) {
    return <Skeleton className="h-screen w-full border" />;
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="space-y-8 p-6 bg-card rounded-lg border shadow-sm">
          <TransactionBasicInfo
            form={form}
            onTypeChange={(type) => {
              setTransactionType(type);
              form.setValue("type", type);
            }}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <CategorySelect form={form} transactionType={transactionType} />
            <RelatedPartySelect form={form} transactionType={transactionType} />
          </div>

          <TransactionItems
            form={form}
            items={items}
            setItems={setItems}
            transactionType={transactionType}
          />

          <div className="flex justify-end">
            <Button
              type="submit"
              disabled={mutation.isPending}
              className="w-full md:w-auto"
            >
              {mutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              {mode === "edit" ? "Update Transaksi" : "Buat Transaksi"}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
