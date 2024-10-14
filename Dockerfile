FROM node:22.9.0-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
COPY . .
EXPOSE 8080
CMD [ "npm", "run", "dev" ]