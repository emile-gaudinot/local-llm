const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const tmp = require('tmp');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname)));

app.get('/run-script', (req, res) => {
    const model_name = req.query.model_name || '';
    const prompt = req.query.prompt || '';
    const command = 'python';
    // Create temp file for messages
    const tmpobj = tmp.fileSync({ postfix: '.json' });
    const messagesPath = tmpobj.name;
    const args = ['script.py', model_name, messagesPath];
    
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
            console.log(`messages: ${data}, messagesPath: ${messagesPath}`);
            tmpobj.removeCallback();
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
