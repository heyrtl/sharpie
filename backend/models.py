from pydantic import BaseModel, Field
from typing import Optional

class PromptRequest(BaseModel):
    system_prompt: str = Field(..., min_length=1, max_length=5000)
    user_prompt: str = Field(..., min_length=1, max_length=5000)
    model: str = Field(default="qwen2.5:3b")

class PromptSaveRequest(BaseModel):
    system_prompt: str
    user_prompt: str
    model: str
    response: Optional[str] = ""

class PromptResponse(BaseModel):
    id: str
    system_prompt: str
    user_prompt: str
    model: str
    response: Optional[str]
    created_at: str
    hits: int

class PromptShareResponse(BaseModel):
    id: str
    url: str

class ForkRequest(BaseModel):
    parent_id: str
    system_prompt: str
    user_prompt: str
    model: str