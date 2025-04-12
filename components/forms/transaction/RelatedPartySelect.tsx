"use client"

import { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { RelatedPartySchema } from "@/lib/validations/related-party";
import { CreateTransactionDTO } from "@/lib/validations/transaction";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

interface RelatedParty {
  id: string;
  name: string;
  type: "income" | "expense";
}

interface RelatedPartySelectProps {
  form: UseFormReturn<CreateTransactionDTO>;
  transactionType: "pemasukan" | "pengeluaran";
}

export function RelatedPartySelect({ form, transactionType }: RelatedPartySelectProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const queryClient = useQueryClient();

  // Related party form
  const relatedPartyForm = useForm<z.infer<typeof RelatedPartySchema>>({
    resolver: zodResolver(RelatedPartySchema),
    defaultValues: {
      name: "",
      description: "",
      contactInfo: "",
      type: transactionType === "pemasukan" ? "income" : "expense",
    }
  });

  // Fetch related parties
  const { data: relatedParties, isLoading } = useQuery({
    queryKey: ['relatedParties', transactionType],
    queryFn: async () => {
      const apiType = transactionType === "pemasukan" ? "income" : "expense";
      const response = await fetch(`/api/related-parties?type=${apiType}`);
      if (!response.ok) throw new Error("Failed to fetch related parties");
      return response.json();
    }
  });

  // Create related party mutation
  const createRelatedParty = useMutation({
    mutationFn: async (data: z.infer<typeof RelatedPartySchema>) => {
      const response = await fetch("/api/related-parties", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create related party");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['relatedParties', transactionType] });
      toast.success("Pihak terkait berhasil ditambahkan");
      form.setValue("relatedParty", data.name);
      setDialogOpen(false);
      relatedPartyForm.reset({
        name: "",
        description: "",
        contactInfo: "",
        type: transactionType === "pemasukan" ? "income" : "expense",
      });
    },
    onError: (error: Error) => {
      toast.error(`Gagal menambahkan pihak terkait: ${error.message}`);
    }
  });

  return (
    <FormField
      control={form.control}
      name="relatedParty"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="font-semibold">Pihak Terkait</FormLabel>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <Select onValueChange={field.onChange} value={field.value}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Pilih pihak terkait" />
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
                ) : relatedParties && relatedParties.length > 0 ? (
                  relatedParties.map((party: RelatedParty) => (
                    <SelectItem key={party.id} value={party.name}>
                      {party.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-parties" disabled>
                    Tidak ada pihak terkait
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
                        relatedPartyForm.reset({
                          name: "",
                          description: "",
                          contactInfo: "",
                          type: transactionType === "pemasukan" ? "income" : "expense",
                        });
                        setDialogOpen(true);
                      }}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      Tambah Pihak Terkait Baru
                    </Button>
                  </DialogTrigger>
                </div>
              </SelectContent>
            </Select>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Tambah Pihak Terkait Baru</DialogTitle>
                <DialogDescription>
                  Tambahkan pihak terkait baru untuk transaksi {transactionType}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={(e) => {
                e.preventDefault();
                createRelatedParty.mutate(relatedPartyForm.getValues());
              }} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nama Pihak Terkait</Label>
                    <Input
                      id="name"
                      value={relatedPartyForm.watch('name')}
                      onChange={(e) => relatedPartyForm.setValue('name', e.target.value)}
                      placeholder="Nama pihak terkait"
                      className="w-full"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Deskripsi (Opsional)</Label>
                    <Textarea
                      id="description"
                      value={relatedPartyForm.watch('description')}
                      onChange={(e) => relatedPartyForm.setValue('description', e.target.value)}
                      placeholder="Deskripsi pihak terkait"
                      className="w-full min-h-[100px]"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="contactInfo">Kontak (Opsional)</Label>
                    <Input
                      id="contactInfo"
                      value={relatedPartyForm.watch('contactInfo')}
                      onChange={(e) => relatedPartyForm.setValue('contactInfo', e.target.value)}
                      placeholder="Kontak pihak terkait"
                      className="w-full"
                    />
                  </div>
                  <input type="hidden" {...relatedPartyForm.register("type")} />
                </div>
                <div className="flex justify-end">
                  <Button
                    type="submit"
                    disabled={createRelatedParty.isPending}
                    className="w-full sm:w-auto"
                  >
                    {createRelatedParty.isPending ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Menyimpan...
                      </>
                    ) : (
                      "Simpan Pihak Terkait"
                    )}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
          <FormMessage />
        </FormItem>
      )}
    />
  );
} 