const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

class SalesModel {
  // Create a new sales record
  static async create(data) {
    try {
      const sales = await prisma.sales.create({
        data: {
          order_id: data.order_id,
          product: data.product,
          category: data.category,
          region: data.region,
          sales: data.sales,
          revenue: data.revenue,
          date: data.date,
          user_id: data.user_id,
          created_at: new Date(),
          updated_at: new Date()
        }
      });
      
      return sales;
    } catch (error) {
      throw new Error(`Failed to create sales record: ${error.message}`);
    }
  }

  // Get all sales records with filtering and pagination
  static async findAll(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'date',
        sortOrder = 'DESC',
        category,
        region,
        startDate,
        endDate,
        search
      } = { ...filters, ...options };

      const skip = (page - 1) * limit;
      
      // Build where clause
      const where = {};
      
      if (category) {
        where.category = category;
      }
      
      if (region) {
        where.region = region;
      }
      
      if (startDate || endDate) {
        where.date = {};
        if (startDate) {
          where.date.gte = startDate;
        }
        if (endDate) {
          where.date.lte = endDate;
        }
      }
      
      if (search) {
        where.OR = [
          { order_id: { contains: search, mode: 'insensitive' } },
          { product: { contains: search, mode: 'insensitive' } },
          { category: { contains: search, mode: 'insensitive' } },
          { region: { contains: search, mode: 'insensitive' } }
        ];
      }

      // Build order by clause
      const orderBy = {};
      orderBy[sortBy] = sortOrder.toLowerCase();

      // Execute query with pagination
      const [sales, total] = await Promise.all([
        prisma.sales.findMany({
          where,
          orderBy,
          skip,
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
        }),
        prisma.sales.count({ where })
      ]);

