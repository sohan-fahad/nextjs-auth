import slugify from 'slugify';

export const generateSlug = (str: string) => {
    const slug = slugify(str, {
        replacement: '-',
        remove: undefined,
        lower: true,
    });
    return slug;
};