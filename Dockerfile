FROM node:18.20.1-alpine3.19 AS base

RUN npm i -g pnpm

RUN mkdir -p /usr/src/shrimp/
WORKDIR /usr/src/shrimp

COPY package.json pnpm-lock.yaml /usr/src/shrimp
RUN pnpm install

COPY . /usr/src/shrimp

HEALTHCHECK --interval=12s --timeout=12s --start-period=30s \  
	CMD npx ts-node -r ./src/healthCheck.ts

CMD ["npx", "ts-node-esm", "-r" ,"./src/index.ts", "deploy"]
