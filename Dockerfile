FROM node:22-alpine

WORKDIR /app

COPY package.json ./
COPY node_modules ./node_modules

COPY . .

RUN mkdir -p data

EXPOSE 3000

CMD ["node", "server.js"]
