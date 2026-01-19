# Security Considerations

## ✅ What We're Doing Right

1. **No API Keys Exposed**
   - No hardcoded credentials
   - Local-only deployment by default
   - Environment variables for configuration

2. **Input Validation**
   - Pydantic models validate all API inputs
   - Max length limits on prompts (5000 chars)
   - SQL injection prevented (using parameterized queries)

3. **CORS Configuration**
   - Currently set to `allow_origins=["*"]` for development
   - **TODO:** Restrict in production to your domain

4. **SQLite Security**
   - Database file permissions handled by Docker volumes
   - No remote database = no network attack surface
   - Read-only for frontend (all writes through API)

## ⚠️ Known Limitations (By Design)

1. **No Authentication**
   - This is a self-hosted tool for personal/team use
   - Add auth layer (nginx basic auth, Authelia, etc.) if exposing publicly

2. **Rate Limiting**
   - Not implemented (assumes trusted local network)
   - Add nginx rate limiting if exposing to internet

3. **Prompt Privacy**
   - Shared prompts are public (anyone with link can view)
   - This is intentional for the sharing feature
   - Don't share sensitive prompts

## 🔒 Recommendations for Public Deployment

If you're deploying this to the internet:

1. **Add Authentication**
   ```nginx
   # In nginx.conf
   auth_basic "Sharpie";
   auth_basic_user_file /etc/nginx/.htpasswd;
   ```

2. **Restrict CORS**
   ```python
   # In main.py
   allow_origins=["https://sharpie.ratul-rahman.com"]
   ```

3. **Add Rate Limiting**
   ```python
   # Install: pip install slowapi
   from slowapi import Limiter
   limiter = Limiter(key_func=get_remote_address)
   
   @app.post("/api/generate")
   @limiter.limit("10/minute")
   async def generate_response(...):
   ```

4. **Use HTTPS**
   - Let's Encrypt for free SSL
   - Cloudflare for easy setup

5. **Monitor Usage**
   - Add logging for prompt submissions
   - Track API usage patterns

## 🐛 Reporting Security Issues

Found a vulnerability? Please email: hello@ratul-rahman.com

**Do NOT open public issues for security vulnerabilities.**

## 📝 Security Best Practices for Users

1. **Keep Docker Updated**
   - Run `docker pull ollama/ollama:latest` regularly
   
2. **Don't Share Sensitive Prompts**
   - Shared prompts are PUBLIC
   - No passwords, API keys, or personal info in prompts

3. **Firewall Rules**
   - Block ports 8000 and 11434 from internet if not needed
   - Only expose port 5173 (frontend) if sharing with others

4. **Backup Your Database**
   - `docker cp sharpie-backend:/app/data/sharpie.db ./backup/`