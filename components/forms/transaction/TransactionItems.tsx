"use client"

import { UseFormReturn } from "react-hook-form";
import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { z } from "zod";
import { MasterItemSchema } from "@/lib/validations/master-item";
import { CreateTransactionDTO } from "@/lib/validations/transaction";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Trash2, PlusCircle, Loader2 } from "lucide-react";
import {  
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatRupiah } from "@/lib/utils";
import { TransactionItem } from "@/lib/types";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface MasterItem {
  id: string;
  name: string;
  defaultPrice: number;
  type: "income" | "expense";
}

interface TransactionItemsProps {
  form: UseFormReturn<CreateTransactionDTO>;
  transactionType: "pemasukan" | "pengeluaran";
  items: TransactionItem[];
  setItems: (items: TransactionItem[]) => void;
}

export function TransactionItems({ form, transactionType, items, setItems }: TransactionItemsProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null);
  const queryClient = useQueryClient();

  // Master item form
  const masterItemForm = useForm<z.infer<typeof MasterItemSchema>>({
    resolver: zodResolver(MasterItemSchema),
    defaultValues: {
      name: "",
      description: "",
      defaultPrice: 0,
      type: transactionType === "pemasukan" ? "income" : "expense",
    }
  });

  // Fetch master items
  const { data, isLoading: isMasterItemsLoading } = useQuery({
    queryKey: ['masterItems', transactionType === "pemasukan" ? "income" : "expense"],
    queryFn: async () => {
      const apiType = transactionType === "pemasukan" ? "income" : "expense";
      const response = await fetch(`/api/master-items?type=${apiType}`);
      if (!response.ok) throw new Error("Failed to fetch master items");
      const responseData = await response.json();
      return responseData.data || responseData || [];
    }
  });

  // Access masterItems safely
  const masterItems = data?.data || data || [];

  // Create master item mutation
  const createMasterItem = useMutation({
    mutationFn: async (data: z.infer<typeof MasterItemSchema>) => {
      const response = await fetch("/api/master-items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create master item");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['masterItems'] });
      toast.success("Item master berhasil ditambahkan");
      
      if (currentItemIndex !== null) {
        const newItems = [...items];
        newItems[currentItemIndex] = {
          ...newItems[currentItemIndex],
          name: data.name,
          itemPrice: data.defaultPrice,
          totalPrice: data.defaultPrice * newItems[currentItemIndex].quantity,
          masterItemId: data.id
        };
        setItems(newItems);
        form.setValue("items", newItems);
        form.setValue("amountTotal", calculateTotal(newItems));
      }
      
      setDialogOpen(false);
      masterItemForm.reset({
        name: "",
        description: "",
        defaultPrice: 0,
        type: transactionType === "pemasukan" ? "income" : "expense",
      });
    },
    onError: (error: Error) => {
      toast.error(`Gagal menambahkan item master: ${error.message}`);
    }
  });

  const addItem = () => {
    setItems([...items, { name: "", itemPrice: 0, quantity: 1, totalPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
      form.setValue("items", newItems);
      form.setValue("amountTotal", calculateTotal(newItems));
    }
  };

  const updateItem = (index: number, field: keyof TransactionItem, value: string | number) => {
    const newItems = [...items];
    let newTotalPrice = newItems[index].totalPrice;

    if (field === 'itemPrice') {
      newItems[index].itemPrice = Number(value);
      newTotalPrice = newItems[index].itemPrice * newItems[index].quantity;
    } else if (field === 'quantity') {
      newItems[index].quantity = Number(value);
      newTotalPrice = newItems[index].itemPrice * newItems[index].quantity;
    } else {
      newItems[index] = {
        ...newItems[index],
        [field]: value
      };
    }
    
    newItems[index].totalPrice = newTotalPrice;
    setItems(newItems);
    form.setValue("items", newItems);
    form.setValue("amountTotal", calculateTotal(newItems));
  };

  const selectMasterItem = (index: number, itemId: string) => {
    if (masterItems) {
      const selectedItem = masterItems.find((item: MasterItem) => item.id === itemId);
      if (selectedItem) {
        const newItems = [...items];
        newItems[index] = {
          ...newItems[index],
          name: selectedItem.name,
          itemPrice: selectedItem.defaultPrice,
          totalPrice: selectedItem.defaultPrice * newItems[index].quantity,
          masterItemId: selectedItem.id
        };
        setItems(newItems);
        form.setValue("items", newItems);
        form.setValue("amountTotal", calculateTotal(newItems));
      }
    }
  };

  const calculateTotal = (currentItems = items) => {
    return currentItems.reduce((sum, item) =>
      sum + (item.itemPrice * item.quantity), 0
    );
  };

  const handleCreateMasterItem = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      await createMasterItem.mutateAsync(masterItemForm.getValues());
    } catch (error) {
      // Error is handled by the mutation's onError
      toast.error("Gagal menambahkan item master");
      console.log(error);
    }
  };

  return (
    <div className="space-y-4 border p-4 rounded-md bg-card">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Items</h3>
        <Button type="button" onClick={addItem} variant="outline" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Item
        </Button>
      </div>

      <div className="space-y-6">
        {items.map((item: TransactionItem, index: number) => (
          <div
            key={item.id || `item-${index}`}
            className="grid grid-cols-12 gap-4 items-end p-4 rounded-lg bg-muted/50 relative group"
          >
            <div className="col-span-12 md:col-span-5">
              <Label className="font-medium">Nama Item</Label>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <Select
                  value={item.masterItemId || ""}
                  onValueChange={(value) => {
                    selectMasterItem(index, value);
                  }}
                >
                  <SelectTrigger className="w-full mt-1.5">
                    <SelectValue placeholder="Pilih item" />
                  </SelectTrigger>
                  <SelectContent>
                    {isMasterItemsLoading ? (
                      <SelectItem value="loading" disabled>
                        <div className="flex items-center">
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Loading...
                        </div>
                      </SelectItem>
                    ) : masterItems && masterItems.length > 0 ? (
                      masterItems.map((masterItem: MasterItem) => (
                        <SelectItem key={masterItem.id} value={masterItem.id}>
                          <div className="flex justify-between items-center w-full">
                            <span>{masterItem.name}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              {formatRupiah(masterItem.defaultPrice)}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="no-items" disabled>
                        Tidak ada item
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
                            setCurrentItemIndex(index);
                            masterItemForm.reset({
                              name: "",
                              description: "",
                              defaultPrice: 0,
                              type: transactionType === "pemasukan" ? "income" : "expense",
                            });
                            setDialogOpen(true);
                          }}
                        >
                          <PlusCircle className="h-4 w-4 mr-2" />
                          Tambah Item Baru
                        </Button>
                      </DialogTrigger>
                    </div>
                  </SelectContent>
                </Select>
                <DialogContent className="sm:max-w-[425px]" onPointerDownOutside={(e) => e.preventDefault()}>
                  <DialogHeader>
                    <DialogTitle>Tambah Item Master Baru</DialogTitle>
                    <DialogDescription>
                      Tambahkan item master baru untuk transaksi {transactionType}
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...masterItemForm}>
                    <form 
                      onSubmit={handleCreateMasterItem}
                      onClick={(e) => e.stopPropagation()} 
                      className="space-y-6"
                    >
                      <div className="space-y-4">
                        <FormField
                          control={masterItemForm.control}
                          name="name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Nama Item</FormLabel>
                              <FormControl>
                                <Input placeholder="Nama item" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={masterItemForm.control}
                          name="defaultPrice"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Harga Default</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  placeholder="Harga default" 
                                  {...field}
                                  onChange={(e) => field.onChange(Number(e.target.value))}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={masterItemForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Deskripsi (Opsional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Deskripsi item" 
                                  className="min-h-[100px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <input type="hidden" {...masterItemForm.register("type")} />
                      </div>
                      <div className="flex justify-end">
                        <Button
                          type="submit"
                          disabled={createMasterItem.isPending}
                          className="w-full sm:w-auto"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {createMasterItem.isPending ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Menyimpan...
                            </>
                          ) : (
                            "Simpan Item"
                          )}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            </div>
            
            <div className="col-span-6 md:col-span-3">
              <Label className="font-medium">Harga</Label>
              <Input
                type="number"
                value={item.itemPrice || ""}
                onChange={(e) => updateItem(index, "itemPrice", e.target.value)}
                required
                min="0"
                placeholder="0"
                className="mt-1.5"
              />
            </div>

            <div className="col-span-4 md:col-span-3">
              <Label className="font-medium">Jumlah</Label>
              <Input
                type="number"
                value={item.quantity || ""}
                onChange={(e) => updateItem(index, "quantity", e.target.value)}
                required
                min="1"
                placeholder="1"
                className="mt-1.5"
              />
            </div>

            <div className="col-span-2 md:col-span-1 flex items-end">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeItem(index)}
                disabled={items.length === 1}
                className="text-muted-foreground hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>

            <div className="absolute -right-2 -top-2 bg-primary text-primary-foreground px-2 py-0.5 rounded text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity">
              {formatRupiah(item.itemPrice * item.quantity)}
            </div>
          </div>
        ))}
      </div>

      <div className="flex justify-between items-center pt-4 border-t">
        <div className="text-lg font-semibold">
          Total: {formatRupiah(calculateTotal())}
        </div>
      </div>
    </div>
  );
} 