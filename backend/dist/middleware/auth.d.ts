import { Request, Response, NextFunction } from 'express';
interface AuthRequest extends Request {
    user?: {
        id: number;
        email: string;
    };
}
export declare const authMiddleware: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export default authMiddleware;
//# sourceMappingURL=auth.d.ts.map