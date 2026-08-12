import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();

async function main() {
  const count = await prisma.cake.count();
  if (count === 0) {
    await prisma.cake.createMany({
      data: [
        { name: 'Chocolate Truffle', description: 'Rich chocolate cake', category: 'Chocolate', price: 25.0, imageUrl: '/images/chocolate_truffle.png' },
        { name: 'Vanilla Bean', description: 'Classic vanilla cake', category: 'Vanilla', price: 20.0, imageUrl: '/images/vanilla_bean.png' },
        { name: 'Red Velvet', description: 'Red velvet with cream cheese', category: 'Specialty', price: 30.0, imageUrl: '/images/red_velvet.png' },
        { name: 'Strawberry Shortcake', description: 'Light cake with fresh strawberries', category: 'Fruit', price: 28.0, imageUrl: '/images/strawberry_shortcake.png' }
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
