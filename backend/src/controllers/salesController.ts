import express, { Request, Response } from 'express';
import salesService from '../services/salesService';
import { validationResult } from 'express-validator';

// Extend Request interface to include file property
interface AuthenticatedRequest extends Request {
  user?: {
    id: number;
    email: string;
  };
  file?: any; // Use any for multer file to avoid TypeScript issues
}

// Define interface for import result
interface ImportResult {
  importedCount: number;
  skippedCount: number;
  errors: string[];
}

class SalesController {
  // Get all sales records with filtering and pagination
  async getAllSales(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'date',
        period = 'month',
        category,
        region,
        startDate,
        endDate
      } = req.query;
      
      const filters = {
        period,
        category,
        region,
        startDate: startDate ? new Date(startDate as string) : null,
        endDate: endDate ? new Date(endDate as string) : null
      };
      
      const analytics = await salesService.getSalesAnalytics(filters);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error in getAllSales:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get sales record by ID
  async getSalesById(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const sales = await salesService.getSalesById(parseInt(id));
      
      if (!sales) {
        return res.status(404).json({
          success: false,
          message: 'Sales record not found'
        });
      }
      
      res.json({
        success: true,
        data: sales
      });
    } catch (error) {
      console.error('Error in getSalesById:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Create new sales record
  async createSales(req: Request, res: Response) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }
      
      const sales = await salesService.createSales(req.body);
      
      res.status(201).json({
        success: true,
        message: 'Sales record created successfully',
        data: sales
      });
    } catch (error) {
      console.error('Error in createSales:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Update sales record
  async updateSales(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }
      
      const sales = await salesService.updateSales(parseInt(id), req.body);
      
      res.json({
        success: true,
        message: 'Sales record updated successfully',
        data: sales
      });
    } catch (error) {
      console.error('Error in updateSales:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Delete sales record
  async deleteSales(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const sales = await salesService.deleteSales(parseInt(id));
      
      if (!sales) {
        return res.status(404).json({
          success: false,
          message: 'Sales record not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Sales record deleted successfully',
        data: sales
      });
    } catch (error) {
      console.error('Error in deleteSales:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Export sales data
  async exportSales(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'date',
        period = 'month',
        category,
        region,
        startDate,
        endDate
      } = req.query;
      
      const filters = {
        period,
        category,
        region,
        startDate: startDate ? new Date(startDate as string) : null,
        endDate: endDate ? new Date(endDate as string) : null
      };
      
      const csvData = await salesService.exportSales(filters);
      
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename="sales_data.csv"');
      res.send(csvData);
    } catch (error) {
      console.error('Error in exportSales:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Get sales analytics
  async getSalesAnalytics(req: Request, res: Response) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'date',
        period = 'month',
        category,
        region,
        startDate,
        endDate
      } = req.query;
      
      const filters = {
        period,
        category,
        region,
        startDate: startDate ? new Date(startDate as string) : null,
        endDate: endDate ? new Date(endDate as string) : null
      };
      
      const analytics = await salesService.getSalesAnalytics(filters);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      console.error('Error in getSalesAnalytics:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Import sales data
  async importSales(req: AuthenticatedRequest, res: Response) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      // Check if file is CSV
      if (!req.file.originalname.endsWith('.csv')) {
        return res.status(400).json({
          success: false,
          message: 'Only CSV files are allowed'
        });
      }

      // Pass file buffer directly to service
      const result = await salesService.importSales(req.file) as ImportResult;
      
      res.json({
        success: true,
        message: `Successfully imported ${result.importedCount} records`,
        data: {
          importedCount: result.importedCount,
          skippedCount: result.skippedCount,
          errors: result.errors
        }
      });
    } catch (error: any) {
      console.error('Error in importSales:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

export default new SalesController();
