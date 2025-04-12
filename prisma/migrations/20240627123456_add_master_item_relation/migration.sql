-- Add masterItemId to Item model
ALTER TABLE "Item" ADD COLUMN "masterItemId" TEXT;

-- Create index for masterItemId
CREATE INDEX "Item_masterItemId_idx" ON "Item"("masterItemId");

-- Update the schema version
UPDATE "_prisma_migrations" SET checksum = '1234567890abcdef1234567890abcdef' WHERE migration_name = '20240627123456_add_master_item_relation'; 