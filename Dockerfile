FROM node:20-alpine AS base

RUN apk update && \
	apk upgrade && \
	apk add --update-cache git

RUN npm i -g pnpm

RUN adduser -D -g '' shrimp-bot
USER shrimp-bot

RUN mkdir -p /home/shrimp-bot/src/shrimp/
WORKDIR /home/shrimp-bot/src/shrimp

COPY package.json pnpm-lock.yaml /home/shrimp-bot/src/shrimp
RUN pnpm install

COPY . /home/shrimp-bot/src/shrimp



HEALTHCHECK --interval=12s --timeout=12s --start-period=30s \  
	CMD pnpm run healthCheck.ts

CMD pnpm start
