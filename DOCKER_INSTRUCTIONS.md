# Docker Instructions for Syed Voice Assistant

This guide explains how to build and run the Syed Voice Assistant using Docker.

## Prerequisites

- [Docker](https://docs.docker.com/get-docker/) installed on your machine.
- [Docker Compose](https://docs.docker.com/compose/install/) (usually included with Docker Desktop).

## Getting Started

### 1. Set up Environment Variables

Create a `.env` file in the root directory (or use your existing one) and ensure it contains your Gemini API key:

```env
API_KEY=your_gemini_api_key_here
```

### 2. Build and Run with Docker Compose

The easiest way to start the application is using Docker Compose:

```bash
docker-compose up --build -d
```

- `--build`: Forces a rebuild of the image.
- `-d`: Runs the container in detached mode (background).

### 3. Access the Application

Once the container is running, open your browser and go to:

**[http://localhost:3000](http://localhost:3000)**

---

## Troubleshooting

### Microphone Access
Modern browsers require **HTTPS** for microphone access unless you are accessing the site via `localhost`.
- If you run this on a remote server, you must set up a reverse proxy (like Nginx with Let's Encrypt) to provide SSL/TLS.
- For local testing, `http://localhost:3000` will work fine.

### API Key Issues
If the AI fails to connect, ensure your `API_KEY` is correct in the `.env` file and that you've restarted the container after making changes.
