"use client";

import { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { RelatedPartySchema } from "@/lib/validations/related-party";
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

interface RelatedParty {
  id: string;
  name: string;
  type: "income" | "expense";
}

interface RelatedPartySelectProps {
  form: UseFormReturn<CreateTransactionDTO>;
  transactionType: "pemasukan" | "pengeluaran";
}

export function RelatedPartySelect({
  form,
  transactionType,
}: RelatedPartySelectProps) {
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
    },
  });

  // Fetch related parties
  const { data, isLoading } = useQuery({
    queryKey: [
      "relatedParties",
      "",
      transactionType === "pemasukan" ? "income" : "expense",
    ],
    queryFn: async () => {
      const apiType = transactionType === "pemasukan" ? "income" : "expense";
      const response = await fetch(`/api/related-parties/all?type=${apiType}`);
      if (!response.ok) throw new Error("Failed to fetch related parties");
      const responseData = await response.json();
      return responseData.data || responseData || [];
    },
  });

  // Access relatedParties safely
  const relatedParties = data?.data || data || [];

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
      queryClient.invalidateQueries({ queryKey: ["relatedParties"] });
      toast.success("Pihak terkait berhasil ditambahkan");
      form.setValue("relatedPartyId", data.id, { shouldValidate: true });
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
    },
  });

  const handleCreateRelatedParty = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      await createRelatedParty.mutateAsync(relatedPartyForm.getValues());
    } catch (error) {
      // Error is handled by the mutation's onError
      toast.error("Gagal menambahkan pihak terkait");
      console.log(error);
    }
  };

  const selectRelatedParty = (partyId: string) => {
    if (relatedParties) {
      const selectedParty = relatedParties.find(
        (party: RelatedParty) => party.id === partyId
      );
      if (selectedParty) {
        form.setValue("relatedPartyId", selectedParty.id, {
          shouldValidate: true,
        });
      }
    }
  };

  const getRelatedPartyLabel = () =>
    transactionType === "pengeluaran" ? "Supplier" : "Konsumen";
  const getRelatedPartyPlaceholder = () =>
    transactionType === "pengeluaran" ? "Pilih supplier" : "Pilih konsumen";
  const getAddRelatedPartyLabel = () =>
    transactionType === "pengeluaran"
      ? "Tambah Supplier Baru"
      : "Tambah Konsumen Baru";
  const getRelatedPartyDialogTitle = () =>
    transactionType === "pengeluaran"
      ? "Tambah Supplier Baru"
      : "Tambah Konsumen Baru";
  const getRelatedPartyDialogDesc = () =>
    transactionType === "pengeluaran"
      ? "Tambahkan supplier baru untuk transaksi pengeluaran"
      : "Tambahkan konsumen baru untuk transaksi pemasukan";
  const getRelatedPartyNameLabel = () =>
    transactionType === "pengeluaran" ? "Nama Supplier" : "Nama Konsumen";
  const getRelatedPartyNamePlaceholder = () =>
    transactionType === "pengeluaran" ? "Nama supplier" : "Nama konsumen";
  const getRelatedPartyDescPlaceholder = () =>
    transactionType === "pengeluaran"
      ? "Deskripsi supplier"
      : "Deskripsi konsumen";
  const getRelatedPartyContactPlaceholder = () =>
    transactionType === "pengeluaran" ? "Kontak supplier" : "Kontak konsumen";
  const getNoRelatedPartyText = () =>
    transactionType === "pengeluaran"
      ? "Tidak ada supplier"
      : "Tidak ada konsumen";

  return (
    <FormField
      control={form.control}
      name="relatedPartyId"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="font-semibold">
            {getRelatedPartyLabel()}
          </FormLabel>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <Select value={field.value} onValueChange={selectRelatedParty}>
              <FormControl>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={getRelatedPartyPlaceholder()}>
                    {field.value && relatedParties
                      ? relatedParties.find(
                          (p: RelatedParty) => p.id === field.value
                        )?.name
                      : getRelatedPartyPlaceholder()}
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
                ) : relatedParties && relatedParties.length > 0 ? (
                  relatedParties.map((party: RelatedParty) => (
                    <SelectItem key={party.id} value={party.id}>
                      {party.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="no-parties" disabled>
                    {getNoRelatedPartyText()}
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
                          type:
                            transactionType === "pemasukan"
                              ? "income"
                              : "expense",
                        });
                        setDialogOpen(true);
                      }}
                    >
                      <PlusCircle className="h-4 w-4 mr-2" />
                      {getAddRelatedPartyLabel()}
                    </Button>
                  </DialogTrigger>
                </div>
              </SelectContent>
            </Select>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{getRelatedPartyDialogTitle()}</DialogTitle>
                <DialogDescription>
                  {getRelatedPartyDialogDesc()}
                </DialogDescription>
              </DialogHeader>
              <Form {...relatedPartyForm}>
                <form onSubmit={handleCreateRelatedParty} className="space-y-4">
                  <FormField
                    control={relatedPartyForm.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{getRelatedPartyNameLabel()}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={getRelatedPartyNamePlaceholder()}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={relatedPartyForm.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Deskripsi</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder={getRelatedPartyDescPlaceholder()}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={relatedPartyForm.control}
                    name="contactInfo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Kontak</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={getRelatedPartyContactPlaceholder()}
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={createRelatedParty.isPending}
                    className="w-full"
                  >
                    {createRelatedParty.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    {getAddRelatedPartyLabel()}
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
