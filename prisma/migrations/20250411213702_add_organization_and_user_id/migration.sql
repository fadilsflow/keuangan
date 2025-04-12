/*
  Warnings:

  - Added the required column `organizationId` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Item` table without a default value. This is not possible if the table is not empty.
  - Added the required column `organizationId` to the `Transaction` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Item" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "itemPrice" REAL NOT NULL,
    "quantity" INTEGER NOT NULL,
    "totalPrice" REAL NOT NULL,
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    CONSTRAINT "Item_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
-- Set default values for existing records (org_default and user_default)
INSERT INTO "new_Item" ("id", "itemPrice", "name", "quantity", "totalPrice", "transactionId", "organizationId", "userId") 
SELECT "id", "itemPrice", "name", "quantity", "totalPrice", "transactionId", 'org_default', 'user_default' FROM "Item";
DROP TABLE "Item";
ALTER TABLE "new_Item" RENAME TO "Item";
CREATE INDEX "Item_organizationId_idx" ON "Item"("organizationId");
CREATE INDEX "Item_userId_idx" ON "Item"("userId");
CREATE INDEX "Item_transactionId_idx" ON "Item"("transactionId");
CREATE TABLE "new_Transaction" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "date" DATETIME NOT NULL,
    "description" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "relatedParty" TEXT NOT NULL,
    "amountTotal" REAL NOT NULL,
    "paymentImg" TEXT NOT NULL DEFAULT '',
    "type" TEXT NOT NULL DEFAULT 'pengeluaran',
    "organizationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "monthHistoryId" TEXT,
    CONSTRAINT "Transaction_monthHistoryId_fkey" FOREIGN KEY ("monthHistoryId") REFERENCES "MonthHistory" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
-- Set default values for existing records (org_default and user_default)
INSERT INTO "new_Transaction" ("amountTotal", "category", "createdAt", "date", "description", "id", "monthHistoryId", "paymentImg", "relatedParty", "type", "updatedAt", "organizationId", "userId") 
SELECT "amountTotal", "category", "createdAt", "date", "description", "id", "monthHistoryId", "paymentImg", "relatedParty", "type", "updatedAt", 'org_default', 'user_default' FROM "Transaction";
DROP TABLE "Transaction";
ALTER TABLE "new_Transaction" RENAME TO "Transaction";
CREATE INDEX "Transaction_organizationId_idx" ON "Transaction"("organizationId");
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");
CREATE INDEX "Transaction_organizationId_userId_idx" ON "Transaction"("organizationId", "userId");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
