# Local LLM

[![License](https://img.shields.io/badge/License-CC%20BY--NC--SA-blue)](https://creativecommons.org/)
[![Python](https://img.shields.io/badge/Python-3.13-green)](https://www.python.org/)
[![Ollama](https://img.shields.io/badge/Ollama-0.6.0-purple)](https://ollama.com/)

<img width="1461" height="752" alt="image" src="https://github.com/user-attachments/assets/9827cffd-b189-4b3e-aaa7-113a0f384d88" />
<br>
<br>
This project enables to run open-source large language models (LLMs) locally using Ollama, with user-friendly web interface.
It works well with lightweight models, making it perfect for running it on its own local machine.

### Features
- Local Execution: Run open-source LLMs directly on your local machine without relying on cloud services.
- Ollama Support: Seamless integration with Ollama, an open-source API for running large language models.
- Lightweight Models: Includes support for multiple lightweight models like mistral-nemo:12b and gemma3:4b.
- Custom UI: A user-friendly web interface to interact with the models.
- Injection Prevention: Safe implementation to prevent injection attacks.

### Usage
Clone this repository:
```bash
git clone https://github.com/yourusername/local-llms.git
```
Install dependencies:
```bash
cd local-llms\apps
npm install
python -m venv venv
venv\Scripts\activate
pip install -r requirements.txt
```
Set Ollama download folder to `local-llm\ollama-models\`.

Download a model (see all [Ollama models](https://ollama.com/search)):
```bash
ollama pull mistral:7b
```
Get model names and start server:
```bash
start http://localhost:3000
..\get_model_names.ps1
node server.js
```
