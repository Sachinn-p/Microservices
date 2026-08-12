import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.cake.count();
  if (count === 0) {
    await prisma.cake.createMany({
      data: [
        { name: 'Chocolate Truffle', description: 'Rich chocolate cake', category: 'Chocolate', price: 25.0, imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?q=80&w=400&auto=format&fit=crop' },
        { name: 'Vanilla Bean', description: 'Classic vanilla cake', category: 'Vanilla', price: 20.0, imageUrl: 'https://images.unsplash.com/photo-1557308536-ee471ef2c390?q=80&w=400&auto=format&fit=crop' },
        { name: 'Red Velvet', description: 'Red velvet with cream cheese', category: 'Specialty', price: 30.0, imageUrl: 'https://images.unsplash.com/photo-1614707267537-b85aaf00c4b7?q=80&w=400&auto=format&fit=crop' },
        { name: 'Strawberry Shortcake', description: 'Light cake with fresh strawberries', category: 'Fruit', price: 28.0, imageUrl: 'https://images.unsplash.com/photo-1565958011703-44f9829ba187?q=80&w=400&auto=format&fit=crop' }
      ]
    });
    console.log('Database seeded successfully.');
  } else {
    console.log('Database already seeded.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
