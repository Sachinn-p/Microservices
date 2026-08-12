# Cake Delight - Cloud Native Microservices Platform

Cake Delight is a cloud-native microservices application built as part of a capstone project. It showcases a modern e-commerce backend built with Node.js, Express, JavaScript, Prisma ORM, MySQL, RabbitMQ, Docker, and Kubernetes.

## 🏗️ Architecture

The application is decomposed into five distinct microservices, communicating via synchronous HTTP calls (through an API Gateway) and asynchronous event-driven messaging (via RabbitMQ).

1. **API Gateway (Port 3000)**
   - Acts as the single entry point for all client requests.
   - Routes requests to the appropriate backend microservice using `http-proxy-middleware`.

2. **Catalog Service (Port 3001)**
   - Manages the cake catalog, pricing, and availability.
   - **Database**: MySQL (`catalog_db`)

3. **Order Service (Port 3002)**
   - Manages user shopping baskets and handles the checkout process.
   - Emits an `OrderCompleted` event to RabbitMQ upon successful checkout.
   - **Database**: MySQL (`order_db`)

4. **Rating Service (Port 3003)**
   - Manages user reviews and ratings for cakes.
   - **Database**: MySQL (`rating_db`)

5. **Notification Service (Port 3004)**
   - Consumes `OrderCompleted` events from RabbitMQ.
   - Responsible for generating user notifications (mocked as database records for this project).
   - **Database**: MySQL (`notification_db`)

## 🛠️ Technology Stack

- **Runtime**: [Node.js](https://nodejs.org/) (Fast JavaScript runtime and package manager)
- **Framework**: Express.js with JavaScript
- **Database**: MySQL (4 isolated logical databases)
- **ORM**: Prisma (v7+)
- **Message Broker**: RabbitMQ
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes

---

## 🚀 Getting Started Locally

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)
- [Node.js](https://nodejs.org/) installed locally (optional, for running without containers)

### 0. Setup Environment Variables
Before running the application, generate the required `.env` files for each microservice using the provided script:
```bash
./setup-env.sh
```

### 1. Automated Setup (Recommended)
You can build, start the infrastructure, run migrations, and launch all services with a single command:
```bash
bash start.sh
```

### 2. Manual Setup (Alternative)
If you prefer to start things manually:
Start the MySQL databases and RabbitMQ broker:
```bash
docker-compose up -d mysql rabbitmq
```
*Note: The MySQL container uses `init-dbs.sql` to automatically provision the 4 distinct databases on startup.*

Then push the Prisma schemas:
```bash
for dir in catalog-service order-service rating-service notification-service; do
  (cd "$dir" && npx prisma db push)
done
```

### 3. Run the Microservices
If you didn't use `bash start.sh`, you can build and run the services via Docker, or run them locally using Node.js.

**Using Node.js (Local Development):**
```bash
# Open 5 separate terminal tabs, and run the following in each:
cd api-gateway && node index.js
cd catalog-service && node index.js
cd order-service && node index.js
cd rating-service && node index.js
cd notification-service && node index.js

# And in a 6th terminal tab for the frontend:
cd frontend && npm run dev
```

---

## ☸️ Kubernetes Deployment

A complete deployment manifest is provided in `k8s/all-in-one.yaml`.

1. Ensure your local cluster (Minikube or Docker Desktop) is running.
2. Build the Docker images to your cluster's registry:
   ```bash
   eval $(minikube docker-env) # If using Minikube
   for dir in catalog-service order-service rating-service notification-service api-gateway; do
     docker build -t cakedelight/$dir:latest ./$dir
   done
   ```
3. Apply the manifests:
   ```bash
   kubectl apply -f k8s/all-in-one.yaml
   ```
4. Access the API Gateway:
   The API Gateway is exposed as a `NodePort` on port `30000`. You can access it at `http://localhost:30000`.

---

## 📡 API Reference (via API Gateway)

All requests should be routed through the API Gateway at `http://localhost:3000/`.

### Catalog
- `GET /api/cakes` - Retrieve a list of cakes (supports `search`, `category`, `minPrice`, `maxPrice` query params)
- `GET /api/cakes/:id` - Retrieve details of a specific cake
- `POST /api/cakes/seed` - *Deprecated, use `node prisma/seed.js` in `catalog-service` instead.*

### Orders & Baskets
- `POST /api/basket` - Add an item to the basket
  - *Payload*: `{"userId": "user-1", "cakeId": "1", "quantity": 1}`
- `GET /api/basket/:userId` - Retrieve a user's current basket
- `POST /api/checkout` - Checkout the user's basket and trigger the order event
  - *Payload*: `{"userId": "user-1"}`

### Ratings
- `POST /api/ratings` - Submit a new rating
  - *Payload*: `{"userId": "user-1", "cakeId": "1", "score": 5, "comment": "Great!"}`
- `GET /api/ratings/cake/:id` - Get average score and all ratings for a specific cake

### Notifications
- `GET /api/notifications/:userId` - Get all generated notifications for a user (proving the RabbitMQ integration worked).
