import { prisma } from "@/lib/prisma";

export interface MonthlyData {
  [key: string]: {
    month: number;
    year: number;
    income: number;
    expense: number;
  };
}

export interface CategoryData {
  [key: string]: {
    category: string;
    income: number;
    expense: number;
    type: "income" | "expense";
  };
}

export interface YearlyData {
  [key: string]: {
    year: number;
    income: number;
    expense: number;
  };
}

export interface RelatedPartyData {
  [key: string]: {
    relatedParty: string;
    income: number;
    expense: number;
    type: "income" | "expense";
  };
}

export interface ItemData {
  [key: string]: {
    itemName: string;
    quantity: number;
    totalAmount: number;
    type: "income" | "expense";
  };
}

export interface TransactionTypeData {
  type: "income" | "expense";
  total: number;
  transactionCount: number;
  categories: { name: string; total: number }[];
  relatedParties: { name: string; total: number }[];
  items: { name: string; total: number; quantity: number }[];
}

export async function generateMonthlyReport(orgId: string, startDate: Date, endDate: Date) {
  const transactions = await prisma.transaction.findMany({
    where: {
      organizationId: orgId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      date: true,
      type: true,
      amountTotal: true,
    },
    orderBy: {
      date: "asc",
    },
  });

  // Group transactions by month
  const monthlyData = transactions.reduce((acc: MonthlyData, transaction) => {
    const month = transaction.date.getMonth();
    const year = transaction.date.getFullYear();
    const key = `${year}-${month + 1}`;

    if (!acc[key]) {
      acc[key] = {
        month: month + 1,
        year,
        income: 0,
        expense: 0,
      };
    }

    if (transaction.type === "income" || transaction.type === "pemasukan") {
      acc[key].income += transaction.amountTotal;
    } else {
      acc[key].expense += transaction.amountTotal;
    }

    return acc;
  }, {});

  return Object.values(monthlyData);
}

export async function generateCategoryReport(orgId: string, startDate: Date, endDate: Date) {
  const transactions = await prisma.transaction.findMany({
    where: {
      organizationId: orgId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      category: true,
      type: true,
      amountTotal: true,
    },
  });

  // Group transactions by category and type
  const categoryData = transactions.reduce((acc: CategoryData, transaction) => {
    const isIncome = transaction.type === "income" || transaction.type === "pemasukan";
    const type = isIncome ? "income" : "expense";
    const key = `${transaction.category}-${type}`;

    if (!acc[key]) {
      acc[key] = {
        category: transaction.category,
        income: 0,
        expense: 0,
        type: type,
      };
    }

    if (isIncome) {
      acc[key].income += transaction.amountTotal;
    } else {
      acc[key].expense += transaction.amountTotal;
    }

    return acc;
  }, {});

  return Object.values(categoryData);
}

export async function generateYearlyReport(orgId: string, startDate: Date, endDate: Date) {
  const transactions = await prisma.transaction.findMany({
    where: {
      organizationId: orgId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      date: true,
      type: true,
      amountTotal: true,
    },
  });

  // Group transactions by year
  const yearlyData = transactions.reduce((acc: YearlyData, transaction) => {
    const year = transaction.date.getFullYear();

    if (!acc[year]) {
      acc[year] = {
        year,
        income: 0,
        expense: 0,
      };
    }

    if (transaction.type === "income" || transaction.type === "pemasukan") {
      acc[year].income += transaction.amountTotal;
    } else {
      acc[year].expense += transaction.amountTotal;
    }

    return acc;
  }, {});

  return Object.values(yearlyData);
}

export async function generateRelatedPartyReport(orgId: string, startDate: Date, endDate: Date) {
  const transactions = await prisma.transaction.findMany({
    where: {
      organizationId: orgId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      relatedParty: true,
      type: true,
      amountTotal: true,
    },
  });

  // Group transactions by related party and type
  const relatedPartyData = transactions.reduce((acc: RelatedPartyData, transaction) => {
    const isIncome = transaction.type === "income" || transaction.type === "pemasukan";
    const type = isIncome ? "income" : "expense";
    const key = `${transaction.relatedParty}-${type}`;

    if (!acc[key]) {
      acc[key] = {
        relatedParty: transaction.relatedParty,
        income: 0,
        expense: 0,
        type: type,
      };
    }

    if (isIncome) {
      acc[key].income += transaction.amountTotal;
    } else {
      acc[key].expense += transaction.amountTotal;
    }

    return acc;
  }, {});

  return Object.values(relatedPartyData);
}

