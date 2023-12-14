import express from 'express';
import { Client } from 'pg';

const router = express.Router();

async function handleDatabaseTransaction(
  res: any,
  callback: (client: Client) => Promise<any>,
): Promise<void> {
  const client = new Client({
    connectionString: process.env.DB_CONNECTION_URL,
  });

  try {
    // Connect to the database
    await client.connect();

    // Begin the transaction
    await client.query('BEGIN');

    // Execute the transactional database operation
    const result = await callback(client);

    // Commit the transaction
    await client.query('COMMIT');

    // Respond with the result
    res.json(result.rows);
  } catch (error) {
    // Rollback the transaction in case of an error
    await client.query('ROLLBACK');
    console.error('Database error:', error);
    res.status(500).json({ error: 'Database error: ' + error });
  } finally {
    try {
      // Disconnect from the database
      await client.end();
      console.log('Connection closed');
    } catch (endError) {
      console.error('Error closing connection:', endError);
    }
  }
}

/*

PROJECTS

*/

// GET all projects
router.get('/projects', async (req, res) => {
  await handleDatabaseTransaction(res, async (client) => {
    const queryText = 'SELECT * FROM project'
    return await client.query(queryText)
  })
})



// GET specific project
router.get('/projects/:projectId', async (req, res) => {
  const { projectId } = req.params;
  await handleDatabaseTransaction(res, async (client) => {
    const result = await client.query('SELECT * FROM project WHERE projectId = $1', [projectId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  });
});

// POST a project
router.post('/projects', async (req, res) => {
  const { projectName } = req.body;

  if (!projectName) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  await handleDatabaseTransaction(res, async (client) => {
    const result = await client.query('INSERT INTO project (projectName) VALUES ($1) RETURNING *', [projectName]);

    res.status(201).json(result.rows[0]);
  });
});

// DELETE a project by projectId
router.delete('/projects/:projectId', async (req, res) => {
  const { projectId } = req.params;

  await handleDatabaseTransaction(res, async (client) => {
    const result = await client.query('DELETE FROM project WHERE projectId = $1 RETURNING *', [projectId]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Project not found' });
    }

    res.json(result.rows[0]);
  });
});

// DELETE all projects
router.delete('/projects', async (req, res) => {
  await handleDatabaseTransaction(res, async (client) => {
    const result = await client.query('DELETE FROM project RETURNING *');

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'No projects found' });
    }

    res.json(result.rows);
  });
});

/*
  TIMESHEETS
*/

