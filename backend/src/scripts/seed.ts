import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // Create a demo user
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'demo@example.com' },
    update: {},
    create: {
      email: 'demo@example.com',
      name: 'Demo User',
      password: hashedPassword,
    },
  });

  console.log('✅ Created demo user:', user.email);

  // Create sample sales data
  const sampleSales = [
    {
      orderId: 'ORD001',
      product: 'Laptop Pro 15',
      category: 'Electronics',
      region: 'North America',
      sales: 45,
      revenue: 45000.00,
      date: new Date('2024-01-15'),
      userId: user.id,
    },
    {
      orderId: 'ORD002',
      product: 'Office Chair',
      category: 'Furniture',
      region: 'Europe',
      sales: 120,
      revenue: 24000.00,
      date: new Date('2024-01-16'),
      userId: user.id,
    },
    {
      orderId: 'ORD003',
      product: 'Coffee Maker',
      category: 'Appliances',
      region: 'Asia',
      sales: 89,
      revenue: 17800.00,
      date: new Date('2024-01-17'),
      userId: user.id,
    },
    {
      orderId: 'ORD004',
      product: 'Wireless Mouse',
      category: 'Electronics',
      region: 'North America',
      sales: 234,
      revenue: 23400.00,
      date: new Date('2024-01-18'),
      userId: user.id,
    },
    {
      orderId: 'ORD005',
      product: 'Standing Desk',
      category: 'Furniture',
      region: 'Europe',
      sales: 67,
      revenue: 33500.00,
      date: new Date('2024-01-19'),
      userId: user.id,
    },
    {
      orderId: 'ORD006',
      product: 'Smartphone X',
      category: 'Electronics',
      region: 'Asia',
      sales: 156,
      revenue: 124800.00,
      date: new Date('2024-01-20'),
      userId: user.id,
    },
    {
      orderId: 'ORD007',
      product: 'Blender',
      category: 'Appliances',
      region: 'North America',
      sales: 98,
      revenue: 14700.00,
      date: new Date('2024-01-21'),
      userId: user.id,
    },
    {
      orderId: 'ORD008',
      product: 'Bookshelf',
      category: 'Furniture',
      region: 'Europe',
      sales: 45,
      revenue: 13500.00,
      date: new Date('2024-01-22'),
      userId: user.id,
    },
    {
      orderId: 'ORD009',
      product: 'Tablet Pro',
      category: 'Electronics',
      region: 'Asia',
      sales: 78,
      revenue: 46800.00,
      date: new Date('2024-01-23'),
      userId: user.id,
    },
    {
      orderId: 'ORD010',
      product: 'Microwave Oven',
      category: 'Appliances',
      region: 'North America',
      sales: 112,
      revenue: 33600.00,
      date: new Date('2024-01-24'),
      userId: user.id,
    },
  ];

  // Insert sample sales data
  for (const sale of sampleSales) {
    await prisma.sales.create({
      data: sale,
    });
  }

  console.log('✅ Created sample sales data');

  // Create user settings
  await prisma.userSettings.upsert({
    where: { userId: user.id },
    update: {},
    create: {
      userId: user.id,
      theme: 'light',
      chartAnimation: true,
      itemsPerPage: 10,
      autoRefresh: 0,
      showNotifications: true,
      notificationDuration: 3,
      autoSave: true,
    },
  });

  console.log('✅ Created user settings');

  console.log('🎉 Database seeding completed successfully!');
  console.log('📊 Login with: demo@example.com / password123');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
