/**
 * Sales Routes
 * Defines API endpoints for sales data
 */

import express from 'express';
import {
    getAllSales,
    getSalesById,
    createSales,
    updateSales,
    deleteSales,
    getSalesStatistics,
    exportSalesCSV
} from '../controllers/salesController.js';

const router = express.Router();

/**
 * @route   GET /api/sales
 * @desc    Get all sales records with optional filtering and pagination
 * @access   Public
 * @query   category, region, dateFrom, dateTo, minSales, maxSales, page, limit
 */
router.get('/', getAllSales);

/**
 * @route   GET /api/sales/statistics
 * @desc    Get sales statistics and analytics
 * @access   Public
 * @query   category, region, dateFrom, dateTo, minSales, maxSales
 */
router.get('/statistics', getSalesStatistics);

/**
 * @route   GET /api/sales/export
 * @desc    Export sales data as CSV
 * @access   Public
 * @query   category, region, dateFrom, dateTo, minSales, maxSales
 */
router.get('/export', exportSalesCSV);

/**
 * @route   GET /api/sales/:id
 * @desc    Get sales record by ID
 * @access   Public
 * @param    id - Sales record ID
 */
router.get('/:id', getSalesById);

/**
 * @route   POST /api/sales
 * @desc    Create new sales record
 * @access   Public
 * @body     product, category, sales, quantity, date, region, salesperson
 */
router.post('/', createSales);

/**
 * @route   PUT /api/sales/:id
 * @desc    Update sales record
 * @access   Public
 * @param    id - Sales record ID
 * @body     product, category, sales, quantity, date, region, salesperson
 */
router.put('/:id', updateSales);

/**
 * @route   DELETE /api/sales/:id
 * @desc    Delete sales record
 * @access   Public
 * @param    id - Sales record ID
 */
router.delete('/:id', deleteSales);

export default router;
