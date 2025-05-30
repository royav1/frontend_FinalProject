## Docker Image (Prebuilt)
You can pull and run the prebuilt Docker image for this frontend:
docker pull r300887882/amazon-tracker-frontend:latest


# 🧩 Amazon Price Tracker (Frontend - Angular)
### This is the Angular frontend for the Amazon Price Tracker app. It provides an intuitive interface for searching Amazon products, tracking prices, organizing watchlists, and viewing price history with built-in notification support.

### It communicates with the Django backend via REST API (http://127.0.0.1:8000/).

## ✅ Development Environment Setup:
### Navigate to the frontend directory:
cd frontend/myapp

## Install dependencies:
npm install

## Run the app:
ng serve -o



# 🏗️ Production Build

## To create a production build for deployment:
ng build --configuration=production

## Output files will be placed in:
frontend/myapp/dist/myapp/


# 🧠 What This Frontend Does:
## The app offers a full-featured Amazon product price tracking experience with:

### 🔐 Secure login/register (JWT via sessionStorage)
### 🔍 Amazon search with adjustable depth (1–10 pages)
### 📦 Add/remove tracked products
### 🎯 Set target prices and receive mock alerts
### 📁 Organize products into custom watchlists
### 📈 View price history with filters
### 🕒 Manually trigger scraping per product
### 📨 Floating UI notifications when price targets are met


# 🧩 Feature Overview
## 🔐 Auth
### 1. Login
### 2. Register
### 3. Logout (clears sessionStorage)

## 🔍 Search
### 4. Keyword search with selectable depth (1–10 pages)
### 5. View results in-app
### 6. Add items to tracking
### 7. Login required to search

## 📦 Tracked Products
### 8. View all tracked products
### 9. Set/edit target prices
### 10. Delete items (retains price history)
### 11. Add to watchlists

## 📁 Watchlists
### 12. Create/delete/rename watchlists
### 13. Add/remove products to/from watchlists
### 14. Toggle global scheduled scraping

## 📈 Price History
### 15. View history for each product
### 16. Filter by date range (7d, 30d, 90d, 6mo, 1yr)
### 17. Filter by sale events
### 18. Handles deleted products using snapshot logic

## 💌 Mock Notifications
### 19. When a product meets its target price, a floating message simulates an email alert from the backend



## 📦 This Angular app is designed to work seamlessly with the Django backend and is deployable as part of a Docker Compose stack.
