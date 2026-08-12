import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';

const app = express();
app.use(createProxyMiddleware({
  target: 'http://localhost:3001',
  changeOrigin: true,
  pathFilter: '/api/cakes'
}));

app.listen(3099, () => console.log('Test proxy on 3099'));
