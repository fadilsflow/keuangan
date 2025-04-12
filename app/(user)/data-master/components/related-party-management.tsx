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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
async function fetchRelatedParties(search = "", type: "income" | "expense" = "expense"): Promise<RelatedParty[]> {
  const searchParams = new URLSearchParams();
  if (search) {
    searchParams.append('search', search);
  }
  searchParams.append('type', type);
  
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
  
  const queryClient = useQueryClient();
  
  // Query to fetch related parties
  const { data: relatedParties, isLoading, isError } = useQuery({
    queryKey: ['relatedParties', search, type],
    queryFn: () => fetchRelatedParties(search, type)
  });
  
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

  return (
    <div className="space-y-4">
      <div className="flex justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Cari pihak terkait..."
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

      {isLoading ? (
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : isError ? (
        <div className="text-center py-8 text-destructive">
          Gagal memuat data pihak terkait. Silakan coba lagi.
        </div>
      ) : relatedParties && relatedParties.length > 0 ? (
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama Pihak Terkait</TableHead>
              <TableHead>Info Kontak</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead className="w-[150px]">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {relatedParties.map((party) => (
              <TableRow key={party.id}>
                <TableCell className="font-medium">{party.name}</TableCell>
                <TableCell>{party.contactInfo || "-"}</TableCell>
                <TableCell>{party.description || "-"}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon"
                      onClick={() => handleEditClick(party)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      className="text-destructive"
                      onClick={() => handleDeleteClick(party)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      ) : (
        <div className="text-center py-8 text-muted-foreground border rounded-md">
          Tidak ada pihak terkait ditemukan.
        </div>
      )}

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