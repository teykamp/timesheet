import express from 'express';
import { Client } from 'pg';

const router = express.Router();

async function handleDatabaseTransaction(
  callback: (client: Client) => Promise<any>,
): Promise<any> {
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

    return result;
  } catch (error) {
    // Rollback the transaction in case of an error
    await client.query('ROLLBACK');
    console.error('Database error:', error);
    throw error; // Re-throw the error to be caught by the API call function
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
  try {
    const result = await handleDatabaseTransaction(async (client) => {
      const queryText = 'SELECT * FROM project';
      return await client.query(queryText);
    });

    res.status(200).json(result.rows || []);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving projects from the database' });
  }
});

// GET specific project
router.get('/projects/:projectId', async (req, res) => {
  const { projectId } = req.params;

  try {
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query('SELECT * FROM project WHERE projectId = $1', [projectId]);
    });

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Project not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving project from the database' });
  }
});

// POST a project
router.post('/projects', async (req, res) => {
  const { projectName } = req.body;

  if (!projectName) {
    res.status(400).json({ error: 'Project name is required' });
    return;
  }

  try {
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query('INSERT INTO project (projectName) VALUES ($1) RETURNING *', [projectName]);
    });

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error inserting project into the database' });
  }
});

// DELETE a project by projectId
router.delete('/projects/:projectId', async (req, res) => {
  const { projectId } = req.params;

  try {
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query('DELETE FROM project WHERE projectId = $1 RETURNING *', [projectId]);
    });

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Project not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting project from the database' });
  }
});

// DELETE all projects
router.delete('/projects', async (req, res) => {
  try {
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query('DELETE FROM project RETURNING *');
    });

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'No projects found' });
    } else {
      res.json(result.rows);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting projects from the database' });
  }
});

// PUT or PATCH a timesheet with entries
router.put('/timesheets/:timesheetId', async (req, res) => {
  const { timesheetId } = req.params;
  const { userId, endDate, status, entries } = req.body;

  if (!userId || !endDate || !status || !Array.isArray(entries) || entries.length === 0) {
    res.status(400).json({ error: 'Invalid request body' });
    return;
  }

  try {
    const result = await handleDatabaseTransaction(async (client) => {
      let timesheetIdToUpdate = timesheetId;

      await client.query('DELETE FROM TimesheetEntry WHERE timesheetId = $1', [timesheetIdToUpdate]);

      const existingTimesheetResult = await client.query('SELECT * FROM Timesheet WHERE timesheetId = $1', [timesheetId]);

      if (existingTimesheetResult.rows.length === 0) {
        const newTimesheetResult = await client.query(
          'INSERT INTO Timesheet (userId, endDate, status) VALUES ($1, $2, $3) RETURNING timesheetId',
          [userId, endDate, status]
        );

        timesheetIdToUpdate = newTimesheetResult.rows[0].timesheetId;
      } else {
        await client.query(
        'UPDATE Timesheet SET endDate = $1, status = $2 WHERE timesheetId = $3',
        [endDate, status, timesheetId]
      );
      }

      const entryArray = entries.flat();

      // Insert new timesheet entries
      const entryPromises = entryArray.map(async (entry) => {
        const { projectid, hoursWorked, date } = entry.entry;

        await client.query(
          'INSERT INTO TimesheetEntry (timesheetId, projectId, hoursWorked, date) VALUES ($1, $2, $3, $4)',
          [timesheetIdToUpdate, projectid, hoursWorked, date]
        );
      });

      await Promise.all(entryPromises);

      return { timesheetId: timesheetIdToUpdate };
    });

    res.status(200).json(result);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Error updating or inserting timesheet and entries to the database' });
  }
});