export async function generateItemReport(orgId: string, startDate: Date, endDate: Date) {
  const transactions = await prisma.transaction.findMany({
    where: {
      organizationId: orgId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      items: true,
    },
  });

  // Group by items
  const itemData = transactions.reduce((acc: ItemData, transaction) => {
    const isIncome = transaction.type === "income" || transaction.type === "pemasukan";
    const type = isIncome ? "income" : "expense";
    
    transaction.items.forEach(item => {
      const key = `${item.name}-${type}`;
      
      if (!acc[key]) {
        acc[key] = {
          itemName: item.name,
          quantity: 0,
          totalAmount: 0,
          type: type,
        };
      }
      
      acc[key].quantity += item.quantity;
      acc[key].totalAmount += item.totalPrice;
    });
    
    return acc;
  }, {});

  return Object.values(itemData);
}

export async function generateSummaryReport(orgId: string, startDate: Date, endDate: Date) {
  // Fetch transactions with items
  const transactions = await prisma.transaction.findMany({
    where: {
      organizationId: orgId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    include: {
      items: true,
    },
  });

  // Separate by transaction type
  const summary: { income: TransactionTypeData, expense: TransactionTypeData } = {
    income: {
      type: "income",
      total: 0,
      transactionCount: 0,
      categories: [],
      relatedParties: [],
      items: [],
    },
    expense: {
      type: "expense",
      total: 0,
      transactionCount: 0,
      categories: [],
      relatedParties: [],
      items: [],
    }
  };

  // Helper objects for aggregation
  const categories: { 
    income: Record<string, number>, 
    expense: Record<string, number> 
  } = { 
    income: {}, 
    expense: {} 
  };
  
  const relatedParties: { 
    income: Record<string, number>, 
    expense: Record<string, number> 
  } = { 
    income: {}, 
    expense: {} 
  };
  
  const items: { 
    income: Record<string, { total: number, quantity: number }>, 
    expense: Record<string, { total: number, quantity: number }> 
  } = { 
    income: {}, 
    expense: {} 
  };

  // Aggregate data
  transactions.forEach(transaction => {
    const isIncome = transaction.type === "income" || transaction.type === "pemasukan";
    const type = isIncome ? "income" : "expense";
    
    // Add to total and count
    summary[type].total += transaction.amountTotal;
    summary[type].transactionCount += 1;
    
    // Process category
    if (!categories[type][transaction.category]) {
      categories[type][transaction.category] = 0;
    }
    categories[type][transaction.category] += transaction.amountTotal;
    
    // Process related party
    if (!relatedParties[type][transaction.relatedParty]) {
      relatedParties[type][transaction.relatedParty] = 0;
    }
    relatedParties[type][transaction.relatedParty] += transaction.amountTotal;
    
    // Process items
    transaction.items.forEach(item => {
      const itemKey = item.name;
      if (!items[type][itemKey]) {
        items[type][itemKey] = { total: 0, quantity: 0 };
      }
      items[type][itemKey].total += item.totalPrice;
      items[type][itemKey].quantity += item.quantity;
    });
  });

  // Convert aggregated data to arrays
  summary.income.categories = Object.entries(categories.income)
    .map(([name, total]) => ({ name, total: total as number }))
    .sort((a, b) => b.total - a.total);
  
  summary.income.relatedParties = Object.entries(relatedParties.income)
    .map(([name, total]) => ({ name, total: total as number }))
    .sort((a, b) => b.total - a.total);
  
  summary.income.items = Object.entries(items.income)
    .map(([name, data]) => ({ 
      name, 
      total: (data as { total: number, quantity: number }).total,
      quantity: (data as { total: number, quantity: number }).quantity
    }))
    .sort((a, b) => b.total - a.total);
  
  summary.expense.categories = Object.entries(categories.expense)
    .map(([name, total]) => ({ name, total: total as number }))
    .sort((a, b) => b.total - a.total);
  
  summary.expense.relatedParties = Object.entries(relatedParties.expense)
    .map(([name, total]) => ({ name, total: total as number }))
    .sort((a, b) => b.total - a.total);
  
  summary.expense.items = Object.entries(items.expense)
    .map(([name, data]) => ({ 
      name, 
      total: (data as { total: number, quantity: number }).total,
      quantity: (data as { total: number, quantity: number }).quantity
    }))
    .sort((a, b) => b.total - a.total);

  return summary;
} 