// POST a timesheet
router.post('/timesheets', async (req, res) => {
  const { userId, endDate, status, timesheetEntries } = req.body;

  if (!userId || !endDate || !status || !timesheetEntries) {
    return res.status(400).json({ error: 'User Id, end date, status, and timesheet entries are required' });
  }

  try {
    await handleDatabaseTransaction(res, async (client) => {
      const result = await client.query(
        'INSERT INTO Timesheet (userId, endDate, status) VALUES ($1, $2, $3) RETURNING *',
        [userId, endDate, status]
      );

      res.status(201).json(result.rows[0]);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error inserting timesheet into the database' });
  }
});

// GET a timesheet by timesheetId
router.get('/timesheets/:timesheetId', async (req, res) => {
  const { timesheetId } = req.params;

  try {
    await handleDatabaseTransaction(res, async (client) => {
      const result = await client.query('SELECT * FROM Timesheet WHERE timesheetId = $1', [timesheetId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Timesheet not found' });
      }

      res.json(result.rows[0]);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving timesheet from the database' });
  }
});

// GET all timesheets
router.get('/timesheets', async (req, res) => {
  try {
    await handleDatabaseTransaction(res, async (client) => {
      const result = await client.query('SELECT * FROM Timesheet');

      res.json(result.rows);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving timesheets from the database' });
  }
});

// DELETE a timesheet by timesheetId
router.delete('/timesheets/:timesheetId', async (req, res) => {
  const { timesheetId } = req.params;

  try {
    await handleDatabaseTransaction(res, async (client) => {
      const result = await client.query('DELETE FROM Timesheet WHERE timesheetId = $1 RETURNING *', [timesheetId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Timesheet not found' });
      }

      res.json(result.rows[0]);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting timesheet from the database' });
  }
});

// DELETE all timesheets
router.delete('/timesheets', async (req, res) => {
  try {
    await handleDatabaseTransaction(res, async (client) => {
      const result = await client.query('DELETE FROM Timesheet RETURNING *');

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'No Timesheets found' });
      }

      res.json(result.rows);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting timesheets from the database' });
  }
});

// UPDATE the status of a timesheet by timesheetId
router.put('/timesheets/:timesheetId/status', async (req, res) => {
  const { timesheetId } = req.params;
  const { status } = req.body;

  if (!status || !['approved', 'working', 'submitted'].includes(status)) {
    return res.status(400).json({ error: 'Valid status (approved, working, submitted) is required' });
  }

  try {
    await handleDatabaseTransaction(res, async (client) => {
      const result = await client.query(
        'UPDATE Timesheet SET status = $1 WHERE timesheetId = $2 RETURNING *',
        [status, timesheetId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Timesheet not found' });
      }

      res.json(result.rows[0]);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error updating timesheet status in the database' });
  }
});



/*
  TIMESHEETENTRIES
*/

// POST a timesheetEntry
router.post('/timesheetEntries', async (req, res) => {
  const { timesheetId, entryId, projectId, hoursWorked, Date } = req.body;

  if (!timesheetId || !entryId || !projectId || !hoursWorked || !Date) {
    return res.status(400).json({ error: 'All fields are required for timesheet entry' });
  }

  try {
    await handleDatabaseTransaction(res, async (client) => {
      const result = await client.query(
        'INSERT INTO TimesheetEntry (timesheetId, entryId, projectId, hoursWorked, Date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [timesheetId, entryId, projectId, hoursWorked, Date]
      );

      res.status(201).json(result.rows[0]);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error inserting timesheet entry into the database' });
  }
});

// GET a timesheetEntry by timesheetId
router.get('/timesheetEntries/:timesheetId', async (req, res) => {
  const { timesheetId } = req.params;

  try {
    await handleDatabaseTransaction(res, async (client) => {
      const result = await client.query('SELECT * FROM TimesheetEntry WHERE timesheetId = $1', [timesheetId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'TimesheetEntry not found' });
      }

      res.json(result.rows[0]);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving timesheet entry from the database' });
  }
});

// GET all timesheetEntries
router.get('/timesheetEntries', async (req, res) => {
  try {
    await handleDatabaseTransaction(res, async (client) => {
      const result = await client.query('SELECT * FROM TimesheetEntry');

      res.json(result.rows);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving timesheet entries from the database' });
  }
});

// DELETE a timesheetEntry by entryId
router.delete('/timesheetEntries/:entryId', async (req, res) => {
  const { entryId } = req.params;

  try {
    await handleDatabaseTransaction(res, async (client) => {
      const result = await client.query('DELETE FROM TimesheetEntry WHERE entryId = $1 RETURNING *', [entryId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'TimesheetEntry not found' });
      }

      res.json(result.rows[0]);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting timesheet entry from the database' });
  }
});

// DELETE all timesheetEntries
router.delete('/timesheetEntries', async (req, res) => {
  try {
    await handleDatabaseTransaction(res, async (client) => {
      const result = await client.query('DELETE FROM TimesheetEntry RETURNING *');

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'No timesheetEntries found' });
      }

      res.json(result.rows);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting timesheet entries from the database' });
  }
});

// UPDATE a timesheetEntry by entryId
router.put('/timesheetEntries/:entryId', async (req, res) => {
  const { entryId } = req.params;
  const { timesheetId, projectId, hoursWorked, Date } = req.body;

  try {
    await handleDatabaseTransaction(res, async (client) => {
      const result = await client.query(
        'UPDATE TimesheetEntry SET timesheetId = $1, projectId = $2, hoursWorked = $3, Date = $4 WHERE entryId = $5 RETURNING *',
        [timesheetId, projectId, hoursWorked, Date, entryId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'TimesheetEntry not found' });
      }

      res.json(result.rows[0]);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error updating timesheet entry in the database' });
  }
});


/*
  USERS
*/
// POST a user
router.post('/users', async (req, res) => {
  const { username, email, managerId, isManager } = req.body;

  if (!username || !email || typeof isManager !== 'boolean') {
    return res.status(400).json({ error: 'Username, email, and isManager are required fields' });
  }

  try {
    await handleDatabaseTransaction(res, async (client) => {
      const result = await client.query(
        'INSERT INTO "timesheetuser" (userId, email, managerId, isManager) VALUES ($1, $2, $3, $4) RETURNING *',
        [username, email, managerId, isManager]
      );

      res.status(201).json(result.rows[0]);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error inserting user into the database' });
  }
});

// GET a user by userId
router.get('/users/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    await handleDatabaseTransaction(res, async (client) => {
      const result = await client.query('SELECT * FROM "timesheetuser" WHERE userId = $1', [userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(result.rows[0]);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving user from the database' });
  }
});

// GET all users
router.get('/users', async (req, res) => {
  try {
    await handleDatabaseTransaction(res, async (client) => {
      const result = await client.query('SELECT * FROM "timesheetuser"');

      res.json(result.rows);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving users from the database' });
  }
});

// DELETE a user by userId
router.delete('/users/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    await handleDatabaseTransaction(res, async (client) => {
      const result = await client.query('DELETE FROM "timesheetuser" WHERE userId = $1 RETURNING *', [userId]);

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(result.rows[0]);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user from the database' });
  }
});

// DELETE all users
router.delete('/users', async (req, res) => {
  try {
    await handleDatabaseTransaction(res, async (client) => {
      const result = await client.query('DELETE FROM "timesheetuser" RETURNING *');

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'No users found' });
      }

      res.json(result.rows);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error deleting users from the database' });
  }
});

// GET all managers
router.get('/managers', async (req, res) => {
  try {
    await handleDatabaseTransaction(res, async (client) => {
      const result = await client.query('SELECT * FROM "timesheetuser" WHERE isManager = true');

      res.json(result.rows);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving managers from the database' });
  }
});

// GET all users of a manager
router.get('/users/manager/:managerId', async (req, res) => {
  const { managerId } = req.params;

  try {
    await handleDatabaseTransaction(res, async (client) => {
      const result = await client.query('SELECT * FROM "timesheetuser" WHERE managerId = $1', [managerId]);

      res.json(result.rows);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving users of a manager from the database' });
  }
});

// UPDATE user's manager
router.put('/users/:userId/manager', async (req, res) => {
  const { userId } = req.params;
  const { managerId } = req.body;

  try {
    await handleDatabaseTransaction(res, async (client) => {
      const result = await client.query(
        'UPDATE "timesheetuser" SET managerId = $1 WHERE userId = $2 RETURNING *',
        [managerId, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(result.rows[0]);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error updating user\'s manager in the database' });
  }
});

// UPDATE user's manager status
router.put('/users/:userId/manager/status', async (req, res) => {
  const { userId } = req.params;
  const { isManager } = req.body;

  try {
    await handleDatabaseTransaction(res, async (client) => {
      const result = await client.query(
        'UPDATE "timesheetuser" SET isManager = $1 WHERE userId = $2 RETURNING *',
        [isManager, userId]
      );

      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      res.json(result.rows[0]);
    });
  } catch (error) {
    res.status(500).json({ error: 'Error updating user\'s manager status in the database' });
  }
});

export = router;