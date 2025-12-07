# BrandFrame Studio - Retail Media Creative Tool

BrandFrame Studio is a Generative AI-powered platform designed to empower advertisers to autonomously create professional, guideline-compliant retail media creatives. Leveraging Google's **Gemini 3 Pro** and **Gemini 1.5/2.5 Flash**, it automates the design process while ensuring strict adherence to brand guidelines.

## 🚀 Features

*   **BrandKit Management**: Upload and store brand assets (logos, colors, fonts) and style guidelines.
*   **GenAI Creative Builder**:
    *   **Prompt Refinement**: Uses **Gemini 2.5 Flash** to rewrite user prompts to be brand-compliant.
    *   **High-Fidelity Generation**: Uses **Gemini 3 Pro** to generate professional retail posters.
    *   **LangGraph Orchestration**: A structured agent workflow ensures reliability and compliance.
*   **Visual Editor**: A robust canvas editor (powered by Fabric.js) for manual tweaks, text overlays, and element arrangement.
*   **Multi-Format Support**: Auto-resize validation for Instagram Stories, Posts, and Facebook formats.
*   **Export**: Download campaign-ready creatives in PNG/JPEG.

## 🛠️ Tech Stack

### Frontend
*   **Framework**: Next.js 14 (App Router)
*   **Styling**: Tailwind CSS
*   **Canvas Engine**: Fabric.js
*   **Icons**: Lucide React

### Backend
*   **Framework**: FastAPI (Python)
*   **AI Orchestration**: LangGraph, LangChain
*   **AI Models**: Google Gemini 3 Pro, Gemini 2.5 Flash (via `langchain-google-genai`)
*   **Database**: Firebase Firestore (via `firebase-admin`)

## 📦 Installation & Setup

### Prerequisites
*   Node.js & npm/pnpm
*   Python 3.10+
*   Google Cloud Project with Gemini API enabled
*   Firebase Project (Firestore enabled)

### 1. Backend Setup

```bash
cd backend

# Windows
.venv\Scripts\activate
# Mac/Linux
source .venv/bin/activate

# Install dependencies
uv sync

# Environment Variables
# Create a .env file in backend/
GOOGLE_API_KEY=your_gemini_api_key

# Firebase Setup
# Place your service account JSON in backend/ and update config.py if necessary.
```

**Run the Backend:**
```bash
uvicorn main:app --reload --port 8000
```

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
pnpm install

# Environment Variables
# Create .env.local if needed (e.g. for client-side firebase config)
```

**Run the Frontend:**
```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the application.

## 🎨 Usage Workflow

1.  **Create BrandKit**: Go to `/studio/brandkit/new` to define your brand identity (colors, logo, tone).
2.  **Open Editor**: Select your BrandKit to enter the Creative Studio.
3.  **Generate with AI**:
    *   Click the **Wand Icon (Generate AI)** in the sidebar.
    *   Enter a simple prompt (e.g., "Summer sale for fresh juices").
    *   The agent will refine your prompt to match the BrandKit and generate a compliant image.
4.  **Customize**: Use the canvas tools to add text, shapes, or resize.
5.  **Export**: Download your final creative.

## 🧠 AI Workflow (LangGraph)

The backend utilizes a graph-based agent:
1.  **FetchBrandData**: Retrieves guidelines from Firestore.
2.  **RefinePrompt**: Gemini Flash rewrites the prompt to enforce brand tone and rules.
3.  **GenerateImage**: Gemini 3 Pro creates the visual asset based on the strict prompt.

## 📄 License
Tesco Retail Media Hackathon Project.
