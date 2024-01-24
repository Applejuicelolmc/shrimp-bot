FROM node:alpine

RUN mkdir -p /usr/src/shrimp/
WORKDIR /usr/src/shrimp

COPY package.json /usr/src/shrimp
RUN pnpm install

COPY . /usr/src/shrimp

CMD ["npx", "ts-node", "-r" ,"./src/index.ts"]
