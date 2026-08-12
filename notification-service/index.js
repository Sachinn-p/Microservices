import express from 'express';
import pkg from '@prisma/client';
const { PrismaClient } = pkg;
import amqp from 'amqplib';

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

const connectRabbitMQ = async () => {
  try {
    const conn = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://user:password@localhost:5672');
    const channel = await conn.createChannel();
    
    await channel.assertExchange('order_events', 'fanout', { durable: true });
    
    const q = await channel.assertQueue('', { exclusive: true });
    await channel.bindQueue(q.queue, 'order_events', '');
    
    console.log('Connected to RabbitMQ and waiting for events...');
    
    channel.consume(q.queue, async (msg) => {
      if (msg !== null) {
        try {
          const event = JSON.parse(msg.content.toString());
          console.log('Received OrderCompleted event:', event);
          
          // Fetch catalog to resolve names if items exist
          let itemDetails = '';
          if (event.items && event.items.length > 0) {
            try {
              const res = await fetch('http://catalog-service:3001/api/cakes');
              if (res.ok) {
                const result = await res.json();
                const cakes = result.data;
                const parts = event.items.map(item => {
                  const cake = cakes.find(c => c.id === item.cakeId);
                  const name = cake ? cake.name : `Cake #${item.cakeId}`;
                  return `${name} (x${item.quantity})`;
                });
                itemDetails = ` containing ${parts.join(', ')}`;
              }
            } catch (err) {
              console.error('Failed to fetch catalog', err);
            }
          }

          const message = `Your order ${event.orderId}${itemDetails} totaling $${event.totalAmount.toFixed(2)} has been received.`;
          
          // Save notification
          await prisma.notification.create({
            data: {
              orderId: event.orderId,
              userId: event.userId,
              message,
              status: 'SENT'
            }
          });
          
          channel.ack(msg);
        } catch (error) {
          console.error('Failed to process message', error);
          // depending on error, might want to nack
        }
      }
    });
  } catch (err) {
    console.error('RabbitMQ connection failed, retrying in 5s', err);
    setTimeout(connectRabbitMQ, 5000);
  }
};
connectRabbitMQ();

// Simple healthcheck endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.get('/api/notifications/:userId', async (req, res) => {
  try {
    const notifications = await prisma.notification.findMany({
      where: { userId: req.params.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ data: notifications });
  } catch (err) {
    res.status(500).json({ error: { code: 'SERVER_ERROR', message: 'Failed to fetch notifications' } });
  }
});

const PORT = process.env.PORT || 3004;
app.listen(PORT, () => {
  console.log(`Notification service running on port ${PORT}`);
});