import express from 'express';
import pg from 'pg';

const router = express.Router();
const conString = process.env.DB_CONNECTION_URL;
const client = new pg.Client(conString);

/*
  PROJECTS
*/

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

// POST a project
router.post('/projects', async (req, res) => {
  const { projectName } = req.body;

  if (!projectName) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  try {
    await client.connect();
    const result = await client.query('INSERT INTO project (projectName) VALUES ($1) RETURNING *', [projectName]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error inserting project into the database' });
  } finally {
    await client.end();
  }
});

// GET a project by projectId
router.get('/projects/:projectId', async (req, res) => {
  const { projectId } = req.params;

  try {
    await client.connect();
    const result = await client.query('SELECT * FROM project WHERE projectId = $1', [projectId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving project from the database' });
  } finally {
    await client.end();
  }
});

// DELETE a project by projectId
router.delete('/projects/:projectId', async (req, res) => {
  const { projectId } = req.params;

  try {
    await client.connect();
    const result = await client.query('DELETE FROM project WHERE projectId = $1 RETURNING *', [projectId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting project from the database' });
  } finally {
    await client.end();
  }
});

// DELETE all projects
router.delete('/projects', async (req, res) => {
  try {
    await client.connect();
    const result = await client.query('DELETE FROM project RETURNING *');

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No projects found' });
    }

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting projects from the database' });
  } finally {
    await client.end();
  }
});

/*
  TIMESHEETS
*/

// POST a timesheet
router.post('/timesheets', async (req, res) => {
  const { userId, endDate } = req.body;

  if (!userId || !endDate) {
    return res.status(400).json({ error: 'User ID and end date are required' });
  }

  try {
    await client.connect();
    const result = await client.query('INSERT INTO timesheet (userId, endDate) VALUES ($1, $2) RETURNING *', [userId, endDate]);
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error inserting timesheet into the database' });
  } finally {
    await client.end();
  }
});

// GET a timesheet by timesheetId
router.get('/timesheets/:timesheetId', async (req, res) => {
  const { timesheetId } = req.params;

  try {
    await client.connect();
    const result = await client.query('SELECT * FROM timesheet WHERE timesheetId = $1', [timesheetId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Timesheet not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving timesheet from the database' });
  } finally {
    await client.end();
  }
});

// GET all timesheets
router.get('/timesheets', async (req, res) => {
  try {
    await client.connect();
    const result = await client.query('SELECT * FROM timesheet');

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving timesheets from the database' });
  } finally {
    await client.end();
  }
});

// DELETE a timesheet by timesheetId
router.delete('/timesheets/:timesheetId', async (req, res) => {
  const { timesheetId } = req.params;

  try {
    await client.connect();
    const result = await client.query('DELETE FROM timesheet WHERE timesheetId = $1 RETURNING *', [timesheetId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Timesheet not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting timesheet from the database' });
  } finally {
    await client.end();
  }
});

// DELETE all timesheets
router.delete('/timesheets', async (req, res) => {
  try {
    await client.connect();
    const result = await client.query('DELETE FROM timesheet RETURNING *');

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No timesheets found' });
    }

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting timesheets from the database' });
  } finally {
    await client.end();
  }
});

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

export = router