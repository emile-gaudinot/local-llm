$fileContent = Get-Content -Path 'model_names.txt' -Encoding UTF8 -Raw
$lines = $fileContent -split "`r`n" | ForEach-Object { $_.Trim() }
# Process each line
for ($i = 0; $i -lt $lines.Count; $i++) {
    $modelName = $lines[$i]
    if ($modelName -eq '') {
        continue
    }
    $modelInfos = ollama show $modelName | Out-String
    if ($modelinfos -like '*vision*') {
        $lines[$i] += " vision"
    }
}
# Write the updated lines back to the file
$lines | Out-File -FilePath 'model_names.txt' -Encoding UTF8 -Force
