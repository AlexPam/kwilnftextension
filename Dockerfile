# First stage: build the application
FROM node:14-alpine

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json
COPY package*.json ./

# Install dependencies
RUN npm install


# Install ts-node
RUN npm install -g ts-node

# Copy the source from the current directory to the working directory inside the container
COPY . .

# Build the application (using TypeScript compiler, tsc)
#RUN npm run build


# Expose port
EXPOSE 50051

# Command to run the application
CMD ["node", "kwilextention/index.ts"]