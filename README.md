<p align="center">
  <img src="https://img.shields.io/badge/COBRA-AI-00ffff?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAyNCAyNCI+PHBhdGggZD0iTTEyIDJMMiAyMmgyMEwxMiAyeiIgZmlsbD0iIzAwZmZmZiIvPjwvc3ZnPg==&labelColor=050510" alt="Cobra AI" />
  <img src="https://img.shields.io/badge/React-18.2-61DAFB?style=for-the-badge&logo=react&logoColor=white&labelColor=050510" alt="React" />
  <img src="https://img.shields.io/badge/OpenRouter-API-8B5CF6?style=for-the-badge&logo=openai&logoColor=white&labelColor=050510" alt="OpenRouter" />
  <img src="https://img.shields.io/badge/Supabase-Auth%20%26%20DB-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white&labelColor=050510" alt="Supabase" />
  <img src="https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white&labelColor=050510" alt="Vite" />
</p>

# 🐍 COBRA AI

> **A cyberpunk-themed, full-stack AI assistant powered by OpenRouter with multi-model support, real-time streaming, image generation, voice control, and persistent chat sessions via Supabase.**

Cobra AI is a premium React web application with a tactical, holographic interface inspired by sci-fi command systems. It connects to **100+ AI models** through OpenRouter's unified API, supports multi-modal input (text, images, PDFs, voice), and persists your entire conversation history in the cloud.

---

## ✨ Features

### 🤖 AI & Language Models
- **OpenRouter API Integration** — Access 100+ LLMs through a single API (Gemma 4, Llama 3.3, GPT, Qwen, and more)
- **Real-Time Streaming** — Token-by-token response streaming for instant feedback
- **Smart Model Fallback** — Automatic cascading fallback through multiple free models if one is rate-limited (429) or unavailable
- **Pollinations Emergency Core** — Last-resort fallback to Pollinations AI if all OpenRouter nodes fail
- **Custom Personas** — Switch between built-in personas (Standard, JARVIS, Code Expert, Hacker) or create your own with custom system prompts
- **Temperature & Top-P Controls** — Fine-tune AI creativity and response diversity

### 🎨 Image Generation
- **`/imagine` Command** — Generate images directly in chat using natural language prompts
- **3 Image Engines:**
  - 🟢 **Pollinations AI** (Free, default) — Powered by Flux model
  - 🟡 **Hugging Face** (Free API key) — Stable Diffusion XL
  - 🔴 **OpenAI DALL·E 3** (Premium) — Highest quality generation
- **Image Download** — One-click download for all generated images

### 🔐 Authentication & Cloud Persistence
- **Supabase Authentication** — Secure email/password login and registration
- **Cloud Chat Sessions** — All conversations persist in Supabase PostgreSQL database
- **Multi-Session Management** — Create, switch, rename, and delete chat sessions
- **Auto-Naming** — Sessions auto-rename based on your first message

### 📄 Document Intelligence (RAG)
- **File Upload & Analysis** — Upload and analyze documents directly in chat
  - **PDF** — Full text extraction with page-by-page parsing (via `pdfjs-dist`)
  - **TXT / CSV / Markdown** — Direct text file reading
  - **Images** — Vision-capable models can analyze uploaded images
- **Web Search** — Toggle live DuckDuckGo web search results injected into AI context

### 🎙️ Voice & Audio
- **Voice Recognition** — Speech-to-text input via Web Speech API
- **Text-to-Speech** — Listen to AI responses with play, pause, and stop controls
- **Customizable TTS** — Browser-native speech synthesis

### 📤 Export & Productivity
- **Export Chat as TXT** — Plain text conversation logs
- **Export Chat as PDF** — Full visual export with styling preserved
- **Export Chat as PNG** — Screenshot-quality image export
- **Copy Code Blocks** — One-click copy for any code in responses
- **Copy Messages** — Copy any AI response to clipboard
- **Edit & Fork** — Edit any previous message and re-branch the conversation
- **Regenerate Responses** — Re-run any AI response with one click
- **Delete Messages** — Remove individual messages or clear entire sessions

