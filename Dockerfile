FROM node:20-alpine

WORKDIR /app

# ставимо залежності окремо (щоб кешувалось при rebuild)
COPY backend/package*.json ./backend/
RUN cd backend && npm ci --omit=dev

# копіюємо код
COPY backend/ ./backend/
COPY frontend/ ./frontend/

EXPOSE 5173

CMD ["node", "backend/server.js"]
