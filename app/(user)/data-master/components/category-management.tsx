"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CategorySchema } from "@/lib/validations/category";
import { z } from "zod";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginatedDataTable } from "./paginated-data-table";

// Define the type for category
interface Category {
  id: string;
  name: string;
  description?: string;
  type: "income" | "expense";
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  userId: string;
}

// Function to fetch categories
async function fetchCategories(
  search = "", 
  type: "income" | "expense" = "expense",
  page = 1,
  pageSize = 10
): Promise<{ data: Category[], meta: { totalItems: number, totalPages: number } }> {
  const searchParams = new URLSearchParams();
  if (search) {
    searchParams.append('search', search);
  }
  searchParams.append('type', type);
  searchParams.append('page', page.toString());
  searchParams.append('pageSize', pageSize.toString());
  
  const response = await fetch(`/api/categories?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
}

// Function to create a category
async function createCategory(data: z.infer<typeof CategorySchema>): Promise<Category> {
  const response = await fetch("/api/categories", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create category");
  }
  
  return response.json();
}

// Function to update a category
async function updateCategory(id: string, data: z.infer<typeof CategorySchema>): Promise<Category> {
  const response = await fetch(`/api/categories/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update category");
  }
  
  return response.json();
}

// Function to delete a category
async function deleteCategory(id: string): Promise<{message: string}> {
  const response = await fetch(`/api/categories/${id}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete category");
  }
  
  return response.json();
}

export function CategoryManagement() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense"); // Default to expense
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  const queryClient = useQueryClient();
  
  // Query to fetch categories
  const { data, isLoading, isError } = useQuery({
    queryKey: ['categories', search, type, currentPage, pageSize],
    queryFn: () => fetchCategories(search, type, currentPage, pageSize)
  });
  
  const categories = data?.data || [];
  const totalItems = data?.meta?.totalItems || 0;
  const totalPages = data?.meta?.totalPages || 1;
  
  // Mutation to create a category
  const createMutation = useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Kategori berhasil ditambahkan");
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Gagal menambahkan kategori: ${error.message}`);
    }
  });
  
  // Mutation to update a category
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: z.infer<typeof CategorySchema> }) => 
      updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Kategori berhasil diperbarui");
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Gagal memperbarui kategori: ${error.message}`);
    }
  });
  
  // Mutation to delete a category
  const deleteMutation = useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      toast.success("Kategori berhasil dihapus");
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Gagal menghapus kategori: ${error.message}`);
    }
  });

  // Form for adding a category
  const addForm = useForm<z.infer<typeof CategorySchema>>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: "",
      description: "",
      type: type,
    }
  });

  // Form for editing a category
  const editForm = useForm<z.infer<typeof CategorySchema>>({
    resolver: zodResolver(CategorySchema),
    defaultValues: {
      name: "",
      description: "",
      type: type,
    }
  });

  // Update form default values when type changes
  useEffect(() => {
    addForm.setValue("type", type);
  }, [type, addForm]);

  // Handle submitting the add form
  function onAddSubmit(data: z.infer<typeof CategorySchema>) {
    createMutation.mutate(data);
  }

  // Handle submitting the edit form
  function onEditSubmit(data: z.infer<typeof CategorySchema>) {
    if (selectedCategory) {
      updateMutation.mutate({ id: selectedCategory.id, data });
    }
  }

  // Handle opening the edit dialog
  function handleEditClick(category: Category) {
    setSelectedCategory(category);
    editForm.reset({
      name: category.name,
      description: category.description || "",
      type: category.type,
    });
    setIsEditDialogOpen(true);
  }

  // Handle opening the delete dialog
  function handleDeleteClick(category: Category) {
    setSelectedCategory(category);
    setIsDeleteDialogOpen(true);
  }

  // Handle confirming deletion
  function handleConfirmDelete() {
    if (selectedCategory) {
      deleteMutation.mutate(selectedCategory.id);
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, type]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
        <div className="relative w-full sm:w-auto flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Cari kategori..."
            className="pl-8 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Select
          value={type}
          onValueChange={(value) => setType(value as "income" | "expense")}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Pilih Jenis" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="income">Pemasukan</SelectItem>
            <SelectItem value="expense">Pengeluaran</SelectItem>
          </SelectContent>
        </Select>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-1 h-4 w-4" />
              Tambah Kategori
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Kategori</DialogTitle>
              <DialogDescription>
                Tambahkan kategori baru untuk transaksi {type === "income" ? "pemasukan" : "pengeluaran"}.
              </DialogDescription>
            </DialogHeader>
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                <FormField
                  control={addForm.control}
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
                  control={addForm.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Deskripsi</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Deskripsi kategori" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={addForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jenis</FormLabel>
                      <Select
                        defaultValue={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih jenis kategori" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="income">Pemasukan</SelectItem>
                          <SelectItem value="expense">Pengeluaran</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <DialogFooter>
                  <Button type="submit" disabled={createMutation.isPending}>
                    {createMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Simpan
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <PaginatedDataTable
        data={categories}
        totalItems={totalItems}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        pageSize={pageSize}
        isLoading={isLoading}
        emptyMessage={`Tidak ada kategori ${type === "income" ? "pemasukan" : "pengeluaran"}`}
        columns={[
          { header: "Nama", key: "name" },
          { header: "Deskripsi", key: "description" },
          { header: "Jenis", key: (category) => (
            <span>
              {category.type === "income" ? "Pemasukan" : "Pengeluaran"}
            </span>
          )},
          { header: "Aksi", key: (category) => (
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleEditClick(category)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDeleteClick(category)}
                className="text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        ]}
      />

      {/* Edit dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Kategori</DialogTitle>
            <DialogDescription>
              Edit kategori untuk transaksi {selectedCategory?.type === "income" ? "pemasukan" : "pengeluaran"}.
            </DialogDescription>
          </DialogHeader>
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
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
                control={editForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deskripsi</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Deskripsi kategori" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={editForm.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Jenis</FormLabel>
                    <Select
                      defaultValue={field.value}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Pilih jenis kategori" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="income">Pemasukan</SelectItem>
                        <SelectItem value="expense">Pengeluaran</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter>
                <Button type="submit" disabled={updateMutation.isPending}>
                  {updateMutation.isPending && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Simpan
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Hapus Kategori</DialogTitle>
            <DialogDescription>
              Anda yakin ingin menghapus kategori "{selectedCategory?.name}"?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteDialogOpen(false)}
            >
              Batal
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleConfirmDelete}
              disabled={deleteMutation.isPending}
            >
              {deleteMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Hapus
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 