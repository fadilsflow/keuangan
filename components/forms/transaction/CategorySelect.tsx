"use client";

import { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { CategorySchema } from "@/lib/validations/category";
import { CreateTransactionDTO } from "@/lib/validations/transaction";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
}

interface CategorySelectProps {
  form: UseFormReturn<CreateTransactionDTO>;
  transactionType: "pemasukan" | "pengeluaran";
}

export function CategorySelect({ form, transactionType }: CategorySelectProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Category form
  const categoryForm = useForm<z.infer<typeof CategorySchema>>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: "",
      description: "",
      type: transactionType === "pemasukan" ? "income" : "expense",
    },
  });

  // Fetch categories
  const { data, isLoading } = useQuery({
    queryKey: [
      "categories",
      "",
      transactionType === "pemasukan" ? "income" : "expense",
    ],
    queryFn: async () => {
      const apiType = transactionType === "pemasukan" ? "income" : "expense";
      const response = await fetch(`/api/categories/all?type=${apiType}`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      const responseData = await response.json();
      return responseData.data || responseData || [];
    },
  });

  // Access categories safely
  const categories = data?.data || data || [];

  // Create category mutation
  const createCategory = useMutation({
    mutationFn: async (data: z.infer<typeof CategorySchema>) => {
      const response = await fetch("/api/categories", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create category");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      toast.success("Kategori berhasil ditambahkan");
      form.setValue("categoryId", data.id, { shouldValidate: true });
      setDialogOpen(false);
      categoryForm.reset({
        name: "",
        description: "",
        type: transactionType === "pemasukan" ? "income" : "expense",
      });
    },
    onError: (error: Error) => {
      toast.error(`Gagal menambahkan kategori: ${error.message}`);
    },
  });

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await createCategory.mutateAsync(categoryForm.getValues());
    } catch (error) {
      // Error is handled by the mutation's onError
      toast.error("Gagal menambahkan kategori");
      console.log(error);
    }
  };

  const selectCategory = (categoryId: string) => {
    if (categories) {
      const selectedCategory = categories.find(
        (category: Category) => category.id === categoryId
      );
      if (selectedCategory) {
        form.setValue("categoryId", selectedCategory.id, {
          shouldValidate: true,
        });
      }
    }
  };

  return (
    <FormField
      control={form.control}
      name="categoryId"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="font-semibold">Kategori</FormLabel>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <Select value={field.value} onValueChange={selectCategory}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kategori">
                    {field.value && categories
                      ? categories.find((c: Category) => c.id === field.value)
                          ?.name
                      : "Pilih kategori"}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {isLoading ? (
                  <SelectItem value="loading" disabled>
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Loading...
                    </div>
                  </SelectItem>
                ) : categories && categories.length > 0 ? (
                  categories.map((category: Category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-categories" disabled>
                    Tidak ada kategori
                  </SelectItem>
                )}
                <div className="border-t border-border mt-2 pt-2">
                  <DialogTrigger asChild>
                    <Button
                      type="button"
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        categoryForm.reset({
                          name: "",
                          description: "",
                          type:
                            transactionType === "pemasukan"
                              ? "income"
                              : "expense",
                        });
                        setDialogOpen(true);
                      }}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Tambah Kategori Baru
                    </Button>
                  </DialogTrigger>
                </div>
              </SelectContent>
            </Select>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Tambah Kategori Baru</DialogTitle>
                <DialogDescription>
                  Tambahkan kategori baru untuk transaksi{" "}
                  {transactionType === "pemasukan"
                    ? "pemasukan"
                    : "pengeluaran"}
                </DialogDescription>
              </DialogHeader>
              <Form {...categoryForm}>
                <form onSubmit={handleCreateCategory} className="space-y-4">
                  <FormField
                    control={categoryForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nama Kategori</FormLabel>
                        <FormControl>
                          <Input placeholder="Nama kategori" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={categoryForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deskripsi</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Deskripsi kategori"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={createCategory.isPending}
                    className="w-full"
                  >
                    {createCategory.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Tambah Kategori
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
