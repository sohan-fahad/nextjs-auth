import { diskStorage } from 'multer';
import * as path from 'path';

export const generateFilename = (file: any) => {
    return `${Date.now()}${path.extname(file.name)}`;
};

export const storageImageOptions = diskStorage({
    destination: './uploads/temp',
    filename: (req, file, callback) => {
        callback(null, generateFilename(file));
    },
});


