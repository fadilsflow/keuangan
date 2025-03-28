"use client"

import { useQueryClient } from "@tanstack/react-query";
import { useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
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
import { CreateTransactionDTO, TransactionCreateSchema } from "@/lib/validations/transaction";
import { formatDateForInput } from "@/lib/utils";
import { formatRupiah } from "@/lib/utils";

const categories = [
    "Bahan Baku",
    "Tenaga Kerja",
    "Overhead",
    "Penjualan",
    "Lainnya",
];

interface TransactionItem {
    id?: string;
    name: string;
    itemPrice: number;
    quantity: number;
    totalPrice: number;
    transactionId?: string;
}

interface TransactionFormProps {
    defaultValues?: any;
    defaultType?: "pemasukan" | "pengeluaran";
    mode?: "create" | "edit";
    onSuccess?: () => void;
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

    const [items, setItems] = useState<TransactionItem[]>(() => {
        if (defaultValues?.items && defaultValues.items.length > 0) {
            return defaultValues.items.map((item: TransactionItem) => ({
                id: item.id,
                name: item.name,
                itemPrice: item.itemPrice,
                quantity: item.quantity,
                totalPrice: item.totalPrice,
                transactionId: item.transactionId
            }));
        }
        return [{ name: "", itemPrice: 0, quantity: 1, totalPrice: 0 }];
    });

    // Tambahkan useEffect untuk memperbarui items ketika defaultValues berubah
    useEffect(() => {
        if (defaultValues?.items && defaultValues.items.length > 0) {
            setItems(defaultValues.items.map((item: TransactionItem) => ({
                id: item.id,
                name: item.name,
                itemPrice: item.itemPrice,
                quantity: item.quantity,
                totalPrice: item.totalPrice,
                transactionId: item.transactionId
            })));
        }
    }, [defaultValues]);

    const form = useForm<CreateTransactionDTO>({
        resolver: zodResolver(TransactionCreateSchema),
        defaultValues: {
            date: defaultValues?.date || formatDateForInput(new Date()),
            description: defaultValues?.description || "",
            category: defaultValues?.category || "",
            relatedParty: defaultValues?.relatedParty || "",
            amountTotal: defaultValues?.amountTotal || 0,
            type: defaultValues?.type || defaultType,
            paymentImg: defaultValues?.paymentImg || "",
            items: items,
            ...(defaultValues?.id && { id: defaultValues.id }),
            ...(defaultValues?.monthHistoryId && { monthHistoryId: defaultValues.monthHistoryId })
        }
    });

    // Initialize form with defaultValues once
    useEffect(() => {
        if (defaultValues && !isInitialized) {
            form.reset(defaultValues);
            setIsInitialized(true);
        }
    }, [defaultValues, form, isInitialized]);

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
                form.reset();
                setItems([{ name: "", itemPrice: 0, quantity: 1, totalPrice: 0 }]);
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
            setItems(items.filter((_: TransactionItem, i: number) => i !== index));
        }
    };

    const updateItem = (index: number, field: keyof TransactionItem, value: any) => {
        const newItems = [...items];
        newItems[index] = {
            ...newItems[index],
            [field]: value,
            ...(field === 'itemPrice' || field === 'quantity' ? {
                totalPrice: field === 'itemPrice' ?
                    value * newItems[index].quantity :
                    newItems[index].itemPrice * value
            } : {})
        };
        setItems(newItems);
        form.setValue("items", newItems);
        form.setValue("amountTotal", calculateTotal());
    };

    const calculateTotal = () => {
        return items.reduce((sum: number, item: TransactionItem) =>
            sum + (item.itemPrice * item.quantity), 0
        );
    };

    const onSubmit = async (data: CreateTransactionDTO) => {
        try {
            const submitData = {
                ...data,
                amountTotal: calculateTotal(),
                items: items.map((item: TransactionItem) => ({
                    ...(item.id && { id: item.id }),
                    name: item.name,
                    itemPrice: item.itemPrice,
                    quantity: item.quantity,
                    totalPrice: item.itemPrice * item.quantity,
                    ...(item.transactionId && { transactionId: item.transactionId })
                }))
            };
            mutation.mutate(submitData);
        } catch (error) {
            console.error("Submit error:", error);
            toast.error("Error submitting form");
        }
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className="grid grid-cols-2 gap-4">
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
                                        value={typeof field.value === 'string' ? field.value.split('T')[0] : formatDateForInput(field.value).split('T')[0]}
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
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
                            <FormItem>
                                <FormLabel>Deskripsi</FormLabel>
                                <FormControl>
                                    <Input {...field} />
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
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                    <FormControl>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Pilih kategori" />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem key={category} value={category}>
                                                {category}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
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
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />

                    <FormField
                        control={form.control}
                        name="paymentImg"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>URL Gambar Pembayaran</FormLabel>
                                <FormControl>
                                    <Input {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>

                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-semibold">Items</h3>
                        <Button type="button" onClick={addItem} variant="outline" size="sm">
                            <Plus className="w-4 h-4 mr-2" />
                            Tambah Item
                        </Button>
                    </div>
                    {items.map((item: TransactionItem, index: number) => (
                        <div key={item.id || index} className="grid grid-cols-4 gap-4 items-end">
                            <FormItem>
                                <FormLabel>Nama</FormLabel>
                                <FormControl>
                                    <Input
                                        value={item.name}
                                        onChange={(e) => updateItem(index, "name", e.target.value)}
                                        required
                                    />
                                </FormControl>
                            </FormItem>

                            <FormItem>
                                <FormLabel>Harga</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        value={item.itemPrice}
                                        onChange={(e) => updateItem(index, "itemPrice", Number(e.target.value))}
                                        required
                                        min="0"
                                    />
                                </FormControl>
                            </FormItem>

                            <FormItem>
                                <FormLabel>Jumlah</FormLabel>
                                <FormControl>
                                    <Input
                                        type="number"
                                        value={item.quantity}
                                        onChange={(e) => updateItem(index, "quantity", Number(e.target.value))}
                                        required
                                        min="1"
                                    />
                                </FormControl>
                            </FormItem>

                            <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                onClick={() => removeItem(index)}
                                disabled={items.length === 1}
                            >
                                <Trash2 className="w-4 h-4" />
                            </Button>
                        </div>
                    ))}
                </div>

                <div className="flex justify-between items-center">
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
                                <span className="loading loading-spinner"></span>
                                {mode === "edit" ? "Memperbarui..." : "Membuat..."}
                            </>
                        ) : (
                            mode === "edit" ? "Perbarui Transaksi" : "Buat Transaksi"
                        )}
                    </Button>
                </div>
            </form>
        </Form>
    );
} 