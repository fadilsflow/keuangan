export interface CreateTransactionDTO {
  date: string | Date;
  description: string;
  category: string;
  relatedParty: string;
  amountTotal: number;
  paymentImg?: string;
  type: "pemasukan" | "pengeluaran";
  organizationId: string;
  userId: string;
  items: Array<{
    name: string;
    itemPrice: number;
    quantity: number;
    masterItemId?: string;
  }>;
}

export interface CreateItemDTO {
  name: string;
  itemPrice: number;
  quantity: number;
  masterItemId?: string;
} 