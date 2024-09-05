const express = require('express');
const { VM } = require('vm2');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Initialize SQLite database
const db = new sqlite3.Database('./logs.db', (err) => {
  if (err) {
    console.error('Error opening database', err);
  } else {
    console.log('Database connected');
    db.run('CREATE TABLE IF NOT EXISTS logs (id INTEGER PRIMARY KEY AUTOINCREMENT, timestamp TEXT, result TEXT)');
  }
});

// Webhook endpoint
app.post('/webhook', async (req, res) => {
  const { code } = req.body;

  if (!code) {
    return res.status(400).json({ error: 'No code provided' });
  }

  const vm = new VM({
    timeout: 5000,
    sandbox: {
      console: {
        log: (...args) => console.log(...args),
      },
      fetch: fetch,
      output: new Map(),
    },
  });

  try {
    // Execute the code
    const result = await vm.run(code);

    // Get the output
    const output = vm.sandbox.output;
    const outputString = JSON.stringify(Object.fromEntries(output));

    // Log the result to the database
    db.run('INSERT INTO logs (timestamp, result) VALUES (?, ?)', [new Date().toISOString(), outputString], (err) => {
      if (err) {
        console.error('Error inserting log', err);
      }
    });

    res.json({ result, output: Object.fromEntries(output) });
  } catch (error) {
    console.error('Error executing code:', error);
    res.status(500).json({ error: 'Error executing code' });
  }
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

module.exports = app;
