"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }
        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
            include: { settings: true }
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // Check password
        const isValidPassword = await bcryptjs_1.default.compare(password, user.password);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
        }
        // Generate JWT token
        const signOptions = {
            expiresIn: '24h' // Use string literal instead of environment variable
        };
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'fallback-secret', signOptions);
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            success: true,
            message: 'Login successful',
            data: {
                user: userWithoutPassword,
                token
            }
        });
    }
    catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Register endpoint
router.post('/register', async (req, res) => {
    try {
        const { email, password, name } = req.body;
        if (!email || !password || !name) {
            return res.status(400).json({
                success: false,
                message: 'Name, email, and password are required'
            });
        }
        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'User already exists'
            });
        }
        // Hash password
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
        // Create user
        const user = await prisma.user.create({
            data: {
                email,
                password: hashedPassword,
                name,
                settings: {
                    create: {
                        theme: 'light',
                        chartAnimation: true,
                        itemsPerPage: 10,
                        autoRefresh: 0,
                        showNotifications: true,
                        notificationDuration: 3,
                        autoSave: true
                    }
                }
            },
            include: { settings: true }
        });
        // Generate JWT token
        const signOptions = {
            expiresIn: '24h' // Use string literal instead of environment variable
        };
        const token = jsonwebtoken_1.default.sign({ userId: user.id, email: user.email }, process.env.JWT_SECRET || 'fallback-secret', signOptions);
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        res.status(201).json({
            success: true,
            message: 'Registration successful',
            data: {
                user: userWithoutPassword,
                token
            }
        });
    }
    catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});
// Get current user
router.get('/me', async (req, res) => {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'No token provided'
            });
        }
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'fallback-secret');
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: { settings: true }
        });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid token'
            });
        }
        // Remove password from response
        const { password: _, ...userWithoutPassword } = user;
        res.json({
            success: true,
            data: userWithoutPassword
        });
    }
    catch (error) {
        console.error('Auth error:', error);
        res.status(401).json({
            success: false,
            message: 'Invalid token'
        });
    }
});
exports.default = router;
//# sourceMappingURL=authRoutes.js.map