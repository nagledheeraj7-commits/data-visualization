"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const multer_1 = __importDefault(require("multer"));
const express_validator_1 = require("express-validator");
const salesController_1 = __importDefault(require("../controllers/salesController"));
const auth_1 = __importDefault(require("../middleware/auth"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const router = express_1.default.Router();
// Configure multer for file uploads
const storage = multer_1.default.memoryStorage();
const upload = (0, multer_1.default)({
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        // Accept CSV files only
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        }
        else {
            cb(new Error('Only CSV files are allowed'));
        }
    }
});
// Rate limiting for sensitive operations
const sensitiveRateLimit = (0, express_rate_limit_1.default)({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: {
        success: false,
        message: 'Too many requests from this IP, please try again after 15 minutes'
    }
});
// Validation rules
const salesValidationRules = [
    (0, express_validator_1.body)('order_id')
        .notEmpty()
        .withMessage('Order ID is required')
        .isLength({ min: 3, max: 50 })
        .withMessage('Order ID must be between 3 and 50 characters'),
    (0, express_validator_1.body)('product')
        .notEmpty()
        .withMessage('Product name is required')
        .isLength({ min: 2, max: 100 })
        .withMessage('Product name must be between 2 and 100 characters'),
    (0, express_validator_1.body)('category')
        .notEmpty()
        .withMessage('Category is required')
        .isIn(['Electronics', 'Furniture', 'Appliances'])
        .withMessage('Category must be Electronics, Furniture, or Appliances'),
    (0, express_validator_1.body)('region')
        .notEmpty()
        .withMessage('Region is required')
        .isIn(['North America', 'Europe', 'Asia'])
        .withMessage('Region must be North America, Europe, or Asia'),
    (0, express_validator_1.body)('sales')
        .notEmpty()
        .withMessage('Sales quantity is required')
        .isInt({ min: 0 })
        .withMessage('Sales must be a non-negative integer'),
    (0, express_validator_1.body)('revenue')
        .notEmpty()
        .withMessage('Revenue is required')
        .isFloat({ min: 0 })
        .withMessage('Revenue must be a non-negative number'),
    (0, express_validator_1.body)('date')
        .notEmpty()
        .withMessage('Date is required')
        .isISO8601()
        .withMessage('Date must be in YYYY-MM-DD format')
];
// Validation middleware
const validateRequest = (req, res, next) => {
    const errors = (0, express_validator_1.validationResult)(req);
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
router.get('/', salesController_1.default.getAllSales.bind(salesController_1.default));
router.get('/export', salesController_1.default.exportSales.bind(salesController_1.default));
// File upload route (public - no auth required)
router.post('/import', sensitiveRateLimit, upload.single('file'), salesController_1.default.importSales.bind(salesController_1.default));
// Protected routes (auth required)
router.use(auth_1.default);
router.get('/analytics', salesController_1.default.getSalesAnalytics.bind(salesController_1.default));
router.get('/:id', [
    (0, express_validator_1.param)('id').isInt().withMessage('ID must be an integer'),
    validateRequest
], salesController_1.default.getSalesById.bind(salesController_1.default));
router.post('/', salesValidationRules, validateRequest, salesController_1.default.createSales.bind(salesController_1.default));
router.put('/:id', [
    (0, express_validator_1.param)('id').isInt().withMessage('ID must be an integer'),
    ...salesValidationRules,
    validateRequest
], salesController_1.default.updateSales.bind(salesController_1.default));
router.delete('/:id', [
    (0, express_validator_1.param)('id').isInt().withMessage('ID must be an integer'),
    validateRequest
], salesController_1.default.deleteSales.bind(salesController_1.default));
// Error handling middleware
router.use((error, req, res, next) => {
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
exports.default = router;
//# sourceMappingURL=salesRoutes.js.map