"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Search, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { MasterItemSchema } from "@/lib/validations/master-item";
import { z } from "zod";

import { formatRupiah } from "@/lib/utils";

import { PaginatedDataTable } from "./paginated-data-table";

// Define the type for master item
interface MasterItem {
  id: string;
  name: string;
  description?: string;
  defaultPrice: number;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  userId: string;
  type: "income" | "expense";
}

// Add props interface
interface MasterItemManagementProps {
  transactionType: "income" | "expense";
}

// Function to fetch master items
async function fetchMasterItems(
  search = "",
  type: "income" | "expense",
  page = 1,
  pageSize = 10
): Promise<{ data: MasterItem[], meta: { totalItems: number, totalPages: number } }> {
  const searchParams = new URLSearchParams();
  if (search) {
    searchParams.append('search', search);
  }
  searchParams.append('type', type);
  searchParams.append('page', page.toString());
  searchParams.append('pageSize', pageSize.toString());
  
  const response = await fetch(`/api/master-items?${searchParams.toString()}`);
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to fetch master items");
  }
  return response.json();
}

// Function to create a master item
async function createMasterItem(data: z.infer<typeof MasterItemSchema>): Promise<MasterItem> {
  const response = await fetch("/api/master-items", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create master item");
  }
  
  return response.json();
}

// Function to update a master item
async function updateMasterItem(id: string, data: z.infer<typeof MasterItemSchema>): Promise<MasterItem> {
  const response = await fetch(`/api/master-items/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update master item");
  }
  
  return response.json();
}

// Function to delete a master item
async function deleteMasterItem(id: string): Promise<{message: string}> {
  const response = await fetch(`/api/master-items/${id}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete master item");
  }
  
  return response.json();
}

