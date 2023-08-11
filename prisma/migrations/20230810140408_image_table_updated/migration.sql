/*
  Warnings:

  - You are about to drop the column `delete_url` on the `Image` table. All the data in the column will be lost.
  - Added the required column `publicId` to the `Image` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Image" DROP COLUMN "delete_url",
ADD COLUMN     "publicId" TEXT NOT NULL;
