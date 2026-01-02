import ollama


char = '✦'
with open('model_names.txt', 'rb') as f:
    file = f.read().decode('utf-8-sig').splitlines()
    for i in range(len(file)):  # Decodes and removes BOM
        if 'vision' in ollama.show(file[i]).capabilities:
            file[i] += f' {char}\n'  
        else :
            file[i] += '\n'

with open("model_names.txt", "w", encoding="utf-8") as f:
    f.writelines(file)