      return {
        sales,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(total / limit),
          totalItems: total,
          itemsPerPage: limit
        }
      };
    } catch (error) {
      throw new Error(`Failed to fetch sales records: ${error.message}`);
    }
  }

  // Get sales record by ID
  static async findById(id) {
    try {
      const sales = await prisma.sales.findUnique({
        where: { id: parseInt(id) },
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
      
      return sales;
    } catch (error) {
      throw new Error(`Failed to find sales record: ${error.message}`);
    }
  }

  // Update sales record
  static async update(id, data) {
    try {
      const updatedSales = await prisma.sales.update({
        where: { id: parseInt(id) },
        data: {
          ...data,
          updated_at: new Date()
        }
      });
      
      return updatedSales;
    } catch (error) {
      throw new Error(`Failed to update sales record: ${error.message}`);
    }
  }

  // Delete sales record
  static async delete(id) {
    try {
      await prisma.sales.delete({
        where: { id: parseInt(id) }
      });
      
      return true;
    } catch (error) {
      throw new Error(`Failed to delete sales record: ${error.message}`);
    }
  }

  // Get sales analytics
  static async getAnalytics(filters = {}) {
    try {
      const {
        period = 'month',
        category,
        region,
        startDate,
        endDate
      } = filters;

      const where = {};
      
      if (category) where.category = category;
      if (region) where.region = region;
      
      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.gte = startDate;
        if (endDate) where.date.lte = endDate;
      }

      // Get total sales and revenue
      const totalStats = await prisma.sales.aggregate({
        where,
        _sum: {
          sales: true,
          revenue: true
        },
        _count: {
          id: true
        }
      });

      // Get category-wise breakdown
      const categoryStats = await prisma.sales.groupBy({
        by: ['category'],
        where,
        _sum: {
          sales: true,
          revenue: true
        },
        _count: {
          id: true
        }
      });

      // Get region-wise breakdown
      const regionStats = await prisma.sales.groupBy({
        by: ['region'],
        where,
        _sum: {
          sales: true,
          revenue: true
        },
        _count: {
          id: true
        }
      });

      // Get time-based data
      let timeGrouping = 'month';
      if (period === 'day') timeGrouping = 'day';
      if (period === 'week') timeGrouping = 'week';
      if (period === 'year') timeGrouping = 'year';

      const timeStats = await prisma.$queryRaw`
        SELECT 
          DATE_TRUNC(${timeGrouping}, date) as period,
          SUM(sales) as total_sales,
          SUM(revenue) as total_revenue,
          COUNT(*) as total_orders
        FROM sales
        WHERE ${startDate || endDate ? `date >= ${startDate ? `'${startDate.toISOString()}'` : '1970-01-01'} 
                AND date <= ${endDate ? `'${endDate.toISOString()}'` : 'CURRENT_DATE'}` : '1=1'}
        GROUP BY DATE_TRUNC(${timeGrouping}, date)
        ORDER BY period DESC
        LIMIT 12
      `;

      return {
        summary: totalStats,
        categoryBreakdown: categoryStats,
        regionBreakdown: regionStats,
        timeSeries: timeStats,
        period
      };
    } catch (error) {
      throw new Error(`Failed to get analytics: ${error.message}`);
    }
  }

  // Export sales data
  static async exportData(filters = {}, format = 'csv') {
    try {
      const { sales } = await this.findAll(filters, { limit: 10000 }); // Limit for performance
      
      if (format === 'csv') {
        const csvHeader = 'Order ID,Product,Category,Region,Sales,Revenue,Date\n';
        const csvData = sales.map(sales => 
          `${sales.order_id},"${sales.product}","${sales.category}","${sales.region}",${sales.sales},${sales.revenue},${sales.date.toISOString().split('T')[0]}`
        ).join('\n');
        
        return csvHeader + csvData;
      } else if (format === 'json') {
        return sales.map(sales => ({
          order_id: sales.order_id,
          product: sales.product,
          category: sales.category,
          region: sales.region,
          sales: sales.sales,
          revenue: sales.revenue,
          date: sales.date.toISOString().split('T')[0]
        }));
      }
      
      throw new Error('Unsupported export format');
    } catch (error) {
      throw new Error(`Failed to export data: ${error.message}`);
    }
  }

  // Get sales statistics for dashboard
  static async getDashboardStats() {
    try {
      const now = new Date();
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const startOfYear = new Date(now.getFullYear(), 0, 1);

      const [
        currentMonth,
        lastMonth,
        currentYear
      ] = await Promise.all([
        // Current month stats
        prisma.sales.aggregate({
          where: { date: { gte: startOfMonth } },
          _sum: { sales: true, revenue: true },
          _count: { id: true }
        }),
        // Last month stats
        prisma.sales.aggregate({
          where: { 
            date: { 
              gte: startOfLastMonth,
              lt: startOfMonth 
            } 
          },
          _sum: { sales: true, revenue: true },
          _count: { id: true }
        }),
        // Current year stats
        prisma.sales.aggregate({
          where: { date: { gte: startOfYear } },
          _sum: { sales: true, revenue: true },
          _count: { id: true }
        })
      ]);

      // Best selling product
      const bestProduct = await prisma.sales.groupBy({
        by: ['product'],
        _sum: { sales: true },
        orderBy: { _sum: { sales: 'desc' } },
        take: 1
      });

      return {
        currentMonth,
        lastMonth,
        currentYear,
        bestProduct: bestProduct[0] || null,
        // Calculate growth percentages
        salesGrowth: lastMonth._sum.sales > 0 
          ? ((currentMonth._sum.sales - lastMonth._sum.sales) / lastMonth._sum.sales * 100).toFixed(2)
          : 0,
        revenueGrowth: lastMonth._sum.revenue > 0
          ? ((currentMonth._sum.revenue - lastMonth._sum.revenue) / lastMonth._sum.revenue * 100).toFixed(2)
          : 0
      };
    } catch (error) {
      throw new Error(`Failed to get dashboard stats: ${error.message}`);
    }
  }
}

module.exports = SalesModel;
