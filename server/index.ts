import pg from 'pg';
import dotenv from 'dotenv';
import express from 'express';

const app = express();
app.use(express.json());
dotenv.config();

app.listen(3000, () => {
  console.log('Server is listening on port 2000. Ready to accept requests!');
});
