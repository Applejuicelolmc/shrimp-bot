FROM node:20-alpine AS base

RUN apk update && \
	apk upgrade && \
	apk add --update-cache git

RUN npm i -g pnpm

RUN mkdir -p /usr/src/shrimp/
WORKDIR /usr/src/shrimp

COPY package.json pnpm-lock.yaml /usr/src/shrimp
RUN pnpm install

COPY . /usr/src/shrimp

USER nonroot

HEALTHCHECK --interval=12s --timeout=12s --start-period=30s \  
	CMD pnpm run healthCheck.ts

CMD pnpm start
