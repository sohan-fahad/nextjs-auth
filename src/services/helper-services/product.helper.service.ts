import { asyncForEach } from "@/utils/asyncForEach.utils";
import { prisma } from '@/lib/prisma';
import { NextResponse } from "next/server";

export const ProductHelperService = {
    validateVariantOptions: async (variantOptions: any[]) => {
        let validatedData: any[] = [];
        await asyncForEach(variantOptions, async (item: any) => {


            const existVariantOption = await prisma.variantOption.findUnique({
                where: { id: item?.variantOptionId }, include: { variant: true }
            })

            if (!existVariantOption) {
                return NextResponse.json({ message: 'Variant option does not exist', success: false, statusCode: 400 }, { status: 400 });;
            }

            validatedData.push({ ...item, variantId: existVariantOption?.variant?.id, remainingStock: item?.stock });
        })

        return validatedData
    }
}