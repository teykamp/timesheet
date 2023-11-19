import pg from 'pg';
import dotenv from 'dotenv';
import express from 'express';

const app = express();
app.use(express.json());
dotenv.config();

const conString = process.env.DB_CONNECTION_URL;
const client = new pg.Client(conString);

const queriesRoute = require('./queries');
app.use('/api', queriesRoute);

app.get('/api', (req, res) => {
  res.json({
    message: 'Hello World!'
  });
});

client.connect((err) => {
  if (err) {
    return console.error('could not connect to postgres', err);
  }
  client.query('SELECT * FROM project', (err, result) => {
    if (err) {
      return console.error('error running query', err);
    }
    console.log(result.rows);
    client.end();
  });
});

const PORT = process.env.PORT || 3000; // Use the provided PORT or default to 3000
app.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}. Ready to accept requests!`);
});
