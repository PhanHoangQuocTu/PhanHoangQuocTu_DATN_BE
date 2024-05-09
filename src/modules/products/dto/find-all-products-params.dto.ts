export type FindAllProductsParamsDto = {
    search: string;

    categoryId: number;
    
    authorId: number;

    publisherId: number;

    minPrice: number;

    maxPrice: number;

    minRating: number;

    maxRating: number;

    limit: number;

    page: number;
}
