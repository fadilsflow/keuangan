import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { TransactionRequest, TransactionResponse, PaginationResponse } from '@/lib/types';

// Fungsi fetcher untuk mengambil semua transaksi
async function fetchTransactions(
  page = 1,
  limit = 10,
  filters?: { type?: string; category?: string; startDate?: string; endDate?: string; search?: string }
): Promise<PaginationResponse<TransactionResponse>> {
  let url = `/api/transactions?page=${page}&limit=${limit}`;
  
  if (filters) {
    if (filters.type) url += `&type=${filters.type}`;
    if (filters.category) url += `&category=${filters.category}`;
    if (filters.startDate) url += `&startDate=${filters.startDate}`;
    if (filters.endDate) url += `&endDate=${filters.endDate}`;
    if (filters.search) url += `&search=${filters.search}`;
  }
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch transactions');
  }
  
  return response.json();
}

// Fungsi fetcher untuk mengambil satu transaksi berdasarkan ID
async function fetchTransactionById(id: string): Promise<{ data: TransactionResponse }> {
  const response = await fetch(`/api/transactions/${id}`);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch transaction');
  }
  
  return response.json();
}

// Fungsi untuk membuat transaksi baru
async function createTransaction(transaction: TransactionRequest): Promise<{ data: TransactionResponse }> {
  const response = await fetch('/api/transactions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transaction),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to create transaction');
  }
  
  return response.json();
}

// Fungsi untuk memperbarui transaksi
async function updateTransaction(
  id: string, 
  transaction: TransactionRequest
): Promise<{ data: TransactionResponse }> {
  const response = await fetch(`/api/transactions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(transaction),
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to update transaction');
  }
  
  return response.json();
}

// Fungsi untuk menghapus transaksi
async function deleteTransaction(id: string): Promise<{ message: string }> {
  const response = await fetch(`/api/transactions/${id}`, {
    method: 'DELETE',
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to delete transaction');
  }
  
  return response.json();
}

// Fetch Categories
async function fetchCategories(): Promise<{ data: string[] }> {
  const response = await fetch('/api/categories');
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch categories');
  }
  
  return response.json();
}

// Fetch Summary
async function fetchSummary(year: number, month?: number): Promise<any> {
  let url = `/api/summary?year=${year}`;
  if (month) url += `&month=${month}`;
  
  const response = await fetch(url);
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to fetch summary');
  }
  
  return response.json();
}

// Upload file
export async function uploadFile(file: File): Promise<{ url: string; filename: string }> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch('/api/upload', {
    method: 'POST',
    body: formData,
  });
  
  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Failed to upload file');
  }
  
  return response.json();
}

// Hooks
export function useTransactions(
  page = 1, 
  limit = 10, 
  filters?: { type?: string; category?: string; startDate?: string; endDate?: string; search?: string }
) {
  return useQuery({
    queryKey: ['transactions', page, limit, filters],
    queryFn: () => fetchTransactions(page, limit, filters),
  });
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: ['transaction', id],
    queryFn: () => fetchTransactionById(id),
    enabled: !!id,
  });
}

export function useCateg