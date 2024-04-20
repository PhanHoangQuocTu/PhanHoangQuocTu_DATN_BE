export type FindAllProductsParamsDto = {
    search: string;

    categoryId: number;

    minPrice: number;

    maxPrice: number;

    minRating: number;

    maxRating: number;

    limit: number;

    page: number;
}
