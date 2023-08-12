/*
  Warnings:

  - You are about to drop the `OrderItemVariant` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `productId` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "OrderItemVariant" DROP CONSTRAINT "OrderItemVariant_orderItemId_fkey";

-- DropForeignKey
ALTER TABLE "OrderItemVariant" DROP CONSTRAINT "OrderItemVariant_variantId_fkey";

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "productId" TEXT NOT NULL;

-- DropTable
DROP TABLE "OrderItemVariant";

-- CreateTable
CREATE TABLE "OrderItemVariantOptions" (
    "id" TEXT NOT NULL,
    "orderItemId" TEXT,
    "productVariantOptionId" TEXT NOT NULL,

    CONSTRAINT "OrderItemVariantOptions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemVariantOptions" ADD CONSTRAINT "OrderItemVariantOptions_orderItemId_fkey" FOREIGN KEY ("orderItemId") REFERENCES "OrderItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderItemVariantOptions" ADD CONSTRAINT "OrderItemVariantOptions_productVariantOptionId_fkey" FOREIGN KEY ("productVariantOptionId") REFERENCES "ProductVariantOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
