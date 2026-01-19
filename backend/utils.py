import httpx
import json
from typing import AsyncGenerator

def format_prompt_for_ollama(system_prompt: str, user_prompt: str) -> str:
    """Format system and user prompts for Ollama"""
    formatted = f"System: {system_prompt}\n\nUser: {user_prompt}"
    return formatted

async def stream_ollama_response(
    ollama_host: str,
    model: str,
    prompt: str
) -> AsyncGenerator[str, None]:
    """Stream response from Ollama API"""
    
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": True
    }
    
    try:
        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream(
                'POST',
                f"{ollama_host}/api/generate",
                json=payload
            ) as response:
                response.raise_for_status()
                
                async for line in response.aiter_lines():
                    if line.strip():
                        try:
                            data = json.loads(line)
                            
                            if 'response' in data:
                                # Send text chunk
                                yield f"data: {json.dumps({'text': data['response']})}\n\n"
                            
                            if data.get('done', False):
                                # Send completion signal
                                yield f"data: {json.dumps({'done': True})}\n\n"
                                break
                                
                        except json.JSONDecodeError:
                            continue
                            
    except httpx.HTTPError as e:
        error_msg = f"Ollama request failed: {str(e)}"
        yield f"data: {json.dumps({'error': error_msg})}\n\n"
    except Exception as e:
        error_msg = f"Unexpected error: {str(e)}"
        yield f"data: {json.dumps({'error': error_msg})}\n\n"