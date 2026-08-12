#!/bin/bash

# Ensure script stops on first error
set -e

echo "🚀 Starting Cake Delight services with Docker Compose..."
docker compose up --build -d

echo "⏳ Waiting 15 seconds for MySQL and RabbitMQ to be ready..."
sleep 15

echo "🔄 Running Prisma database migrations..."
for dir in catalog-service order-service rating-service notification-service; do
  echo "Pushing schema for $dir..."
  docker compose exec $dir npx prisma db push
done

echo "🌱 Seeding database..."
docker compose exec catalog-service node prisma/seed.js

echo "✅ All services started and databases initialized! Access the app at http://localhost:8080"
