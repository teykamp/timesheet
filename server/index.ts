import pg from 'pg';
import dotenv from 'dotenv';
import express from 'express';

const app = express();
app.use(express.json());
dotenv.config();

const queriesRoute = require('./queries');
app.use('/api', queriesRoute);

app.get('/api', (req, res) => {
  res.json({
    message: 'Hello World!'
  });
});

const PORT = process.env.PORT || 3000; // Use the provided PORT or default to 3000
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}. Ready to accept requests!`);
});
