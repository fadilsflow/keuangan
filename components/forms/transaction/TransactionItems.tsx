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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { formatRupiah } from "@/lib/utils";
import { TransactionItem } from "@/lib/types";

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
  const [itemSearch, setItemSearch] = useState("");
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
    queryKey: ['masterItems', itemSearch, transactionType === "pemasukan" ? "income" : "expense"],
    queryFn: async () => {
      const apiType = transactionType === "pemasukan" ? "income" : "expense";
      const searchParams = new URLSearchParams();
      searchParams.append('type', apiType);
      if (itemSearch) {
        searchParams.append('search', itemSearch);
      }
      const response = await fetch(`/api/master-items?${searchParams.toString()}`);
      if (!response.ok) throw new Error("Failed to fetch master items");
      const responseData = await response.json();
      // Return an empty array as default if data is undefined
      return responseData.data || responseData.items || responseData || [];
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
        setCurrentItemIndex(null);
      }
      
      setDialogOpen(false);
      masterItemForm.reset({
        name: "",
        description: "",
        defaultPrice: 0,
        type: transactionType === "pemasukan" ? "income" : "expense",
      });
      setItemSearch("");
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
              <div className="relative mt-1.5">
                <Input
                  value={item.name}
                  onChange={(e) => {
                    updateItem(index, "name", e.target.value);
                    setItemSearch(e.target.value);
                    setCurrentItemIndex(index);
                  }}
                  placeholder="Ketik untuk mencari atau tambah item baru"
                  onFocus={() => {
                    setItemSearch(item.name);
                    setCurrentItemIndex(index);
                  }}
                  required
                  className="w-full"
                />
                
                {itemSearch && currentItemIndex === index && (
                  <div className="absolute z-10 w-full mt-1 bg-popover rounded-md border shadow-lg max-h-60 overflow-auto">
                    <div className="p-2 space-y-1">
                      {isMasterItemsLoading ? (
                        <div className="p-2 text-muted-foreground flex items-center justify-center">
                          <Loader2 className="h-4 w-4 animate-spin mr-2"/> Loading...
                        </div>
                      ) : masterItems && masterItems.length > 0 ? (
                        masterItems.map((masterItem: MasterItem) => (
                          <div 
                            key={masterItem.id}
                            className="flex justify-between items-center p-2 hover:bg-accent rounded-md cursor-pointer transition-colors"
                            onClick={() => {
                              selectMasterItem(index, masterItem.id);
                              setItemSearch("");
                              setCurrentItemIndex(null);
                            }}
                          >
                            <span>{masterItem.name}</span>
                            <span className="text-sm text-muted-foreground">
                              {formatRupiah(masterItem.defaultPrice)}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="p-2 text-muted-foreground">
                          Item &quot;{itemSearch}&quot; tidak ditemukan
                        </div>
                      )}
                      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="ghost"
                            className="w-full justify-start mt-2"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              masterItemForm.reset({
                                name: itemSearch,
                                description: "",
                                defaultPrice: 0,
                                type: transactionType === "pemasukan" ? "income" : "expense",
                              });
                              setDialogOpen(true);
                            }}
                          >
                            <PlusCircle className="h-4 w-4 mr-2" />
                            Tambah &quot;{itemSearch}&quot; sebagai Item Baru
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>Tambah Item Master Baru</DialogTitle>
                            <DialogDescription>
                              Tambahkan item master baru untuk transaksi {transactionType}
                            </DialogDescription>
                          </DialogHeader>
                          <form onSubmit={(e) => {
                            e.preventDefault();
                            createMasterItem.mutate(masterItemForm.getValues());
                          }} className="space-y-6">
                            <div className="space-y-4">
                              <div className="space-y-2">
                                <Label htmlFor="name">Nama Item</Label>
                                <Input
                                  id="name"
                                  value={masterItemForm.watch('name')}
                                  onChange={(e) => masterItemForm.setValue('name', e.target.value)}
                                  placeholder="Nama item"
                                  className="w-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="defaultPrice">Harga Default</Label>
                                <Input
                                  id="defaultPrice"
                                  type="number"
                                  value={masterItemForm.watch('defaultPrice')}
                                  onChange={(e) => masterItemForm.setValue('defaultPrice', Number(e.target.value))}
                                  placeholder="Harga default"
                                  className="w-full"
                                />
                              </div>
                              <div className="space-y-2">
                                <Label htmlFor="description">Deskripsi (Opsional)</Label>
                                <Textarea
                                  id="description"
                                  value={masterItemForm.watch('description')}
                                  onChange={(e) => masterItemForm.setValue('description', e.target.value)}
                                  placeholder="Deskripsi item"
                                  className="w-full min-h-[100px]"
                                />
                              </div>
                              <input type="hidden" {...masterItemForm.register("type")} />
                            </div>
                            <div className="flex justify-end">
                              <Button
                                type="submit"
                                disabled={createMasterItem.isPending}
                                className="w-full sm:w-auto"
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
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="col-span-6 md:col-span-3">
              <Label className="font-medium">Harga</Label>
              <Input
                type="number"
                value={item.itemPrice}
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
                value={item.quantity}
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