// GET all submitted timesheets and entries for a manager
router.get('/timesheets/manager/:managerId', async (req, res) => {
  const { managerId } = req.params;
  try {
    const result = await handleDatabaseTransaction(async (client) => {
      const userIdsQueryResult = await client.query(
        'SELECT userId, email FROM timesheetuser WHERE managerId = $1',
        [managerId]
      );
      const userData = userIdsQueryResult.rows.map((row) => row.userid);
      const userEmailsMap = new Map(userIdsQueryResult.rows.map((user) => [user.userId, user.email]))

      if (userData.length === 0) {
        return [];
      }
      const timesheets = []
      for (const userId of userData) {
        const timesheetsQueryResult = await client.query(
          'SELECT t.timesheetId, t.userId, t.endDate, t.status ' +
          'FROM Timesheet t ' +
          'WHERE t.status = $1 AND t.userId = $2',
          ['submitted', userId]
        );

        const timesheetsWithEmails = await Promise.all(timesheetsQueryResult.rows.map(async (timesheet) => {
          const totalHoursResult = await client.query(
            'SELECT COALESCE(SUM(hoursWorked), 0) AS totalHours FROM TimesheetEntry WHERE timesheetId = $1',
            [timesheet.timesheetid]
          );

          const totalHours = totalHoursResult.rows[0].totalhours;

          return {
            ...timesheet,
            email: userEmailsMap.get(timesheet.userId),
            totalHours,
          };
        }));

        timesheets.push(...timesheetsWithEmails);
      }

      return timesheets;
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving timesheets and entries for the manager' + error });
  }
});


// GET timesheets and total hours for a user by userId
router.get('/timesheets/user/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await handleDatabaseTransaction(async (client) => {
      // Fetch timesheets for the given userId
      const timesheetsResult = await client.query(
        'SELECT * FROM Timesheet WHERE userId = $1',
        [userId]
      );
      const timesheets = timesheetsResult.rows || [];

      const timesheetsWithTotalHours = await Promise.all(
        timesheets.map(async (timesheet) => {
          const totalHoursResult = await client.query(
            'SELECT COALESCE(SUM(hoursWorked), 0) AS totalHours FROM TimesheetEntry WHERE timesheetId = $1',
            [timesheet.timesheetid]
          );

          const totalHours = totalHoursResult.rows[0].totalhours
          return { ...timesheet, totalHours };
        })
      );
      return timesheetsWithTotalHours || [];
    });

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving timesheets and total hours from the database' });
  }
});


// POST a timesheet with entries
router.post('/timesheets', async (req, res) => {
  const { userId, endDate, status, entries } = req.body;
  if (!userId || !endDate || !status || !Array.isArray(entries) || entries.length === 0) {
    return res.status(400).json({ error: 'Invalid request body' });
  }

  try {
    const result = await handleDatabaseTransaction(async (client) => {
      const timesheetResult = await client.query(
        `INSERT INTO Timesheet (userId, endDate, status) VALUES ($1, $2, $3)
        RETURNING timesheetId`,
        [userId, endDate, status]
      );
      const timesheetId = timesheetResult.rows[0].timesheetid;
      for (const innerArray of entries) {
        for (const entry of innerArray) {
          const { projectid, hoursWorked, date } = entry.entry;
          const entryResult = await client.query(
            `WITH NewTimesheet AS (
              SELECT timesheetId
              FROM Timesheet
              WHERE timesheetId = $1
            )
            INSERT INTO TimesheetEntry(timesheetId, projectId, hoursWorked, date) VALUES((SELECT timesheetId FROM NewTimesheet), $2, $3, $4) RETURNING *`,
            [timesheetId, projectid, hoursWorked, date]
          );
        }
      }
      return { timesheetId };
    });

    res.status(201).json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error posting timesheet and entries to the database' });
  }
});


// POST a timesheet
router.post('/timesheets/solo', async (req, res) => {
  const { userId, endDate, status, timesheetEntries } = req.body;

  if (!userId || !endDate || !status || !timesheetEntries) {
    return res.status(400).json({ error: 'User Id, end date, status, and timesheet entries are required' });
  }

  try {
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query(
        'INSERT INTO Timesheet (userId, endDate, status) VALUES ($1, $2, $3) RETURNING *',
        [userId, endDate, status]
      );
    });

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error inserting timesheet into the database' });
  }
});


// GET a timesheet by timesheetId
router.get('/timesheets/:timesheetId', async (req, res) => {
  const { timesheetId } = req.params;

  try {
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query('SELECT * FROM Timesheet WHERE timesheetId = $1', [timesheetId]);
    });

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Timesheet not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving timesheet from the database' });
  }
});


