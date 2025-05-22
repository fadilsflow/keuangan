"use client";

import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
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
import { UseFormReturn } from "react-hook-form";
import { CreateTransactionDTO } from "@/lib/validations/transaction";
import { DatePicker } from "@/components/ui/date-picker";
import { CldUploadWidget, CldImage } from "next-cloudinary";
import { Button } from "@/components/ui/button";
import { ImageIcon, X } from "lucide-react";

interface TransactionBasicInfoProps {
  form: UseFormReturn<CreateTransactionDTO>;
  onTypeChange: (value: "pemasukan" | "pengeluaran") => void;
}

interface CloudinaryInfo {
  public_id: string;
  secure_url: string;
  width: number;
  height: number;
}

export function TransactionBasicInfo({
  form,
  onTypeChange,
}: TransactionBasicInfoProps) {
  // Function to parse date safely with timezone handling
  const parseDate = (dateValue: string | Date): Date => {
    if (dateValue instanceof Date) return dateValue;

    // Create a date from the string and fix timezone issue
    const dateParts = dateValue.split("T")[0].split("-");
    if (dateParts.length !== 3) return new Date();

    // Create date with year, month, day and set time to noon to avoid timezone issues
    // Month is 0-indexed in JavaScript Date
    return new Date(
      parseInt(dateParts[0]),
      parseInt(dateParts[1]) - 1,
      parseInt(dateParts[2]),
      12,
      0,
      0
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
                      12,
                      0,
                      0
                    );

                    // Format to ISO string and keep only the date part
                    const dateString = fixedDate.toISOString().split("T")[0];
                    field.onChange(dateString);
                  } else {
                    field.onChange("");
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
              <Input
                {...field}
                placeholder="Contoh: Pembelian ATK Kantor"
                className="w-full"
              />
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
            <FormLabel className="font-semibold">
              Bukti Pembayaran (Opsional)
            </FormLabel>
            <FormControl>
              <div className="flex flex-col gap-4">
                {!field.value ? (
                  <CldUploadWidget
                    uploadPreset="cashlog"
                    signatureEndpoint="/api/sign-cloudinary-params"
                    onSuccess={(result: any, { widget }) => {
                      const info = result?.info as CloudinaryInfo;
                      if (info?.secure_url) {
                        field.onChange(info.secure_url);
                      }
                      widget.close();
                    }}
                    onQueuesEnd={(result, { widget }) => {
                      widget.close();
                    }}
                    onError={(error) => {
                      console.error("Upload error:", error);
                    }}
                    options={{
                      maxFiles: 1,
                      maxFileSize: 1024 * 1024 * 2, // 2MB,
                      resourceType: "image",
                      sources: ["local", "camera"],
                      multiple: false,
                      styles: {
                        palette: {
                          window: "#FFFFFF",
                          windowBorder: "#90A0B3",
                          tabIcon: "#0078FF",
                          menuIcons: "#5A616A",
                          textDark: "#000000",
                          textLight: "#FFFFFF",
                          link: "#0078FF",
                          action: "#FF620C",
                          inactiveTabIcon: "#0E2F5A",
                          error: "#F44235",
                          inProgress: "#0078FF",
                          complete: "#20B832",
                          sourceBg: "#E4EBF1"
                        }
                      }
                    }}
                  >
                    {({ open }) => {
                      function handleOnClick() {
                        open();
                      }
                      return (
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full h-24 flex flex-col items-center justify-center cursor-pointer"
                          onClick={handleOnClick}
                        >
                          <ImageIcon className="h-6 w-6" />
                          <span>Unggah Bukti Pembayaran</span>
                          <span className="text-xs text-muted-foreground">Maksimal size gambar 2MB</span>
                        </Button>
                      );
                    }}
                  </CldUploadWidget>
                ) : (
                  <div className="relative w-full">
                    <div className="relative h-full w-full overflow-hidden rounded-lg border p-3 flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <CldImage
                          src={field.value}
                          alt="Bukti pembayaran"
                          width={50}
                          height={50}
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-col gap-2">
                        <span className="text-sm font-medium ">Bukti Pembayaran</span>
                        <span className="text-xs text-muted-foreground">Berhasil diunggah</span>
                      </div>

                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute right-2 top-2"
                        onClick={() => {
                          field.onChange("");
                        }}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
