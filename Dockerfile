FROM node:16-alpine AS base

RUN npm i -g pnpm

RUN mkdir -p /usr/src/shrimp/
WORKDIR /usr/src/shrimp

COPY package.json pnpm-lock.yaml /usr/src/shrimp
RUN pnpm install

COPY . /usr/src/shrimp

CMD ["npx", "ts-node", "-r" ,"./src/index.ts"]