// GET all timesheets
router.get('/timesheets', async (req, res) => {
  try {
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query('SELECT * FROM Timesheet');
    });

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving timesheets from the database' });
  }
});


// DELETE a timesheet by timesheetId and all associated timesheet entries
router.delete('/timesheets/:timesheetId', async (req, res) => {
  const { timesheetId } = req.params;

  try {
    const result = await handleDatabaseTransaction(async (client) => {
      await client.query('DELETE FROM TimesheetEntry WHERE timesheetId = $1', [timesheetId]);

      return await client.query('DELETE FROM Timesheet WHERE timesheetId = $1 RETURNING *', [timesheetId]);
    });

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Timesheet not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting timesheet and entries from the database' });
  }
});


// DELETE a timesheet by timesheetId
router.delete('/timesheets/solo/:timesheetId', async (req, res) => {
  const { timesheetId } = req.params;

  try {
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query('DELETE FROM Timesheet WHERE timesheetId = $1 RETURNING *', [timesheetId]);
    });

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Timesheet not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting timesheet from the database' });
  }
});


// DELETE all timesheets
router.delete('/timesheets', async (req, res) => {
  try {
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query('DELETE FROM Timesheet RETURNING *');
    });

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'No Timesheets found' });
    } else {
      res.json(result.rows);
    }
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
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query(
        'UPDATE Timesheet SET status = $1 WHERE timesheetId = $2 RETURNING *',
        [status, timesheetId]
      );
    });

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Timesheet not found' });
    } else {
      res.json(result.rows[0]);
    }
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
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query(
        'INSERT INTO TimesheetEntry (timesheetId, entryId, projectId, hoursWorked, Date) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [timesheetId, entryId, projectId, hoursWorked, Date]
      );
    });

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error inserting timesheet entry into the database' });
  }
});


// GET a timesheetEntry by timesheetId
router.get('/timesheetEntries/:timesheetId', async (req, res) => {
  const { timesheetId } = req.params;

  try {
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query('SELECT * FROM TimesheetEntry WHERE timesheetId = $1', [timesheetId]);
    });

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'TimesheetEntry not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving timesheet entry from the database' });
  }
});


// GET timesheet entries formatted for the grid
router.get('/timesheetEntriesFormatted/:timesheetId', async (req, res) => {
  const { timesheetId } = req.params;

  try {
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query(
        'SELECT * FROM TimesheetEntry WHERE timesheetId = $1 ORDER BY projectid, date',
        [timesheetId]
      );
    });

    const formattedData: any[] = [];

    result.rows.forEach((entry: any) => {
      const existingRow = formattedData.find((row) => row[0].projectid === entry.projectid);

      if (existingRow) {
        existingRow.push({
          entry: {
            projectid: entry.projectid,
            hoursWorked: entry.hoursworked,
            date: entry.date,
          },
        });
      } else {
        const newRow = [
          { projectid: entry.projectid },
          {
            entry: {
              projectid: entry.projectid,
              hoursWorked: entry.hoursworked,
              date: entry.date,
            },
          },
        ];
        formattedData.push(newRow);
      }
    });
    res.json(formattedData);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error fetching and formatting timesheet entries from the database' });
  }
});

// GET all timesheetEntries
router.get('/timesheetEntries', async (req, res) => {
  try {
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query('SELECT * FROM TimesheetEntry');
    });

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving timesheet entries from the database' });
  }
});

// DELETE a timesheetEntry by entryId
router.delete('/timesheetEntries/:entryId', async (req, res) => {
  const { entryId } = req.params;

  try {
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query('DELETE FROM TimesheetEntry WHERE entryId = $1 RETURNING *', [entryId]);
    });

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'TimesheetEntry not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting timesheet entry from the database' });
  }
});

// DELETE all timesheetEntries
router.delete('/timesheetEntries', async (req, res) => {
  try {
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query('DELETE FROM TimesheetEntry RETURNING *');
    });

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'No timesheetEntries found' });
    } else {
      res.json(result.rows);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting timesheet entries from the database' });
  }
});

