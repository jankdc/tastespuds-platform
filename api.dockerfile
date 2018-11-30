FROM node:10-alpine

ARG NODE_ENV=development

RUN apk update && apk upgrade && \
    apk add --no-cache bash git openssh postgresql-client curl

WORKDIR /node
COPY package.json package-lock.json ./
RUN npm install && npm cache clean --force
COPY . .
EXPOSE 8080

CMD ["npm", "start"]
