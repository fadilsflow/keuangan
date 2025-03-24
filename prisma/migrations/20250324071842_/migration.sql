-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "relatedParty" TEXT NOT NULL,
    "amountTotal" REAL NOT NULL,
    "paymentImg" TEXT NOT NULL,
    "type" TEXT NOT NULL DEFAULT 'income',
    "monthHistoryId" TEXT,
    CONSTRAINT "Transaction_monthHistoryId_fkey" FOREIGN KEY ("monthHistoryId") REFERENCES "MonthHistory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "itemPrice" REAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalPrice" REAL NOT NULL,
    "transactionId" TEXT NOT NULL,
    CONSTRAINT "Item_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "MonthHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "totalIncome" REAL NOT NULL DEFAULT 0,
    "totalExpense" REAL NOT NULL DEFAULT 0,
    "yearHistoryId" TEXT,
    CONSTRAINT "MonthHistory_yearHistoryId_fkey" FOREIGN KEY ("yearHistoryId") REFERENCES "YearHistory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "YearHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "totalIncome" REAL NOT NULL DEFAULT 0,
    "totalExpense" REAL NOT NULL DEFAULT 0
);
