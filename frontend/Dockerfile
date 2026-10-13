# Build stage
FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm ci --legacy-peer-deps

# Inject backend URL at build time (defaults to production live backend)
ARG REACT_APP_API_URL="https://healthmitra-backend-mu58.onrender.com"
ENV REACT_APP_API_URL=$REACT_APP_API_URL

COPY . .
RUN npm run build

# Production stage
FROM nginx:alpine

COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
