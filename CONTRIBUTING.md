# Contributing to Sharpie

Thanks for your interest in contributing to Sharpie! This document will help you get started.

## Code of Conduct

Be respectful and constructive. We're all here to build something useful.

## How to Contribute

### Reporting Bugs

Open an issue with:
- What you expected to happen
- What actually happened
- Steps to reproduce
- Your environment (OS, Docker version, GPU if applicable)

### Suggesting Features

Open an issue describing:
- The problem you're trying to solve
- Your proposed solution
- Why this would be useful to others

### Pull Requests

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/your-feature`)
3. Make your changes
4. Test locally with `docker-compose up --build`
5. Commit with a clear message
6. Push to your fork
7. Open a Pull Request

## Development Setup

### Prerequisites

- Docker Desktop
- Node.js 18+ (for frontend development)
- Python 3.11+ (for backend development)

### Local Development (without Docker)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
npm run dev
```

Make sure Ollama is running separately on port 11434.

### With Docker (recommended)

```bash
docker-compose up --build
```

All services start automatically.

## Project Structure

```
sharpie/
├── backend/
│   ├── main.py          # API routes and app setup
│   ├── database.py      # SQLite operations
│   ├── models.py        # Pydantic models
│   └── utils.py         # Helper functions
├── frontend/
│   └── src/
│       ├── App.jsx      # Main app component
│       ├── components/  # UI components
│       └── utils/       # API client
└── docker-compose.yml   # Container orchestration
```

## Coding Standards

### Backend (Python)

- Follow PEP 8
- Use type hints
- Add docstrings for functions
- Keep functions focused and small

### Frontend (JavaScript)

- Use functional components
- Keep components under 200 lines
- Use descriptive variable names
- Add comments for complex logic

### General

- Write clear commit messages
- One feature per PR
- Update README if adding user-facing features
- Test your changes

## Testing

Before submitting:

1. Run the app with `docker-compose up --build`
2. Test basic workflow:
   - Create a prompt
   - Run it
   - Share it
   - Fork it
3. Check for console errors
4. Verify markdown rendering works

## Areas We Need Help

- [ ] API key support (OpenAI, Claude, Gemini)
- [ ] Prompt history and versioning
- [ ] Export/import functionality
- [ ] UI improvements
- [ ] Documentation
- [ ] Bug fixes

## Questions?

Open an issue or reach out to [@heyrtl](https://twitter.com/heyrtl) on Twitter.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.