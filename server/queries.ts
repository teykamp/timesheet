import express from 'express';
import { Pool, QueryResult } from 'pg';

const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_URL,
});

async function handleQuery(
  res: express.Response,
  queryText: string,
  queryParams?: any[]
): Promise<QueryResult | undefined> {
  try {
    const client = await pool.connect();
    const result = await client.query(queryText, queryParams);
    return result;
  } catch (error) {
    res.status(500).json({ error: 'Database error' });
  }
}

// GET all projects
router.get('/projects', async (req, res) => {
  const result = await handleQuery(res, 'SELECT * FROM project');
  if (result) {
    res.json(result.rows);
  }
});

// GET specific project
router.get('/projects/:projectId', async (req, res) => {
  const { projectId } = req.params;
  const result = await handleQuery(res, 'SELECT * FROM project WHERE projectId = $1', [projectId]);
  if (result) {
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(result.rows[0]);
  }
});

// POST a project
router.post('/projects', async (req, res) => {
  const { projectName } = req.body;

  if (!projectName) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  const result = await handleQuery(res, 'INSERT INTO project (projectName) VALUES ($1) RETURNING *', [projectName]);
  if (result) {
    res.status(201).json(result.rows[0]);
  }
});

// DELETE a project by projectId
router.delete('/projects/:projectId', async (req, res) => {
  const { projectId } = req.params;

  const result = await handleQuery(res, 'DELETE FROM project WHERE projectId = $1 RETURNING *', [projectId]);
  if (result) {
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }
    res.json(result.rows[0]);
  }
});

// DELETE all projects
router.delete('/projects', async (req, res) => {
  const result = await handleQuery(res, 'DELETE FROM project RETURNING *');
  if (result) {
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No projects found' });
    }
    res.json(result.rows);
  }
});

/*
  TIMESHEETS
*/

// POST a timesheet
router.post('/timesheets', async (req, res) => {
  const { userId, endDate } = req.body;

  if (!userId || !endDate) return res.status(400).json({ error: 'User ID and end date are required' });
  try {
    const result = await handleQuery(res, 'INSERT INTO timesheet (userId, endDate) VALUES ($1, $2) RETURNING *', [userId, endDate]);
    if (result) res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error inserting timesheet into the database' });
  }
});

