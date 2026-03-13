declare class SalesService {
    getAllSales(filters?: any, options?: any): Promise<{
        sales: ({
            user: {
                id: number;
                email: string;
                name: string;
            };
        } & {
            date: Date;
            category: string;
            region: string;
            product: string;
            sales: number;
            id: number;
            orderId: string;
            revenue: number;
            createdAt: Date;
            updatedAt: Date;
            userId: number;
        })[];
        currentPage: any;
        totalPages: number;
        totalItems: number;
        itemsPerPage: any;
    }>;
    getSalesById(id: number): Promise<({
        user: {
            id: number;
            email: string;
            name: string;
        };
    } & {
        date: Date;
        category: string;
        region: string;
        product: string;
        sales: number;
        id: number;
        orderId: string;
        revenue: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
    }) | null>;
    createSales(data: any): Promise<{
        date: Date;
        category: string;
        region: string;
        product: string;
        sales: number;
        id: number;
        orderId: string;
        revenue: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
    }>;
    updateSales(id: number, data: any): Promise<{
        date: Date;
        category: string;
        region: string;
        product: string;
        sales: number;
        id: number;
        orderId: string;
        revenue: number;
        createdAt: Date;
        updatedAt: Date;
        userId: number;
    }>;
    deleteSales(id: number): Promise<boolean>;
    getSalesAnalytics(filters?: any): Promise<{
        summary: import(".prisma/client").Prisma.GetSalesAggregateType<{
            where: any;
            _sum: {
                sales: true;
                revenue: true;
            };
            _count: {
                id: true;
            };
        }>;
        categoryBreakdown: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.SalesGroupByOutputType, "category"[]> & {
            _count: {
                id: number;
            };
            _sum: {
                sales: number | null;
                revenue: number | null;
            };
        })[];
        regionBreakdown: (import(".prisma/client").Prisma.PickEnumerable<import(".prisma/client").Prisma.SalesGroupByOutputType, "region"[]> & {
            _count: {
                id: number;
            };
            _sum: {
                sales: number | null;
                revenue: number | null;
            };
        })[];
        period: any;
    }>;
    exportSales(filters?: any, format?: string): Promise<string | {
        order_id: any;
        product: any;
        category: any;
        region: any;
        sales: any;
        revenue: any;
        date: any;
    }[]>;
    importSales(file: any): Promise<unknown>;
}
declare const _default: SalesService;
export default _default;
//# sourceMappingURL=salesService.d.ts.map