document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('prompt-input').focus();
});

document.getElementById('run-button').addEventListener('click', runScript);
document.getElementById('prompt-input').addEventListener('keydown', function(event) {
    if (event.key === 'Enter') {
        event.preventDefault(); // Prevent form submission if inside a form
        runScript();
    }
});

// Configure marked to use highlight.js
marked.setOptions({
    highlight: function(code, lang) {
        const language = hljs.getLanguage(lang) ? lang : 'plaintext';
        return hljs.highlight(code, { language }).value;
    }
});

async function runScript() {
    const button = document.getElementById('run-button');
    button.classList.add('active');

    const model_name = document.getElementById('model-selector').value;
    const prompt = document.getElementById('prompt-input').value;

    const outputElement = document.getElementById('output');
    const executionTimeElement = document.getElementById('executionTime');
    outputElement.innerHTML = '';
    outputElement.classList.remove('hidden');
    executionTimeElement.textContent = '';

    const response = await fetch(`/run-script?model_name=${encodeURIComponent(model_name)}&prompt=${encodeURIComponent(prompt)}`);
    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let received = '';
    let done = false;

    while (!done) {
        const { value, done: streamDone } = await reader.read();
        if (value) {
            const chunk = decoder.decode(value, { stream: !streamDone });
            if (chunk.trim().includes(model_name) && chunk.trim().includes('min') && chunk.trim().includes('s') && chunk.trim().includes(' | ')) {
                executionTimeElement.textContent = chunk.trim();
                continue;
            };
            received += chunk;
            outputElement.innerHTML = marked.parse(received);
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightBlock(block);
            });
        }
        done = streamDone;
    }

    button.classList.remove('active');
}

// Populate model selector from model_names.txt
async function populateModelSelector() {
    try {
        const response = await fetch('./model_names.txt');
        const text = await response.text();
        const models = text.trim().split('\n').filter(line => line.trim());
        
        const selector = document.getElementById('model-selector');
        selector.innerHTML = '';
        
        models.forEach((model, index) => {
            const option = document.createElement('option');
            option.value = model.trim();
            option.textContent = model.trim();
            if (model.trim() === 'mistral:7b') option.selected = true;
            selector.appendChild(option);
        });
    } catch (error) {
        console.error('Failed to load models:', error);
    }
}
populateModelSelector();
