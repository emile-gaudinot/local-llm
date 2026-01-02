const historyDiv = document.getElementById('history');
const promptInput = document.getElementById('prompt-input');
let prompt = '';

function autoResize() {
    this.style.height = 'auto';  // Reset height to auto to recalculate scrollHeight
    this.style.height = (this.scrollHeight+1) + 'px';
}

document.addEventListener('DOMContentLoaded', function() {
    promptInput.addEventListener('input', autoResize);
    promptInput.focus();
    populateModelSelector();
    fetch('/detect-vision-models').then(() => {
        populateModelSelector();
    })
    .catch(err => console.error('Error detecting vision models:', err)); 
});

// Manage any file upload
const selectFileBtn = document.getElementById('selectFileBtn');
const fileInput = document.getElementById('fileInput');
let file = null;
let uploadedFilePath = '';
selectFileBtn.addEventListener('click', () => {
    fileInput.click();
});
fileInput.addEventListener('change', async (event) => {
    file = event.target.files[0];
    if (file) {
        if (file !== '') {
            selectFileBtn.style.backgroundColor = 'var(--orange)';
        }
        else {
            selectFileBtn.style.backgroundColor = '#555';
        }
        // Upload the file to the backend
        const formData = new FormData();
        formData.append('file', file);
        const res = await fetch('/upload-file', {
            method: 'POST',
            body: formData
        });
        const data = await res.json();
        uploadedFilePath = data.path; // server-side path
    }
    promptInput.focus();
});

document.getElementById('run-button').addEventListener('click', runScript);
promptInput.addEventListener('keydown', function(event) {
    if (event.key === 'Enter' && !event.shiftKey) {
        event.preventDefault(); // Prevent form submission if inside a form
        runScript();
    }
    else if (event.key === 'ArrowUp' && prompt !== '') {
        promptInput.value = prompt;
        promptInput.selectionStart = promptInput.value.length;
    }
});

// Configure marked to use highlight.js
marked.setOptions({
    highlight: function(code, lang) {
        // fallback to plaintext if language is not supported or is 'latex'
        // const language = hljs.getLanguage(lang) && lang !== 'latex' ? lang : 'plaintext';
        const language = hljs.getLanguage(lang);
        return hljs.highlight(code, { language }).value;
    }
});

function addHistory(historyDiv, content, type) {
    const elem = document.createElement('div');
    if (type === 'prompt') {
        elem.className = 'history-prompt';
    }
    else if (type === 'answer') {
        elem.className = 'history-answer';
    }
    else if (type === 'time') {
        elem.className = 'execution-time';
    }
    elem.textContent = content;
    historyDiv.appendChild(elem);
}

function scrollDown() {
    requestAnimationFrame(() => {
        document.documentElement.scrollTop = document.documentElement.scrollHeight;
    });
}

async function runScript() {
    const startTime = performance.now();

    const button = document.getElementById('run-button');
    button.classList.add('active');
    const loader = document.getElementById('loader');
    loader.classList.remove('hidden');
    const buttonGroup = document.getElementById('button-group');
    buttonGroup.style.marginBottom = '2em';

    const model_name = document.getElementById('model-selector').value.replace(' ✦', '');
    prompt = promptInput.value;
    addHistory(historyDiv, prompt, 'prompt');
    promptInput.value = '';
    promptInput.style.height = 'auto';
    scrollDown();

    const response = await fetch(`/run-script?model_name=${encodeURIComponent(model_name)}&prompt=${encodeURIComponent(prompt)}&file_path=${encodeURIComponent(uploadedFilePath)}`);
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    // const decoder = new TextDecoder('windows-1252'); // default windows encoding

    addHistory(historyDiv, '', 'answer');
    const lastAnswer = historyDiv.lastElementChild;
    let received = '';
    let done = false;

    while (!done) {
        const { value, done: streamDone } = await reader.read();
        if (value) {
            const chunk = decoder.decode(value, { stream: !streamDone });
            // if (chunk.trim().includes(model_name) && chunk.trim().includes('min') && chunk.trim().includes('s') && chunk.trim().includes(' | ')) {
            //     addHistory(historyDiv, chunk.trim(), 'time');
            //     scrollDown();
            //     continue;
            // };
            received += chunk;
            lastAnswer.innerHTML = marked.parse(received);
            document.querySelectorAll('pre code').forEach((block) => {
                hljs.highlightBlock(block);
            });
            scrollDown();
        }
        done = streamDone;
    }
    // Execution time
    const elapsedTime = (performance.now() - startTime) / 1000;
    const minutes = Math.floor(elapsedTime / 60);
    const seconds = Math.floor(elapsedTime % 60);
    addHistory(historyDiv, `${minutes}min ${seconds}s  |  ${model_name}`, 'time');
    scrollDown();

    button.classList.remove('active');
    loader.classList.add('hidden');
}

// Populate model selector from model_names.txt
async function populateModelSelector() {
    try {
        const response = await fetch(`./model_names.txt?ts=${Date.now()}`);
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

// Exit on trash button click
document.getElementById("trashBtn").addEventListener("click", async function() {
    await fetch('/exit', { method: 'POST' });
    window.close();
});
