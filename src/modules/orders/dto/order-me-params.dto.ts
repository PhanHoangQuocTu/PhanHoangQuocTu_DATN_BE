import { OrderStatus } from "src/utils/common/order-status.enum";

export type OrderMeParamsDto = {
    limit: number;
    page: number;
    status?: OrderStatus;
}