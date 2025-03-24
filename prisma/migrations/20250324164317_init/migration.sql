/*
  Warnings:

  - A unique constraint covering the columns `[year]` on the table `YearHistory` will be added. If there are existing duplicate values, this will fail.
  - Made the column `yearHistoryId` on table `MonthHistory` required. This step will fail if there are existing NULL values in that column.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_MonthHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "totalIncome" REAL NOT NULL DEFAULT 0,
    "totalExpense" REAL NOT NULL DEFAULT 0,
    "yearHistoryId" TEXT NOT NULL,
    CONSTRAINT "MonthHistory_yearHistoryId_fkey" FOREIGN KEY ("yearHistoryId") REFERENCES "YearHistory" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_MonthHistory" ("id", "month", "totalExpense", "totalIncome", "year", "yearHistoryId") SELECT "id", "month", "totalExpense", "totalIncome", "year", "yearHistoryId" FROM "MonthHistory";
DROP TABLE "MonthHistory";
ALTER TABLE "new_MonthHistory" RENAME TO "MonthHistory";
CREATE UNIQUE INDEX "MonthHistory_year_month_key" ON "MonthHistory"("year", "month");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "YearHistory_year_key" ON "YearHistory"("year");
