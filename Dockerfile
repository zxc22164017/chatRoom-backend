FROM node:22.9.0-alpine
WORKDIR /app
COPY package.json ./
RUN npm install
RUN npm install pm2 -g
COPY . .
EXPOSE 8080
CMD [ "pm2-runtime", "index.js", "-i", "0" ]