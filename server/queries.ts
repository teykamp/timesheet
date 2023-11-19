import express from 'express';
import pg from 'pg';

const router = express.Router();
const conString = process.env.DB_CONNECTION_URL;
const client = new pg.Client(conString);

router.get('/projects', (req, res) => {
  client.connect((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not connect to the database' });
    }

    client.query('SELECT * FROM project', (err, result) => {
      if (err) {
        client.end();
        return res.status(500).json({ error: 'Error running the query' });
      }

      res.json(result.rows);
      client.end();
    });
  });
});

export = router;