export enum OrderStatus {
    PROCESSING = 'processing',
    SHIPPED = 'shipped',
    DELIVERED = 'delivered',
    CANCELLED = 'cancelled',
}

export enum OrderType {
    cash = 'cash',
    vnpay = 'vnpay',
}