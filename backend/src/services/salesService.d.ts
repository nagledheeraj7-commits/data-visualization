declare class SalesService {
    getAllSales(filters?: any, options?: any): Promise<{
        sales: ({
            user: {
                email: string;
                id: number;
                name: string;
            };
        } & {
            id: number;
            createdAt: Date;
            updatedAt: Date;
            sales: number;
            userId: number;
            orderId: string;
            product: string;
            category: string;
            region: string;
            revenue: number;
            date: Date;
        })[];
        currentPage: any;
        totalPages: number;
        totalItems: number;
        itemsPerPage: any;
    }>;
    getSalesById(id: number): Promise<({
        user: {
            email: string;
            id: number;
            name: string;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        sales: number;
        userId: number;
        orderId: string;
        product: string;
        category: string;
        region: string;
        revenue: number;
        date: Date;
    }) | null>;
    createSales(data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        sales: number;
        userId: number;
        orderId: string;
        product: string;
        category: string;
        region: string;
        revenue: number;
        date: Date;
    }>;
    updateSales(id: number, data: any): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        sales: number;
        userId: number;
        orderId: string;
        product: string;
        category: string;
        region: string;
        revenue: number;
        date: Date;
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