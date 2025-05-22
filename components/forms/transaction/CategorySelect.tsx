"use client"

import { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { CategorySchema } from "@/lib/validations/category";
import { CreateTransactionDTO } from "@/lib/validations/transaction";
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
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
    }
  });

  // Fetch categories
  const { data, isLoading } = useQuery({
    queryKey: ['categories', "", transactionType === "pemasukan" ? "income" : "expense"],
    queryFn: async () => {
      const apiType = transactionType === "pemasukan" ? "income" : "expense";
      const response = await fetch(`/api/categories?type=${apiType}`);
      if (!response.ok) throw new Error("Failed to fetch categories");
      const responseData = await response.json();
      // Return an empty array as default if data is undefined
      return responseData.data || responseData || [];
    }
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
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Kategori berhasil ditambahkan");
      form.setValue("category", data.name);
      setDialogOpen(false);
      categoryForm.reset({
        name: "",
        description: "",
        type: transactionType === "pemasukan" ? "income" : "expense",
      });
    },
    onError: (error: Error) => {
      toast.error(`Gagal menambahkan kategori: ${error.message}`);
    }
  });

  const onSubmit = async (values: z.infer<typeof CategorySchema>) => {
    await createCategory.mutateAsync(values);
  };

  return (
    <FormField
      control={form.control}
      name="category"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="font-semibold">Kategori</FormLabel>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih kategori" />
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
                    <SelectItem key={category.id} value={category.name}>
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
                          type: transactionType === "pemasukan" ? "income" : "expense",
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
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Tambah Kategori Baru</DialogTitle>
                <DialogDescription>
                  Tambahkan kategori baru untuk transaksi {transactionType}
                </DialogDescription>
              </DialogHeader>
              <Form {...categoryForm}>
                <form onSubmit={categoryForm.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="space-y-4">
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
                          <FormLabel>Deskripsi (Opsional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Deskripsi kategori" 
                              className="min-h-[100px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <input type="hidden" {...categoryForm.register("type")} />
                  </div>
                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      disabled={createCategory.isPending}
                      className="w-full sm:w-auto"
                    >
                      {createCategory.isPending ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Menyimpan...
                        </>
                      ) : (
                        "Simpan"
                      )}
                    </Button>
                  </div>
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