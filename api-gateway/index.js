import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

import cors from 'cors';

const app = express();
app.use(cors());

const CATALOG_URL = process.env.CATALOG_URL || 'http://localhost:3001';
const ORDER_URL = process.env.ORDER_URL || 'http://localhost:3002';
const RATING_URL = process.env.RATING_URL || 'http://localhost:3003';
const NOTIFICATION_URL = process.env.NOTIFICATION_URL || 'http://localhost:3004';

app.use(createProxyMiddleware({ target: CATALOG_URL, changeOrigin: true, pathFilter: '/api/cakes' }));
app.use(createProxyMiddleware({ target: ORDER_URL, changeOrigin: true, pathFilter: ['/api/basket', '/api/checkout'] }));
app.use(createProxyMiddleware({ target: RATING_URL, changeOrigin: true, pathFilter: '/api/ratings' }));
app.use(createProxyMiddleware({ target: NOTIFICATION_URL, changeOrigin: true, pathFilter: '/api/notifications' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});