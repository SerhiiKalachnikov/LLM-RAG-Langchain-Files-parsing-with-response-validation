# LLM-RAG-Langchain-Files-parsing-with-response-validation

## 🌟 Overview

This project demonstrates how to parse various files using LangChain, OpenAI, Ollama. Validate responses using ZOD validator. It leverages NestJS for building efficient and scalable applications.

## 🛠️ Technologies Used

![Node.js](https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-412991?style=for-the-badge&logo=openai&logoColor=white)
![LangChain](https://img.shields.io/badge/LangChain-FF9900?style=for-the-badge&logo=langchain&logoColor=white)
![Ollama](https://img.shields.io/badge/Ollama-000000?style=for-the-badge&logo=ollama&logoColor=white)
![Llava](https://img.shields.io/badge/Llava-FF4500?style=for-the-badge&logo=ollama&logoColor=white)
![Llama](https://img.shields.io/badge/Llama-FF4500?style=for-the-badge&logo=ollama&logoColor=white)

## 🎯 Features

- 📅 Parse calendar events from text files and pictures.
- ✅ Parse and validate responses using LangChain.
- 📂 Handle file uploads and responses.
- 🛠️ Use ZOD for response validation and structuring.
- 🤖 Use ZOD as chain for AI. For build response structure.
- 📝 Use OpenAI for text and image processing.
- 🗣️ Use Ollama for text processing.
- 💬 Use Llama for chat processing.
- 👁️ Use LLava for vision processing.

Supported file types:

- 📝 Text files (`.txt`)
- 🖼️ Image files (`.png`, `.jpg`, `.jpeg`, `.gif`)
- 📄 PDF files (`.pdf`)
- 📃 DOCX files (`.docx`)

## 📋 Table of Contents

- [🗂️ Project Structure](#project-structure)
- [📦 Installation](#-installation-flow)
- [🚀 Running the Application](#-running-the-application)
- [🌐 Environment Variables](#-environment-variables)
- [🐳 Ollama installation](#-ollama-installation)
- [📜 License](#-license)

## Project Structure

- **src**: Contains the main source code for the application.
  - **llm-module**: Contains the logic for handling file parsing and validation.
    - **calendar.service.ts**: Service for handling calendar events.
    - **dto**: Data transfer objects.
    - **interfaces**: TypeScript interfaces.
    - **validators**: Validation schemas.
    - **llm.controller.ts**: Controller for handling LLM-related requests.
    - **llm.service.ts**: Service for handling LLM-related logic.
  - **decorators**: Custom decorators. Retry strategy for AI requests.
  - **utils**: Utility functions and classes. Store logs in a file.

## 📦 Installation Flow

```bash
npm install
```

## 🚀 Running the Application

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## 🌐 Environment Variables

Create a `.env` file in the root directory and configure the following variables:

```env
PORT=4000
NODE_ENV="production"
DATABASE_LLM_TABLE="llm"
OPENAI_API_KEY="your-openai-api-key"
OPENAI_EMBEDDING_MODEL="text-embedding-3-small"
OPENAI_VISION_MODEL="gpt-4o"
OPENAI_CHAT_MODEL="gpt-4o"
OLLAMA_BASE_URL="http://localhost:11434"
OLLAMA_EMBEDDING_MODEL="nomic-embed-text"
OLLAMA_VISION_MODEL='llava-phi3'
OLLAMA_CHAT_MODEL='llama3.2'
```

> Note: NODE_ENV="production" using OpenAI. NODE_ENV="development" using Ollama.

## 🐳 Ollama installation

Install Docker and Docker Compose.

Create a `docker-compose.yml` file in the root directory and configure the following services:

```YML
services:
    ollama:
        image: ollama/ollama:latest
        container_name: ollama
        pull_policy: always
        tty: true
        restart: unless-stopped
        volumes:
            - ollama:/root/.ollama
        ports:
            - 11434:11434
        # Uncomment to enable GPU support
        environment:
            - NVIDIA_VISIBLE_DEVICES=all
            - NVIDIA_DRIVER_CAPABILITIES=compute,utility
            - MODELS=all-minilm:latest,llava-phi3:latest
            - OLLAMA_NUM_PARALLEL=10
            - OLLAMA_MAX_LOADED_MODELS=10
        deploy:
            resources:
                reservations:
                    devices:
                        - driver: nvidia
                            count: 1
                            capabilities: [gpu]

    open-webui:
        image: ghcr.io/open-webui/open-webui:main
        container_name: open-webui
        pull_policy: missing
        volumes:
            - open-webui:/app/backend/data
        depends_on:
            - ollama
        ports:
            - 3000:8080
        environment:
            - 'OLLAMA_BASE_URL=http://ollama:11434'
        extra_hosts:
            - host.docker.internal:host-gateway
        restart: unless-stopped

volumes:
    ollama:
    open-webui:

```

Run the following command to start the Ollama service:

```bash
docker-compose up -d
```

## 📜 License

This project is licensed under the MIT License. See the [LICENSE](./LICENSE) file for details.
