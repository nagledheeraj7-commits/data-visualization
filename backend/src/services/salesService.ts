import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

class SalesService {
  // Get all sales records with filtering and pagination
  async getAllSales(filters: any = {}, options: any = {}) {
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
      const where: any = {};
      
      if (category) {
        where.category = category;
      }
      
      if (region) {
        where.region = region;
      }
      
      if (startDate || endDate) {
        where.date = {};
        if (startDate) {
          where.date.gte = new Date(startDate);
        }
        if (endDate) {
          where.date.lte = new Date(endDate);
        }
      }
      
      if (search) {
        where.OR = [
          { order_id: { contains: search } },
          { product: { contains: search } },
          { category: { contains: search } },
          { region: { contains: search } }
        ];
      }

      // Build order by clause
      const orderBy: any = {};
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
        currentPage: page,
        totalPages: Math.ceil(total / limit),
        totalItems: total,
        itemsPerPage: limit
      };
    } catch (error) {
      throw new Error(`Failed to fetch sales records: ${error}`);
    }
  }

  // Get sales record by ID
  async getSalesById(id: number) {
    try {
      const sales = await prisma.sales.findUnique({
        where: { id },
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
      throw new Error(`Failed to find sales record: ${error}`);
    }
  }

  // Create new sales record
  async createSales(data: any) {
    try {
      const sales = await prisma.sales.create({
        data: {
          orderId: data.order_id,
          product: data.product,
          category: data.category,
          region: data.region,
          sales: data.sales,
          revenue: data.revenue,
          date: new Date(data.date),
          userId: data.user_id || null
        }
      });
      
      return sales;
    } catch (error) {
      throw new Error(`Failed to create sales record: ${error}`);
    }
  }

  // Update sales record
  async updateSales(id: number, data: any) {
    try {
      const updatedSales = await prisma.sales.update({
        where: { id },
        data: {
          ...data,
          date: data.date ? new Date(data.date) : undefined
        }
      });
      
      return updatedSales;
    } catch (error) {
      throw new Error(`Failed to update sales record: ${error}`);
    }
  }

  // Delete sales record
  async deleteSales(id: number) {
    try {
      await prisma.sales.delete({
        where: { id }
      });
      
      return true;
    } catch (error) {
      throw new Error(`Failed to delete sales record: ${error}`);
    }
  }

  // Get sales analytics
  async getSalesAnalytics(filters: any = {}) {
    try {
      const {
        period = 'month',
        category,
        region,
        startDate,
        endDate
      } = filters;

      const where: any = {};
      
      if (category) where.category = category;
      if (region) where.region = region;
      
      if (startDate || endDate) {
        where.date = {};
        if (startDate) where.date.ggte = new Date(startDate);
        if (endDate) where.date.lte = new Date(endDate);
      }

      // Get total stats
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

      // Get category breakdown
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

      // Get region breakdown
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

      return {
        summary: totalStats,
        categoryBreakdown: categoryStats,
        regionBreakdown: regionStats,
        period
      };
    } catch (error) {
      throw new Error(`Failed to get analytics: ${error}`);
    }
  }

  // Export sales data
  async exportSales(filters: any = {}, format: string = 'csv') {
    try {
      const { sales } = await this.getAllSales(filters, { limit: 10000 });
      
      if (format === 'csv') {
        const csvHeader = 'Order ID,Product,Category,Region,Sales,Revenue,Date\n';
        const csvData = sales.map((sale: any) => 
          `${sale.orderId},"${sale.product}","${sale.category}","${sale.region}",${sale.sales},${sale.revenue},${sale.date.toISOString().split('T')[0]}`
        ).join('\n');
        
        return csvHeader + csvData;
      } else if (format === 'json') {
        return sales.map((sale: any) => ({
          order_id: sale.orderId,
          product: sale.product,
          category: sale.category,
          region: sale.region,
          sales: sale.sales,
          revenue: sale.revenue,
          date: sale.date.toISOString().split('T')[0]
        }));
      }
      
      throw new Error('Unsupported export format');
    } catch (error) {
      throw new Error(`Failed to export data: ${error}`);
    }
  }

  // Import sales data
  async importSales(file: any) {
    try {
      const csv = require('csv-parser');
      const results: any[] = [];

      return new Promise((resolve, reject) => {
        // Handle buffer-based CSV data
        let csvStream;
        
        if (file.buffer) {
          // Create a readable stream from buffer
          const { Readable } = require('stream');
          const stream = Readable.from([file.buffer]);
          csvStream = stream.pipe(csv());
        } else {
          // Original file system approach
          const fs = require('fs');
          csvStream = fs.createReadStream(file.path).pipe(csv());
        }

        csvStream
          .on('data', (data: any) => results.push(data))
          .on('end', async () => {
            try {
              let importedCount = 0;
              let skippedCount = 0;
              const errors: string[] = [];

              for (const row of results) {
                try {
                  await this.createSales({
                    order_id: row.order_id || row['Order ID'] || row['orderId'],
                    product: row.product || row['Product'],
                    category: row.category || row['Category'],
                    region: row.region || row['Region'],
                    sales: parseInt(row.sales || row['Sales'] || 0),
                    revenue: parseFloat(row.revenue || row['Revenue'] || 0),
                    date: row.date || row['Date'] || new Date().toISOString().split('T')[0]
                  });
                  importedCount++;
                } catch (error) {
                  skippedCount++;
                  errors.push(`Row ${importedCount + skippedCount}: ${error}`);
                }
              }

              resolve({
                importedCount,
                skippedCount,
                errors: errors.slice(0, 10) // Limit errors to first 10
              });
            } catch (error) {
              reject(error);
            }
          })
          .on('error', reject);
      });
    } catch (error) {
      throw new Error(`Failed to import data: ${error}`);
    }
  }
}

export default new SalesService();
