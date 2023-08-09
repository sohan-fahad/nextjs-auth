import { genSalt, hash, compare } from "bcryptjs";

export const BcryptHelper = {
    hash: async (plainText: string, saltRounds: number = 10) => {
        const salt = await genSalt(saltRounds)
        return await hash(plainText, salt);
    },
    compare: (plainText: string, hashString: string) => {
        return compare(plainText, hashString);
    }

}