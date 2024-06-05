export type MonthlyRevenueParamsDto = {
    limit: number;

    page: number;
}

export type MonthlyRevenueResult = {
    month: string;
    revenue: number;
};

export type MonthlyRevenueMeta = {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
};

export type MonthlyRevenueResponse = {
    data: MonthlyRevenueResult[];
    meta: MonthlyRevenueMeta;
};