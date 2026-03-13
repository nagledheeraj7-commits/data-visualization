/**
 * Validation Middleware
 * Request validation and sanitization
 */

import { body, param, query, validationResult } from 'express-validator';

/**
 * Sales record validation rules
 */
export const validateSales = [
    body('product')
        .trim()
        .notEmpty()
        .withMessage('Product name is required')
        .isLength({ min: 1, max: 100 })
        .withMessage('Product name must be between 1 and 100 characters'),
    
    body('category')
        .trim()
        .notEmpty()
        .withMessage('Category is required')
        .isIn(['Electronics', 'Furniture', 'Stationery'])
        .withMessage('Category must be Electronics, Furniture, or Stationery'),
    
    body('sales')
        .isFloat({ min: 0 })
        .withMessage('Sales must be a positive number')
        .custom((value) => {
            if (value && value.toString().split('.')[1]?.length > 2) {
                throw new Error('Sales can have maximum 2 decimal places');
            }
            return true;
        }),
    
    body('quantity')
        .isInt({ min: 0 })
        .withMessage('Quantity must be a positive integer'),
    
    body('date')
        .isISO8601()
        .withMessage('Date must be in ISO 8601 format (YYYY-MM-DD)')
        .custom((value) => {
            const date = new Date(value);
            const now = new Date();
            if (date > now) {
                throw new Error('Date cannot be in the future');
            }
            return true;
        }),
    
    body('region')
        .trim()
        .notEmpty()
        .withMessage('Region is required')
        .isIn(['North', 'South', 'East', 'West'])
        .withMessage('Region must be North, South, East, or West'),
    
    body('salesperson')
        .trim()
        .notEmpty()
        .withMessage('Salesperson name is required')
        .isLength({ min: 2, max: 50 })
        .withMessage('Salesperson name must be between 2 and 50 characters')
        .matches(/^[a-zA-Z\s]+$/)
        .withMessage('Salesperson name can only contain letters and spaces')
];

/**
 * ID parameter validation
 */
export const validateId = [
    param('id')
        .isInt({ min: 1 })
        .withMessage('ID must be a positive integer')
];

/**
 * Query parameter validation for filtering
 */
export const validateQuery = [
    query('category')
        .optional()
        .isIn(['Electronics', 'Furniture', 'Stationery'])
        .withMessage('Category must be Electronics, Furniture, or Stationery'),
    
    query('region')
        .optional()
        .isIn(['North', 'South', 'East', 'West'])
        .withMessage('Region must be North, South, East, or West'),
    
    query('dateFrom')
        .optional()
        .isISO8601()
        .withMessage('Date from must be in ISO 8601 format (YYYY-MM-DD)'),
    
    query('dateTo')
        .optional()
        .isISO8601()
        .withMessage('Date to must be in ISO 8601 format (YYYY-MM-DD)')
        .custom((value, { req }) => {
            if (value && req.query.dateFrom) {
                const fromDate = new Date(req.query.dateFrom);
                const toDate = new Date(value);
                if (toDate < fromDate) {
                    throw new Error('Date to must be after date from');
                }
            }
            return true;
        }),
    
    query('minSales')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Minimum sales must be a positive number'),
    
    query('maxSales')
        .optional()
        .isFloat({ min: 0 })
        .withMessage('Maximum sales must be a positive number')
        .custom((value, { req }) => {
            if (value && req.query.minSales) {
                const minSales = parseFloat(req.query.minSales);
                const maxSales = parseFloat(value);
                if (maxSales < minSales) {
                    throw new Error('Maximum sales must be greater than minimum sales');
                }
            }
            return true;
        }),
    
    query('page')
        .optional()
        .isInt({ min: 1 })
        .withMessage('Page must be a positive integer'),
    
    query('limit')
        .optional()
        .isInt({ min: 1, max: 100 })
        .withMessage('Limit must be between 1 and 100')
];

/**
 * Validation result checker
 */
export const checkValidation = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.param,
            message: error.msg,
            value: error.value
        }));
        
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errorMessages
        });
    }
    
    next();
};

/**
 * Sanitize input data
 */
export const sanitizeInput = (req, res, next) => {
    // Remove any potential XSS attacks
    if (req.body) {
        Object.keys(req.body).forEach(key => {
            if (typeof req.body[key] === 'string') {
                req.body[key] = req.body[key]
                    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
                    .trim();
            }
        });
    }
    
    next();
};

export default {
    validateSales,
    validateId,
    validateQuery,
    checkValidation,
    sanitizeInput
};
