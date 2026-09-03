FROM node:22-alpine

WORKDIR /app

# Disable husky for Docker builds
ENV HUSKY=0

# Install dependencies for workspace
COPY package.json yarn.lock nx.json ./
COPY apps/inframind-backend/package.json apps/inframind-backend/
COPY apps/inframind-frontend/package.json apps/inframind-frontend/

RUN yarn install --frozen-lockfile

# Copy the rest of the code
COPY . .

# Generate Prisma Client
RUN yarn workspace inframind-backend prisma generate

# Build backend
RUN yarn nx run inframind-backend:build

EXPOSE 5000
CMD ["yarn", "workspace", "inframind-backend", "start"]
