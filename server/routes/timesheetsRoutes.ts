import {Router, Request, Response} from "express"
export const  router = Router();
import { handleDatabaseTransaction } from "../queries";

// PUT or PATCH a timesheet with entries
router.put('/:timesheetId', async (req, res) => {
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
  router.get('/manager/:managerId', async (req, res) => {
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
  router.get('/user/:userId', async (req, res) => {
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
  router.post('/', async (req, res) => {
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
  router.post('/solo', async (req, res) => {
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
  router.get('/:timesheetId', async (req, res) => {
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
  router.get('/', async (req, res) => {
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
  router.delete('/:timesheetId', async (req, res) => {
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
  router.delete('/solo/:timesheetId', async (req, res) => {
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
  router.delete('/', async (req, res) => {
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
  router.put('/:timesheetId/status', async (req, res) => {
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
  
  