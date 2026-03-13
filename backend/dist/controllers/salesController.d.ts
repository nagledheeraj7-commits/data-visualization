import express, { Request, Response } from 'express';
interface AuthenticatedRequest extends Request {
    user?: {
        id: number;
        email: string;
    };
    file?: any;
}
declare class SalesController {
    getAllSales(req: Request, res: Response): Promise<void>;
    getSalesById(req: Request, res: Response): Promise<express.Response<any, Record<string, any>> | undefined>;
    createSales(req: Request, res: Response): Promise<express.Response<any, Record<string, any>> | undefined>;
    updateSales(req: Request, res: Response): Promise<express.Response<any, Record<string, any>> | undefined>;
    deleteSales(req: Request, res: Response): Promise<express.Response<any, Record<string, any>> | undefined>;
    exportSales(req: Request, res: Response): Promise<void>;
    getSalesAnalytics(req: Request, res: Response): Promise<void>;
    importSales(req: AuthenticatedRequest, res: Response): Promise<express.Response<any, Record<string, any>> | undefined>;
}
declare const _default: SalesController;
export default _default;
//# sourceMappingURL=salesController.d.ts.map