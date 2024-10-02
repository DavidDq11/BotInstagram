From node:18-alpine

workdir /app

copy package.json .

run npm install

copy . .

run npm run build

expose 3000

cmd ["npm", "run", "start"]