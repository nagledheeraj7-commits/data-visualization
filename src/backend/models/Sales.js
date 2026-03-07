/**
 * Sales Model
 * Defines the Sales data structure and database operations
 */

import { dbConfig } from '../config/database.js';

/**
 * Sales data model
 */
export class Sales {
    constructor(data = {}) {
        this.id = data.id || null;
        this.product = data.product || '';
        this.category = data.category || '';
        this.sales = parseFloat(data.sales) || 0;
        this.quantity = parseInt(data.quantity) || 0;
        this.date = data.date || new Date().toISOString().split('T')[0];
        this.region = data.region || '';
        this.salesperson = data.salesperson || '';
        this.createdAt = data.createdAt || new Date();
        this.updatedAt = data.updatedAt || new Date();
    }

    /**
     * Validate sales data
     * @returns {Object} Validation result
     */
    validate() {
        const errors = [];

        if (!this.product || this.product.trim() === '') {
            errors.push('Product name is required');
        }

        if (!this.category || this.category.trim() === '') {
            errors.push('Category is required');
        }

        if (isNaN(this.sales) || this.sales < 0) {
            errors.push('Sales must be a valid positive number');
        }

        if (isNaN(this.quantity) || this.quantity < 0) {
            errors.push('Quantity must be a valid positive number');
        }

        if (!this.date || !this.isValidDate(this.date)) {
            errors.push('Valid date is required');
        }

        if (!this.region || this.region.trim() === '') {
            errors.push('Region is required');
        }

        if (!this.salesperson || this.salesperson.trim() === '') {
            errors.push('Salesperson name is required');
        }

        return {
            isValid: errors.length === 0,
            errors
        };
    }

    /**
     * Check if date string is valid
     * @param {string} dateString 
     * @returns {boolean}
     */
    isValidDate(dateString) {
        const date = new Date(dateString);
        return date instanceof Date && !isNaN(date);
    }

    /**
     * Convert to JSON object
     * @returns {Object}
     */
    toJSON() {
        return {
            id: this.id,
            product: this.product,
            category: this.category,
            sales: this.sales,
            quantity: this.quantity,
            date: this.date,
            region: this.region,
            salesperson: this.salesperson,
            createdAt: this.createdAt,
            updatedAt: this.updatedAt
        };
    }

    /**
     * Create sales record
     * @param {Object} data 
     * @returns {Promise<Sales>}
     */
    static async create(data) {
        const sales = new Sales(data);
        const validation = sales.validate();
        
        if (!validation.isValid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        // In a real implementation, this would save to database
        // For now, we'll simulate database operations
        sales.id = Math.floor(Math.random() * 10000);
        sales.createdAt = new Date();
        sales.updatedAt = new Date();

        return sales;
    }

    /**
     * Get all sales records
     * @param {Object} filters 
     * @returns {Promise<Array<Sales>>}
     */
    static async findAll(filters = {}) {
        // In a real implementation, this would query the database
        // For now, we'll return mock data
        try {
            const response = await fetch('/data/sales.json');
            const data = await response.json();
            const salesData = data.salesData || data;
            
            let filteredData = salesData;
            
            // Apply filters
            if (filters.category) {
                filteredData = filteredData.filter(record => record.category === filters.category);
            }
            
            if (filters.region) {
                filteredData = filteredData.filter(record => record.region === filters.region);
            }
            
            if (filters.dateFrom) {
                filteredData = filteredData.filter(record => record.date >= filters.dateFrom);
            }
            
            if (filters.dateTo) {
                filteredData = filteredData.filter(record => record.date <= filters.dateTo);
            }
            
            if (filters.minSales) {
                filteredData = filteredData.filter(record => record.sales >= filters.minSales);
            }
            
            if (filters.maxSales) {
                filteredData = filteredData.filter(record => record.sales <= filters.maxSales);
            }
            
            return filteredData.map(record => new Sales(record));
        } catch (error) {
            console.error('Error fetching sales data:', error);
            throw new Error('Failed to fetch sales data');
        }
    }

    /**
     * Get sales record by ID
     * @param {number} id 
     * @returns {Promise<Sales|null>}
     */
    static async findById(id) {
        try {
            const records = await this.findAll();
            return records.find(record => record.id === id) || null;
        } catch (error) {
            console.error('Error finding sales record:', error);
            throw new Error('Failed to find sales record');
        }
    }

    /**
     * Update sales record
     * @param {number} id 
     * @param {Object} data 
     * @returns {Promise<Sales>}
     */
    static async update(id, data) {
        const sales = new Sales({ ...data, id });
        const validation = sales.validate();
        
        if (!validation.isValid) {
            throw new Error(`Validation failed: ${validation.errors.join(', ')}`);
        }

        sales.updatedAt = new Date();
        return sales;
    }

    /**
     * Delete sales record
     * @param {number} id 
     * @returns {Promise<boolean>}
     */
    static async delete(id) {
        // In a real implementation, this would delete from database
        return true;
    }

    /**
     * Get sales statistics
     * @param {Object} filters 
     * @returns {Promise<Object>}
     */
    static async getStatistics(filters = {}) {
        const records = await this.findAll(filters);
        
        const totalRecords = records.length;
        const totalSales = records.reduce((sum, record) => sum + record.sales, 0);
        const averageSales = totalRecords > 0 ? totalSales / totalRecords : 0;
        const totalQuantity = records.reduce((sum, record) => sum + record.quantity, 0);
        
        // Category breakdown
        const categoryStats = {};
        records.forEach(record => {
            if (!categoryStats[record.category]) {
                categoryStats[record.category] = {
                    count: 0,
                    totalSales: 0,
                    totalQuantity: 0
                };
            }
            categoryStats[record.category].count++;
            categoryStats[record.category].totalSales += record.sales;
            categoryStats[record.category].totalQuantity += record.quantity;
        });

        // Region breakdown
        const regionStats = {};
        records.forEach(record => {
            if (!regionStats[record.region]) {
                regionStats[record.region] = {
                    count: 0,
                    totalSales: 0
                };
            }
            regionStats[record.region].count++;
            regionStats[record.region].totalSales += record.sales;
        });

        return {
            totalRecords,
            totalSales,
            averageSales,
            totalQuantity,
            categoryStats,
            regionStats
        };
    }




  
}

export default Sales;
