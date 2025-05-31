"use client";

import { useState, useMemo, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { formatRupiah } from "@/lib/utils";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import {
  MoreHorizontal,
  Trash2,
  TrendingUp,
  TrendingDown,
  Pencil,
  FileText,
  Printer,
  Eye,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Download } from "lucide-react";
import { Link } from "lucide-react";
import { ExternalLink } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Pagination } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { CldImage } from "next-cloudinary";

interface TransactionDataTableProps {
  filters: {
    search: string;
    type: string;
    category: string;
    dateRange?: {
      from: Date;
      to: Date;
    };
  };
}

interface Item {
  id: string;
  name: string;
  itemPrice: number;
  quantity: number;
  totalPrice: number;
}

// Definisikan tipe untuk response API
interface TransactionResponse {
  data: Array<{
    id: string;
    date: string;
    description: string;
    category: string;
    relatedParty: string;
    amountTotal: number;
    type: string;
    paymentImg?: string;
    items: Item[];
  }>;
  meta: {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

// Tambahkan tipe untuk transaction item untuk menggantikan any
type TransactionItem = TransactionResponse["data"][0];

// Definisi return type untuk fungsi API
interface DeleteResponse {
  success: boolean;
}

async function fetchTransactions(
  filters: TransactionDataTableProps["filters"],
  page: number = 1,
  pageSize: number = 10
): Promise<TransactionResponse> {
  const params = new URLSearchParams();

  console.log("Filters received by fetchTransactions:", filters);

  if (filters.search) params.append("search", filters.search);
  if (filters.type && filters.type !== "all")
    params.append("type", filters.type);
  if (filters.category && filters.category !== "all")
    params.append("category", filters.category);
  if (filters.dateRange?.from)
    params.append("from", filters.dateRange.from.toISOString());
  if (filters.dateRange?.to)
    params.append("to", filters.dateRange.to.toISOString());
  params.append("page", page.toString());
  params.append("pageSize", pageSize.toString());

  const url = `/api/transactions?${params.toString()}`;
  console.log("API URL:", url);

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch transactions");
  const data = await response.json();
  return data;
}

async function deleteTransaction(id: string): Promise<DeleteResponse> {
  const response = await fetch(`/api/transactions/${id}`, {
    method: "DELETE",
  });
  if (!response.ok) throw new Error("Failed to delete transaction");
  return response.json();
}

async function deleteMultipleTransactions(
  ids: string[]
): Promise<DeleteResponse> {
  const response = await fetch("/api/transactions/bulk-delete", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ ids }),
  });
  if (!response.ok) throw new Error("Failed to delete transactions");
  return response.json();
}

