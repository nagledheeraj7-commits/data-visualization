import express, { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import { body, param, query, validationResult } from 'express-validator';
import salesController from '../controllers/salesController';
import authMiddleware from '../middleware/auth';
import rateLimit from 'express-rate-limit';

const router: Router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req: Express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
    // Accept CSV files only
    if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
      cb(null, true);
    } else {
      cb(new Error('Only CSV files are allowed'));
    }
  }
});

// Rate limiting for sensitive operations
const sensitiveRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again after 15 minutes'
  }
});

// Validation rules
const salesValidationRules = [
  body('order_id')
    .notEmpty()
    .withMessage('Order ID is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Order ID must be between 3 and 50 characters'),
  
  body('product')
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ min: 2, max: 100 })
    .withMessage('Product name must be between 2 and 100 characters'),
  
  body('category')
    .notEmpty()
    .withMessage('Category is required')
    .isIn(['Electronics', 'Furniture', 'Appliances'])
    .withMessage('Category must be Electronics, Furniture, or Appliances'),
  
  body('region')
    .notEmpty()
    .withMessage('Region is required')
    .isIn(['North America', 'Europe', 'Asia'])
    .withMessage('Region must be North America, Europe, or Asia'),
  
  body('sales')
    .notEmpty()
    .withMessage('Sales quantity is required')
    .isInt({ min: 0 })
    .withMessage('Sales must be a non-negative integer'),
  
  body('revenue')
    .notEmpty()
    .withMessage('Revenue is required')
    .isFloat({ min: 0 })
    .withMessage('Revenue must be a non-negative number'),
  
  body('date')
    .notEmpty()
    .withMessage('Date is required')
    .isISO8601()
    .withMessage('Date must be in YYYY-MM-DD format')
];

// Validation middleware
const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  }
  next();
};

// Public routes (no auth required)
router.get('/', salesController.getAllSales.bind(salesController));
router.get('/export', salesController.exportSales.bind(salesController));

// File upload route (public - no auth required)
router.post('/import', 
  sensitiveRateLimit,
  upload.single('file'),
  salesController.importSales.bind(salesController)
);

// Protected routes (auth required)
router.use(authMiddleware);

router.get('/analytics', salesController.getSalesAnalytics.bind(salesController));

router.get('/:id', [
  param('id').isInt().withMessage('ID must be an integer'),
  validateRequest
], salesController.getSalesById.bind(salesController));

router.post('/', salesValidationRules, validateRequest, salesController.createSales.bind(salesController));

router.put('/:id', [
  param('id').isInt().withMessage('ID must be an integer'),
  ...salesValidationRules,
  validateRequest
], salesController.updateSales.bind(salesController));

router.delete('/:id', [
  param('id').isInt().withMessage('ID must be an integer'),
  validateRequest
], salesController.deleteSales.bind(salesController));

// Error handling middleware
router.use((error: any, req: Request, res: Response, next: NextFunction) => {
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Invalid file format'
    });
  }
  
  if (error.type === 'entity.too.large') {
    return res.status(413).json({
      success: false,
      message: 'File too large'
    });
  }
  
  next(error);
});

export default router;
