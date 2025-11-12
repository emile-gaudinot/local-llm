const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname)));

app.get('/run-script', (req, res) => {
    const model_name = req.query.model_name || '';
    const prompt = req.query.prompt || '';
    const command = 'python';
    const args = ['script.py', model_name];
    
    const child = spawn(command, args, { shell: false });
    child.stdin.write(prompt);  // Input is passed as raw text to the python script
    child.stdin.end();

    res.setHeader('Content-Type', 'text/plain; charset=utf-8');

    child.stdout.on('data', (data) => {
        res.write(data);
    });
    child.stderr.on('data', (data) => {
        console.error(`Script stderr: ${data}`);
    });
    child.on('close', (code) => {
        res.end();
    });
    child.on('error', (err) => {
        console.error(`Error executing script: ${err.message}`);
        res.status(500).end('Error executing script');
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
