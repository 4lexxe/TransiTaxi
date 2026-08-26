# Single container Dockerfile for Fullstack TransiTaxi (Frontend + Backend)
FROM node:20-alpine

WORKDIR /app

# Copy root and package manifests
COPY package*.json ./
COPY Backend/package*.json ./Backend/
COPY Frontend/package*.json ./Frontend/

# Install dependencies
RUN cd Frontend && npm install
RUN cd Backend && npm install

# Copy application source code
COPY Frontend ./Frontend
COPY Backend ./Backend

# Build frontend production bundle
RUN cd Frontend && npm run build

# Expose server port
EXPOSE 10000

ENV ENVIRONMENT=production
ENV PORT=10000

CMD ["node", "Backend/server.js"]
