/**
 * Common types for the application
 */

// Generic record type to replace 'any' in object accumulators
export interface GenericRecord<T = unknown> {
  [key: string]: T;
}

// API response type
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Error type
export interface ApiError {
  status: number;
  message: string;
  details?: unknown;
}

// Transaction related types
export interface TransactionItem {
  id?: string;
  name: string;
  itemPrice: number;
  quantity: number;
  totalPrice: number;
  transactionId?: string;
  masterItemId?: string;
}

export interface TransactionData {
  id?: string;
  title: string;
  description?: string;
  date: Date | string;
  type: 'income' | 'expense';
  category: string;
  relatedParty: string;
  amountTotal: number;
  items?: TransactionItem[];
  [key: string]: unknown;
}

// Chart and reporting types
export interface ChartDataItem {
  name: string;
  value: number;
  [key: string]: string | number | Date;
}

// Form event types
export type FormChangeEvent = React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>;
export type FormSubmitEvent = React.FormEvent<HTMLFormElement>; 