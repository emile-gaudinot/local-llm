const express = require('express');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const upload = multer({ dest: 'files/' });
const app = express();
const PORT = 3000;

const messages_path = './files/messages.json';
fs.writeFileSync(messages_path, '[]', 'utf-8');
let messages = [];

app.use(express.static(path.join(__dirname)));

app.post('/upload-file', upload.single('file'), (req, res) => {
    // Return the server-side path to the uploaded file
    res.json({ path: req.file.path });
});

app.get('/run-script', (req, res) => {
    const model_name = req.query.model_name || '';
    const prompt = req.query.prompt || '';
    const file_path = req.query.file_path || '';
    const command = 'python';
    const args = ['script.py', model_name, messages_path, file_path];

    // Write messages to file
    fs.writeFileSync(messages_path, JSON.stringify(messages), 'utf-8');
    
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
        // Read messages from file and send as header
        fs.readFile(messages_path, 'utf-8', (err, data) => {
            messages.push(...JSON.parse(data))
        });
        res.end(); // Ensure the response stream is closed
        fs.unlink(messages_path, () => {});
    });
    child.on('error', (err) => {
        console.error(`Error executing script: ${err.message}`);
        res.status(500).end('Error executing script');
    });
});

const server = app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

// Add shutdown endpoint
app.post('/exit', (req, res) => {
    res.send('Exiting');
    // Delete all files in files/ directory
    fs.readdirSync('./files/').forEach(file => {
        fs.unlinkSync(path.join('./files/', file));
    });
    process.exit();
});

