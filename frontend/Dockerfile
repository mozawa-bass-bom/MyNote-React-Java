FROM node:22-alpine

WORKDIR /app

# Ensure we have package files
COPY package*.json ./

RUN npm install

# In local development with volume mounts, COPY . . isn't strictly necessary for running,
# but it provides a fallback if volume isn't mounted correctly.
COPY . .

# Expose Vite's default port
EXPOSE 3000

# Start command is usually overridden by docker-compose, but we provide it here as deafult
CMD ["npm", "run", "dev"]
