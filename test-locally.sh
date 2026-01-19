#!/bin/bash

echo "🧪 Sharpie Local Testing Script"
echo "================================"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Docker is running
echo -e "\n${YELLOW}[1/6]${NC} Checking Docker..."
if ! docker info > /dev/null 2>&1; then
    echo -e "${RED}❌ Docker is not running${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Docker is running${NC}"

# Check if docker-compose exists
echo -e "\n${YELLOW}[2/6]${NC} Checking docker-compose..."
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}❌ docker-compose not found${NC}"
    exit 1
fi
echo -e "${GREEN}✓ docker-compose found${NC}"

# Build and start services
echo -e "\n${YELLOW}[3/6]${NC} Building and starting services..."
docker-compose up -d --build

# Wait for services to be ready
echo -e "\n${YELLOW}[4/6]${NC} Waiting for services to be ready..."
sleep 10

# Check Ollama health
echo -e "\n${YELLOW}[5/6]${NC} Checking Ollama..."
OLLAMA_STATUS=$(curl -s http://localhost:11434/api/tags | grep -o "models" || echo "failed")
if [ "$OLLAMA_STATUS" = "failed" ]; then
    echo -e "${RED}❌ Ollama is not responding${NC}"
    echo "Check logs: docker-compose logs ollama"
else
    echo -e "${GREEN}✓ Ollama is running${NC}"
fi

# Check Backend health
echo -e "\n${YELLOW}[6/6]${NC} Checking Backend API..."
BACKEND_STATUS=$(curl -s http://localhost:8000/health | grep -o "status" || echo "failed")
if [ "$BACKEND_STATUS" = "failed" ]; then
    echo -e "${RED}❌ Backend is not responding${NC}"
    echo "Check logs: docker-compose logs backend"
else
    echo -e "${GREEN}✓ Backend is running${NC}"
fi

echo -e "\n${GREEN}================================${NC}"
echo -e "${GREEN}✓ All services started!${NC}"
echo ""
echo "📱 Frontend: http://localhost:5173"
echo "🔧 Backend API: http://localhost:8000"
echo "🤖 Ollama: http://localhost:11434"
echo ""
echo "Run 'docker-compose logs -f' to see logs"
echo "Run 'docker-compose down' to stop services"