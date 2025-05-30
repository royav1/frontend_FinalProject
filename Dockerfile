# Stage 1: Build Angular app
FROM node:18 AS builder

WORKDIR /app
COPY . .

RUN npm install
RUN npm run build --configuration=production

# Print what's inside /app, /app/dist, and /app/dist/myapp
RUN echo "📂 Listing /app:" && ls -l /app && \
    echo "📂 Listing /app/dist:" && ls -l /app/dist && \
    echo "📂 Listing /app/dist/myapp:" && ls -l /app/dist/myapp

# Stage 2: Serve with Nginx
FROM nginx:alpine

# Copy built Angular app to Nginx's public directory
COPY --from=builder /app/dist/myapp/browser/ /usr/share/nginx/html/

# Custom Nginx config to serve SPA
COPY nginx.conf /etc/nginx/conf.d/default.conf
