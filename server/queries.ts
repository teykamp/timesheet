import express from 'express';
import { Pool, QueryResult } from 'pg';

const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DB_CONNECTION_URL,
  max: -1,
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
    
    res.status(500).json({ error: 'Database error: ' + error });
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

  if (!userId || !endDate) return res.status(400).json({ error: 'User Id and end date are required' });
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
    const result = await handleQuery(res, 'SELECT * FROM Timesheet WHERE timesheetId = $1', [timesheetId]);
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
    const result = await handleQuery(res, 'SELECT * FROM Timesheet');
    if (result) res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving timesheets from the database' });
  }
});

// DELETE a timesheet by timesheetId
router.delete('/timesheets/:timesheetId', async (req, res) => {
  const { timesheetId } = req.params;
  try {
    const result = await handleQuery(res, 'DELETE FROM Timesheet WHERE timesheetId = $1 RETURNING *', [timesheetId]);
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
    const result = await handleQuery(res, 'DELETE FROM Timesheet RETURNING *');

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
  const { timesheetId, entryId, projectId, hoursWorked, Date } = req.body;
  const result = await handleQuery(
    res,
    'INSERT INTO TimesheetEntry (timesheetId, entryId, projectId, hoursWorked, Date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
    [timesheetId, entryId, projectId, hoursWorked, Date]
  );
  if (result) res.status(201).json(result.rows[0]);
});

// GET a timesheetEntry by timesheetId
router.get('/timesheetEntries/:timesheetId', async (req, res) => {
  const { timesheetId } = req.params;
  const result = await handleQuery(res, 'SELECT * FROM TimesheetEntry WHERE timesheetId = $1', [timesheetId]);
  if (result) {
    if (result.rows.length === 0) return res.status(404).json({ error: 'TimesheetEntry not found' });
    res.json(result.rows[0]);
  }
});

// GET all timesheetEntries
router.get('/timesheetEntries', async (req, res) => {
  const result = await handleQuery(res, 'SELECT * FROM TimesheetEntry');
  if (result) res.json(result.rows);
});

// DELETE a timesheetEntry by entryId
router.delete('/timesheetEntries/:entryId', async (req, res) => {
  const { entryId } = req.params;
  const result = await handleQuery(res, 'DELETE FROM TimesheetEntry WHERE entryId = $1 RETURNING *', [entryId]);
  if (result) {
    if (result.rows.length === 0) return res.status(404).json({ error: 'TimesheetEntry not found' });
    res.json(result.rows[0]);
  }
});

// DELETE all timesheetEntries
router.delete('/timesheetEntries', async (req, res) => {
  const result = await handleQuery(res, 'DELETE FROM TimesheetEntry RETURNING *');

  if (result) {
    if (result.rows.length === 0) return res.status(404).json({ error: 'No timesheetEntries found' });
    res.json(result.rows);
  }
});

// UPDATE a timesheetEntry by entryId
router.put('/timesheetEntries/:entryId', async (req, res) => {
  const { entryId } = req.params;
  const { timesheetId, projectId, hoursWorked, Date } = req.body;

  const result = await handleQuery(
    res,
    'UPDATE TimesheetEntry SET timesheetId = $1, projectId = $2, hoursWorked = $3, Date = $4 WHERE entryId = $5 RETURNING *',
    [timesheetId, projectId, hoursWorked, Date, entryId]
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
  const { username, email, managerId, isManager } = req.body;

  const result = await handleQuery(
    res,
    'INSERT INTO "timesheetuser" (userId, email, managerId, isManager) VALUES ($1, $2, $3, $4) RETURNING *',
    [username, email, managerId, isManager]
  );

  if (result) res.status(201).json(result.rows[0]);
});

// GET a user by userId
router.get('/users/:userId', async (req, res) => {
  const { userId } = req.params;

  const result = await handleQuery(res, 'SELECT * FROM "timesheetuser" WHERE userId = $1', [userId]);

  if (result) {
    if (result.rows.length === 0) return res.status(404).json({ error: 'User not found' });
    res.json(result.rows[0]);
  }
});

// GET all users
router.get('/users', async (req, res) => {
  const result = await handleQuery(res, 'SELECT * FROM "timesheetuser"');

  if (result) res.json(result.rows);
});

// DELETE a user by userId
router.delete('/users/:userId', async (req, res) => {
  const { userId } = req.params;

  const result = await handleQuery(res, 'DELETE FROM "user" WHERE userId = $1 RETURNING *', [userId]);

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
router.get('/users/manager/:managerId', async (req, res) => {
  const { managerId } = req.params;

  const result = await handleQuery(res, 'SELECT * FROM "user" WHERE managerId = $1', [managerId]);

  if (result) {
    res.json(result.rows);
  }
});

// UPDATE user's manager
router.put('/users/:userId/manager', async (req, res) => {
  const { userId } = req.params;
  const { managerId } = req.body;

  const result = await handleQuery(
    res,
    'UPDATE "user" SET managerId = $1 WHERE userId = $2 RETURNING *',
    [managerId, userId]
  );

  if (result) {
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  }
});

// UPDATE user's manager status
router.put('/users/:userId/manager/status', async (req, res) => {
  const { userId } = req.params;
  const { isManager } = req.body;

  const result = await handleQuery(
    res,
    'UPDATE "user" SET isManager = $1 WHERE userId = $2 RETURNING *',
    [isManager, userId]
  );

  if (result) {
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    res.json(result.rows[0]);
  }
});

export = router;