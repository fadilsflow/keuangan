"use client"
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { TransactionCreateSchema } from "@/app/api/schemas/transaction.schema";
import type { CreateTransactionDTO } from "@/app/api/types/transaction.types";

const categories = [
  "Bahan Baku",
  "Tenaga Kerja",
  "Overhead",
  "Penjualan",
  "Lainnya",
];

interface TransactionFormProps {
  defaultType?: "pemasukan" | "pengeluaran";
  onSuccess?: () => void;
}

export function TransactionForm({ defaultType = "pengeluaran", onSuccess }: TransactionFormProps) {
  const queryClient = useQueryClient();
  const [items, setItems] = useState([{ name: "", itemPrice: 0, quantity: 1 }]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Format tanggal untuk input datetime-local
  const formatDateForInput = (date: Date) => {
    return date.toISOString().slice(0, 16); // Format: YYYY-MM-DDThh:mm
  };

  const form = useForm<CreateTransactionDTO>({
    resolver: zodResolver(TransactionCreateSchema),
    defaultValues: {
      date: formatDateForInput(new Date()),
      description: "",
      category: "",
      relatedParty: "",
      amountTotal: 0,
      type: "pengeluaran",
      items: items,
    },
  });

  const createTransaction = async (data: CreateTransactionDTO) => {
    console.log("Sending data to API:", data);

    const response = await fetch("/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...data,
        date: new Date(data.date), // Pastikan date dalam format yang benar
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error("API Error:", error);
      throw new Error(error.message || "Failed to create transaction");
    }

    return response.json();
  };

  const mutation = useMutation({
    mutationFn: createTransaction,
    onMutate: (variables) => {
      console.log("Starting mutation with:", variables);
    },
    onSuccess: (data) => {
      console.log("Mutation success:", data);
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaction created successfully");
      form.reset();
      setItems([{ name: "", itemPrice: 0, quantity: 1 }]);
      onSuccess?.();
    },
    onError: (error: Error) => {
      console.error("Mutation error:", error);
      toast.error("Failed to create transaction", {
        description: error.message
      });
    },
  });

  const addItem = () => {
    setItems([...items, { name: "", itemPrice: 0, quantity: 1 }]);
  };

  const removeItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + (item.itemPrice * item.quantity), 0);
  };

  const updateItem = (index: number, field: keyof typeof items[0], value: any) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);

    // Update form values
    form.setValue("items", newItems);
    form.setValue("amountTotal", calculateTotal());
  };

  const onSubmit = async (data: CreateTransactionDTO) => {
    try {
      setIsSubmitting(true);

      // Validasi items
      if (items.some(item => !item.name || item.itemPrice <= 0)) {
        toast.error("Please fill all item details correctly");
        return;
      }

      // Persiapkan data
      const submitData = {
        ...data,
        amountTotal: calculateTotal(),
        items: items.map(item => ({
          name: item.name,
          itemPrice: item.itemPrice,
          quantity: item.quantity
        }))
      };

      console.log("Submitting data:", submitData);

      // Submit data
      mutation.mutate(submitData);
    } catch (error) {
      console.error("Submit error:", error);
      toast.error("Error submitting form");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date</FormLabel>
                <FormControl>
                  <Input
                    type="datetime-local"
                    {...field}
                    value={formatDateForInput(
                      field.value instanceof Date ? field.value : new Date(field.value)
                    )}
                    onChange={(e) => {
                      const date = new Date(e.target.value);
                      if (!isNaN(date.getTime())) {
                        field.onChange(date);
                      }
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Jenis Transaksi</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih jenis transaksi" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="pemasukan">Pemasukan</SelectItem>
                    <SelectItem value="pengeluaran">Pengeluaran</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Category</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="relatedParty"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pihak Terkait</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="paymentImg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Payment Image URL</FormLabel>
                <FormControl>
                  <Input {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Items</h3>
            <Button type="button" onClick={addItem} variant="outline" size="sm">
              <Plus className="w-4 h-4 mr-2" />
              Add Item
            </Button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-4 gap-4 items-end">
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input
                    value={item.name}
                    onChange={(e) => updateItem(index, "name", e.target.value)}
                    required
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel>Price</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={item.itemPrice}
                    onChange={(e) => updateItem(index, "itemPrice", Number(e.target.value))}
                    required
                    min="0"
                  />
                </FormControl>
              </FormItem>

              <FormItem>
                <FormLabel>Quantity</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    value={item.quantity}
                    onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                    required
                    min="1"
                  />
                </FormControl>
              </FormItem>

              <Button
                type="button"
                variant="destructive"
                size="icon"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>

        <div className="flex justify-between items-center">
          <div className="text-lg font-semibold">
            Total: {calculateTotal().toLocaleString()}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting || mutation.isPending}
            className="w-full md:w-auto"
          >
            {(isSubmitting || mutation.isPending) ? (
              <>
                <span className="loading loading-spinner"></span>
                Creating...
              </>
            ) : (
              "Create Transaction"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
} 