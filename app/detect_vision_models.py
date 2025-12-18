with open('model_names.txt', 'rb') as f:
    file = f.read().decode('utf-8-sig').splitlines()
    for i in range(len(file)):  # Decodes and removes BOM
        file[i] = file[i].replace('vision', '✦') + '\n'

with open("model_names.txt", "w", encoding="utf-8") as f:
    f.writelines(file)