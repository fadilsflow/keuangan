import { DateRange } from "react-day-picker";

export interface BaseReportItem {
  year: number;
  income: number;
  expense: number;
}

export interface MonthlyReportItem extends BaseReportItem {
  type: 'monthly';
  month: number;
}

export interface YearlyReportItem extends BaseReportItem {
  type: 'yearly';
}

export interface CategoryReportItem extends BaseReportItem {
  type: 'category';
  category: string;
}

export interface RelatedPartyReportItem extends BaseReportItem {
  type: 'related-party';
  relatedParty: string;
}

export interface ItemReportItem extends BaseReportItem {
  type: 'items';
  itemName: string;
  quantity: number;
  totalAmount: number;
  transactionType: "income" | "expense";
}

export interface SummaryData {
  total: number;
  transactionCount: number;
  income: {
    total: number;
    count: number;
    transactionCount: number;
    categories?: Array<{ name: string; total: number }>;
    relatedParties?: Array<{ name: string; total: number }>;
    items?: Array<{ name: string; quantity: number; totalAmount: number }>;
  };
  expense: {
    total: number;
    count: number;
    transactionCount: number;
    categories?: Array<{ name: string; total: number }>;
    relatedParties?: Array<{ name: string; total: number }>;
    items?: Array<{ name: string; quantity: number; totalAmount: number }>;
  };
}

export type ReportDataItem = MonthlyReportItem | YearlyReportItem | CategoryReportItem | RelatedPartyReportItem | ItemReportItem;
export type ArrayReportData = ReportDataItem[] & SummaryData;
export type ReportData = ArrayReportData | SummaryData;

export type TransactionType = "income" | "expense";

export const reportTypes = [
  { value: "monthly", label: "Laporan Bulanan" },
  { value: "yearly", label: "Laporan Tahunan" },
  { value: "category", label: "Laporan Kategori" },
  { value: "related-party", label: "Laporan Pihak Terkait" },
  { value: "items", label: "Laporan Item" },
  { value: "summary", label: "Laporan Ringkasan" },
] as const;

export type ReportType = typeof reportTypes[number]["value"];

export interface ReportFiltersState {
  date: DateRange | undefined;
  reportType: ReportType;
  transactionType: "all" | TransactionType;
}

// Type guard functions
export const isMonthlyReport = (item: ReportDataItem): item is MonthlyReportItem => item.type === 'monthly';
export const isYearlyReport = (item: ReportDataItem): item is YearlyReportItem => item.type === 'yearly';
export const isCategoryReport = (item: ReportDataItem): item is CategoryReportItem => item.type === 'category';
export const isRelatedPartyReport = (item: ReportDataItem): item is RelatedPartyReportItem => item.type === 'related-party';
export const isItemReport = (item: ReportDataItem): item is ItemReportItem => item.type === 'items';
export const isArrayData = (data: ReportData): data is ArrayReportData => Array.isArray(data); 