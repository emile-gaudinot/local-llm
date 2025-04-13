const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.static(path.join(__dirname)));

app.get('/run-script', (req, res) => {
    const model_name = req.query.model_name || '';
    const prompt = req.query.prompt || '';
    const float_precision = req.query.float_precision || 'bfloat16';

    // Command to activate the virtual environment and run the script
    const command = `..\\mistral-inference\\env-mistral\\Scripts\\activate && python script.py "${model_name}" "${prompt}" "${float_precision}"`;

    exec(command, { shell: 'cmd.exe' }, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing script: ${error.message}`);
            return res.status(500).send('Error executing script');
        }
        res.send(stdout);
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
