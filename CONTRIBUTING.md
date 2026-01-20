# Contributing to Sharpie

Thank you for your interest in contributing! We welcome all skill levels.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR-USERNAME/sharpie.git`
3. Create a branch: `git checkout -b feature/your-feature`

## Development Setup

### Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

Ensure Ollama is running separately on `http://localhost:11434`.

## Code Guidelines

- Write clear commit messages
- Add tests for new features
- Follow PEP 8 (Python) and ESLint (JavaScript)
- Update documentation as needed

## Reporting Issues

Use GitHub Issues and include:
- Steps to reproduce
- Expected vs. actual behavior
- Your environment (OS, Docker version, GPU info)

## Submitting PRs

- Keep PRs focused and reasonably sized
- Reference related issues
- Ensure tests pass locally
- Wait for review before merging

## Questions?

Open a discussion or issue. Happy coding!