import express from 'express';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

app.post('/api/ratings', async (req, res) => {
  try {
    const { cakeId, userId, score, comment } = req.body;
    
    if (score < 1 || score > 5) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Score must be between 1 and 5' } });
    }
    
    const rating = await prisma.rating.create({
      data: { cakeId, userId, score, comment }
    });
    
    res.status(201).json({ data: rating });
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to submit rating' } });
  }
});

app.get('/api/ratings/cake/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const ratings = await prisma.rating.findMany({ where: { cakeId: id } });
    
    const averageScore = ratings.length > 0 
      ? ratings.reduce((acc, r) => acc + r.score, 0) / ratings.length 
      : 0;
      
    res.json({
      data: {
        cakeId: id,
        averageScore,
        totalRatings: ratings.length,
        ratings
      }
    });
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch ratings' } });
  }
});

const PORT = process.env.PORT || 3003;
app.listen(PORT, () => {
  console.log(`Rating service running on port ${PORT}`);
});