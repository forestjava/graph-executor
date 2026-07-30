FROM node:24-alpine

WORKDIR /app

COPY package.json package-lock.json tsconfig.json ./
COPY src ./src
COPY assets ./assets

RUN npm install
RUN npm run build

CMD ["node", "dist/index.js"]