// UPDATE a timesheetEntry by entryId
router.put('/timesheetEntries/:entryId', async (req, res) => {
  const { entryId } = req.params;
  const { timesheetId, projectId, hoursWorked, Date } = req.body;

  try {
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query(
        'UPDATE TimesheetEntry SET timesheetId = $1, projectId = $2, hoursWorked = $3, Date = $4 WHERE entryId = $5 RETURNING *',
        [timesheetId, projectId, hoursWorked, Date, entryId]
      );
    });

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'TimesheetEntry not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating timesheet entry in the database' });
  }
});

/*
  USERS
*/

// Check if user first time login and POST if does not exist
router.get('/userFirstTimeLogin/:userId/:email', async (req, res) => {
  const { userId, email } = req.params;

  try {
    const userResponse = await handleDatabaseTransaction(async (client) => {
      const result = await client.query('SELECT * FROM "timesheetuser" WHERE userId = $1', [userId]);

      if (!result || !result.rows || result.rows.length === 0) {
        const createUserResult = await client.query(
          'INSERT INTO "timesheetuser" (userId, email) VALUES ($1, $2) RETURNING *',
          [userId, email]
        );

        return createUserResult.rows[0];
      }

      return result.rows[0];
    });

    res.json(userResponse);
  } catch (error) {
    res.status(500).json({ error: 'Error checking or creating user' });
  }
});

// POST a user
router.post('/users', async (req, res) => {
  const { username, email, managerId, isManager } = req.body;

  if (!username || !email || typeof isManager !== 'boolean') {
    return res.status(400).json({ error: 'Username, email, and isManager are required fields' });
  }

  try {
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query(
        'INSERT INTO "timesheetuser" (userId, email, managerId, isManager) VALUES ($1, $2, $3, $4) RETURNING *',
        [username, email, managerId, isManager]
      );
    });

    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: 'Error inserting user into the database' });
  }
});

// GET a user by userId
router.get('/users/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query('SELECT * FROM "timesheetuser" WHERE userId = $1', [userId]);
    });

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving user from the database' });
  }
});

// GET all users
router.get('/users', async (req, res) => {
  try {
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query('SELECT * FROM "timesheetuser"');
    });

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving users from the database' });
  }
});

// DELETE a user by userId
router.delete('/users/:userId', async (req, res) => {
  const { userId } = req.params;

  try {
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query('DELETE FROM "timesheetuser" WHERE userId = $1 RETURNING *', [userId]);
    });

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting user from the database' });
  }
});

// DELETE all users
router.delete('/users', async (req, res) => {
  try {
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query('DELETE FROM "timesheetuser" RETURNING *');
    });

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'No users found' });
    } else {
      res.json(result.rows);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error deleting users from the database' });
  }
});

// GET all managers
router.get('/managers', async (req, res) => {
  try {
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query('SELECT * FROM "timesheetuser" WHERE isManager = true');
    });

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving managers from the database' });
  }
});

// GET all users of a manager
router.get('/users/manager/:managerId', async (req, res) => {
  const { managerId } = req.params;

  try {
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query('SELECT * FROM "timesheetuser" WHERE managerId = $1', [managerId]);
    });

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: 'Error retrieving users of a manager from the database' });
  }
});

// UPDATE user's manager
router.put('/users/:userId/manager', async (req, res) => {
  const { userId } = req.params;
  const { managerId } = req.body;

  try {
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query(
        'UPDATE "timesheetuser" SET managerId = $1 WHERE userId = $2 RETURNING *',
        [managerId, userId]
      );
    });

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating user\'s manager in the database' });
  }
});

// UPDATE user's manager status
router.put('/users/:userId/manager/status', async (req, res) => {
  const { userId } = req.params;
  const { isManager } = req.body;

  try {
    const result = await handleDatabaseTransaction(async (client) => {
      return await client.query(
        'UPDATE "timesheetuser" SET isManager = $1 WHERE userId = $2 RETURNING *',
        [isManager, userId]
      );
    });

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (error) {
    res.status(500).json({ error: 'Error updating user\'s manager status in the database' });
  }
});

export {router , handleDatabaseTransaction};