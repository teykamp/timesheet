import {Router, Request, Response} from "express"
export const  router = Router();
import { handleDatabaseTransaction } from "../queries";

/*
    TIMESHEETENTRIES
  */
  
  // POST a timesheetEntry
  router.post('/', async (req, res) => {
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
  router.get('/:timesheetId', async (req, res) => {
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
 // /timesheetEntriesFormatted/:timesheetId -> /timesheetEntries/FormattedBy/:timesheetID (implemented)
  router.get('/FormattedBy/:timesheetId', async (req, res) => {
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
  router.get('/', async (req, res) => {
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
  router.delete('/:entryId', async (req, res) => {
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
  router.delete('/', async (req, res) => {
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
  router.put('/:entryId', async (req, res) => {
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
  