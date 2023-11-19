import express from 'express';
import pg from 'pg';

const router = express.Router();
const conString = process.env.DB_CONNECTION_URL;
const client = new pg.Client(conString);

// get all projects
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

// post a project
// get a project
// delete a project
// delete all projects

// post a timesheet
// get a timesheet
// get all timesheets
// delete a timesheet
// delete all timesheets

// post a timesheetEntry
// get a timesheetEntry
// get all timesheetEntries
// delete a timesheetEntry
// delete all timesheetEntries
// update a timesheetEntry

// post a user
// get a user
// get all users
// delete a user
// delete all users
// get all managers
// get all users of a manager
// update user's manager
// update user's manager status

export = router;