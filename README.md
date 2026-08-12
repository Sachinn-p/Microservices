# Cake Delight - Cloud Native Microservices Platform

Cake Delight is a cloud-native microservices application built as part of a capstone project. It showcases a modern e-commerce platform built with React, Node.js, Express, Prisma ORM, MySQL, RabbitMQ, Docker, and Kubernetes. The platform features a beautiful, dynamic frontend rendering high-quality cake images.

## 🏗️ Architecture

The application is decomposed into six distinct components, communicating via synchronous HTTP calls (through an API Gateway) and asynchronous event-driven messaging (via RabbitMQ).

1. **Frontend UI**
   - Built with React, Vite, and Tailwind CSS.
   - Provides a responsive and interactive shopping experience, including a dynamic catalog and shopping basket.
   - Integrates high-quality Unsplash images for product displays.

2. **API Gateway (Port 3000)**
   - Acts as the single entry point for all frontend requests.
   - Routes requests to the appropriate backend microservice using `express-http-proxy`.

3. **Catalog Service (Port 3001)**
   - Manages the cake catalog, pricing, and image assets.
   - **Database**: MySQL (`catalog_db`)

4. **Order Service (Port 3002)**
   - Manages user shopping baskets (add, update quantity, remove items) and handles the checkout process.
   - Emits an `order_events` message to RabbitMQ upon successful checkout.
   - **Database**: MySQL (`order_db`)

5. **Rating Service (Port 3003)**
   - Manages user reviews and ratings for cakes.
   - **Database**: MySQL (`rating_db`)

6. **Notification Service (Port 3004)**
   - Consumes `order_events` messages from RabbitMQ.
   - Enriches notification messages by querying the Catalog Service for human-readable cake names.
   - **Database**: MySQL (`notification_db`)

## 🛠️ Technology Stack

- **Frontend**: React.js, Vite, Tailwind CSS
- **Backend Runtime**: [Node.js](https://nodejs.org/)
- **Framework**: Express.js
- **Database**: MySQL (4 isolated logical databases)
- **ORM**: Prisma (v5+)
- **Message Broker**: RabbitMQ
- **Containerization**: Docker & Docker Compose
- **Orchestration**: Kubernetes (`kind`, `minikube`)

---

## 🚀 Getting Started Locally (Docker Compose)

### Prerequisites
- [Docker](https://docs.docker.com/get-docker/) & [Docker Compose](https://docs.docker.com/compose/install/)

### 0. Setup Environment Variables
Before running the application, generate the required `.env` files for each microservice using the provided script:
```bash
./setup-env.sh
```

### 1. Automated Setup (Recommended)
You can build, start the infrastructure, run database migrations, seed data, and launch all services with a single command:
```bash
bash start.sh
```
Access the application at **http://localhost:8080**

### 2. Manual Setup (Alternative)
If you prefer to start things manually:
Start the MySQL databases and RabbitMQ broker:
```bash
docker compose up -d mysql rabbitmq
```
*Note: The MySQL container uses `init-dbs.sql` to automatically provision the 4 distinct databases on startup.*

Then push the Prisma schemas:
```bash
for dir in catalog-service order-service rating-service notification-service; do
  (cd "$dir" && npx prisma db push)
done
```
Seed the catalog data:
```bash
(cd catalog-service && node prisma/seed.js)
```

Then run `docker compose up -d`.

---

## ☸️ Kubernetes Deployment

A complete deployment manifest is provided in `k8s/all-in-one.yaml`.

### 1. Build and Load Images
First, build the Docker images locally:
```bash
docker compose build
```
If you are using **`kind`** (Kubernetes in Docker), you must load these local images into the cluster nodes:
```bash
kind load docker-image cakedelight-frontend cakedelight-order-service cakedelight-catalog-service cakedelight-rating-service cakedelight-notification-service cakedelight-api-gateway
```
*(If using Minikube, run `eval $(minikube docker-env)` before building).*

### 2. Apply the Manifests
```bash
kubectl apply -f k8s/all-in-one.yaml
```

### 3. Initialize Databases
**Important**: The databases spin up empty in Kubernetes. You must manually sync the schemas and seed the initial data:
```bash
# Push schemas
kubectl exec deployment/catalog-service -- npx prisma db push
kubectl exec deployment/order-service -- npx prisma db push
kubectl exec deployment/rating-service -- npx prisma db push
kubectl exec deployment/notification-service -- npx prisma db push

# Seed catalog data
kubectl exec deployment/catalog-service -- node prisma/seed.js
```

### 4. Access the Application
You can access the frontend via port-forwarding:
```bash
kubectl port-forward svc/frontend 8080:80
```
Open **http://localhost:8080** in your browser.

---

## 📊 Kubernetes Dashboard

To visually manage your Kubernetes cluster, you can install the official Kubernetes Dashboard:

1. **Deploy the Dashboard**:
   ```bash
   kubectl apply -f https://raw.githubusercontent.com/kubernetes/dashboard/v2.7.0/aio/deploy/recommended.yaml
   ```
2. **Create an Admin User**:
   ```bash
   kubectl create serviceaccount dashboard-admin -n kubernetes-dashboard
   kubectl create clusterrolebinding dashboard-admin --clusterrole=cluster-admin --serviceaccount=kubernetes-dashboard:dashboard-admin
   ```
3. **Get your Login Token**:
   ```bash
   kubectl create token dashboard-admin -n kubernetes-dashboard
   ```
4. **Start the Proxy**:
   ```bash
   kubectl proxy
   ```
5. **Access the Dashboard**:
   Go to [http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/](http://localhost:8001/api/v1/namespaces/kubernetes-dashboard/services/https:kubernetes-dashboard:/proxy/) and log in with your token.

---

## 📡 API Reference (via API Gateway)

All requests should be routed through the API Gateway at `http://localhost:3000/`.

### Catalog
- `GET /api/cakes` - Retrieve a list of cakes (supports `search`, `category`, `minPrice`, `maxPrice` query params)
- `GET /api/cakes/:id` - Retrieve details of a specific cake
- `POST /api/cakes/seed` - *Deprecated, use `node prisma/seed.js` in `catalog-service` instead.*

### Orders & Baskets
- `GET /api/basket/:userId` - Retrieve a user's current basket with cake details populated.
- `POST /api/basket` - Add an item to the basket
  - *Payload*: `{"userId": "user-1", "cakeId": "1", "quantity": 1}`
- `PUT /api/basket/:userId/items/:cakeId` - Update the quantity of a specific item.
  - *Payload*: `{"quantity": 2}`
- `DELETE /api/basket/:userId/items/:cakeId` - Remove an item from the basket.
- `POST /api/checkout` - Checkout the user's basket and trigger the order event via RabbitMQ.
  - *Payload*: `{"userId": "user-1"}`

### Ratings
- `POST /api/ratings` - Submit a new rating
  - *Payload*: `{"userId": "user-1", "cakeId": "1", "score": 5, "comment": "Great!"}`
- `GET /api/ratings/cake/:id` - Get average score and all ratings for a specific cake

### Notifications
- `GET /api/notifications/:userId` - Get all generated notifications for a user (proving the RabbitMQ integration worked, enriched with actual cake names).
