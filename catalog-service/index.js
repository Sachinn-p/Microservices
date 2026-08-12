import express from 'express';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

app.get('/api/cakes', async (req, res) => {
  try {
    const { category, minPrice, maxPrice, search } = req.query;
    
    const where = {};
    if (category) where.category = String(category);
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = parseFloat(String(minPrice));
      if (maxPrice) where.price.lte = parseFloat(String(maxPrice));
    }
    if (search) {
      where.name = { contains: String(search) };
    }
    
    const cakes = await prisma.cake.findMany({ where });
    res.json({ data: cakes });
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch cakes' } });
  }
});

app.get('/api/cakes/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const cake = await prisma.cake.findUnique({ where: { id } });
    
    if (!cake) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Cake not found' } });
    }
    
    res.json({ data: cake });
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch cake' } });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Catalog service running on port ${PORT}`);
});