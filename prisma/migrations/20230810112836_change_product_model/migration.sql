/*
  Warnings:

  - You are about to drop the `ProductVariant` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_ProductVariantToVariant` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ProductVariant" DROP CONSTRAINT "ProductVariant_productId_fkey";

-- DropForeignKey
ALTER TABLE "_ProductVariantToVariant" DROP CONSTRAINT "_ProductVariantToVariant_A_fkey";

-- DropForeignKey
ALTER TABLE "_ProductVariantToVariant" DROP CONSTRAINT "_ProductVariantToVariant_B_fkey";

-- DropTable
DROP TABLE "ProductVariant";

-- DropTable
DROP TABLE "_ProductVariantToVariant";

-- CreateTable
CREATE TABLE "ProductVariantOption" (
    "id" TEXT NOT NULL,
    "mrp" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "remainingStock" INTEGER NOT NULL DEFAULT 0,
    "isStockout" BOOLEAN NOT NULL DEFAULT false,
    "productId" TEXT,
    "variantOptionId" TEXT NOT NULL,
    "variantId" TEXT NOT NULL,

    CONSTRAINT "ProductVariantOption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ProductVariantOption" ADD CONSTRAINT "ProductVariantOption_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantOption" ADD CONSTRAINT "ProductVariantOption_variantId_fkey" FOREIGN KEY ("variantId") REFERENCES "Variant"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductVariantOption" ADD CONSTRAINT "ProductVariantOption_variantOptionId_fkey" FOREIGN KEY ("variantOptionId") REFERENCES "VariantOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
