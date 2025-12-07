# Get all subfolders in the parent folder
$subfolders = Get-ChildItem -Path ..\ollama-models\manifests\registry.ollama.ai\library\ -Directory

# Generate the output strings and write to file
$output = @()
foreach ($folder in $subfolders) {
    $files = Get-ChildItem -Path $folder.FullName -File
    foreach ($file in $files) {
        $output += "$($folder.Name):$($file.Name)"
    }
}

# Write to model_names.txt
$output | Out-File -FilePath .\model_names.txt -Encoding UTF8