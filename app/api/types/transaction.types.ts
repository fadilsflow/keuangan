export interface CreateTransactionDTO {
  date: string | Date;
  description: string;
  category: string;
  relatedParty: string;
  amountTotal: number;
  paymentImg?: string;
  type: "pemasukan" | "pengeluaran";
  items: Array<{
    name: string;
    itemPrice: number;
    quantity: number;
  }>;
}

export interface CreateItemDTO {
  name: string;
  itemPrice: number;
  quantity: number;
} 