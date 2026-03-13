const salesService = require('../services/salesService');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');

class SalesController {
  // Get all sales records with filtering and pagination
  async getAllSales(req, res) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'date',
        sortOrder = 'desc',
        category,
        region,
        startDate,
        endDate,
        search
      } = req.query;

      const filters = {
        category,
        region,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        search
      };

      const options = {
        page: parseInt(page),
        limit: parseInt(limit),
        sortBy,
        sortOrder: sortOrder.toUpperCase()
      };

      const result = await salesService.getAllSales(filters, options);
      
      res.json({
        success: true,
        data: result.sales,
        pagination: {
          currentPage: result.currentPage,
          totalPages: result.totalPages,
          totalItems: result.totalItems,
          itemsPerPage: result.itemsPerPage
        }
      });
    } catch (error) {
      logger.error('Error in getAllSales:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get sales record by ID
  async getSalesById(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid sales ID'
        });
      }

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
      logger.error('Error in getSalesById:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Create new sales record
  async createSales(req, res) {
    try {
      // Validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const salesData = {
        order_id: req.body.order_id,
        product: req.body.product,
        category: req.body.category,
        region: req.body.region,
        sales: parseInt(req.body.sales),
        revenue: parseFloat(req.body.revenue),
        date: new Date(req.body.date),
        user_id: req.user.id // Assuming user is attached by auth middleware
      };

      const newSales = await salesService.createSales(salesData);
      
      res.status(201).json({
        success: true,
        message: 'Sales record created successfully',
        data: newSales
      });
    } catch (error) {
      logger.error('Error in createSales:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Update sales record
  async updateSales(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid sales ID'
        });
      }

      // Check if sales exists
      const existingSales = await salesService.getSalesById(parseInt(id));
      if (!existingSales) {
        return res.status(404).json({
          success: false,
          message: 'Sales record not found'
        });
      }

      // Validation
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const updateData = {
        order_id: req.body.order_id || existingSales.order_id,
        product: req.body.product || existingSales.product,
        category: req.body.category || existingSales.category,
        region: req.body.region || existingSales.region,
        sales: req.body.sales ? parseInt(req.body.sales) : existingSales.sales,
        revenue: req.body.revenue ? parseFloat(req.body.revenue) : existingSales.revenue,
        date: req.body.date ? new Date(req.body.date) : existingSales.date
      };

      const updatedSales = await salesService.updateSales(parseInt(id), updateData);
      
      res.json({
        success: true,
        message: 'Sales record updated successfully',
        data: updatedSales
      });
    } catch (error) {
      logger.error('Error in updateSales:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Delete sales record
  async deleteSales(req, res) {
    try {
      const { id } = req.params;
      
      if (!id || isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid sales ID'
        });
      }

      // Check if sales exists
      const existingSales = await salesService.getSalesById(parseInt(id));
      if (!existingSales) {
        return res.status(404).json({
          success: false,
          message: 'Sales record not found'
        });
      }

      await salesService.deleteSales(parseInt(id));
      
      res.json({
        success: true,
        message: 'Sales record deleted successfully'
      });
    } catch (error) {
      logger.error('Error in deleteSales:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Export sales data
  async exportSales(req, res) {
    try {
      const {
        format = 'csv',
        category,
        region,
        startDate,
        endDate
      } = req.query;

      const filters = {
        category,
        region,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      };

      const exportData = await salesService.exportSales(filters, format);
      
      if (format === 'csv') {
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename="sales-export-${Date.now()}.csv"`);
        return res.send(exportData);
      } else if (format === 'json') {
        res.setHeader('Content-Type', 'application/json');
        res.setHeader('Content-Disposition', `attachment; filename="sales-export-${Date.now()}.json"`);
        return res.json(exportData);
      } else {
        return res.status(400).json({
          success: false,
          message: 'Unsupported export format'
        });
      }
    } catch (error) {
      logger.error('Error in exportSales:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
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

      const result = await salesService.importSales(req.file);
      
      res.json({
        success: true,
        message: `Successfully imported ${result.importedCount} records`,
        data: {
          importedCount: result.importedCount,
          skippedCount: result.skippedCount,
          errors: result.errors
        }
      });
    } catch (error) {
      logger.error('Error in importSales:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }

  // Get sales analytics
  async getSalesAnalytics(req, res) {
    try {
      const {
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
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null
      };

      const analytics = await salesService.getSalesAnalytics(filters);
      
      res.json({
        success: true,
        data: analytics
      });
    } catch (error) {
      logger.error('Error in getSalesAnalytics:', error);
      res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: error.message
      });
    }
  }
}

module.exports = new SalesController();
