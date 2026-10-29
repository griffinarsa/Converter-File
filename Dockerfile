FROM node:22-bookworm-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build
FROM node:22-bookworm-slim AS api
RUN apt-get update && apt-get install -y --no-install-recommends libreoffice-writer libreoffice-calc libreoffice-impress ffmpeg ghostscript poppler-utils fonts-liberation fonts-noto-core && rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY server/package*.json ./
RUN npm install --omit=dev
COPY server/*.js ./
ENV PORT=3001 MAX_FILE_MB=50
RUN useradd --system --uid 10001 --create-home converter && chown -R converter:converter /app /home/converter
ENV HOME=/tmp
USER converter
EXPOSE 3001
CMD ["node","index.js"]
FROM nginx:alpine AS web
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
