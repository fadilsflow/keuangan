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
import { RelatedPartySchema } from "@/lib/validations/related-party";
import { z } from "zod";


import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PaginatedDataTable } from "./paginated-data-table";

// Define the type for related party
interface RelatedParty {
  id: string;
  name: string;
  description?: string;
  contactInfo?: string;
  type: "income" | "expense";
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  userId: string;
}

// Function to fetch related parties
async function fetchRelatedParties(
  search = "", 
  type: "income" | "expense" = "expense",
  page = 1,
  pageSize = 10
): Promise<{ data: RelatedParty[], meta: { totalItems: number, totalPages: number } }> {
  const searchParams = new URLSearchParams();
  if (search) {
    searchParams.append('search', search);
  }
  searchParams.append('type', type);
  searchParams.append('page', page.toString());
  searchParams.append('pageSize', pageSize.toString());
  
  const response = await fetch(`/api/related-parties?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch related parties");
  }
  return response.json();
}

// Function to create a related party
async function createRelatedParty(data: z.infer<typeof RelatedPartySchema>): Promise<RelatedParty> {
  const response = await fetch("/api/related-parties", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to create related party");
  }
  
  return response.json();
}

// Function to update a related party
async function updateRelatedParty(id: string, data: z.infer<typeof RelatedPartySchema>): Promise<RelatedParty> {
  const response = await fetch(`/api/related-parties/${id}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to update related party");
  }
  
  return response.json();
}

// Function to delete a related party
async function deleteRelatedParty(id: string): Promise<{message: string}> {
  const response = await fetch(`/api/related-parties/${id}`, {
    method: "DELETE",
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || "Failed to delete related party");
  }
  
  return response.json();
}

export function RelatedPartyManagement() {
  const [search, setSearch] = useState("");
  const [type, setType] = useState<"income" | "expense">("expense"); // Default to expense
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedRelatedParty, setSelectedRelatedParty] = useState<RelatedParty | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10;
  
  const queryClient = useQueryClient();
  
  // Query to fetch related parties
  const { data, isLoading } = useQuery({
    queryKey: ['relatedParties', search, type, currentPage, pageSize],
    queryFn: () => fetchRelatedParties(search, type, currentPage, pageSize)
  });
  
  const relatedParties = data?.data || [];
  const totalItems = data?.meta?.totalItems || 0;
  const totalPages = data?.meta?.totalPages || 1;
  
  // Mutation to create a related party
  const createMutation = useMutation({
    mutationFn: createRelatedParty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relatedParties'] });
      toast.success("Pihak terkait berhasil ditambahkan");
      setIsAddDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Gagal menambahkan pihak terkait: ${error.message}`);
    }
  });
  
  // Mutation to update a related party
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: z.infer<typeof RelatedPartySchema> }) => 
      updateRelatedParty(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relatedParties'] });
      toast.success("Pihak terkait berhasil diperbarui");
      setIsEditDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Gagal memperbarui pihak terkait: ${error.message}`);
    }
  });
  
  // Mutation to delete a related party
  const deleteMutation = useMutation({
    mutationFn: deleteRelatedParty,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relatedParties'] });
      toast.success("Pihak terkait berhasil dihapus");
      setIsDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast.error(`Gagal menghapus pihak terkait: ${error.message}`);
    }
  });

  // Form for adding a related party
  const addForm = useForm<z.infer<typeof RelatedPartySchema>>({
    resolver: zodResolver(RelatedPartySchema),
    defaultValues: {
      name: "",
      description: "",
      contactInfo: "",
      type: type,
    }
  });

  // Form for editing a related party
  const editForm = useForm<z.infer<typeof RelatedPartySchema>>({
    resolver: zodResolver(RelatedPartySchema),
    defaultValues: {
      name: "",
      description: "",
      contactInfo: "",
      type: type,
    }
  });

  // Update form default values when type changes
  useEffect(() => {
    addForm.setValue("type", type);
  }, [type, addForm]);

  // Handle submitting the add form
  function onAddSubmit(data: z.infer<typeof RelatedPartySchema>) {
    createMutation.mutate(data);
  }

  // Handle submitting the edit form
  function onEditSubmit(data: z.infer<typeof RelatedPartySchema>) {
    if (selectedRelatedParty) {
      updateMutation.mutate({ id: selectedRelatedParty.id, data });
    }
  }

  // Handle opening the edit dialog
  function handleEditClick(relatedParty: RelatedParty) {
    setSelectedRelatedParty(relatedParty);
    editForm.reset({
      name: relatedParty.name,
      description: relatedParty.description || "",
      contactInfo: relatedParty.contactInfo || "",
      type: relatedParty.type,
    });
    setIsEditDialogOpen(true);
  }

  // Handle opening the delete dialog
  function handleDeleteClick(relatedParty: RelatedParty) {
    setSelectedRelatedParty(relatedParty);
    setIsDeleteDialogOpen(true);
  }

  // Handle confirming deletion
  function handleConfirmDelete() {
    if (selectedRelatedParty) {
      deleteMutation.mutate(selectedRelatedParty.id);
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
            placeholder="Cari pihak terkait..."
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
              Tambah Pihak Terkait
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Tambah Pihak Terkait Baru</DialogTitle>
              <DialogDescription>
                Buat pihak terkait baru untuk transaksi Anda.
              </DialogDescription>
            </DialogHeader>
            
            <Form {...addForm}>
              <form onSubmit={addForm.handleSubmit(onAddSubmit)} className="space-y-4">
                <FormField
                  control={addForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Pihak Terkait</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Masukkan nama pihak terkait" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={addForm.control}
                  name="contactInfo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Informasi Kontak (Opsional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Masukkan informasi kontak" />
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
                        <Textarea {...field} placeholder="Masukkan deskripsi pihak terkait" />
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

      <PaginatedDataTable
        data={relatedParties}
        totalItems={totalItems}
        totalPages={totalPages}
        currentPage={currentPage}
        onPageChange={handlePageChange}
        pageSize={pageSize}
        isLoading={isLoading}
        emptyMessage={`Tidak ada pihak terkait ${type === "income" ? "pemasukan" : "pengeluaran"}`}
        columns={[
          { header: "Nama", key: "name" },
          { header: "Tipe", key: (party) => (
            <span>
              {party.type === "income" ? "Pemasukan" : "Pengeluaran"}
            </span>
          )},
          { header: "Alamat", key: "address" },
          { header: "Telepon", key: "phone" },
          { header: "Email", key: "email" },
          { header: "Aksi", key: (party) => (
            <div className="flex gap-2">
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleEditClick(party)}
              >
                <Pencil className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleDeleteClick(party)}
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
            <DialogTitle>Edit Pihak Terkait</DialogTitle>
            <DialogDescription>
              Perbarui informasi pihak terkait.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(onEditSubmit)} className="space-y-4">
              <FormField
                control={editForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Pihak Terkait</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Masukkan nama pihak terkait" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={editForm.control}
                name="contactInfo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Informasi Kontak (Opsional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Masukkan informasi kontak" />
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
                      <Textarea {...field} placeholder="Masukkan deskripsi pihak terkait" />
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
              Apakah Anda yakin ingin menghapus pihak terkait ini? Tindakan ini tidak dapat dibatalkan.
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