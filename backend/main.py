from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
import httpx
import json
import os
from nanoid import generate

from database import init_db, save_prompt, get_prompt, update_response, create_fork
from models import (
    PromptRequest, 
    PromptSaveRequest, 
    PromptResponse, 
    PromptShareResponse,
    ForkRequest
)
from utils import stream_ollama_response, format_prompt_for_ollama

# Initialize FastAPI app
app = FastAPI(
    title="Sharpie API",
    description="Self-hostable AI prompt playground",
    version="1.0.0"
)

# CORS configuration
allowed_origins = os.getenv("ALLOWED_ORIGINS", "*").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins != ["*"] else ["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize database on startup
@app.on_event("startup")
async def startup_event():
    init_db()
    print("✅ Database initialized")

# Health check
@app.get("/")
async def root():
    return {
        "service": "Sharpie API",
        "status": "running",
        "version": "1.0.0"
    }

@app.get("/health")
async def health_check():
    """Check if Ollama is reachable"""
    ollama_host = os.getenv("OLLAMA_HOST", "http://localhost:11434")
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{ollama_host}/api/tags", timeout=5.0)
            return {
                "status": "healthy",
                "ollama": "connected",
                "models": response.json()
            }
    except Exception as e:
        return {
            "status": "degraded",
            "ollama": "disconnected",
            "error": str(e)
        }

@app.post("/api/generate")
async def generate_response(request: PromptRequest):
    """Stream AI response from Ollama"""
    ollama_host = os.getenv("OLLAMA_HOST", "http://localhost:11434")
    
    try:
        formatted_prompt = format_prompt_for_ollama(
            request.system_prompt,
            request.user_prompt
        )
        
        return StreamingResponse(
            stream_ollama_response(
                ollama_host,
                request.model,
                formatted_prompt
            ),
            media_type="text/event-stream",
            headers={
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            }
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Generation failed: {str(e)}")

@app.post("/api/prompts", response_model=PromptShareResponse)
async def create_prompt(request: PromptSaveRequest):
    """Save a prompt and return shareable ID"""
    try:
        prompt_id = generate(size=6)
        save_prompt(
            prompt_id=prompt_id,
            system_prompt=request.system_prompt,
            user_prompt=request.user_prompt,
            model=request.model,
            response=request.response or ""
        )
        
        return PromptShareResponse(
            id=prompt_id,
            url=f"/p/{prompt_id}"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to save prompt: {str(e)}")

@app.get("/api/prompts/{prompt_id}", response_model=PromptResponse)
async def fetch_prompt(prompt_id: str):
    """Get a saved prompt by ID"""
    prompt = get_prompt(prompt_id)
    
    if not prompt:
        raise HTTPException(status_code=404, detail="Prompt not found")
    
    return PromptResponse(**prompt)

@app.post("/api/prompts/{prompt_id}/fork", response_model=PromptShareResponse)
async def fork_prompt(prompt_id: str, request: ForkRequest):
    """Create a fork of an existing prompt"""
    try:
        # Verify parent exists
        parent = get_prompt(prompt_id)
        if not parent:
            raise HTTPException(status_code=404, detail="Parent prompt not found")
        
        # Create new prompt
        fork_id = generate(size=6)
        save_prompt(
            prompt_id=fork_id,
            system_prompt=request.system_prompt,
            user_prompt=request.user_prompt,
            model=request.model,
            response=""
        )
        
        # Track fork relationship
        create_fork(fork_id, prompt_id)
        
        return PromptShareResponse(
            id=fork_id,
            url=f"/p/{fork_id}"
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fork prompt: {str(e)}")

@app.get("/api/models")
async def list_models():
    """List available Ollama models"""
    ollama_host = os.getenv("OLLAMA_HOST", "http://localhost:11434")
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.get(f"{ollama_host}/api/tags", timeout=5.0)
            data = response.json()
            return {"models": [m["name"] for m in data.get("models", [])]}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch models: {str(e)}")