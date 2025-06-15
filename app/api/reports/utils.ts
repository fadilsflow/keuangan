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

export async function generateMonthlyReport(
  orgId: string,
  startDate: Date,
  endDate: Date
) {
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

export async function generateCategoryReport(
  orgId: string,
  startDate: Date,
  endDate: Date
) {
  const transactions = await prisma.transaction.findMany({
    where: {
      organizationId: orgId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      category: {
        select: {
          name: true,
        },
      },
      type: true,
      amountTotal: true,
    },
  });

  // Group transactions by category and type
  const categoryData = transactions.reduce((acc: CategoryData, transaction) => {
    const isIncome =
      transaction.type === "income" || transaction.type === "pemasukan";
    const type = isIncome ? "income" : "expense";
    const key = `${transaction.category.name}-${type}`;

    if (!acc[key]) {
      acc[key] = {
        category: transaction.category.name,
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

export async function generateYearlyReport(
  orgId: string,
  startDate: Date,
  endDate: Date
) {
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

export async function generateRelatedPartyReport(
  orgId: string,
  startDate: Date,
  endDate: Date
) {
  const transactions = await prisma.transaction.findMany({
    where: {
      organizationId: orgId,
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: {
      relatedParty: {
        select: {
          name: true,
        },
      },
      type: true,
      amountTotal: true,
    },
  });

  // Group transactions by related party and type
  const relatedPartyData = transactions.reduce(
    (acc: RelatedPartyData, transaction) => {
      const isIncome =
        transaction.type === "income" || transaction.type === "pemasukan";
      const type = isIncome ? "income" : "expense";
      const key = `${transaction.relatedParty.name}-${type}`;

      if (!acc[key]) {
        acc[key] = {
          relatedParty: transaction.relatedParty.name,
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
    },
    {}
  );

  return Object.values(relatedPartyData);
}

export async function generateItemReport(
  orgId: string,
  startDate: Date,
  endDate: Date
) {
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
    const isIncome =
      transaction.type === "income" || transaction.type === "pemasukan";
    const type = isIncome ? "income" : "expense";

    transaction.items.forEach((item) => {
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

export async function generateSummaryReport(
  orgId: string,
  startDate: Date,
  endDate: Date
) {
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
      category: {
        select: {
          name: true,
        },
      },
      relatedParty: {
        select: {
          name: true,
        },
      },
    },
  });

  const incomeData: TransactionTypeData = {
    type: "income",
    total: 0,
    transactionCount: 0,
    categories: [],
    relatedParties: [],
    items: [],
  };

  const expenseData: TransactionTypeData = {
    type: "expense",
    total: 0,
    transactionCount: 0,
    categories: [],
    relatedParties: [],
    items: [],
  };

  // Helper function to update category stats
  function updateCategoryStats(
    data: TransactionTypeData,
    categoryName: string,
    amount: number
  ) {
    const existingCategory = data.categories.find(
      (c) => c.name === categoryName
    );
    if (existingCategory) {
      existingCategory.total += amount;
    } else {
      data.categories.push({ name: categoryName, total: amount });
    }
  }

  // Helper function to update related party stats
  function updateRelatedPartyStats(
    data: TransactionTypeData,
    partyName: string,
    amount: number
  ) {
    const existingParty = data.relatedParties.find((p) => p.name === partyName);
    if (existingParty) {
      existingParty.total += amount;
    } else {
      data.relatedParties.push({ name: partyName, total: amount });
    }
  }

  // Helper function to update item stats
  function updateItemStats(
    data: TransactionTypeData,
    itemName: string,
    amount: number,
    quantity: number
  ) {
    const existingItem = data.items.find((i) => i.name === itemName);
    if (existingItem) {
      existingItem.total += amount;
      existingItem.quantity += quantity;
    } else {
      data.items.push({ name: itemName, total: amount, quantity: quantity });
    }
  }

  // Process transactions
  transactions.forEach((transaction) => {
    const data = transaction.type === "pemasukan" ? incomeData : expenseData;
    data.total += transaction.amountTotal;
    data.transactionCount++;

    // Update category stats
    updateCategoryStats(
      data,
      transaction.category.name,
      transaction.amountTotal
    );

    // Update related party stats
    updateRelatedPartyStats(
      data,
      transaction.relatedParty.name,
      transaction.amountTotal
    );

    // Update item stats
    transaction.items.forEach((item) => {
      updateItemStats(data, item.name, item.totalPrice, item.quantity);
    });
  });

  // Sort arrays by total amount
  [incomeData, expenseData].forEach((data) => {
    data.categories.sort((a, b) => b.total - a.total);
    data.relatedParties.sort((a, b) => b.total - a.total);
    data.items.sort((a, b) => b.total - a.total);
  });

  return {
    income: incomeData,
    expense: expenseData,
  };
}
