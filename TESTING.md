# Testing Guide

## Quick Start Testing

### 1. Prerequisites Check
```bash
# Check Docker
docker --version
# Expected: Docker version 20.x or higher

# Check Docker Compose
docker-compose --version
# Expected: docker-compose version 2.x or higher

# Check available disk space (need ~5GB for Ollama model)
df -h
```

### 2. Start Services
```bash
# Make test script executable
chmod +x test-locally.sh

# Run test script
./test-locally.sh
```

### 3. Manual Testing Checklist

#### Backend Tests
```bash
# Test 1: Health check
curl http://localhost:8000/health
# Expected: {"status": "healthy", "ollama": "connected", ...}

# Test 2: List models
curl http://localhost:8000/api/models
# Expected: {"models": ["qwen2.5:3b"]}

# Test 3: Generate response (streaming)
curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "system_prompt": "You are a helpful assistant.",
    "user_prompt": "Say hello",
    "model": "qwen2.5:3b"
  }'
# Expected: Streaming SSE events with response chunks

# Test 4: Save a prompt
curl -X POST http://localhost:8000/api/prompts \
  -H "Content-Type: application/json" \
  -d '{
    "system_prompt": "You are a helpful assistant.",
    "user_prompt": "Test prompt",
    "model": "qwen2.5:3b",
    "response": "Test response"
  }'
# Expected: {"id": "abc123", "url": "/p/abc123"}

# Test 5: Get saved prompt (replace abc123 with actual ID from Test 4)
curl http://localhost:8000/api/prompts/abc123
# Expected: Full prompt data
```

#### Frontend Tests

Open http://localhost:5173 in your browser

**Test 1: Basic Generation**
1. Enter system prompt: "You are a helpful assistant."
2. Enter user prompt: "Tell me a joke"
3. Click "Run Prompt" or press Cmd/Ctrl+Enter
4. ✅ Response should stream in real-time
5. ✅ Copy button should work

**Test 2: Share Functionality**
1. Run a prompt
2. Click "Share" button
3. ✅ URL should update to `?p=xxxxxx`
4. ✅ Link should be copied to clipboard
5. ✅ "✓ Copied!" feedback should appear

**Test 3: Fork Functionality**
1. Load a shared prompt (from Test 2)
2. Modify the prompts
3. Click "Fork"
4. ✅ New URL should be generated
5. ✅ Original prompt remains unchanged

**Test 4: Settings**
1. Click ⚙️ button
2. ✅ Modal opens
3. ✅ Model selector shows available models
4. Change model
5. Close settings
6. ✅ Model persists for next generation

**Test 5: URL Sharing**
1. Get share URL from Test 2
2. Open in new incognito window
3. ✅ Prompt should load correctly
4. ✅ Can run the loaded prompt
5. ✅ Can fork it

### 4. Check Logs

```bash
# All logs
docker-compose logs

# Specific service logs
docker-compose logs ollama
docker-compose logs backend
docker-compose logs frontend

# Follow logs in real-time
docker-compose logs -f
```

### 5. Common Issues & Fixes

**Issue: Ollama not pulling model**
```bash
# Manually pull model
docker exec -it sharpie-ollama ollama pull qwen2.5:3b
```

**Issue: Port already in use**
```bash
# Check what's using the port
lsof -i :8000
lsof -i :5173
lsof -i :11434

# Kill the process or change ports in docker-compose.yml
```

**Issue: GPU not detected**
```bash
# Check NVIDIA runtime
docker run --rm --gpus all nvidia/cuda:11.0-base nvidia-smi

# If fails, you might need nvidia-container-toolkit
# Run CPU-only mode by removing deploy section from docker-compose.yml
```

**Issue: Database not persisting**
```bash
# Check volume
docker volume ls | grep sharpie

# Inspect volume
docker volume inspect sharpie_db_data

# Backup database
docker cp sharpie-backend:/app/data/sharpie.db ./backup.db
```

### 6. Performance Testing

```bash
# Check response time
time curl -X POST http://localhost:8000/api/generate \
  -H "Content-Type: application/json" \
  -d '{
    "system_prompt": "You are a helpful assistant.",
    "user_prompt": "Count to 10",
    "model": "qwen2.5:3b"
  }'

# Expected: First token in 1-3 seconds on RTX 3060
```

### 7. Cleanup

```bash
# Stop services
docker-compose down

# Remove volumes (WARNING: deletes all data)
docker-compose down -v

# Remove images
docker-compose down --rmi all
```

## Success Criteria

Before launching, verify:
- ✅ All backend API tests pass
- ✅ All frontend tests work
- ✅ Sharing works across browsers
- ✅ Fork creates independent copies
- ✅ No console errors in browser
- ✅ No errors in Docker logs
- ✅ Response time < 5 seconds for first token
- ✅ Can restart services without data loss