# ASCON Cryptography Simulator & Analytics Studio

![System Architecture](https://via.placeholder.com/1200x400/111/4444ff?text=ASCON+Cryptography+Studio)

The **ASCON Cryptography Simulator** is an advanced, cinematic educational framework designed to demystify **ASCON**—the NIST standard for lightweight cryptography in constrained IoT environments. It bridges complex discrete mathematics, low-level bitslicing, and algorithmic performance metrics with a highly interactive, Vercel-tier user experience. 

Built as a definitive Final Year Project, this platform allows students and security researchers to inspect internal state permutations in real-time, guided by a localized, context-aware LLM Agent.

---

## 🏛️ System Architecture

The application is deployed using a decoupled, event-driven architecture relying on a high-concurrency Python backend and an animated Next.js frontend.

### 1. Frontend Client (Next.js)
- **Framework**: Built on **Next.js 16** (App Router) maximizing React 19 concurrent features. 
- **State Management**: **Zustand** is utilized for deeply nested store persistence, maintaining the ASCON state matrix (`nonce`, `key`, `associated_data`), the micro-step synchronization index, and JWT Auth sessions across renders.
- **Cinematic Rendering**: **Framer Motion** powers smooth physics-based UI transitions. Layout changes, step-scrubbing in the Avalanche matrix, and the custom RoboExplainer typewriter mascot rely on heavily optimized GPU bounds.
- **Styling**: Tailored with modular **Tailwind CSS v4** utilizing deep, glassmorphic UI tokens.

### 2. Live API & RAG Engine (FastAPI)
- **Communication Protocol**: Dual-lane API logic. Traditional REST routes handle Authentication (`/login`, `/register`) using **PyMongo/MongoDB**, while **WebSockets** maintain a persistent zero-latency duplex connection for the AI Copilot.
- **Context-Aware RAG Engine**: The AI-Tutor runs entirely locally. It parses user questions and pushes queries to a locally hosted **Ollama (Mistral)** instance via **LangChain**.
- **Algorithmic UI Control**: The LLM acts as the UI's director. Via semantic parsing matrices, the backend evaluates the cryptographic context of user questions (e.g., "explain permutation bounds") and ejects JSON-based triggers (`actions: { highlight: 'permutation-view', open_side_panel: true }`) back into the WebSocket stream, actively shifting the Next.js visualizer states autonomously.

---

## ✨ Core Analytical Modules

### 🔗 The Context-Aware AI Copilot 
The AI Tutor panel isn't just a chatbot—it physically drives the environment. Powered by Ollama, it answers strict cryptographic queries and automatically loads the requisite Visualizer Panels (S-Box models, State Array matrices) to aid its explanation. 

### 🧮 320-Bit Internal State Matrix Explorer
Watch ASCON's Sponge construction run live. The $5 \times 64$-bit ($x_0$ to $x_4$) matrix is meticulously detailed into 8-bit bytes. Users can inspect distinct hex thresholds, trace logic flows, and perform simulated bit-flipping Avalanche attacks directly on the UI grid to visualize how non-linearity propagates via the `p^12` permutation.

### 🤖 Robo-Explainer Learning Modules
An interactive, gamified learning path targeting IoT security problems. Context is not simply dumped on the screen; it is typed out live by an animated floating mascot (`ASCON Bot`), minimizing cognitive overload while ensuring deeper engagement.

### 🔌 Embedded Hardware Target Dashboard (IoT)
Simulates a live ESP32-C3 implementation to validate NIST's standardization reasoning. Features live UART ciphertext intercepts and animated metrics charting ASCON's ultra-low RAM/ROM footprint and live power draw against traditional AES-256-GCM configurations.

---

## ⚙️ Local Development Setup

To run this platform locally, spin up both the FastAPI backend server and the Next.js frontend portal.

### Prerequisites
- Node.js (v18+)
- Python 3.10+
- A running MongoDB Database
- **Ollama**: Installed locally with the Mistral model initialized (`ollama pull mistral`)

### 1. Initialize Backend Core
The Python environment handles the API routes and local LangChain intelligence.
```bash
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt

# Execute the ASGI Server
python main.py
```

### 2. Initialize Frontend Portal
```bash
npm install
npm run dev
```

Visit `http://localhost:3000` to dive into the dashboard.

---

