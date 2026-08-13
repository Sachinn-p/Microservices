import express from 'express';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import amqp from 'amqplib';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

let rabbitChannel = null;
const connectRabbitMQ = async () => {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://user:password@localhost:5672');
    rabbitChannel = await conn.createChannel();
    await rabbitChannel.assertExchange('order_events', 'fanout', { durable: true });
    console.log('Connected to RabbitMQ');
  } catch (err) {
    console.error('RabbitMQ connection failed, retrying in 5s', err);
    setTimeout(connectRabbitMQ, 5000);
  }
};
connectRabbitMQ();

app.post('/api/basket', async (req, res) => {
  try {
    const { userId, cakeId, quantity } = req.body;
    let basket = await prisma.basket.findUnique({ where: { userId } });
    if (!basket) {
      basket = await prisma.basket.create({ data: { userId } });
    }
    
    const existingItem = await prisma.basketItem.findFirst({
      where: { basketId: basket.id, cakeId }
    });
    
    if (existingItem) {
      await prisma.basketItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity }
      });
    } else {
      await prisma.basketItem.create({
        data: { basketId: basket.id, cakeId, quantity }
      });
    }
    
    res.status(201).json({ message: 'Item added to basket' });
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to add item' } });
  }
});

app.get('/api/basket/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const basket = await prisma.basket.findUnique({
      where: { userId },
      include: { items: true }
    });
    res.json({ data: basket || { userId, items: [] } });
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch basket' } });
  }
});

app.put('/api/basket/:userId/items/:cakeId', async (req, res) => {
  try {
    const { userId, cakeId } = req.params;
    const { quantity } = req.body;
    
    if (quantity === undefined || quantity < 0) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Invalid quantity' } });
    }

    const basket = await prisma.basket.findUnique({ where: { userId } });
    if (!basket) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Basket not found' } });
    }

    const existingItem = await prisma.basketItem.findFirst({
      where: { basketId: basket.id, cakeId }
    });

    if (!existingItem) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Item not found in basket' } });
    }

    if (quantity === 0) {
      await prisma.basketItem.delete({
        where: { id: existingItem.id }
      });
      return res.json({ message: 'Item removed from basket' });
    } else {
      await prisma.basketItem.update({
        where: { id: existingItem.id },
        data: { quantity }
      });
      return res.json({ message: 'Item quantity updated' });
    }
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to update item quantity' } });
  }
});

app.delete('/api/basket/:userId/items/:cakeId', async (req, res) => {
  try {
    const { userId, cakeId } = req.params;
    
    const basket = await prisma.basket.findUnique({ where: { userId } });
    if (!basket) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Basket not found' } });
    }

    const existingItem = await prisma.basketItem.findFirst({
      where: { basketId: basket.id, cakeId }
    });

    if (!existingItem) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Item not found in basket' } });
    }

    await prisma.basketItem.delete({
      where: { id: existingItem.id }
    });

    res.json({ message: 'Item removed from basket' });
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to remove item' } });
  }
});

app.post('/api/checkout', async (req, res) => {
  try {
    const { userId } = req.body;
    const basket = await prisma.basket.findUnique({
      where: { userId },
      include: { items: true }
    });
    
    if (!basket || basket.items.length === 0) {
      return res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'Basket is empty' } });
    }
    
    let cakes = [];
    try {
      const res = await fetch('http://catalog-service:3001/api/cakes');
      if (res.ok) {
        const result = await res.json();
        cakes = result.data;
      }
    } catch (err) {
      console.error('Failed to fetch catalog', err);
    }
    
    let totalAmount = 0;
    const itemsData = basket.items.map(item => {
      const cake = cakes.find(c => c.id === item.cakeId);
      const price = cake ? cake.price : 160.0;
      totalAmount += item.quantity * price;
      return {
        cakeId: item.cakeId,
        quantity: item.quantity,
        price: price
      };
    });
    
    const order = await prisma.order.create({
      data: {
        userId,
        totalAmount,
        items: {
          create: itemsData
        }
      }
    });
    
    await prisma.basketItem.deleteMany({ where: { basketId: basket.id } });
    
    if (rabbitChannel) {
      const event = { 
        orderId: order.id, 
        userId, 
        totalAmount, 
        status: order.status,
        items: basket.items.map(item => ({ cakeId: item.cakeId, quantity: item.quantity }))
      };
      rabbitChannel.publish('order_events', '', Buffer.from(JSON.stringify(event)));
      console.log('Published OrderCompleted event for order', order.id);
    }
    
    res.status(201).json({ data: order, message: 'Checkout successful' });
  } catch (error) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to checkout' } });
  }
});

const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log(`Order service running on port ${PORT}`);
});