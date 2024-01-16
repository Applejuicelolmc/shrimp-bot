FROM node:alpine

RUN mkdir -p /usr/src/shrimp/
WORKDIR /usr/src/shrimp

COPY package.json /usr/src/shrimp
RUN npm install

COPY . /usr/src/shrimp

CMD ["npm", "start"]