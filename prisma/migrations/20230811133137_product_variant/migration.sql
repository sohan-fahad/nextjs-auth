/*
  Warnings:

  - You are about to drop the column `productId` on the `ProductVariantOption` table. All the data in the column will be lost.
  - You are about to drop the column `variantId` on the `ProductVariantOption` table. All the data in the column will be lost.
  - You are about to drop the column `variantOptionId` on the `ProductVariantOption` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductVariantOption" DROP CONSTRAINT "ProductVariantOption_productId_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariantOption" DROP CONSTRAINT "ProductVariantOption_variantId_fkey";

-- DropForeignKey
ALTER TABLE "ProductVariantOption" DROP CONSTRAINT "ProductVariantOption_variantOptionId_fkey";

-- AlterTable
ALTER TABLE "ProductVariantOption" DROP COLUMN "productId",
DROP COLUMN "variantId",
DROP COLUMN "variantOptionId",
ADD COLUMN     "productVariantId" TEXT;

-- CreateTable
CREATE TABLE "ProductVariant" (
    "id" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,
    "productId" TEXT,

    CONSTRAINT "ProductVariant_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariant" ADD CONSTRAINT "ProductVariant_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantOption" ADD CONSTRAINT "ProductVariantOption_productVariantId_fkey" FOREIGN KEY ("productVariantId") REFERENCES "ProductVariant"("id") ON DELETE SET NULL ON UPDATE CASCADE;
