import { create } from 'zustand';
import { startOfMonth, endOfMonth } from "date-fns";
import { ReportFiltersState, ReportType, TransactionType } from '@/types/report';
import { DateRange } from 'react-day-picker';

interface ReportStore extends ReportFiltersState {
  setDate: (date: DateRange | undefined) => void;
  setReportType: (type: ReportType) => void;
  setTransactionType: (type: "all" | TransactionType) => void;
}

export const useReportStore = create<ReportStore>((set) => ({
  date: {
    from: startOfMonth(new Date()),
    to: endOfMonth(new Date()),
  },
  reportType: 'monthly',
  transactionType: 'all',
  setDate: (date) => set({ date }),
  setReportType: (reportType) => set({ reportType }),
  setTransactionType: (transactionType) => set({ transactionType }),
})); 