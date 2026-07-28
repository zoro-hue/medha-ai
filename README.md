# 🧠 StudyForge — AI Study Assistant

> Transform your notes into interactive flashcards, quizzes, and structured study materials powered by AI.

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue?logo=typescript)](https://typescriptlang.org)
[![Vite](https://img.shields.io/badge/Vite-8-purple?logo=vite)](https://vite.dev)
[![Gemini](https://img.shields.io/badge/Gemini-2.5%20Flash-green?logo=google)](https://ai.google.dev)

---

## 📋 Overview

StudyForge is an AI-powered study assistant that takes **free-form text input** (notes, paragraphs, topics, chapters, or lecture content) and generates **structured, interactive learning materials** — not a chatbot.

The AI returns **strict JSON** which the frontend parses and renders as **interactive React components**: flashcards with flip animations, multiple-choice quizzes with instant feedback, mind maps, key points, and revision tips.

### Key Differentiators

- **Not a chatbot** — AI returns structured JSON, frontend renders interactive components
- **Production-grade error handling** — handles malformed JSON, timeouts, rate limits, race conditions
- **Provider fallback** — Gemini 2.5 Flash primary, Groq (Llama 3.3) as fallback
- **Latest-wins strategy** — AbortController prevents stale responses from overwriting newer ones
- **Zod validation** — every AI response is validated against a strict schema on both client and server

---

## 🏗️ Architecture

```
┌─────────────────────────┐         ┌──────────────────────────────────────┐
│       Frontend          │         │           Backend API                │
│                         │  POST   │                                      │
│  React 19 + Vite        │ ───────>│  Express + TypeScript                │
│  Zustand State          │ /api/   │                                      │
│  TanStack Query         │ generate│  ┌─── Validation (Zod) ──────────┐  │
│  Framer Motion          │         │  │                                │  │
│  Tailwind CSS           │ <───────│  │  ┌── Prompt Builder ────────┐ │  │
│                         │  JSON   │  │  │                          │ │  │
│  Zod Client Validation  │         │  │  │  ┌── Gemini 2.5 Flash ┐ │ │  │
└─────────────────────────┘         │  │  │  │  (Primary)         │ │ │  │
                                    │  │  │  └────────────────────┘ │ │  │
                                    │  │  │                          │ │  │
                                    │  │  │  ┌── Groq Llama 3.3 ──┐ │ │  │
                                    │  │  │  │  (Fallback)        │ │ │  │
                                    │  │  │  └────────────────────┘ │ │  │
                                    │  │  └──────────────────────────┘ │  │
                                    │  │                                │  │
                                    │  │  Retry + Backoff + Timeout     │  │
                                    │  └────────────────────────────────┘  │
                                    └──────────────────────────────────────┘
```

---

## 📂 Folder Structure

```
studyforge/
├── client/                      # Frontend (React + Vite)
│   ├── src/
│   │   ├── animations/          # Framer Motion variants
│   │   ├── components/
│   │   │   ├── analytics/       # Analytics dashboard with charts
│   │   │   ├── common/          # Sidebar, shared components
│   │   │   ├── dashboard/       # Smart notes input, study summary
│   │   │   ├── flashcards/      # Flashcard viewer with flip animation
│   │   │   ├── history/         # Session history with CRUD
│   │   │   └── quiz/            # Quiz engine with instant feedback
│   │   ├── hooks/               # Custom React hooks
│   │   ├── lib/                 # Utilities (cn, formatters, etc.)
│   │   ├── services/            # API client with AbortController
│   │   ├── store/               # Zustand stores (study, session, theme)
│   │   └── types/               # TypeScript type definitions
│   ├── index.html
│   └── vite.config.ts
│
├── server/                      # Backend (Express + TypeScript)
│   ├── src/
│   │   ├── controllers/         # Request handlers
│   │   ├── middleware/           # Validation, rate limiting, error handling
│   │   ├── prompts/             # Prompt engineering templates
│   │   ├── providers/           # AI provider abstraction (Gemini, Groq)
│   │   ├── routes/              # API route definitions
│   │   ├── services/            # Business logic (generation, retry)
│   │   ├── types/               # Zod schemas & TypeScript types
│   │   └── utils/               # Environment config
│   └── .env.example
│
├── .gitignore
└── README.md
```

---

## ✨ Features

### Core
- **Smart Notes Input** — Paste text, drag & drop `.txt` files, character/word/token counting
- **AI Generation** — Flashcards, quizzes, summaries, mind maps, revision tips from any text
- **Flashcard Engine** — 3D flip animation, shuffle, bookmark, mark as mastered, search & filter
- **Quiz Engine** — Multiple choice, timer, instant feedback, explanations, retry wrong answers
- **Study Summary** — Key points, common mistakes, revision tips, interactive mind map tree
- **Analytics Dashboard** — Stats cards, radar chart (topic difficulty), area chart (session history)
- **Session History** — Save/restore/delete/duplicate/rename, export/import JSON

### Polish
- **Dark/Light Mode** — Persisted theme with system preference detection
- **Keyboard Shortcuts** — Alt+1-6 for navigation, Space to flip, arrows for cards, Ctrl+Shift+D for theme
- **Micro-animations** — Spring physics, page transitions, staggered lists, animated progress
- **Mobile Responsive** — Bottom navigation bar, touch-optimized cards
- **Accessibility** — ARIA labels, focus rings, reduced motion support, semantic HTML
- **Code Splitting** — Lazy-loaded views with Suspense fallbacks

### AI Failure Handling
- Malformed JSON extraction (removes markdown fences, finds first/last braces)
- Zod schema validation with detailed error messages
- Exponential backoff with jitter (up to 3 retries per provider)
- Provider fallback (Gemini → Groq)
- Request timeout (60s) via AbortController
- Race condition prevention (latest request wins)
- Client disconnect detection (cancels server-side generation)
- Rate limiting (10 requests/minute per IP)
- Structured error responses for all failure modes

---

## 🚀 Setup

### Prerequisites
- Node.js 18+
- npm 9+
- A Gemini API key ([get one free](https://aistudio.google.com/apikey))
- A Groq API key ([get one free](https://console.groq.com/keys))

### Installation

```bash
# Clone the repository
git clone https://github.com/YOUR_USERNAME/studyforge.git
cd studyforge

# Install server dependencies
cd server
npm install

# Create environment file
cp .env.example .env
# Edit .env and add your API keys

# Install client dependencies
cd ../client
npm install
```

### Running Locally

```bash
# Terminal 1: Start the backend
cd server
npm run dev

# Terminal 2: Start the frontend
cd client
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API requests to the backend on port `3001`.

---

## 🔑 Environment Variables

### Server (`server/.env`)

| Variable | Required | Description |
|----------|----------|-------------|
| `PORT` | No | Server port (default: 3001) |
| `NODE_ENV` | No | Environment (default: development) |
| `GEMINI_API_KEY` | **Yes** | Google Gemini API key |
| `GROQ_API_KEY` | **Yes** | Groq API key |
| `CORS_ORIGIN` | No | Allowed CORS origin (default: http://localhost:5173) |

---

## 🤖 AI Usage Note

This project uses AI tools in the following ways:

1. **Gemini 2.5 Flash** — Primary AI provider for generating structured study materials from user input
2. **Groq (Llama 3.3 70B)** — Fallback provider when Gemini is unavailable
3. **Development assistance** — AI coding assistants were used for boilerplate generation and debugging, but all architectural decisions and core logic are original work

---

## ⚠️ Known Limitations

- **Token limits** — Very long inputs may exceed the model's context window
- **Local models** — Not currently supported (Ollama integration planned)
- **Offline mode** — Requires network connection for AI generation (session history works offline)
- **File support** — Currently supports `.txt` and `.md` files; PDF parsing not yet implemented
- **Streaming** — Responses are not streamed; full response is returned after generation

---

## 🔮 Future Improvements

- [ ] Streaming responses with progressive rendering
- [ ] Refinement loop (follow-up prompts to edit existing materials)
- [ ] PDF/DOCX file upload with text extraction
- [ ] Command palette (Ctrl+K)
- [ ] PWA support with offline caching
- [ ] Spaced repetition algorithm (SM-2)
- [ ] Collaborative study sessions
- [ ] Voice input
- [ ] Export to Anki format
- [ ] Deployment (Vercel + Render)

---

## ⏱️ Time Spent

| Phase | Time |
|-------|------|
| Architecture & planning | ~1h |
| Backend (API, providers, prompts, validation) | ~2h |
| Frontend (components, stores, services) | ~3h |
| Polish (animations, dark mode, accessibility) | ~1h |
| Testing & debugging | ~1h |
| **Total** | **~8h** |

---

## 📜 License

MIT
