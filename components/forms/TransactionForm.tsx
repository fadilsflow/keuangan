"use client"

import { useQueryClient } from "@tanstack/react-query";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Plus, Trash2, Search, PlusCircle, Loader2 } from "lucide-react";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { CreateTransactionDTO, TransactionCreateSchema } from "@/lib/validations/transaction";
import { formatDateForInput } from "@/lib/utils";
import { formatRupiah } from "@/lib/utils";
import { CategorySchema } from "@/lib/validations/category";
import { RelatedPartySchema } from "@/lib/validations/related-party";
import { MasterItemSchema } from "@/lib/validations/master-item";
import { z } from "zod";

// Define interfaces for master data
interface Category {
  id: string;
  name: string;
  type: "income" | "expense";
}

interface RelatedParty {
  id: string;
  name: string;
  type: "income" | "expense";
}

interface MasterItem {
  id: string;
  name: string;
  defaultPrice: number;
  type: "income" | "expense";
}

interface TransactionItem {
    id?: string;
    name: string;
    itemPrice: number;
    quantity: number;
    totalPrice: number;
    transactionId?: string;
    masterItemId?: string;
}

interface TransactionFormProps {
    defaultValues?: any;
    defaultType?: "pemasukan" | "pengeluaran";
    mode?: "create" | "edit";
    onSuccess?: () => void;
}

// Function to fetch categories
async function fetchCategories(type: "pemasukan" | "pengeluaran"): Promise<Category[]> {
  const apiType = type === "pemasukan" ? "income" : "expense";
  const response = await fetch(`/api/categories?type=${apiType}`);
  if (!response.ok) {
    throw new Error("Failed to fetch categories");
  }
  return response.json();
}

// Function to fetch related parties
async function fetchRelatedParties(type: "pemasukan" | "pengeluaran"): Promise<RelatedParty[]> {
  const apiType = type === "pemasukan" ? "income" : "expense";
  const response = await fetch(`/api/related-parties?type=${apiType}`);
  if (!response.ok) {
    throw new Error("Failed to fetch related parties");
  }
  return response.json();
}

// Function to fetch master items with search
async function fetchMasterItems(search: string, type: "pemasukan" | "pengeluaran"): Promise<MasterItem[]> {
  const apiType = type === "pemasukan" ? "income" : "expense";
  const searchParams = new URLSearchParams();
  searchParams.append('type', apiType);
  if (search) {
    searchParams.append('search', search);
  }
  const response = await fetch(`/api/master-items?${searchParams.toString()}`);
  if (!response.ok) {
    throw new Error("Failed to fetch master items");
  }
  const data = await response.json();
  return data.items;
}

async function createTransaction(data: CreateTransactionDTO) {
    const response = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            ...data,
            date: new Date(data.date),
        }),
    });

    if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Failed to create transaction");
    }

    return response.json();
}

