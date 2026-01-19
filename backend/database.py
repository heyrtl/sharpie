import sqlite3
import os
from contextlib import contextmanager
from typing import Optional, Dict, Any

DATABASE_PATH = os.getenv("DATABASE_PATH", "data/sharpie.db")

def init_db():
    """Initialize database with schema"""
    os.makedirs(os.path.dirname(DATABASE_PATH), exist_ok=True)
    
    conn = sqlite3.connect(DATABASE_PATH)
    conn.execute('''
        CREATE TABLE IF NOT EXISTS prompts (
            id TEXT PRIMARY KEY,
            system_prompt TEXT NOT NULL,
            user_prompt TEXT NOT NULL,
            model TEXT NOT NULL,
            response TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            hits INTEGER DEFAULT 0
        )
    ''')
    
    conn.execute('''
        CREATE TABLE IF NOT EXISTS prompt_forks (
            id TEXT PRIMARY KEY,
            parent_id TEXT,
            forked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (parent_id) REFERENCES prompts(id)
        )
    ''')
    
    # Create indexes for performance
    conn.execute('CREATE INDEX IF NOT EXISTS idx_created_at ON prompts(created_at DESC)')
    conn.execute('CREATE INDEX IF NOT EXISTS idx_hits ON prompts(hits DESC)')
    
    conn.commit()
    conn.close()

@contextmanager
def get_db():
    """Context manager for database connections"""
    conn = sqlite3.connect(DATABASE_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def save_prompt(prompt_id: str, system_prompt: str, user_prompt: str, 
                model: str, response: str = "") -> None:
    """Save a prompt to database"""
    with get_db() as conn:
        conn.execute(
            """
            INSERT INTO prompts (id, system_prompt, user_prompt, model, response)
            VALUES (?, ?, ?, ?, ?)
            """,
            (prompt_id, system_prompt, user_prompt, model, response)
        )
        conn.commit()

def get_prompt(prompt_id: str) -> Optional[Dict[str, Any]]:
    """Get a prompt by ID"""
    with get_db() as conn:
        # Increment hit counter
        conn.execute("UPDATE prompts SET hits = hits + 1 WHERE id = ?", (prompt_id,))
        conn.commit()
        
        cursor = conn.execute(
            "SELECT * FROM prompts WHERE id = ?",
            (prompt_id,)
        )
        row = cursor.fetchone()
        
        if row:
            return dict(row)
        return None

def update_response(prompt_id: str, response: str) -> None:
    """Update response for a prompt"""
    with get_db() as conn:
        conn.execute(
            "UPDATE prompts SET response = ? WHERE id = ?",
            (response, prompt_id)
        )
        conn.commit()

def create_fork(fork_id: str, parent_id: str) -> None:
    """Track a fork relationship"""
    with get_db() as conn:
        conn.execute(
            "INSERT INTO prompt_forks (id, parent_id) VALUES (?, ?)",
            (fork_id, parent_id)
        )
        conn.commit()