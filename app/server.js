const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname)));

app.get('/run-script', (req, res) => {
    const model_name = req.query.model_name || '';
    const prompt = req.query.prompt || '';
    const command = `venv\\Scripts\\activate && python script.py "${model_name}" "${prompt}"`;

    exec(command, { shell: 'cmd.exe' }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error.message}`);
            return res.status(500).send('Error executing script');
        }
        if (stderr) {
            console.error(`Script stderr: ${stderr}`);
        }
        res.send(stdout);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
