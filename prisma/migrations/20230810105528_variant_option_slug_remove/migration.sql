/*
  Warnings:

  - You are about to drop the column `slug` on the `VariantOption` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "VariantOption_slug_key";

-- AlterTable
ALTER TABLE "VariantOption" DROP COLUMN "slug";
