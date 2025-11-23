const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const tmp = require('tmp');
const app = express();
const PORT = 3000;


// Create temp file for messages
const tmpobj = tmp.fileSync({ postfix: '.json' });
const messagesPath = tmpobj.name;
let messages = [];

app.use(express.static(path.join(__dirname)));

app.get('/run-script', (req, res) => {
    const model_name = req.query.model_name || '';
    const prompt = req.query.prompt || '';
    const command = 'python';
    const args = ['script.py', model_name, messagesPath];

    // Write messages to temp file
    fs.writeFileSync(messagesPath, JSON.stringify(messages), 'utf-8');
    
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
        // Read messages from temp file and send as header
        fs.readFile(messagesPath, 'utf-8', (err, data) => {
            messages.push(...JSON.parse(data))
            tmpobj.removeCallback();
            res.end(); // Ensure the response stream is closed
        });
    });
    child.on('error', (err) => {
        console.error(`Error executing script: ${err.message}`);
        res.status(500).end('Error executing script');
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