export function TransactionDataTable({ filters }: TransactionDataTableProps) {
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const queryClient = useQueryClient();
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 10; // Items per page

  const { data, isLoading } = useQuery<TransactionResponse, Error>({
    queryKey: ["transactions", filters, currentPage, pageSize],
    queryFn: () => fetchTransactions(filters, currentPage, pageSize),
    staleTime: 30000, // 30 detik
    placeholderData: (prevData) => prevData, // Pengganti keepPreviousData
  });

  const transactions = useMemo(() => data?.data || [], [data?.data]);
  const totalPages = data?.meta?.totalPages || 1;

  useEffect(() => {
    const tableElement = document.querySelector(".transaction-table-container");
    if (tableElement) {
      tableElement.scrollTop = 0;
    }
  }, [currentPage]);

  const deleteMutation = useMutation<DeleteResponse, Error, string>({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      toast.success("Transaksi berhasil dihapus");
    },
    onError: () => {
      toast.error("Gagal menghapus transaksi");
    },
  });

  const bulkDeleteMutation = useMutation<DeleteResponse, Error, string[]>({
    mutationFn: deleteMultipleTransactions,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      setSelectedRows([]);
      toast.success("Transaksi terpilih berhasil dihapus");
    },
    onError: () => {
      toast.error("Gagal menghapus transaksi terpilih");
    },
  });

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedRows(transactions.map((t) => t.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleSelectRow = (checked: boolean, id: string) => {
    if (checked) {
      setSelectedRows([...selectedRows, id]);
    } else {
      setSelectedRows(selectedRows.filter((rowId) => rowId !== id));
    }
  };

  const handleEdit = (id: string) => {
    router.push(`/transactions/${id}/edit`);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus transaksi ini?")) {
      deleteMutation.mutate(id);
    }
  };

  const handleBulkDelete = () => {
    if (selectedRows.length === 0) return;

    if (
      window.confirm(
        `Apakah Anda yakin ingin menghapus ${selectedRows.length} transaksi terpilih?`
      )
    ) {
      bulkDeleteMutation.mutate(selectedRows);
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    setSelectedRows([]);
  };

  const handlePrintDetail = (transaction: TransactionItem) => {
    // Create a new window for printing
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    // Generate the HTML content
    const content = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Detail Transaksi</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .detail-row { margin: 10px 0; }
            .label { font-weight: bold; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            .items-table th { background-color: #f5f5f5; }
            .total { text-align: right; margin-top: 20px; font-weight: bold; }
            @media print {
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${transaction.type === "pemasukan" ? "INVOICE" : "KUITANSI"}</h1>
            <p>No: ${transaction.id}</p>
          </div>
          
          <div class="detail-row">
            <span class="label">Tanggal:</span>
            <span>${format(new Date(transaction.date), "d MMMM yyyy", {
              locale: id,
            })}</span>
          </div>
          
           <div class="detail-row">
            <span class="label">Jenis Transaksi:</span>
            <span>${transaction.type === "pemasukan" ? "Pemasukan" : "Pengeluaran"}</span>
          </div>
          
          <div class="detail-row">
            <span class="label">${transaction.type === "pemasukan" ? "Konsumen" : "Supplier"}:</span>
            <span>${transaction.relatedParty}</span>
          </div>

          <div class="detail-row">
            <span class="label">Kategori:</span>
            <span>${transaction.category}</span>
          </div>
          
          <div class="detail-row">
            <span class="label">Deskripsi:</span>
            <span>${transaction.description}</span>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Jumlah</th>
                <th>Harga</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${transaction.items
                .map(
                  (item: Item) => `
                <tr>
                  <td>${item.name}</td>
                  <td>${item.quantity}</td>
                  <td>${formatRupiah(item.itemPrice)}</td>
                  <td>${formatRupiah(item.totalPrice)}</td>
                </tr>
              `
                )
                .join("")}
            </tbody>
          </table>
          
          <div class="total">
            Total: ${formatRupiah(transaction.amountTotal)}
          </div>

          ${
            transaction.paymentImg
              ? `
            <div style="margin-top: 30px;">
              <div class="label">Bukti Pembayaran:</div>
              <img src="${transaction.paymentImg}" style="max-width: 200px; margin-top: 10px;" />
            </div>
          `
              : ""
          }
          
          <button class="no-print" onclick="window.print()" style="margin-top: 20px; padding: 10px;">
            Print
          </button>
        </body>
      </html>
    `;

    // Write the content to the new window and print
    printWindow.document.write(content);
    printWindow.document.close();
  };

  const handleDownloadInvoice = async (id: string): Promise<void> => {
    try {
      const response = await fetch(`/api/transactions/${id}/invoice`);
      if (!response.ok) throw new Error("Failed to generate invoice");

      // Create a blob from the PDF stream
      const blob = await response.blob();

      // Create a link element and trigger download
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `transaction-${id}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Error downloading invoice:", error);
      toast.error("Failed to download invoice");
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/50">
                <TableHead className="w-12">
                  <Skeleton className="h-4 w-4" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-32" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-28" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-20" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-40" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-24" />
                </TableHead>
                <TableHead>
                  <Skeleton className="h-4 w-16" />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: pageSize }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-4 w-4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-48" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-36" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-24 rounded-full" />
                  </TableCell>
                  <TableCell>
                    <div className="space-y-2 rounded-md border px-2 py-1">
                      {Array.from({ length: 2 }).map((_, itemIndex) => (
                        <div
                          key={itemIndex}
                          className="flex items-center justify-between gap-2"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-8" />
                          </div>
                          <Skeleton className="h-4 w-20" />
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-28" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-center mt-4">
          <Skeleton className="h-8 w-64" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        {selectedRows.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkDelete}
            disabled={bulkDeleteMutation.isPending}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Hapus {selectedRows.length} Transaksi
          </Button>
        )}
      </div>

      <div className="overflow-hidden rounded-lg border transaction-table-container">
        <Table className="rounded-lg">
          <TableHeader>
            <TableRow className="bg-muted/50 ">
              <TableHead className="w-12">
                <Checkbox
                  checked={selectedRows.length === transactions.length}
                  onCheckedChange={(checked: boolean) =>
                    handleSelectAll(checked)
                  }
                />
              </TableHead>
              <TableHead>Tanggal</TableHead>
              <TableHead>Deskripsi</TableHead>
              <TableHead>Kategori</TableHead>
              <TableHead>{filters.type === "all" ? "Supplier/Konsumen" : filters.type === "pemasukan" ? "Konsumen" : "Supplier"}</TableHead>
              <TableHead>Jenis</TableHead>
              <TableHead>Item</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Bukti</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="**:data-[slot=table-cell]:first:w-8">
            {transactions.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={9}
                  className="text-center py-8 text-muted-foreground"
                >
                  Tidak ada transaksi
                </TableCell>
              </TableRow>
            ) : (
              transactions.map((transaction: TransactionItem) => (
                <TableRow
                  key={transaction.id}
                  className="transition-colors hover:bg-muted/50"
                >
                  <TableCell>
                    <Checkbox
                      checked={selectedRows.includes(transaction.id)}
                      onCheckedChange={(checked: boolean) =>
                        handleSelectRow(checked, transaction.id)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    {format(new Date(transaction.date), "d MMMM yyyy", {
                      locale: id,
                    })}
                  </TableCell>
                  <TableCell>{transaction.description}</TableCell>
                  <TableCell>{transaction.category}</TableCell>
                  <TableCell>{transaction.relatedParty}</TableCell>

                  <TableCell>
                    <span
                      className={`px-2.5 py-1.5 rounded text-muted-foreground text-xs border  font-medium inline-flex items-center gap-1 ${
                        transaction.type === "pemasukan"
                      }`}
                    >
                      {transaction.type === "pemasukan" ? (
                        <>
                          <TrendingUp className="w-4 h-4 text-green-600 mr-1 " />
                          Pemasukan
                        </>
                      ) : (
                        <>
                          <TrendingDown className="w-4 h-4   text-red-600 mr-1 " />
                          Pengeluaran
                        </>
                      )}
                    </span>
                  </TableCell>
                  <TableCell className="max-w-[300px]">
                    <div className="space-y-1 rounded-md border px-2 py-1 ">
                      {transaction.items.map((item: Item) => (
                        <div
                          key={item.id}
                          className="flex items-center justify-between gap-2 text-sm"
                        >
                          <div className="flex items-center gap-1.5 min-w-0">
                            <span className="truncate">{item.name}</span>
                            <span className="shrink-0 text-xs text-muted-foreground">
                              {item.quantity}x
                            </span>
                          </div>
                          <span className="shrink-0 tabular-nums text-xs font-medium">
                            {formatRupiah(item.totalPrice)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell >
                    <span>{formatRupiah(transaction.amountTotal)}</span>
                  </TableCell>
                  <TableCell className="text-center">
                    {transaction.paymentImg ? (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="flex justify-center items-center">
                            <Eye className="w-4 h-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-md">
                          <DialogHeader>
                            <DialogTitle>Bukti Pembayaran</DialogTitle>
                          </DialogHeader>
                          <div className="flex flex-col gap-4">
                            <div className="flex relative  justify-center items-center">
                              {isLoading ? (
                                <Skeleton className="w-full h-full" />
                              ) : (
                                <CldImage 
                                  src={transaction.paymentImg} 
                                  alt="Bukti Pembayaran"
                                  width={200}
                                  height={200}
                                  className="rounded-lg object-cover"
                                />
                              )}
                            </div>
                            <div className="flex gap-2">
                              <Button
                                variant="outline"
                                onClick={async () => {
                                  if (transaction.paymentImg) {
                                    try {
                                      const response = await fetch(transaction.paymentImg);
                                      const blob = await response.blob();
                                      const url = window.URL.createObjectURL(blob);
                                      const link = document.createElement('a');
                                      link.href = url;
                                      link.download = `payment-${transaction.id}.jpg`;
                                      document.body.appendChild(link);
                                      link.click();
                                      document.body.removeChild(link);
                                      window.URL.revokeObjectURL(url);
                                    } catch (error) {
                                      console.error('Error downloading image:', error);
                                      toast.error('Failed to download image');
                                    }
                                  }
                                }}
                              >
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </Button>
                              <Button
                                variant="outline" 
                                onClick={() => window.open(transaction.paymentImg, '_blank')}
                              >
                                <ExternalLink className="w-4 h-4 mr-2" />
                                Buka di Tab Baru
                              </Button>
                              <Button
                                variant="outline"
                                onClick={() => {
                                  navigator.clipboard.writeText(transaction.paymentImg || '');
                                  toast.success('Link berhasil disalin ke papan klip');
                                }}
                              >
                                <Link className="w-4 h-4 mr-2" />
                                Salin Link
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    ) : (
                      <span className="text-muted-foreground text-xs text-center">N/A</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEdit(transaction.id)}
                        >
                          <Pencil className="w-4 h-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handlePrintDetail(transaction)}
                        >
                          <Printer className="w-4 h-4 mr-2" />
                          Print Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDownloadInvoice(transaction.id)}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Download Invoice
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleDelete(transaction.id)}
                          className="text-red-600"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Hapus
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="flex justify-center mt-4">
          <Pagination
            totalPages={totalPages}
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </div>
  );
}
