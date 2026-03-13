/**
 * Sales Controller
 * Handles HTTP requests for sales data
 */

import Sales from '../models/Sales.js';

/**
 * Get all sales records
 */
export const getAllSales = async (req, res) => {
    try {
        const {
            category,
            region,
            dateFrom,
            dateTo,
            minSales,
            maxSales,
            page = 1,
            limit = 50
        } = req.query;

        const filters = {
            category,
            region,
            dateFrom,
            dateTo,
            minSales: minSales ? parseFloat(minSales) : undefined,
            maxSales: maxSales ? parseFloat(maxSales) : undefined
        };

        const sales = await Sales.findAll(filters);
        
        // Apply pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedSales = sales.slice(startIndex, endIndex);

        res.json({
            success: true,
            data: paginatedSales,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: sales.length,
                pages: Math.ceil(sales.length / limit)
            },
            filters: filters
        });
    } catch (error) {
        console.error('Error fetching sales:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch sales data',
            message: error.message
        });
    }
};

/**
 * Get sales record by ID
 */
export const getSalesById = async (req, res) => {
    try {
        const { id } = req.params;
        const sales = await Sales.findById(parseInt(id));

        if (!sales) {
            return res.status(404).json({
                success: false,
                error: 'Sales record not found'
            });
        }

        res.json({
            success: true,
            data: sales
        });
    } catch (error) {
        console.error('Error fetching sales by ID:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch sales record',
            message: error.message
        });
    }
};

/**
 * Create new sales record
 */
export const createSales = async (req, res) => {
    try {
        const salesData = req.body;
        const sales = await Sales.create(salesData);

        res.status(201).json({
            success: true,
            data: sales,
            message: 'Sales record created successfully'
        });
    } catch (error) {
        console.error('Error creating sales:', error);
        res.status(400).json({
            success: false,
            error: 'Failed to create sales record',
            message: error.message
        });
    }
};

/**
 * Update sales record
 */
export const updateSales = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        const sales = await Sales.update(parseInt(id), updateData);

        res.json({
            success: true,
            data: sales,
            message: 'Sales record updated successfully'
        });
    } catch (error) {
        console.error('Error updating sales:', error);
        res.status(400).json({
            success: false,
            error: 'Failed to update sales record',
            message: error.message
        });
    }
};

/**
 * Delete sales record
 */
export const deleteSales = async (req, res) => {
    try {
        const { id } = req.params;
        await Sales.delete(parseInt(id));

        res.json({
            success: true,
            message: 'Sales record deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting sales:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to delete sales record',
            message: error.message
        });
    }
};

/**
 * Get sales statistics
 */
export const getSalesStatistics = async (req, res) => {
    try {
        const {
            category,
            region,
            dateFrom,
            dateTo,
            minSales,
            maxSales
        } = req.query;

        const filters = {
            category,
            region,
            dateFrom,
            dateTo,
            minSales: minSales ? parseFloat(minSales) : undefined,
            maxSales: maxSales ? parseFloat(maxSales) : undefined
        };

        const statistics = await Sales.getStatistics(filters);

        res.json({
            success: true,
            data: statistics,
            filters: filters
        });
    } catch (error) {
        console.error('Error fetching sales statistics:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch sales statistics',
            message: error.message
        });
    }
};

/**
 * Export sales data as CSV
 */
export const exportSalesCSV = async (req, res) => {
    try {
        const {
            category,
            region,
            dateFrom,
            dateTo,
            minSales,
            maxSales
        } = req.query;

        const filters = {
            category,
            region,
            dateFrom,
            dateTo,
            minSales: minSales ? parseFloat(minSales) : undefined,
            maxSales: maxSales ? parseFloat(maxSales) : undefined
        };

        const sales = await Sales.findAll(filters);

        // Create CSV content
        const headers = ['ID', 'Product', 'Category', 'Sales', 'Quantity', 'Date', 'Region', 'Salesperson'];
        const csvContent = [
            headers.join(','),
            ...sales.map(record => [
                record.id,
                `"${record.product}"`,
                record.category,
                record.sales,
                record.quantity,
                record.date,
                record.region,
                `"${record.salesperson}"`
            ].join(','))
        ].join('\n');

        // Set headers for CSV download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="sales_export_${new Date().toISOString().split('T')[0]}.csv"`);
        
        res.send(csvContent);
    } catch (error) {
        console.error('Error exporting sales:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to export sales data',
            message: error.message
        });
    }
};

export default {
    getAllSales,
    getSalesById,
    createSales,
    updateSales,
    deleteSales,
    getSalesStatistics,
    exportSalesCSV
};