### 🎨 UI/UX Design
- **Cyberpunk Tactical Interface** — Dark holographic theme with glassmorphism and neon cyan/fuchsia accents
- **Animated Splash Screen** — Cinematic boot sequence with holographic 3D globe and progress simulation
- **Warp Speed Starfield** — Procedurally generated animated star background
- **Syntax Highlighting** — VS Code Dark+ theme for code blocks (via `react-syntax-highlighter`)
- **LaTeX Math Rendering** — Full math equation support via KaTeX
- **Markdown Rendering** — Rich formatting with `react-markdown`
- **Fully Responsive** — Mobile-first design with collapsible sidebar and adaptive layouts

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, JSX, TailwindCSS 3 |
| **Build Tool** | Vite 5 |
| **AI Backend** | OpenRouter API (via OpenAI SDK) |
| **Authentication** | Supabase Auth (Email/Password) |
| **Database** | Supabase PostgreSQL |
| **Image Gen** | Pollinations AI, Hugging Face, OpenAI DALL·E 3 |
| **Document Parsing** | pdfjs-dist, FileReader API |
| **Web Search** | DuckDuckGo (via CORS proxy) |
| **Markdown** | react-markdown, remark-math, rehype-katex |
| **Code Highlighting** | react-syntax-highlighter (Prism) |
| **PDF Export** | jsPDF + html2canvas |
| **Voice** | Web Speech API (Recognition + Synthesis) |
| **Icons** | FontAwesome 6 |
| **Routing** | React Router DOM v7 |
| **Deployment** | Vercel |

---

## 📋 Prerequisites

- [Node.js](https://nodejs.org/) (>=16.x)
- [npm](https://www.npmjs.com/) (>=8.x)
- An [OpenRouter](https://openrouter.ai/) API key (free tier available)
- A [Supabase](https://supabase.com/) project (free tier available)

---

## 🚀 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/kingofallsnakes/Cobra-Ai.git
cd Cobra-Ai
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```env
VITE_OPENROUTER_API_KEY=your_openrouter_api_key_here
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

> **Getting your keys:**
> - **OpenRouter:** Sign up at [openrouter.ai](https://openrouter.ai/) → Dashboard → API Keys
> - **Supabase:** Create a project at [supabase.com](https://supabase.com/) → Settings → API

### 4. Set Up Supabase Database

Create the following tables in your Supabase SQL editor:

```sql
-- Sessions table
CREATE TABLE sessions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Messages table
CREATE TABLE messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID REFERENCES sessions(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  text TEXT,
  image_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS Policies (users can only access their own data)
CREATE POLICY "Users can manage their sessions" ON sessions
  FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their messages" ON messages
  FOR ALL USING (auth.uid() = user_id);
```

### 5. Run the Application

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

---

## 💡 Usage

### Chat Commands
| Command | Description |
|---|---|
| Type any message | Send a text prompt to the AI |
| `/imagine <prompt>` | Generate an image from a text description |
| 🎤 Microphone button | Start voice recognition to dictate your message |
| 📎 Plus button | Upload a file (PDF, TXT, CSV, MD, or image) |
| `IMG` button | Quick-generate an image from your current text input |

### Keyboard Shortcuts
| Shortcut | Action |
|---|---|
| `Enter` | Send message |
| `Shift + Enter` | New line in message |

### Settings Panel
Access via the ⚙️ **SETTINGS** button in the sidebar:
- **Temperature** — Control randomness (0 = deterministic, 2 = creative)
- **Top-P** — Limit vocabulary diversity
- **Web Search** — Toggle live search results injection
- **Image Engine** — Switch between Pollinations, Hugging Face, or DALL·E 3
- **Custom Personas** — Create and save custom AI personalities

---

## 🏗️ Project Structure

```
Cobra-Ai/
├── public/                  # Static assets (SVGs)
├── src/
│   ├── assets/              # Images and GIFs
│   ├── services/
│   │   ├── ai.js            # OpenRouter API client, streaming, fallback logic, image generation
│   │   ├── rag.js           # PDF/text extraction, web search
│   │   └── supabaseClient.js # Supabase client initialization
│   ├── App.jsx              # Main app: chat interface, session management, all features
│   ├── App.css              # Custom CSS and animations
│   ├── Auth.jsx             # Login/registration page
│   ├── SplashScreen.jsx     # Animated boot splash screen
│   ├── index.css            # Global styles
│   └── main.jsx             # App entry point with React Router
├── .env                     # Environment variables (not committed)
├── .gitignore
├── index.html
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── vite.config.js
├── vercel.json              # Vercel deployment config
└── README.md
```

---

## 🌐 Deployment

Cobra AI is configured for **Vercel** deployment out of the box:

1. Push your code to GitHub
2. Import the repo in [Vercel](https://vercel.com/)
3. Add your environment variables in Vercel's project settings
4. Deploy 🚀

---

## 🤝 Contributing

Contributions are welcome! Feel free to open issues or submit pull requests.

---

## 📄 License

This project is open source. Feel free to use, modify, and distribute.

---

<p align="center">
  <strong>Built with 🐍 by <a href="https://github.com/kingofallsnakes">kingofallsnakes</a></strong>
</p>
