"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Store simulation state
let simulationInterval = null;
let isSimulating = false;
// Start real-time simulation
router.post('/start', async (req, res) => {
    try {
        if (isSimulating) {
            return res.status(400).json({
                success: false,
                message: 'Simulation is already running'
            });
        }
        isSimulating = true;
        // Start generating data every 2 seconds
        simulationInterval = setInterval(async () => {
            try {
                await generateSimulatedData();
            }
            catch (error) {
                console.error('Simulation error:', error);
            }
        }, 2000);
        res.json({
            success: true,
            message: 'Real-time simulation started',
            data: {
                isSimulating: true,
                interval: 2000
            }
        });
    }
    catch (error) {
        console.error('Start simulation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to start simulation'
        });
    }
});
// Stop real-time simulation
router.post('/stop', async (req, res) => {
    try {
        if (!isSimulating) {
            return res.status(400).json({
                success: false,
                message: 'Simulation is not running'
            });
        }
        if (simulationInterval) {
            clearInterval(simulationInterval);
            simulationInterval = null;
        }
        isSimulating = false;
        res.json({
            success: true,
            message: 'Real-time simulation stopped',
            data: {
                isSimulating: false
            }
        });
    }
    catch (error) {
        console.error('Stop simulation error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to stop simulation'
        });
    }
});
// Get simulation status
router.get('/status', async (req, res) => {
    try {
        res.json({
            success: true,
            data: {
                isSimulating,
                interval: simulationInterval ? 2000 : null
            }
        });
    }
    catch (error) {
        console.error('Get status error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get simulation status'
        });
    }
});
// Generate simulated data
async function generateSimulatedData() {
    const products = [
        'Laptop Pro 15', 'Office Chair', 'Coffee Maker', 'Wireless Mouse',
        'Standing Desk', 'Smartphone X', 'Tablet Pro', 'Blender'
    ];
    const categories = ['Electronics', 'Furniture', 'Appliances'];
    const regions = ['North America', 'Europe', 'Asia'];
    // Generate random sales data
    const randomProduct = products[Math.floor(Math.random() * products.length)];
    const randomCategory = categories[Math.floor(Math.random() * categories.length)];
    const randomRegion = regions[Math.floor(Math.random() * regions.length)];
    const randomSales = Math.floor(Math.random() * 100) + 10;
    const randomRevenue = randomSales * (Math.random() * 500 + 100);
    const orderId = `SIM${Date.now()}${Math.floor(Math.random() * 1000)}`;
    try {
        // Create simulated sales record
        await prisma.sales.create({
            data: {
                orderId: orderId,
                product: randomProduct,
                category: randomCategory,
                region: randomRegion,
                sales: randomSales,
                revenue: randomRevenue,
                date: new Date(),
                userId: 1 // Default user
            }
        });
        console.log(`🔄 Generated simulated sale: ${orderId} - ${randomProduct} (${randomSales} units)`);
    }
    catch (error) {
        console.error('Failed to generate simulated data:', error);
    }
}
// Get recent simulated data
router.get('/recent', async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;
        const recentSales = await prisma.sales.findMany({
            where: {
                orderId: {
                    startsWith: 'SIM'
                }
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: limit,
            include: {
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true
                    }
                }
            }
        });
        res.json({
            success: true,
            data: recentSales
        });
    }
    catch (error) {
        console.error('Get recent simulated data error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to get recent simulated data'
        });
    }
});
// Clear all simulated data
router.delete('/clear', async (req, res) => {
    try {
        // Stop simulation first if running
        if (isSimulating && simulationInterval) {
            clearInterval(simulationInterval);
            simulationInterval = null;
            isSimulating = false;
        }
        // Delete all simulated records
        const deleted = await prisma.sales.deleteMany({
            where: {
                orderId: {
                    startsWith: 'SIM'
                }
            }
        });
        res.json({
            success: true,
            message: `Cleared ${deleted.count} simulated records`,
            data: {
                deletedCount: deleted.count,
                isSimulating: false
            }
        });
    }
    catch (error) {
        console.error('Clear simulated data error:', error);
        res.status(500).json({
            success: false,
            message: 'Failed to clear simulated data'
        });
    }
});
exports.default = router;
//# sourceMappingURL=simulationRoutes.js.map