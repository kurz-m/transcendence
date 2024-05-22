# Use the official Node.js image as the base
FROM node:18

# Set the working directory inside the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of your application code
COPY . .

# Expose port 5501 (make it accessible from outside the container)
EXPOSE 5501

# Define the command to run your application (replace with your actual start command)
CMD [ "node", "server.js" ] 
