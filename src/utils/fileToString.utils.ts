import fs from "fs";

export const fileToString = async (imagePath: string) => await fs.readFileSync(imagePath);