// GET a timesheet by timesheetId
router.get('/timesheets/:timesheetId', async (req, res) => {
  const { timesheetId } = req.params;
  try {
    const result = await handleQuery(res, 'SELECT * FROM timesheet WHERE timesheetId = $1', [timesheetId]);
    if (result) {
      if (result.rows.length === 0) return res.status(404).json({ error: 'No projects found' });
      res.json(result.rows);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving timesheet from the database' });
  }
});

// GET all timesheets
router.get('/timesheets', async (req, res) => {
  try {
    const result = await handleQuery(res, 'SELECT * FROM timesheet');
    if (result) res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving timesheets from the database' });
  }
});

// DELETE a timesheet by timesheetId
router.delete('/timesheets/:timesheetId', async (req, res) => {
  const { timesheetId } = req.params;
  try {
    const result = await handleQuery(res, 'DELETE FROM timesheet WHERE timesheetId = $1 RETURNING *', [timesheetId]);
    if (result) {
      if (result.rows.length === 0) return res.status(404).json({ error: 'Timesheet not found' });
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting timesheet from the database' });
  }
});

// DELETE all timesheets
router.delete('/timesheets', async (req, res) => {
  try {
    const result = await handleQuery(res, 'DELETE FROM timesheet RETURNING *');

    if (result) {
      if (result.rows.length === 0) return res.status(404).json({ error: 'No Timesheets found' });
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting timesheets from the database' });
  }
});

/*
  TIMESHEETENTRIES
*/

// POST a timesheetEntry
router.post('/timesheetEntries', async (req, res) => {
  const { timesheetID, entryID, projectID, hoursWorked, Date } = req.body;
  const result = await handleQuery(
    res,
    'INSERT INTO timesheetEntry (timesheetID, entryID, projectID, hoursWorked, Date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [timesheetID, entryID, projectID, hoursWorked, Date]
  );
  if (result) res.status(201).json(result.rows[0]);
});

// GET a timesheetEntry by entryID
router.get('/timesheetEntries/:entryID', async (req, res) => {
  const { entryID } = req.params;
  const result = await handleQuery(res, 'SELECT * FROM timesheetEntry WHERE entryID = $1', [entryID]);
  if (result) {
    if (result.rows.length === 0) return res.status(404).json({ error: 'TimesheetEntry not found' });
    res.json(result.rows[0]);
  }
});

// GET all timesheetEntries
router.get('/timesheetEntries', async (req, res) => {
  const result = await handleQuery(res, 'SELECT * FROM timesheetEntry');
  if (result) res.json(result.rows);
});

// DELETE a timesheetEntry by entryID
router.delete('/timesheetEntries/:entryID', async (req, res) => {
  const { entryID } = req.params;
  const result = await handleQuery(res, 'DELETE FROM timesheetEntry WHERE entryID = $1 RETURNING *', [entryID]);
  if (result) {
    if (result.rows.length === 0) return res.status(404).json({ error: 'TimesheetEntry not found' });
    res.json(result.rows[0]);
  }
});

// DELETE all timesheetEntries
router.delete('/timesheetEntries', async (req, res) => {
  const result = await handleQuery(res, 'DELETE FROM timesheetEntry RETURNING *');

  if (result) {
    if (result.rows.length === 0) return res.status(404).json({ error: 'No timesheetEntries found' });
    res.json(result.rows);
  }
});

// UPDATE a timesheetEntry by entryID
router.put('/timesheetEntries/:entryID', async (req, res) => {
  const { entryID } = req.params;
  const { timesheetID, projectID, hoursWorked, Date } = req.body;

  const result = await handleQuery(
    res,
    'UPDATE timesheetEntry SET timesheetID = $1, projectID = $2, hoursWorked = $3, Date = $4 WHERE entryID = $5 RETURNING *',
    [timesheetID, projectID, hoursWorked, Date, entryID]
  );

  if (result) {
    if (result.rows.length === 0) return res.status(404).json({ error: 'TimesheetEntry not found' });
    res.json(result.rows[0]);
  }
});

/*
  USERS
*/

// POST a user
router.post('/users', async (req, res) => {
  const { username, email, managerID, isManager } = req.body;

  const result = await handleQuery(
    res,
    'INSERT INTO "user" (username, email, managerID, isManager) VALUES ($1, $2, $3, $4) RETURNING *',
    [username, email, managerID, isManager]
  );

  if (result) res.status(201).json(result.rows[0]);
});

// GET a user by userID
router.get('/users/:userID', async (req, res) => {
  const { userID } = req.params;

  const result = await handleQuery(res, 'SELECT * FROM "user" WHERE userID = $1', [userID]);

  if (result) {
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  }
});

// GET all users
router.get('/users', async (req, res) => {
  const result = await handleQuery(res, 'SELECT * FROM "user"');

  if (result) res.json(result.rows);
});

// DELETE a user by userID
router.delete('/users/:userID', async (req, res) => {
  const { userID } = req.params;

  const result = await handleQuery(res, 'DELETE FROM "user" WHERE userID = $1 RETURNING *', [userID]);

  if (result) {
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  }
});
// DELETE all users
router.delete('/users', async (req, res) => {
  const result = await handleQuery(res, 'DELETE FROM "user" RETURNING *');

  if (result) {
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No users found' });
    }
    res.json(result.rows);
  }
});

// GET all managers
router.get('/managers', async (req, res) => {
  const result = await handleQuery(res, 'SELECT * FROM "user" WHERE isManager = true');

  if (result) {
    res.json(result.rows);
  }
});

// GET all users of a manager
router.get('/users/manager/:managerID', async (req, res) => {
  const { managerID } = req.params;

  const result = await handleQuery(res, 'SELECT * FROM "user" WHERE managerID = $1', [managerID]);

  if (result) {
    res.json(result.rows);
  }
});

// UPDATE user's manager
router.put('/users/:userID/manager', async (req, res) => {
  const { userID } = req.params;
  const { managerID } = req.body;

  const result = await handleQuery(
    res,
    'UPDATE "user" SET managerID = $1 WHERE userID = $2 RETURNING *',
    [managerID, userID]
  );

  if (result) {
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  }
});

// UPDATE user's manager status
router.put('/users/:userID/manager/status', async (req, res) => {
  const { userID } = req.params;
  const { isManager } = req.body;

  const result = await handleQuery(
    res,
    'UPDATE "user" SET isManager = $1 WHERE userID = $2 RETURNING *',
    [isManager, userID]
  );

  if (result) {
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  }
});

export = router;