export function TransactionForm({
    defaultValues,
    defaultType = "pengeluaran",
    mode = "create",
    onSuccess
}: TransactionFormProps) {
    const queryClient = useQueryClient();
    const [isInitialized, setIsInitialized] = useState(false);
    const [transactionType, setTransactionType] = useState<"pemasukan" | "pengeluaran">(defaultType);
    const [itemSearch, setItemSearch] = useState("");
    
    // Popover states instead of Dialog states
    const [categoryPopoverOpen, setCategoryPopoverOpen] = useState(false);
    const [relatedPartyPopoverOpen, setRelatedPartyPopoverOpen] = useState(false);
    const [masterItemPopoverOpen, setMasterItemPopoverOpen] = useState(false);
    const [currentItemIndex, setCurrentItemIndex] = useState<number | null>(null); // Track which item triggered master item popover

    const [items, setItems] = useState<TransactionItem[]>(() => {
        if (defaultValues?.items && defaultValues.items.length > 0) {
            return defaultValues.items.map((item: TransactionItem) => ({
                id: item.id,
                name: item.name,
                itemPrice: item.itemPrice,
                quantity: item.quantity,
                totalPrice: item.totalPrice,
                transactionId: item.transactionId,
                masterItemId: item.masterItemId
            }));
        }
        return [{ name: "", itemPrice: 0, quantity: 1, totalPrice: 0 }];
    });

    // Fetch categories based on transaction type
    const { data: categories, isLoading: isCategoriesLoading } = useQuery({
        queryKey: ['categories', transactionType],
        queryFn: () => fetchCategories(transactionType)
    });

    // Fetch related parties based on transaction type
    const { data: relatedParties, isLoading: isRelatedPartiesLoading } = useQuery({
        queryKey: ['relatedParties', transactionType],
        queryFn: () => fetchRelatedParties(transactionType)
    });

    // Fetch master items based on search and transaction type
    const { data: masterItems, isLoading: isMasterItemsLoading } = useQuery({
        queryKey: ['masterItems', itemSearch, transactionType],
        queryFn: () => fetchMasterItems(itemSearch, transactionType)
    });

    // Update items when defaultValues change
    useEffect(() => {
        if (defaultValues?.items && defaultValues.items.length > 0) {
            setItems(defaultValues.items.map((item: TransactionItem) => ({
                id: item.id,
                name: item.name,
                itemPrice: item.itemPrice,
                quantity: item.quantity,
                totalPrice: item.totalPrice,
                transactionId: item.transactionId,
                masterItemId: item.masterItemId
            })));
        } else if (mode === 'create') {
            setItems([{ name: "", itemPrice: 0, quantity: 1, totalPrice: 0 }]);
        }
    }, [defaultValues, mode]);

    const form = useForm<CreateTransactionDTO>({
        resolver: zodResolver(TransactionCreateSchema),
        defaultValues: {
            date: defaultValues?.date ? formatDateForInput(new Date(defaultValues.date)) : formatDateForInput(new Date()),
            description: defaultValues?.description || "",
            category: defaultValues?.category || "",
            relatedParty: defaultValues?.relatedParty || "",
            amountTotal: defaultValues?.amountTotal || 0,
            type: defaultValues?.type || defaultType,
            paymentImg: defaultValues?.paymentImg || "",
            items: defaultValues?.items || [{ name: "", itemPrice: 0, quantity: 1, totalPrice: 0 }],
            ...(defaultValues?.id && { id: defaultValues.id }),
            ...(defaultValues?.monthHistoryId && { monthHistoryId: defaultValues.monthHistoryId })
        }
    });

    // Reset form when defaultValues change (for edit mode mainly)
    useEffect(() => {
        if (defaultValues) {
             const resetValues = {
                date: defaultValues?.date ? formatDateForInput(new Date(defaultValues.date)) : formatDateForInput(new Date()),
                description: defaultValues?.description || "",
                category: defaultValues?.category || "",
                relatedParty: defaultValues?.relatedParty || "",
                amountTotal: defaultValues?.amountTotal || 0,
                type: defaultValues?.type || defaultType,
                paymentImg: defaultValues?.paymentImg || "",
                items: defaultValues?.items || [{ name: "", itemPrice: 0, quantity: 1, totalPrice: 0 }],
                 ...(defaultValues?.id && { id: defaultValues.id }),
                 ...(defaultValues?.monthHistoryId && { monthHistoryId: defaultValues.monthHistoryId })
            };
            form.reset(resetValues);
            setTransactionType(resetValues.type as "pemasukan" | "pengeluaran");
            if (defaultValues.items) {
                setItems(defaultValues.items);
            } else {
                 setItems([{ name: "", itemPrice: 0, quantity: 1, totalPrice: 0 }]);
            }
        }
    }, [defaultValues, form, defaultType]);

    // Update transaction type when form type value changes
    useEffect(() => {
        const subscription = form.watch((value, { name }) => {
            if (name === "type" && value.type) {
                setTransactionType(value.type as "pemasukan" | "pengeluaran");
                // Clear category and related party when type changes
                form.setValue("category", "");
                form.setValue("relatedParty", "");
                // Reset item search and related states
                setItemSearch("");
                setItems([{ name: "", itemPrice: 0, quantity: 1, totalPrice: 0 }]);
                form.setValue("amountTotal", 0);
            }
        });
        return () => subscription.unsubscribe();
    }, [form]);

    // Initialize form with defaultValues once (less strict reset now)
    useEffect(() => {
        if (defaultValues && !isInitialized) {
            // Initial set handled by the other useEffect
            setIsInitialized(true);
        }
    }, [defaultValues, isInitialized]);

    const updateTransaction = async (data: CreateTransactionDTO) => {
        if (!defaultValues?.id) throw new Error("Transaction ID is required for update");

        const response = await fetch(`/api/transactions/${defaultValues.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                ...data,
                date: new Date(data.date),
            }),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.message || "Failed to update transaction");
        }

        return response.json();
    };

    const mutation = useMutation({
        mutationFn: mode === "edit" ? updateTransaction : createTransaction,
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ["transactions"] });
            toast.success(
                mode === "edit"
                    ? "Transaksi berhasil diperbarui"
                    : "Transaksi berhasil dibuat"
            );
            if (mode === "create") {
                form.reset({
                    date: formatDateForInput(new Date()),
                    description: "",
                    category: "",
                    relatedParty: "",
                    amountTotal: 0,
                    type: defaultType,
                    paymentImg: "",
                    items: [{ name: "", itemPrice: 0, quantity: 1, totalPrice: 0 }],
                });
                setItems([{ name: "", itemPrice: 0, quantity: 1, totalPrice: 0 }]);
                setTransactionType(defaultType);
            }
            onSuccess?.();
        },
        onError: (error: Error) => {
            toast.error(
                mode === "edit"
                    ? "Gagal memperbarui transaksi"
                    : "Gagal membuat transaksi",
                { description: error.message }
            );
        },
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

    const updateItem = (index: number, field: keyof TransactionItem, value: any) => {
        const newItems = [...items];
        let newTotalPrice = newItems[index].totalPrice;

        if (field === 'itemPrice') {
            newItems[index].itemPrice = Number(value);
            newTotalPrice = newItems[index].itemPrice * newItems[index].quantity;
        } else if (field === 'quantity') {
            newItems[index].quantity = Number(value);
            newTotalPrice = newItems[index].itemPrice * newItems[index].quantity;
        } else {
            (newItems[index] as any)[field] = value;
        }
        
        newItems[index].totalPrice = newTotalPrice;

        setItems(newItems);
        form.setValue("items", newItems);
        form.setValue("amountTotal", calculateTotal(newItems));
    };

    // Function to select a master item
    const selectMasterItem = (index: number, itemId: string) => {
        if (masterItems) {
            const selectedItem = masterItems.find(item => item.id === itemId);
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

    const onSubmit = async (data: CreateTransactionDTO) => {
        try {
            const submitData = {
                ...data,
                amountTotal: calculateTotal(),
                items: items.map((item) => ({
                    ...(item.id && { id: item.id }), // Include id only if it exists (for updates)
                    name: item.name,
                    itemPrice: item.itemPrice,
                    quantity: item.quantity,
                    totalPrice: item.itemPrice * item.quantity,
                    ...(item.masterItemId && { masterItemId: item.masterItemId })
                }))
            };
            // Ensure items array is included even if empty (though addItem logic prevents this)
            if (!submitData.items) {
                submitData.items = [];
            }
            mutation.mutate(submitData);
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Error submitting form");
        }
    };

    // Category form
    const categoryForm = useForm<z.infer<typeof CategorySchema>>({
        resolver: zodResolver(CategorySchema),
        defaultValues: {
            name: "",
            description: "",
            type: transactionType === "pemasukan" ? "income" : "expense",
        }
    });

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

    // Update form default types when transaction type changes
    useEffect(() => {
        const apiType = transactionType === "pemasukan" ? "income" : "expense";
        categoryForm.setValue("type", apiType);
        relatedPartyForm.setValue("type", apiType);
        masterItemForm.setValue("type", apiType);
    }, [transactionType, categoryForm, relatedPartyForm, masterItemForm]);

    // Create category mutation
    const createCategoryMutation = useMutation({
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
            queryClient.invalidateQueries({ queryKey: ['categories', transactionType] });
            toast.success("Kategori berhasil ditambahkan");
            form.setValue("category", data.name);
            setCategoryPopoverOpen(false);
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

    // Create related party mutation
    const createRelatedPartyMutation = useMutation({
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
            setRelatedPartyPopoverOpen(false);
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

    // Create master item mutation
    const createMasterItemMutation = useMutation({
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
        onSuccess: (data, variables) => {
            queryClient.invalidateQueries({ queryKey: ['masterItems', transactionType] });
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
                setCurrentItemIndex(null); // Reset index
            } else {
                // Optionally handle case where popover was opened but not tied to a specific item
                // Maybe add the new item as a new row?
                console.warn("Master item created without a specific item index context");
            }
            
            setMasterItemPopoverOpen(false);
            masterItemForm.reset({
                name: "",
                description: "",
                defaultPrice: 0,
                type: transactionType === "pemasukan" ? "income" : "expense",
            });
            setItemSearch(""); // Clear search after adding
        },
        onError: (error: Error) => {
            toast.error(`Gagal menambahkan item master: ${error.message}`);
        }
    });

    // Function to submit category form
    function onSubmitCategoryForm(data: z.infer<typeof CategorySchema>) {
        createCategoryMutation.mutate(data);
    }

    // Function to submit related party form
    function onSubmitRelatedPartyForm(data: z.infer<typeof RelatedPartySchema>) {
        createRelatedPartyMutation.mutate(data);
    }

    // Function to submit master item form
    function onSubmitMasterItemForm(data: z.infer<typeof MasterItemSchema>) {
        createMasterItemMutation.mutate(data);
    }

    return (
        <>
            <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <FormField
                            control={form.control}
                            name="date"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Tanggal</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="date"
                                            {...field}
                                            // Ensure value is always in yyyy-mm-dd format for input
                                            value={field.value ? formatDateForInput(new Date(field.value)).split('T')[0] : ''}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Jenis Transaksi</FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Pilih jenis transaksi" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="pemasukan">Pemasukan</SelectItem>
                                            <SelectItem value="pengeluaran">Pengeluaran</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2"> {/* Span across 2 columns on medium screens */}
                                    <FormLabel>Deskripsi</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="Contoh: Pembelian ATK Kantor" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="category"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Kategori</FormLabel>
                                    <Popover open={categoryPopoverOpen} onOpenChange={setCategoryPopoverOpen}>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Pilih kategori" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {isCategoriesLoading ? (
                                                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                                                ) : categories && categories.length > 0 ? (
                                                    categories.map((category) => (
                                                        <SelectItem key={category.id} value={category.name}>
                                                            {category.name}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="no-categories" disabled>Tidak ada kategori</SelectItem>
                                                )}
                                                <div className="border-t border-border mt-2 pt-2">
                                                    <PopoverTrigger asChild>
                                                        <Button 
                                                            type="button" 
                                                            variant="ghost" 
                                                            className="w-full justify-start" 
                                                            onClick={(e) => {
                                                                e.preventDefault(); // Prevent select from closing
                                                                e.stopPropagation(); // Prevent select from closing
                                                                categoryForm.reset({ // Reset form when opening
                                                                    name: "",
                                                                    description: "",
                                                                    type: transactionType === "pemasukan" ? "income" : "expense",
                                                                });
                                                                setCategoryPopoverOpen(true);
                                                            }}
                                                        >
                                                            <PlusCircle className="h-4 w-4 mr-2" />
                                                            Tambah Kategori Baru
                                                        </Button>
                                                    </PopoverTrigger>
                                                </div>
                                            </SelectContent>
                                        </Select>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="relatedParty"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Pihak Terkait</FormLabel>
                                    <Popover open={relatedPartyPopoverOpen} onOpenChange={setRelatedPartyPopoverOpen}>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="w-full">
                                                    <SelectValue placeholder="Pilih pihak terkait" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {isRelatedPartiesLoading ? (
                                                    <SelectItem value="loading" disabled>Loading...</SelectItem>
                                                ) : relatedParties && relatedParties.length > 0 ? (
                                                    relatedParties.map((party) => (
                                                        <SelectItem key={party.id} value={party.name}>
                                                            {party.name}
                                                        </SelectItem>
                                                    ))
                                                ) : (
                                                    <SelectItem value="no-parties" disabled>Tidak ada pihak terkait</SelectItem>
                                                )}
                                                <div className="border-t border-border mt-2 pt-2">
                                                    <PopoverTrigger asChild>
                                                        <Button 
                                                            type="button" 
                                                            variant="ghost" 
                                                            className="w-full justify-start" 
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                relatedPartyForm.reset({ // Reset form when opening
                                                                    name: "",
                                                                    description: "",
                                                                    contactInfo: "",
                                                                    type: transactionType === "pemasukan" ? "income" : "expense",
                                                                });
                                                                setRelatedPartyPopoverOpen(true);
                                                            }}
                                                        >
                                                            <PlusCircle className="h-4 w-4 mr-2" />
                                                            Tambah Pihak Terkait Baru
                                                        </Button>
                                                    </PopoverTrigger>
                                                </div>
                                            </SelectContent>
                                        </Select>
                                    </Popover>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="paymentImg"
                            render={({ field }) => (
                                <FormItem className="md:col-span-2"> {/* Span across 2 columns */}
                                    <FormLabel>URL Gambar Pembayaran (Opsional)</FormLabel>
                                    <FormControl>
                                        <Input {...field} placeholder="https://link.ke/bukti/pembayaran.jpg" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>

                    <div className="space-y-4 border p-4 rounded-md">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Items</h3>
                            <Button type="button" onClick={addItem} variant="outline" size="sm">
                                <Plus className="w-4 h-4 mr-2" />
                                Tambah Item
                            </Button>
                        </div>
                        {items.map((item, index) => (
                            <div key={item.id || `item-${index}`} className="grid grid-cols-12 gap-4 items-end border-b pb-4 last:border-b-0 last:pb-0">
                                <div className="col-span-12 md:col-span-5">
                                    <FormLabel>Nama Item</FormLabel>
                                    <Popover open={masterItemPopoverOpen && currentItemIndex === index} onOpenChange={(open) => {
                                        if (!open) setCurrentItemIndex(null); // Clear index when popover closes
                                        setMasterItemPopoverOpen(open);
                                    }}>
                                        <PopoverTrigger asChild>
                                            <div className="flex-1 relative">
                                                <Input
                                                    value={item.name}
                                                    onChange={(e) => {
                                                        updateItem(index, "name", e.target.value);
                                                        setItemSearch(e.target.value);
                                                        setCurrentItemIndex(index); // Track which input is active
                                                    }}
                                                    placeholder="Ketik untuk mencari atau tambah item baru"
                                                    onFocus={() => {
                                                        setItemSearch(item.name); // Set search to current item name on focus
                                                        setCurrentItemIndex(index); // Track which input is active
                                                        // Refresh the master items list if needed (optional)
                                                        // queryClient.invalidateQueries({ queryKey: ['masterItems', transactionType] });
                                                    }}
                                                    required
                                                    className="peer" // Add peer class for focus styling if needed
                                                />
                                                
                                                {itemSearch && currentItemIndex === index && (
                                                    <div className="absolute z-10 w-full mt-1 bg-popover rounded-md border shadow-md max-h-60 overflow-auto">
                                                        <div className="p-2 space-y-1">
                                                            {isMasterItemsLoading ? (
                                                                <div className="p-2 text-muted-foreground flex items-center justify-center">
                                                                    <Loader2 className="h-4 w-4 animate-spin mr-2"/> Loading...
                                                                </div>
                                                            ) : masterItems && masterItems.length > 0 ? (
                                                                masterItems.map((masterItem) => (
                                                                    <div 
                                                                        key={masterItem.id}
                                                                        className="flex justify-between items-center p-2 hover:bg-muted rounded cursor-pointer"
                                                                        onClick={() => {
                                                                            selectMasterItem(index, masterItem.id);
                                                                            setItemSearch(""); // Clear search after selection
                                                                            setCurrentItemIndex(null); // Clear active index
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
                                                                    Item "{itemSearch}" tidak ditemukan
                                                                </div>
                                                            )}
                                                            <div className="border-t border-border mt-2 pt-2">
                                                                {/* This button now acts as the PopoverTrigger for the form below */}
                                                                <Button 
                                                                    type="button" 
                                                                    variant="ghost" 
                                                                    className="w-full justify-start" 
                                                                    onClick={() => {
                                                                        masterItemForm.reset({ // Reset form when opening
                                                                            name: itemSearch, // Pre-fill name from search
                                                                            description: "",
                                                                            defaultPrice: 0,
                                                                            type: transactionType === "pemasukan" ? "income" : "expense",
                                                                        });
                                                                        setMasterItemPopoverOpen(true);
                                                                    }}
                                                                >
                                                                    <PlusCircle className="h-4 w-4 mr-2" />
                                                                    Tambah "{itemSearch}" sebagai Item Baru
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </PopoverTrigger>
                                        {/* Master Item Add Form Popover Content */}
                                        <PopoverContent className="w-80" side="right" align="start">
                                            <div className="space-y-4">
                                                <h4 className="font-medium leading-none">Tambah Item Master Baru</h4>
                                                <p className="text-sm text-muted-foreground">
                                                    Tambahkan item master baru untuk transaksi {transactionType}
                                                </p>
                                                <Form {...masterItemForm}>
                                                    <form onSubmit={masterItemForm.handleSubmit(onSubmitMasterItemForm)} className="space-y-4">
                                                        <FormField
                                                            control={masterItemForm.control}
                                                            name="name"
                                                            render={({ field }) => (
                                                                <FormItem>
                                                                    <FormLabel>Nama Item</FormLabel>
                                                                    <FormControl>
                                                                        <Input {...field} />
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
                                                                            {...field} 
                                                                            onChange={(e) => field.onChange(Number(e.target.value))}
                                                                            min="0"
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
                                                                        <Textarea {...field} />
                                                                    </FormControl>
                                                                    <FormMessage />
                                                                </FormItem>
                                                            )}
                                                        />
                                                        <input type="hidden" {...masterItemForm.register("type")} />
                                                        <Button 
                                                            type="submit" 
                                                            disabled={createMasterItemMutation.isPending}
                                                            className="w-full"
                                                        >
                                                            {createMasterItemMutation.isPending ? (
                                                                <>
                                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                                    Menyimpan...
                                                                </>
                                                            ) : "Simpan Item"}
                                                        </Button>
                                                    </form>
                                                </Form>
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                
                                <div className="col-span-6 md:col-span-3">
                                    <FormLabel>Harga</FormLabel>
                                    <Input
                                        type="number"
                                        value={item.itemPrice}
                                        onChange={(e) => updateItem(index, "itemPrice", e.target.value)}
                                        required
                                        min="0"
                                        placeholder="0"
                                    />
                                </div>

                                <div className="col-span-4 md:col-span-3">
                                    <FormLabel>Jumlah</FormLabel>
                                    <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, "quantity", e.target.value)}
                                        required
                                        min="1"
                                        placeholder="1"
                                    />
                                </div>

                                <div className="col-span-2 md:col-span-1 flex items-end">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        onClick={() => removeItem(index)}
                                        disabled={items.length === 1}
                                        className="mt-auto" // Align button to bottom if needed
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center mt-4">
                        <div className="text-lg font-semibold">
                            Total: {formatRupiah(calculateTotal())}
                        </div>
                        <Button
                            type="submit"
                            disabled={mutation.isPending}
                            className="w-full md:w-auto"
                        >
                            {mutation.isPending ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    {mode === "edit" ? "Memperbarui..." : "Membuat..."}
                                </>
                            ) : (
                                mode === "edit" ? "Perbarui Transaksi" : "Buat Transaksi"
                            )}
                        </Button>
                    </div>
                </form>
            </Form>

            {/* Add Category Popover Content (Positioned absolutely relative to trigger) */}
            <PopoverContent className="w-80" side="right" align="start" 
                onOpenAutoFocus={(e) => e.preventDefault()} // Prevent stealing focus
                hidden={!categoryPopoverOpen} // Use hidden to control visibility
            >
                <div className="space-y-4">
                    <h4 className="font-medium leading-none">Tambah Kategori Baru</h4>
                    <p className="text-sm text-muted-foreground">
                        Tambahkan kategori baru untuk transaksi {transactionType}
                    </p>
                    <Form {...categoryForm}>
                        <form onSubmit={categoryForm.handleSubmit(onSubmitCategoryForm)} className="space-y-4">
                            <FormField
                                control={categoryForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nama Kategori</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
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
                                            <Textarea {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <input type="hidden" {...categoryForm.register("type")} />
                            <Button 
                                type="submit" 
                                disabled={createCategoryMutation.isPending}
                                className="w-full"
                            >
                                {createCategoryMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : "Simpan Kategori"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </PopoverContent>

            {/* Add Related Party Popover Content */}
            <PopoverContent className="w-80" side="right" align="start"
                onOpenAutoFocus={(e) => e.preventDefault()} // Prevent stealing focus
                hidden={!relatedPartyPopoverOpen} // Use hidden to control visibility
            >
                <div className="space-y-4">
                    <h4 className="font-medium leading-none">Tambah Pihak Terkait Baru</h4>
                    <p className="text-sm text-muted-foreground">
                        Tambahkan pihak terkait baru untuk transaksi {transactionType}
                    </p>
                    <Form {...relatedPartyForm}>
                        <form onSubmit={relatedPartyForm.handleSubmit(onSubmitRelatedPartyForm)} className="space-y-4">
                            <FormField
                                control={relatedPartyForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Nama Pihak Terkait</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
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
                                        <FormLabel>Deskripsi (Opsional)</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} />
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
                                        <FormLabel>Kontak (Opsional)</FormLabel>
                                        <FormControl>
                                            <Input {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <input type="hidden" {...relatedPartyForm.register("type")} />
                            <Button 
                                type="submit" 
                                disabled={createRelatedPartyMutation.isPending}
                                className="w-full"
                            >
                                {createRelatedPartyMutation.isPending ? (
                                    <>
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                        Menyimpan...
                                    </>
                                ) : "Simpan Pihak Terkait"}
                            </Button>
                        </form>
                    </Form>
                </div>
            </PopoverContent>

            {/* Note: Master Item PopoverContent is already nested within its Popover trigger area */}
        </>
    );
} 