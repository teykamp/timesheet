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

/*
  TIMESHEETENTRIES
*/

// POST a timesheetEntry
router.post('/timesheetEntries', async (req, res) => {
  const { timesheetID, entryID, projectID, hoursWorked, Date } = req.body;

  try {
    await client.connect();
    const result = await client.query(
      'INSERT INTO timesheetEntry (timesheetID, entryID, projectID, hoursWorked, Date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [timesheetID, entryID, projectID, hoursWorked, Date]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error inserting timesheetEntry into the database' });
  } finally {
    await client.end();
  }
});

// GET a timesheetEntry by entryID
router.get('/timesheetEntries/:entryID', async (req, res) => {
  const { entryID } = req.params;

  try {
    await client.connect();
    const result = await client.query('SELECT * FROM timesheetEntry WHERE entryID = $1', [entryID]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'TimesheetEntry not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving timesheetEntry from the database' });
  } finally {
    await client.end();
  }
});

// GET all timesheetEntries
router.get('/timesheetEntries', async (req, res) => {
  try {
    await client.connect();
    const result = await client.query('SELECT * FROM timesheetEntry');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving timesheetEntries from the database' });
  } finally {
    await client.end();
  }
});

// DELETE a timesheetEntry by entryID
router.delete('/timesheetEntries/:entryID', async (req, res) => {
  const { entryID } = req.params;

  try {
    await client.connect();
    const result = await client.query('DELETE FROM timesheetEntry WHERE entryID = $1 RETURNING *', [entryID]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'TimesheetEntry not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting timesheetEntry from the database' });
  } finally {
    await client.end();
  }
});

// DELETE all timesheetEntries
router.delete('/timesheetEntries', async (req, res) => {
  try {
    await client.connect();
    const result = await client.query('DELETE FROM timesheetEntry RETURNING *');

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No timesheetEntries found' });
    }

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting timesheetEntries from the database' });
  } finally {
    await client.end();
  }
});

// UPDATE a timesheetEntry by entryID
router.put('/timesheetEntries/:entryID', async (req, res) => {
  const { entryID } = req.params;
  const { timesheetID, projectID, hoursWorked, Date } = req.body;

  try {
    await client.connect();
    const result = await client.query(
      'UPDATE timesheetEntry SET timesheetID = $1, projectID = $2, hoursWorked = $3, Date = $4 WHERE entryID = $5 RETURNING *',
      [timesheetID, projectID, hoursWorked, Date, entryID]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'TimesheetEntry not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error updating timesheetEntry in the database' });
  } finally {
    await client.end();
  }
});

/*
  USERS
*/

// POST a user
router.post('/users', async (req, res) => {
  const { username, email, managerID, isManager } = req.body;

  try {
    await client.connect();
    const result = await client.query(
      'INSERT INTO "user" (username, email, managerID, isManager) VALUES ($1, $2, $3, $4) RETURNING *',
      [username, email, managerID, isManager]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error inserting user into the database' });
  } finally {
    await client.end();
  }
});

// GET a user by userID
router.get('/users/:userID', async (req, res) => {
  const { userID } = req.params;

  try {
    await client.connect();
    const result = await client.query('SELECT * FROM "user" WHERE userID = $1', [userID]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving user from the database' });
  } finally {
    await client.end();
  }
});

// GET all users
router.get('/users', async (req, res) => {
  try {
    await client.connect();
    const result = await client.query('SELECT * FROM "user"');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving users from the database' });
  } finally {
    await client.end();
  }
});

// DELETE a user by userID
router.delete('/users/:userID', async (req, res) => {
  const { userID } = req.params;

  try {
    await client.connect();
    const result = await client.query('DELETE FROM "user" WHERE userID = $1 RETURNING *', [userID]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user from the database' });
  } finally {
    await client.end();
  }
});

// DELETE all users
router.delete('/users', async (req, res) => {
  try {
    await client.connect();
    const result = await client.query('DELETE FROM "user" RETURNING *');

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No users found' });
    }

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error deleting users from the database' });
  } finally {
    await client.end();
  }
});

// GET all managers
router.get('/managers', async (req, res) => {
  try {
    await client.connect();
    const result = await client.query('SELECT * FROM "user" WHERE isManager = true');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving managers from the database' });
  } finally {
    await client.end();
  }
});

// GET all users of a manager
router.get('/users/manager/:managerID', async (req, res) => {
  const { managerID } = req.params;

  try {
    await client.connect();
    const result = await client.query('SELECT * FROM "user" WHERE managerID = $1', [managerID]);
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving users of the manager from the database' });
  } finally {
    await client.end();
  }
});

// UPDATE user's manager
router.put('/users/:userID/manager', async (req, res) => {
  const { userID } = req.params;
  const { managerID } = req.body;

  try {
    await client.connect();
    const result = await client.query(
      'UPDATE "user" SET managerID = $1 WHERE userID = $2 RETURNING *',
      [managerID, userID]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error updating user\'s manager in the database' });
  } finally {
    await client.end();
  }
});

// UPDATE user's manager status
router.put('/users/:userID/manager/status', async (req, res) => {
  const { userID } = req.params;
  const { isManager } = req.body;

  try {
    await client.connect();
    const result = await client.query(
      'UPDATE "user" SET isManager = $1 WHERE userID = $2 RETURNING *',
      [isManager, userID]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error updating user\'s manager status in the database' });
  } finally {
    await client.end();
  }
});

export = router