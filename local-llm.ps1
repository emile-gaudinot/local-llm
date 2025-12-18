cd D:\Documents\local-llm\app
.\venv\Scripts\activate
.\get_model_names.ps1
Write-Host "Model names written to model_names.txt"

.\vision-models.ps1
python .\detect_vision_models.py
Write-Host "Vision models marked"

start http://localhost:3000
node server.js