export function MasterItemManagement({ transactionType }: MasterItemManagementProps) {
  const [search, setSearch] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMasterItem, setSelectedMasterItem] = useState<MasterItem | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  const queryClient = useQueryClient();
  
  // Query to fetch master items with filtered data
  const { data, isLoading } = useQuery({
    queryKey: ['masterItems', search, transactionType, currentPage, pageSize],
    queryFn: () => fetchMasterItems(search, transactionType, currentPage, pageSize),
  });
  
  const masterItems = data?.data || [];
  const totalItems = data?.meta?.totalItems || 0;
  const totalPages = data?.meta?.totalPages || 1;
  
  // Mutation to create a master item
  const createMutation = useMutation({
    mutationFn: createMasterItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterItems'] });
      toast.success("Item master berhasil ditambahkan");
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Gagal menambahkan item master: ${error.message}`);
    }
  });
  
  // Mutation to update a master item
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: z.infer<typeof MasterItemSchema> }) => 
      updateMasterItem(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterItems'] });
      toast.success("Item master berhasil diperbarui");
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Gagal memperbarui item master: ${error.message}`);
    }
  });
  
  // Mutation to delete a master item
  const deleteMutation = useMutation({
    mutationFn: deleteMasterItem,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['masterItems'] });
      toast.success("Item master berhasil dihapus");
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Gagal menghapus item master: ${error.message}`);
    }
  });

  // Form for adding a master item
  const addForm = useForm<z.infer<typeof MasterItemSchema>>({
    resolver: zodResolver(MasterItemSchema),
    defaultValues: {
      name: "",
      description: "",
      defaultPrice: 0,
      type: transactionType,
    }
  });

  // Form for editing a master item
  const editForm = useForm<z.infer<typeof MasterItemSchema>>({
    resolver: zodResolver(MasterItemSchema),
    defaultValues: {
      name: "",
      description: "",
      defaultPrice: 0,
      type: transactionType,
    }
  });

  // Update form default values when type changes
  useEffect(() => {
    addForm.setValue("type", transactionType);
  }, [transactionType, addForm]);

  // Handle submitting the add form
  function onAddSubmit(data: z.infer<typeof MasterItemSchema>) {
    createMutation.mutate(data);
  }

  // Handle submitting the edit form
  function onEditSubmit(data: z.infer<typeof MasterItemSchema>) {
    if (selectedMasterItem) {
      updateMutation.mutate({ id: selectedMasterItem.id, data });
    }
  }

  // Handle opening the edit dialog
  function handleEditClick(masterItem: MasterItem) {
    setSelectedMasterItem(masterItem);
    editForm.reset({
      name: masterItem.name,
      description: masterItem.description || "",
      defaultPrice: masterItem.defaultPrice,
      type: masterItem.type as "income" | "expense",
    });
    setIsEditDialogOpen(true);
  }

  // Handle opening the delete dialog
  function handleDeleteClick(masterItem: MasterItem) {
    setSelectedMasterItem(masterItem);
    setIsDeleteDialogOpen(true);
  }

  // Handle confirming deletion
  function handleConfirmDelete() {
    if (selectedMasterItem) {
      deleteMutation.mutate(selectedMasterItem.id);
    }
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  // Reset pagination when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [search, transactionType]);

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-center flex-wrap sm:flex-nowrap">
        <div className="relative w-full sm:w-auto flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder={`Cari item ${transactionType === "income" ? "pemasukan" : "pengeluaran"}...`}
            className="pl-8 w-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-1 h-4 w-4" />
              Tambah Item {transactionType === "income" ? "Pemasukan" : "Pengeluaran"}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Item Master Baru</DialogTitle>
              <DialogDescription>
                Buat item master baru untuk {transactionType === "income" ? "pemasukan" : "pengeluaran"}.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Item</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Masukkan nama item" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="defaultPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Harga Default</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          {...field} 
                          onChange={(e) => field.onChange(Number(e.target.value))}
                          placeholder="Masukkan harga default" 
                        />
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
                      <FormLabel>Deskripsi (Opsional)</FormLabel>
                      <FormControl>
                        <Textarea {...field} placeholder="Masukkan deskripsi item" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem className="hidden">
                      <FormControl>
                        <input type="hidden" {...field} value={transactionType} />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createMutation.isPending}
                  >
                    {createMutation.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : "Simpan"}
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      <PaginatedDataTable
        data={masterItems}
        totalItems={totalItems}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        pageSize={pageSize}
        isLoading={isLoading}
        emptyMessage={`Tidak ada item ${transactionType === "income" ? "pemasukan" : "pengeluaran"}`}
        columns={[
          { header: "Nama", key: "name" },
          { header: "Tipe", key: (item) => (
            <span>
              {item.type === "income" ? "Pemasukan" : "Pengeluaran"}
            </span>
          )},
          { 
            header: "Harga Default", 
            key: (item) => (
              <span>
                {formatRupiah(item.defaultPrice)}
              </span>
            ),
            isCurrency: true
          },
          { header: "Deskripsi", key: "description" },
          { header: "Aksi", key: (item) => (
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleEditClick(item)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDeleteClick(item)}
                className="text-red-500"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        ]}
      />

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Item Master</DialogTitle>
            <DialogDescription>
              Perbarui informasi item master.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Item</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Masukkan nama item" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="defaultPrice"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Harga Default</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        {...field} 
                        onChange={(e) => field.onChange(Number(e.target.value))}
                        placeholder="Masukkan harga default" 
                      />
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
                    <FormLabel>Deskripsi (Opsional)</FormLabel>
                    <FormControl>
                      <Textarea {...field} placeholder="Masukkan deskripsi item" />
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
                    <FormLabel>Tipe</FormLabel>
                    <FormControl>
                      <select 
                        className="w-full p-2 rounded-md border border-input"
                        {...field}
                      >
                        <option value="expense">Pengeluaran</option>
                        <option value="income">Pemasukan</option>
                      </select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="submit" 
                  disabled={updateMutation.isPending}
                >
                  {updateMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memperbarui...
                    </>
                  ) : "Perbarui"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Konfirmasi Penghapusan</DialogTitle>
            <DialogDescription>
              Apakah Anda yakin ingin menghapus item master ini? Tindakan ini tidak dapat dibatalkan.
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
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Menghapus...
                </>
              ) : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
} 