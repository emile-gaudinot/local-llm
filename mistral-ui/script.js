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
    const float_precision = document.getElementById('float-selector').value;
    const prompt = document.getElementById('prompt-input').value;

    // Fetch result from backend
    var data = await fetch(`/run-script?model_name=${encodeURIComponent(model_name)}&prompt=${encodeURIComponent(prompt)}&float_precision=${encodeURIComponent(float_precision)}`);
    data = await data.text();
// var data = `1. Start with the given equation $ax+b$:
//    \\[
//    2x + 2 = 8
//    \\]

// 2. Subtract 2 from both sides to isolate the term with \(x\):
//    \[
//    2x + 2 - 2 = 8 - 2
//    \]
//    Simplifying both sides, we get:
//    \[
//    2x = 6
//    \]

// 3. Divide both sides by 2 to solve for \(x\):
//    \[
//    \frac{2x}{2} = \frac{6}{2}
//    \]
//    Simplifying both sides, we get:
//    \[
//    x = 3
//    \]

// ### Conclusion:
// \[
// \boxed{3}
// \]

// 7min 20s  |  Mathstral  |  torch.bfloat16
// `;
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
