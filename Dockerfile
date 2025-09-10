FROM node:21-alpine
WORKDIR /taskmanager

# Install dependencies first for better cache usage
COPY package*.json ./
RUN npm ci --only=production

# Copy the rest of the app
COPY . .

ENV NODE_ENV=production
ENV PORT=5001
EXPOSE 5001

CMD ["npm", "start"]

