"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatDateForInput } from "@/lib/utils";
import { UseFormReturn } from "react-hook-form";
import { CreateTransactionDTO } from "@/lib/validations/transaction";

interface TransactionBasicInfoProps {
  form: UseFormReturn<CreateTransactionDTO>;
  onTypeChange: (value: "pemasukan" | "pengeluaran") => void;
}

export function TransactionBasicInfo({ form, onTypeChange }: TransactionBasicInfoProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-semibold">Tanggal</FormLabel>
            <FormControl>
              <Input
                type="date"
                {...field}
                className="w-full"
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
            <FormLabel className="font-semibold">Jenis Transaksi</FormLabel>
            <Select 
              onValueChange={(value: "pemasukan" | "pengeluaran") => {
                field.onChange(value);
                onTypeChange(value);
              }} 
              value={field.value}
            >
              <FormControl>
                <SelectTrigger className="w-full">
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
          <FormItem className="md:col-span-2">
            <FormLabel className="font-semibold">Deskripsi</FormLabel>
            <FormControl>
              <Input {...field} placeholder="Contoh: Pembelian ATK Kantor" className="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="paymentImg"
        render={({ field }) => (
          <FormItem className="md:col-span-2">
            <FormLabel className="font-semibold">URL Gambar Pembayaran (Opsional)</FormLabel>
            <FormControl>
              <Input {...field} placeholder="https://link.ke/bukti/pembayaran.jpg" className="w-full" />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
} 