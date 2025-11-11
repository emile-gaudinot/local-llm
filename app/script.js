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
    // Button orange
    const button = document.getElementById('run-button');
    button.classList.add('active');

    // Get selected model name, float precision, and prompt
    const model_name = document.getElementById('model-selector').value;
    const prompt = document.getElementById('prompt-input').value;

    // Fetch result from backend
    var data = await fetch(`/run-script?model_name=${encodeURIComponent(model_name)}&prompt=${encodeURIComponent(prompt)}`);
    data = await data.text();
    console.log('data');
    console.log(data);

    // Get execution time
    const splitted = data.split('\n')
    splitted.pop()
    const executionTime = splitted.pop()
    data = splitted.join('\n');
    
    // Convert Markdown to HTML and display the output
    const outputElement = document.getElementById('output');
    const executionTimeElement = document.getElementById('executionTime');
    outputElement.innerHTML = marked.parse(data);
    outputElement.classList.remove('hidden');
    
    // Add execution time at the end of the output
    executionTimeElement.textContent = executionTime;
    
    // Reset button color
    button.classList.remove('active');
    
    // Apply syntax highlighting
    document.querySelectorAll('pre code').forEach((block) => {
        hljs.highlightBlock(block);
    });
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
