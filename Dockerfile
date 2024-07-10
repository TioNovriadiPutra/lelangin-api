FROM node:20.12.2-alpine3.18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json to the container
COPY package.json package-lock.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code to the container
COPY . .

# Build the application
RUN npm run build --ignore-ts-errors

# Expose the port your app runs on
EXPOSE 3333

# Command to run the application
CMD ["sh", "-c", "node ace migration:run && node ace db:seed && node build/server.js"]
