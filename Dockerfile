FROM node:22-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

ENV MONGODB_CLUSTER_PASS=demonterror187
ENV JWT_SECRET=neonaiserver12345678
ENV MAILINGSERVICE=https://automatedemailservice.onrender.com

ENV PORT=3007

EXPOSE 3007

CMD [ "npm", "start" ]