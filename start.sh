#!/bin/bash
set -e

echo ""
echo "  RE:FLECT — startup script"
echo "================================"

# перевіряємо наявність docker
if ! command -v docker &> /dev/null; then
  echo ""
  echo "  Docker not found."
  echo "  Install Docker Desktop: https://www.docker.com/products/docker-desktop"
  echo ""
  exit 1
fi

# перевіряємо що docker запущений
if ! docker info &> /dev/null 2>&1; then
  echo ""
  echo "  Docker is not running."
  echo "  Please start Docker Desktop and run this script again."
  echo ""
  exit 1
fi

echo ""
echo "  Building and starting services..."
echo ""

# запускаємо через docker compose (новий синтаксис)
docker compose up --build -d

echo ""
echo "  Waiting for the app to be ready..."

# чекаємо поки сервер відповість
MAX_WAIT=60
WAITED=0
until curl -sf http://localhost:5173 > /dev/null 2>&1; do
  sleep 2
  WAITED=$((WAITED + 2))
  if [ $WAITED -ge $MAX_WAIT ]; then
    echo ""
    echo "  Timeout. Check logs: docker compose logs app"
    exit 1
  fi
done

echo ""
echo "================================"
echo "  Re:flect is running!"
echo ""
echo "  Site:   http://localhost:5173"
echo "  Admin:  http://localhost:5173/admin.html"
echo "================================"
echo ""
echo "  Useful commands:"
echo "    Stop:       docker compose down"
echo "    Logs:       docker compose logs -f app"
echo "    DB console: docker compose exec db psql -U reflect_user reflect_db"
echo ""
