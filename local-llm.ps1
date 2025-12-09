cd D:\Documents\local-llm\app

.\venv\Scripts\activate
.\get_model_names.ps1
python .\detect_vision_models.py
Write-Host "Model names written to model_names.txt"

start http://localhost:3000
node server.js