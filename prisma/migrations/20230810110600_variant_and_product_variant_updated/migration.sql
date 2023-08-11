/*
  Warnings:

  - You are about to drop the column `productVariantId` on the `Variant` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Variant" DROP CONSTRAINT "Variant_productVariantId_fkey";

-- AlterTable
ALTER TABLE "ProductVariant" ADD COLUMN     "variantId" TEXT;

-- AlterTable
ALTER TABLE "Variant" DROP COLUMN "productVariantId";

-- CreateTable
CREATE TABLE "_ProductVariantToVariant" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_ProductVariantToVariant_AB_unique" ON "_ProductVariantToVariant"("A", "B");

-- CreateIndex
CREATE INDEX "_ProductVariantToVariant_B_index" ON "_ProductVariantToVariant"("B");

-- AddForeignKey
ALTER TABLE "_ProductVariantToVariant" ADD CONSTRAINT "_ProductVariantToVariant_A_fkey" FOREIGN KEY ("A") REFERENCES "ProductVariant"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ProductVariantToVariant" ADD CONSTRAINT "_ProductVariantToVariant_B_fkey" FOREIGN KEY ("B") REFERENCES "Variant"("id") ON DELETE CASCADE ON UPDATE CASCADE;
