FROM node:26-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . . 
EXPOSE 5000
CMD ["npm", "run", "dev"]