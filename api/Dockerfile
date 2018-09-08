FROM node:10-alpine

ARG NODE_ENV=development

WORKDIR /node
COPY package.json package-lock.json ./
RUN npm install && npm cache clean --force
COPY . .
EXPOSE 8080

CMD ["npm", "start"]
