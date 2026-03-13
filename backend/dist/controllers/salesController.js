"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const salesService_1 = __importDefault(require("../services/salesService"));
const express_validator_1 = require("express-validator");
class SalesController {
    // Get all sales records with filtering and pagination
    async getAllSales(req, res) {
        try {
            const { page = 1, limit = 10, sortBy = 'date', period = 'month', category, region, startDate, endDate } = req.query;
            const filters = {
                period,
                category,
                region,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null
            };
            const analytics = await salesService_1.default.getSalesAnalytics(filters);
            res.json({
                success: true,
                data: analytics
            });
        }
        catch (error) {
            console.error('Error in getAllSales:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Get sales record by ID
    async getSalesById(req, res) {
        try {
            const { id } = req.params;
            const sales = await salesService_1.default.getSalesById(parseInt(id));
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
        }
        catch (error) {
            console.error('Error in getSalesById:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Create new sales record
    async createSales(req, res) {
        try {
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }
            const sales = await salesService_1.default.createSales(req.body);
            res.status(201).json({
                success: true,
                message: 'Sales record created successfully',
                data: sales
            });
        }
        catch (error) {
            console.error('Error in createSales:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Update sales record
    async updateSales(req, res) {
        try {
            const { id } = req.params;
            const errors = (0, express_validator_1.validationResult)(req);
            if (!errors.isEmpty()) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: errors.array()
                });
            }
            const sales = await salesService_1.default.updateSales(parseInt(id), req.body);
            res.json({
                success: true,
                message: 'Sales record updated successfully',
                data: sales
            });
        }
        catch (error) {
            console.error('Error in updateSales:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Delete sales record
    async deleteSales(req, res) {
        try {
            const { id } = req.params;
            const sales = await salesService_1.default.deleteSales(parseInt(id));
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
        }
        catch (error) {
            console.error('Error in deleteSales:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Export sales data
    async exportSales(req, res) {
        try {
            const { page = 1, limit = 10, sortBy = 'date', period = 'month', category, region, startDate, endDate } = req.query;
            const filters = {
                period,
                category,
                region,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null
            };
            const csvData = await salesService_1.default.exportSales(filters);
            res.setHeader('Content-Type', 'text/csv');
            res.setHeader('Content-Disposition', 'attachment; filename="sales_data.csv"');
            res.send(csvData);
        }
        catch (error) {
            console.error('Error in exportSales:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Get sales analytics
    async getSalesAnalytics(req, res) {
        try {
            const { page = 1, limit = 10, sortBy = 'date', period = 'month', category, region, startDate, endDate } = req.query;
            const filters = {
                period,
                category,
                region,
                startDate: startDate ? new Date(startDate) : null,
                endDate: endDate ? new Date(endDate) : null
            };
            const analytics = await salesService_1.default.getSalesAnalytics(filters);
            res.json({
                success: true,
                data: analytics
            });
        }
        catch (error) {
            console.error('Error in getSalesAnalytics:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error instanceof Error ? error.message : 'Unknown error'
            });
        }
    }
    // Import sales data
    async importSales(req, res) {
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
            const result = await salesService_1.default.importSales(req.file);
            res.json({
                success: true,
                message: `Successfully imported ${result.importedCount} records`,
                data: {
                    importedCount: result.importedCount,
                    skippedCount: result.skippedCount,
                    errors: result.errors
                }
            });
        }
        catch (error) {
            console.error('Error in importSales:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error',
                error: error.message
            });
        }
    }
}
exports.default = new SalesController();
//# sourceMappingURL=salesController.js.map