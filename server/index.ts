import pg from 'pg';
import dotenv from 'dotenv';
import express from 'express';

const app = express();
app.use(express.json());
dotenv.config();

var conString = process.env.DB_CONNECTION_URL
var client = new pg.Client(conString);

client.connect((err) => {
  if(err) {
    return console.error('could not connect to postgres', err);
  }
  client.query('SELECT * FROM project', function(err, result) {
    if(err) {
      return console.error('error running query', err);
    }
    console.log(result);
    client.end();
  });
});


app.listen(3000, () => {
  console.log('Server is listening on port 2000. Ready to accept requests!');
});
