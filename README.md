
  # Syed Voice Assistant

  **A Next-Gen Real-Time AI Voice Agent**

  [![React](https://img.shields.io/badge/React-19.0-blue?logo=react)](https://react.dev/)
  [![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
  [![Vite](https://img.shields.io/badge/Vite-6.0-purple?logo=vite)](https://vitejs.dev/)
  [![Gemini AI](https://img.shields.io/badge/Gemini_2.0-Flash-orange?logo=google)](https://deepmind.google/technologies/gemini/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-cyan?logo=tailwindcss)](https://tailwindcss.com/)
  [![Docker](https://img.shields.io/badge/Docker-Ready-blue?logo=docker)](https://www.docker.com/)

  [🚀 **View Live Demo**](https://voiceagentt.netlify.app/)

</div>

---

## 📖 About

**Syed** is a cutting-edge, real-time voice assistant built to simulate natural human conversation. Powered by Google's **Gemini 2.0 Flash** model, it features low-latency voice interaction, intelligent turn-taking, and a sleek, futuristic UI.

Unlike traditional chatbots, Syed is **voice-first**, prioritizing fluid audio exchanges over text, making it feel like a real phone call.

## ✨ Key Features

*   **🎙️ Real-Time Voice Interaction:** Seamless speech-to-speech communication with minimal latency.
*   **🌊 Dynamic Audio Visualization:** Real-time audio wave visualization that reacts to voice input and output.
*   **🧠 Intelligent Turn-Taking:** Advanced debouncing logic to handle interruptions and pauses naturally.
*   **🔌 Gemini 2.0 Integration:** Leverages the latest multimodal capabilities for rich understanding.
*   **🌍 Multilingual Support:** Capable of conversing in multiple languages (English, Hindi, Spanish, etc.).
*   **🐳 Dockerized:** Fully containerized for consistent deployment across environments.

## 🛠️ Tech Stack

*   **Frontend Library:** React 19
*   **Language:** TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS
*   **AI Model:** Google GenAI (Gemini 2.0 Flash Native Audio)
*   **Audio Processing:** Web Audio API (ScriptProcessorNode, AnalyserNode)

## 🚀 Getting Started

Follow these steps to run the assistant locally on your machine.

### Prerequisites

*   **Node.js** (v18 or higher)
*   **npm** or **yarn**
*   **Gemini API Key** (Get one from [Google AI Studio](https://aistudio.google.com/))

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/syed-voice-assistant.git
    cd syed-voice-assistant
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Configure Environment:**
    Create a `.env.local` file in the root directory and add your API Key:
    ```env
    VITE_GEMINI_API_KEY=your_actual_api_key_here
    ```

4.  **Run the App:**
    ```bash
    npm run dev
    ```
    Open [http://localhost:5173](http://localhost:5173) in your browser.

## 🐳 Running with Docker

Prefer using Docker? We've got you covered.

1.  **Build the Image:**
    ```bash
    docker-compose build
    ```

2.  **Run the Container:**
    ```bash
    docker-compose up
    ```
    *Note: You may need to pass your API key as an environment variable or configure it in `docker-compose.yml`.*

For detailed Docker instructions, please refer to [DOCKER_INSTRUCTIONS.md](DOCKER_INSTRUCTIONS.md).

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

<div align="center">
  <sub>Built with ❤️ by the Syed Voice Assistant Team</sub>
</div>
