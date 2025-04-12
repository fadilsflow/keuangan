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
import { MasterItemSchema } from "@/lib/validations/master-item";
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
  Pagination, 
  PaginationContent, 
  PaginationEllipsis, 
  PaginationItem,
  PaginationLink, 
  PaginationNext, 
  PaginationPrevious 
} from "@/components/ui/pagination";

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

// Define the pagination response type
interface PaginatedResponse {
  items: MasterItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

// Function to fetch master items
async function fetchMasterItems(search = "", page = 1, limit = 10, type: "income" | "expense" = "expense"): Promise<PaginatedResponse> {
  const searchParams = new URLSearchParams();
  if (search) {
    searchParams.append('search', search);
  }
  searchParams.append('page', page.toString());
  searchParams.append('limit', limit.toString());
  searchParams.append('type', type);
  
  const response = await fetch(`/api/master-items?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch master items");
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

// Format currency
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function MasterItemManagement() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [type, setType] = useState<"income" | "expense">("expense");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedMasterItem, setSelectedMasterItem] = useState<MasterItem | null>(null);
  
  const queryClient = useQueryClient();
  
  // Query to fetch master items
  const { data, isLoading, isError } = useQuery({
    queryKey: ['masterItems', search, page, limit, type],
    queryFn: () => fetchMasterItems(search, page, limit, type)
  });
  
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
      type: type,
    }
  });

  // Form for editing a master item
  const editForm = useForm<z.infer<typeof MasterItemSchema>>({
    resolver: zodResolver(MasterItemSchema),
    defaultValues: {
      name: "",
      description: "",
      defaultPrice: 0,
      type: type,
    }
  });

  // Update form default values when type changes
  useEffect(() => {
    addForm.setValue("type", type);
  }, [type, addForm]);

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

  // Generate pagination links
  function generatePaginationLinks() {
    if (!data?.meta) return null;
    
    const { page: currentPage, totalPages } = data.meta;
    const links = [];
    
    // Previous button
    links.push(
      <PaginationItem key="prev">
        <PaginationPrevious 
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage(Math.max(1, currentPage - 1));
          }}
          aria-disabled={currentPage <= 1}
          style={{ opacity: currentPage <= 1 ? 0.5 : 1, pointerEvents: currentPage <= 1 ? 'none' : 'auto' }}
        />
      </PaginationItem>
    );
    
    // First page
    links.push(
      <PaginationItem key={1}>
        <PaginationLink 
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage(1);
          }}
          isActive={currentPage === 1}
        >
          1
        </PaginationLink>
      </PaginationItem>
    );
    
    // Ellipsis if needed
    if (currentPage > 3) {
      links.push(
        <PaginationItem key="ellipsis1">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Pages around current page
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      if (i <= totalPages && i > 1) {
        links.push(
          <PaginationItem key={i}>
            <PaginationLink 
              href="#"
              onClick={(e) => {
                e.preventDefault();
                setPage(i);
              }}
              isActive={currentPage === i}
            >
              {i}
            </PaginationLink>
          </PaginationItem>
        );
      }
    }
    
    // Ellipsis if needed
    if (currentPage < totalPages - 2) {
      links.push(
        <PaginationItem key="ellipsis2">
          <PaginationEllipsis />
        </PaginationItem>
      );
    }
    
    // Last page if more than 1 page
    if (totalPages > 1) {
      links.push(
        <PaginationItem key={totalPages}>
          <PaginationLink 
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setPage(totalPages);
            }}
            isActive={currentPage === totalPages}
          >
            {totalPages}
          </PaginationLink>
        </PaginationItem>
      );
    }
    
    // Next button
    links.push(
      <PaginationItem key="next">
        <PaginationNext 
          href="#"
          onClick={(e) => {
            e.preventDefault();
            setPage(Math.min(totalPages, currentPage + 1));
          }}
          aria-disabled={currentPage >= totalPages}
          style={{ opacity: currentPage >= totalPages ? 0.5 : 1, pointerEvents: currentPage >= totalPages ? 'none' : 'auto' }}
        />
      </PaginationItem>
    );
    
    return links;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari item master..."
              className="pl-8 w-[300px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="text-sm font-medium">Tipe:</div>
            <select 
              className="p-2 rounded-md border border-input"
              value={type}
              onChange={(e) => setType(e.target.value as "income" | "expense")}
            >
              <option value="expense">Pengeluaran</option>
              <option value="income">Pemasukan</option>
            </select>
          </div>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Tambah Item Master
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Item Master Baru</DialogTitle>
              <DialogDescription>
                Buat item master baru untuk memudahkan pembuatan transaksi.
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

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="text-center py-8 text-destructive">
          Gagal memuat data item master. Silakan coba lagi.
        </div>
      ) : data?.items && data.items.length > 0 ? (
        <>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nama Item</TableHead>
                <TableHead>Harga Default</TableHead>
                <TableHead>Deskripsi</TableHead>
                <TableHead className="w-[150px]">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{formatCurrency(item.defaultPrice)}</TableCell>
                  <TableCell>{item.description || "-"}</TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <Button 
                        variant="outline" 
                        size="icon"
                        onClick={() => handleEditClick(item)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="outline" 
                        size="icon" 
                        className="text-destructive"
                        onClick={() => handleDeleteClick(item)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {/* Pagination */}
          {data.meta.totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination>
                <PaginationContent>
                  {generatePaginationLinks()}
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-8 text-muted-foreground border rounded-md">
          Tidak ada item master ditemukan.
        </div>
      )}

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