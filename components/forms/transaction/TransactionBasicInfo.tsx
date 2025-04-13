"use client"

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import { CreateTransactionDTO } from "@/lib/validations/transaction";
import { DatePicker } from "@/components/ui/date-picker";

interface TransactionBasicInfoProps {
  form: UseFormReturn<CreateTransactionDTO>;
  onTypeChange: (value: "pemasukan" | "pengeluaran") => void;
}

export function TransactionBasicInfo({ form, onTypeChange }: TransactionBasicInfoProps) {
  // Function to parse date safely with timezone handling
  const parseDate = (dateValue: string | Date): Date => {
    if (dateValue instanceof Date) return dateValue;
    
    // Create a date from the string and fix timezone issue
    const dateParts = dateValue.split('T')[0].split('-');
    if (dateParts.length !== 3) return new Date();
    
    // Create date with year, month, day and set time to noon to avoid timezone issues
    // Month is 0-indexed in JavaScript Date
    return new Date(
      parseInt(dateParts[0]), 
      parseInt(dateParts[1]) - 1, 
      parseInt(dateParts[2]), 
      12, 0, 0
    );
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="date"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="font-semibold">Tanggal</FormLabel>
            <FormControl>
              <DatePicker
                value={field.value ? parseDate(field.value) : undefined}
                onChange={(date?: Date) => {
                  if (date) {
                    // Create a new date with time set to noon
                    const fixedDate = new Date(
                      date.getFullYear(),
                      date.getMonth(),
                      date.getDate(),
                      12, 0, 0
                    );
                    
                    // Format to ISO string and keep only the date part
                    const dateString = fixedDate.toISOString().split('T')[0];
                    field.onChange(dateString);
                  } else {
                    field.onChange('');
                  }
                }}
                placeholder="Pilih tanggal"
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